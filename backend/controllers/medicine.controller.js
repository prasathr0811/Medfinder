import Medicine from '../models/medicine.model.js';
import Pharmacy from '../models/pharmacy.model.js';
import mongoose from 'mongoose';

// Smart search & filter medicines with location awareness
export const searchMedicines = async (req, res) => {
  try {
    const { 
      q, 
      category, 
      availableOnly, 
      minPrice, 
      maxPrice, 
      sort, 
      lat, 
      lng 
    } = req.query;

    const queryConditions = {};

    // 1. Text search or regex matching
    if (q) {
      const searchRegex = new RegExp(q, 'i');
      queryConditions.$or = [
        { medicineName: searchRegex },
        { composition: searchRegex },
        { category: searchRegex },
        { manufacturer: searchRegex }
      ];
    }

    // 2. Filter by category
    if (category) {
      queryConditions.category = category;
    }

    // 3. Filter by stock availability
    if (availableOnly === 'true') {
      queryConditions.quantity = { $gt: 0 };
    }

    // 4. Price filter
    if (minPrice || maxPrice) {
      queryConditions.price = {};
      if (minPrice) queryConditions.price.$gte = Number(minPrice);
      if (maxPrice) queryConditions.price.$lte = Number(maxPrice);
    }

    // Handle distance calculations with $geoNear if coords are provided
    if (lat && lng) {
      const latVal = parseFloat(lat);
      const lngVal = parseFloat(lng);

      if (isNaN(latVal) || isNaN(lngVal)) {
        return res.status(400).json({ message: 'Invalid latitude or longitude coordinates' });
      }

      // Aggregate: start at Pharmacy (which holds geospatial index)
      const pipeline = [
        {
          $geoNear: {
            near: { type: "Point", coordinates: [lngVal, latVal] },
            distanceField: "distanceMeters",
            spherical: true,
          }
        },
        {
          $lookup: {
            from: "medicines",
            localField: "_id",
            foreignField: "pharmacyId",
            as: "medicines"
          }
        },
        { $unwind: "$medicines" },
        // Embed pharmacy info into each medicine document
        {
          $addFields: {
            "medicines.distance": { $divide: ["$distanceMeters", 1000] },
            "medicines.pharmacyId": {
              _id: "$_id",
              pharmacyName: "$pharmacyName",
              address: "$address",
              phone: "$phone",
              workingHours: "$workingHours"
            }
          }
        },
        // Promote medicines to root
        { $replaceRoot: { newRoot: "$medicines" } }
      ];

      // Convert conditions to aggregation match stage
      const matchConditions = {};
      if (q) {
        const regex = new RegExp(q, 'i');
        matchConditions.$or = [
          { medicineName: regex },
          { composition: regex },
          { category: regex },
          { manufacturer: regex }
        ];
      }
      if (category) {
        matchConditions.category = category;
      }
      if (availableOnly === 'true') {
        matchConditions.quantity = { $gt: 0 };
      }
      if (minPrice || maxPrice) {
        matchConditions.price = {};
        if (minPrice) matchConditions.price.$gte = Number(minPrice);
        if (maxPrice) matchConditions.price.$lte = Number(maxPrice);
      }

      if (Object.keys(matchConditions).length > 0) {
        pipeline.push({ $match: matchConditions });
      }

      // Add Sorting
      let sortStage = { $sort: { distance: 1 } }; // default nearest
      if (sort === 'cheapest') {
        sortStage = { $sort: { price: 1 } };
      } else if (sort === 'stock') {
        sortStage = { $sort: { quantity: -1 } };
      }
      pipeline.push(sortStage);

      const results = await Pharmacy.aggregate(pipeline);
      return res.status(200).json(results);

    } else {
      // Normal search without geo coordinates
      let query = Medicine.find(queryConditions).populate('pharmacyId');

      if (sort === 'cheapest') {
        query = query.sort({ price: 1 });
      } else if (sort === 'stock') {
        query = query.sort({ quantity: -1 });
      }

      const medicines = await query;
      // Map it to have uniform response structure
      const formatted = medicines.map(m => ({
        _id: m._id,
        medicineName: m.medicineName,
        manufacturer: m.manufacturer,
        category: m.category,
        composition: m.composition,
        strength: m.strength,
        description: m.description,
        quantity: m.quantity,
        price: m.price,
        image: m.image,
        distance: null,
        pharmacyId: m.pharmacyId
      }));

      return res.status(200).json(formatted);
    }
  } catch (error) {
    console.error('Search Medicines Error:', error);
    return res.status(500).json({ message: error.message || 'Error occurred while searching medicines' });
  }
};

// Get single medicine details
export const getMedicineById = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id).populate('pharmacyId');
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    return res.status(200).json(medicine);
  } catch (error) {
    console.error('Get Medicine Error:', error);
    return res.status(500).json({ message: 'Error retrieving medicine details' });
  }
};

// Owner: Register a new Pharmacy
export const registerPharmacy = async (req, res) => {
  try {
    const { pharmacyName, licenseNumber, address, phone, coordinates, workingHours } = req.body;

    // Check if owner already registered a pharmacy
    const existing = await Pharmacy.findOne({ owner: req.user._id });
    if (existing) {
      return res.status(400).json({ message: 'You have already registered a pharmacy' });
    }

    // Check license unique
    const licenseExists = await Pharmacy.findOne({ licenseNumber });
    if (licenseExists) {
      return res.status(400).json({ message: 'License number already registered' });
    }

    if (!coordinates || coordinates.length !== 2) {
      return res.status(400).json({ message: 'Coordinates are required as [lng, lat]' });
    }

    const newPharmacy = await Pharmacy.create({
      owner: req.user._id,
      pharmacyName,
      licenseNumber,
      address,
      phone,
      coordinates: {
        type: 'Point',
        coordinates: [parseFloat(coordinates[0]), parseFloat(coordinates[1])]
      },
      workingHours
    });

    return res.status(201).json(newPharmacy);
  } catch (error) {
    console.error('Register Pharmacy Error:', error);
    return res.status(500).json({ message: error.message || 'Error registering pharmacy' });
  }
};

// Owner: Manage Inventory
export const addMedicine = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ owner: req.user._id });
    if (!pharmacy) {
      return res.status(404).json({ message: 'Register a pharmacy first before listing inventory' });
    }

    const { medicineName, manufacturer, category, composition, strength, description, quantity, price, image } = req.body;

    const newMed = await Medicine.create({
      pharmacyId: pharmacy._id,
      medicineName,
      manufacturer,
      category,
      composition,
      strength,
      description,
      quantity,
      price,
      image
    });

    return res.status(201).json(newMed);
  } catch (error) {
    console.error('Add Medicine Error:', error);
    return res.status(500).json({ message: error.message || 'Error adding medicine' });
  }
};

export const updateMedicine = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ owner: req.user._id });
    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    const medicine = await Medicine.findOne({ _id: req.params.id, pharmacyId: pharmacy._id });
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found in your inventory' });
    }

    const updated = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return res.status(200).json(updated);
  } catch (error) {
    console.error('Update Medicine Error:', error);
    return res.status(500).json({ message: 'Error updating medicine' });
  }
};

export const deleteMedicine = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ owner: req.user._id });
    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    const medicine = await Medicine.findOne({ _id: req.params.id, pharmacyId: pharmacy._id });
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found in your inventory' });
    }

    await Medicine.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: 'Medicine deleted successfully' });
  } catch (error) {
    console.error('Delete Medicine Error:', error);
    return res.status(500).json({ message: 'Error deleting medicine' });
  }
};
