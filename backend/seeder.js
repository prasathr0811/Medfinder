import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/user.model.js';
import Pharmacy from './models/pharmacy.model.js';
import Medicine from './models/medicine.model.js';
import Reservation from './models/reservation.model.js';
import QRCode from 'qrcode';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/medfinder';

const seedData = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    await User.deleteMany();
    await Pharmacy.deleteMany();
    await Medicine.deleteMany();
    await Reservation.deleteMany();
    console.log('Cleared existing data.');

    try {
      await User.collection.dropIndexes();
      await Pharmacy.collection.dropIndexes();
      await Medicine.collection.dropIndexes();
      await Reservation.collection.dropIndexes();
      console.log('Dropped old indexes.');
    } catch (err) {
      console.log('Index drop info/warning:', err.message);
    }

    // 1. Seed Users (1 Admin, 3 Owners, 5 Customers)
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@medfinder.com',
      password: 'admin123', // Will be hashed by user pre-save hook
      role: 'admin'
    });

    const owners = [];
    for (let i = 1; i <= 3; i++) {
      const owner = await User.create({
        name: `Owner ${i}`,
        email: `owner${i}@medfinder.com`,
        password: 'owner123',
        role: 'owner'
      });
      owners.push(owner);
    }

    const customers = [];
    for (let i = 1; i <= 5; i++) {
      const customer = await User.create({
        name: `Customer ${i}`,
        email: `customer${i}@medfinder.com`,
        password: 'user123',
        role: 'customer'
      });
      customers.push(customer);
    }
    console.log('Users seeded.');

    // 2. Seed 10 Pharmacies in Chennai
    const pharmacyData = [
      { name: 'Apollo Pharmacy Adyar', lat: 13.0012, lng: 80.2565, license: 'TN-56781', ownerIdx: 0, address: '12 LB Road, Adyar, Chennai - 600020', phone: '9876543210', hours: '08:00 AM - 10:00 PM' },
      { name: 'MedPlus T.Nagar', lat: 13.0418, lng: 80.2341, license: 'TN-56782', ownerIdx: 0, address: '47 Usman Road, T.Nagar, Chennai - 600017', phone: '9876543211', hours: '24 Hours Open' },
      { name: 'Aster Pharmacy Tambaram', lat: 12.9249, lng: 80.1000, license: 'TN-56783', ownerIdx: 0, address: 'GST Road, Tambaram, Chennai - 600045', phone: '9876543212', hours: '08:00 AM - 11:00 PM' },
      { name: 'Fortis Medics Anna Nagar', lat: 13.0850, lng: 80.2101, license: 'TN-56784', ownerIdx: 1, address: '3rd Avenue, Anna Nagar, Chennai - 600040', phone: '9876543213', hours: '09:00 AM - 09:30 PM' },
      { name: 'HealthKart Velachery', lat: 12.9815, lng: 80.2180, license: 'TN-56785', ownerIdx: 1, address: '100 Feet Road, Velachery, Chennai - 600042', phone: '9876543214', hours: '07:30 AM - 10:30 PM' },
      { name: 'Lifeline Pharmacy Porur', lat: 13.0350, lng: 80.1560, license: 'TN-56786', ownerIdx: 1, address: 'Mount Poonamallee Road, Porur, Chennai - 600116', phone: '9876543215', hours: '08:00 AM - 10:00 PM' },
      { name: 'Sun Pharma Outlet Perungudi', lat: 12.9675, lng: 80.2453, license: 'TN-56787', ownerIdx: 2, address: 'OMR Perungudi, Chennai - 600096', phone: '9876543216', hours: '24 Hours Open' },
      { name: 'Care Pharmacy Mylapore', lat: 13.0368, lng: 80.2676, license: 'TN-56788', ownerIdx: 2, address: '15 Kutchery Road, Mylapore, Chennai - 600004', phone: '9876543217', hours: '08:00 AM - 09:00 PM' },
      { name: 'MedLife Chromepet', lat: 12.9516, lng: 80.1462, license: 'TN-56789', ownerIdx: 2, address: 'GST Road, Chromepet, Chennai - 600044', phone: '9876543218', hours: '09:00 AM - 10:00 PM' },
      { name: '24/7 Meds Guindy', lat: 13.0067, lng: 80.2206, license: 'TN-56790', ownerIdx: 0, address: 'Anna Salai, Guindy, Chennai - 600032', phone: '9876543219', hours: '24 Hours Open' }
    ];

    const pharmacies = [];
    for (const p of pharmacyData) {
      const pharmacy = await Pharmacy.create({
        owner: owners[p.ownerIdx]._id,
        pharmacyName: p.name,
        licenseNumber: p.license,
        address: p.address,
        phone: p.phone,
        workingHours: p.hours,
        coordinates: {
          type: 'Point',
          coordinates: [p.lng, p.lat] // [lng, lat]
        }
      });
      pharmacies.push(pharmacy);
    }
    console.log('10 Pharmacies seeded.');

    // 3. Seed 50+ Medicines distributed across the pharmacies
    const medicineTemplates = [
      { name: 'Dolo 650', composition: 'Paracetamol 650mg', strength: '650mg', category: 'Analgesics', price: 30, desc: 'Effective fever reducer and pain reliever.', manufacturer: 'Micro Labs Ltd' },
      { name: 'Calpol 650', composition: 'Paracetamol 650mg', strength: '650mg', category: 'Analgesics', price: 28, desc: 'Used for mild to moderate pain relief and reducing fever.', manufacturer: 'GSK Pharmaceuticals' },
      { name: 'Crocin Advance', composition: 'Paracetamol 500mg', strength: '500mg', category: 'Analgesics', price: 25, desc: 'Provides fast-acting relief from headaches and body pain.', manufacturer: 'GSK Consumer Healthcare' },
      { name: 'Cetirizine 10mg', composition: 'Cetirizine Hydrochloride', strength: '10mg', category: 'Antihistamines', price: 15, desc: 'Relieves allergic symptoms like runny nose, sneezing, and watery eyes.', manufacturer: 'Cipla Ltd' },
      { name: 'Allegra 120mg', composition: 'Fexofenadine Hydrochloride', strength: '120mg', category: 'Antihistamines', price: 120, desc: 'Non-drowsy allergy relief for hives, sneezing, and itchy nose.', manufacturer: 'Sanofi India' },
      { name: 'Montair LC', composition: 'Montelukast 10mg + Levocetirizine 5mg', strength: '10mg/5mg', category: 'Antihistamines', price: 180, desc: 'Prescribed for asthma prevention and allergic rhinitis.', manufacturer: 'Cipla Ltd' },
      { name: 'Azithromycin 500', composition: 'Azithromycin 500mg', strength: '500mg', category: 'Antibiotics', price: 110, desc: 'Broad-spectrum antibiotic used to treat bacterial respiratory infections.', manufacturer: 'Alembic Pharmaceuticals' },
      { name: 'Amoxicillin 500', composition: 'Amoxicillin Trihydrate 500mg', strength: '500mg', category: 'Antibiotics', price: 85, desc: 'Penicillin-type antibiotic used to treat diverse bacterial infections.', manufacturer: 'Alkem Laboratories' },
      { name: 'Pantoprazole 40mg', composition: 'Pantoprazole Sodium 40mg', strength: '40mg', category: 'Antacids', price: 75, desc: 'Reduces excess stomach acid, helping with acid reflux and GERD.', manufacturer: 'Alkem Laboratories' },
      { name: 'Omez 20', composition: 'Omeprazole 20mg', strength: '20mg', category: 'Antacids', price: 45, desc: 'Proton pump inhibitor treating stomach ulcers and acid reflux.', manufacturer: 'Dr Reddys Laboratories' },
      { name: 'Zincovit', composition: 'Multivitamins + Minerals + Zinc', strength: 'Standard', category: 'Vitamins', price: 105, desc: 'Daily dietary supplement to boost overall immunity and strength.', manufacturer: 'Apex Laboratories' },
      { name: 'Limcee', composition: 'Vitamin C 500mg (Ascorbic Acid)', strength: '500mg', category: 'Vitamins', price: 35, desc: 'Orange flavored chewable Vitamin C tablets for immunity booster.', manufacturer: 'Abbott India' },
      { name: 'Metformin 500', composition: 'Metformin Hydrochloride 500mg', strength: '500mg', category: 'Antidiabetics', price: 22, desc: 'First-line medication for type 2 diabetes management.', manufacturer: 'Abbott India' },
      { name: 'Atorvastatin 10mg', composition: 'Atorvastatin Calcium 10mg', strength: '10mg', category: 'Cardiovascular', price: 68, desc: 'Lowers bad cholesterol (LDL) and triglycerides in blood.', manufacturer: 'Lupin Ltd' },
      { name: 'Amlodipine 5mg', composition: 'Amlodipine Besylate 5mg', strength: '5mg', category: 'Cardiovascular', price: 18, desc: 'Calcium channel blocker that helps treat high blood pressure.', manufacturer: 'Sun Pharma' },
      { name: 'ORS Powder', composition: 'Oral Rehydration Salts IP', strength: '21.8g Sachet', category: 'First Aid', price: 20, desc: 'Restores vital electrolytes and fluids lost due to dehydration.', manufacturer: 'FDC Ltd' },
      { name: 'Ibuprofen 400', composition: 'Ibuprofen 400mg', strength: '400mg', category: 'Analgesics', price: 12, desc: 'Non-steroidal anti-inflammatory drug (NSAID) for pain and swelling.', manufacturer: 'Abbott India' },
      { name: 'Volini Gel', composition: 'Diclofenac + Linseed Oil + Methyl Salicylate', strength: '30g Tube', category: 'Ointments', price: 115, desc: 'Fast-acting gel for joint, back, neck, and muscular pain relief.', manufacturer: 'Sun Pharma' },
      { name: 'Benadryl Cough Syrup', composition: 'Diphenhydramine + Ammonium Chloride', strength: '100ml', category: 'Cough & Cold', price: 95, desc: 'Soothing syrup for dry cough relief and throat tickles.', manufacturer: 'J&J Consumer Health' }
    ];

    const medicineImages = [
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1550572017-edd951b55104?w=300&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=300&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    ];

    const medicines = [];
    let count = 0;
    
    // Distribute various medicines among pharmacies
    for (const pharmacy of pharmacies) {
      for (const temp of medicineTemplates) {
        // Let's seed a subset of templates in each pharmacy to make the inventory catalog realistic and unique
        // We will seed 7-10 medicines per pharmacy, ensuring overlaps for alternative matching
        if ((count % 3 === 0 && pharmacy.pharmacyName.includes('Koramangala')) ||
            (count % 2 === 0 && pharmacy.pharmacyName.includes('Care')) ||
            (count % 5 !== 0)) {
          
          // Vary quantities to show: In Stock (>10), Low Stock (1-10), Out of Stock (0)
          let quantity = 50; // In stock
          if (count % 7 === 0) {
            quantity = 5; // Low Stock
          } else if (count % 11 === 0) {
            quantity = 0; // Out of stock
          }

          const med = await Medicine.create({
            pharmacyId: pharmacy._id,
            medicineName: temp.name,
            manufacturer: temp.manufacturer,
            category: temp.category,
            composition: temp.composition,
            strength: temp.strength,
            description: temp.desc,
            quantity,
            price: temp.price + (count % 5), // Slight price variation
            image: medicineImages[count % medicineImages.length]
          });
          medicines.push(med);
        }
        count++;
      }
    }
    console.log(`Seeded ${medicines.length} medicine records.`);

    // 4. Seed 100+ reservations across various customers, pharmacies, and medicines
    const statuses = ['pending', 'confirmed', 'ready', 'collected', 'cancelled', 'expired'];
    const reservations = [];
    
    console.log('Generating 100 reservations...');
    for (let i = 0; i < 105; i++) {
      const customer = customers[i % customers.length];
      const medicine = medicines[i % medicines.length];
      const pharmacy = pharmacies.find(p => p._id.toString() === medicine.pharmacyId.toString());

      const quantity = (i % 3) + 1; // 1, 2 or 3
      const status = statuses[i % statuses.length];
      
      // Calculate reservation date: some past, some today
      const reservationDate = new Date();
      reservationDate.setDate(reservationDate.getDate() - (i % 15)); // up to 15 days ago

      const expiresAt = new Date(reservationDate);
      expiresAt.setHours(expiresAt.getHours() + 24);

      // Generate a mock QR code string to avoid executing async QR function 100 times, or do it fast
      const qrData = JSON.stringify({
        reservationId: `RES-${i}-MOCK`,
        userId: customer._id,
        medicineName: medicine.medicineName,
        quantity,
        verificationKey: 'MEDFINDER-SECURE-PICKUP'
      });
      // We can generate standard canvas data URL fast
      const qrCode = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`; // Red dot fallback dataurl

      const resv = await Reservation.create({
        userId: customer._id,
        pharmacyId: pharmacy._id,
        medicineId: medicine._id,
        quantity,
        qrCode,
        status,
        reservationDate,
        expiresAt
      });
      reservations.push(resv);
    }
    console.log('Seeded 105 reservation history records.');

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Failed:', error);
    process.exit(1);
  }
};

seedData();
