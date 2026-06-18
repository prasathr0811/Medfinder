import Medicine from '../models/medicine.model.js';
import Pharmacy from '../models/pharmacy.model.js';
import Reservation from '../models/reservation.model.js';
import User from '../models/user.model.js';

// Owner Analytics
export const getOwnerAnalytics = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ owner: req.user._id });
    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    const pharmacyId = pharmacy._id;

    // 1. Core KPIs
    const totalMedicines = await Medicine.countDocuments({ pharmacyId });
    const totalReservations = await Reservation.countDocuments({ pharmacyId });
    const activeReservations = await Reservation.countDocuments({
      pharmacyId,
      status: { $in: ['pending', 'confirmed', 'ready'] }
    });
    const lowStockMedicines = await Medicine.countDocuments({
      pharmacyId,
      quantity: { $lte: 10, $gt: 0 }
    });

    // 2. Reservation Trends (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const reservationTrendsRaw = await Reservation.aggregate([
      {
        $match: {
          pharmacyId,
          reservationDate: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$reservationDate" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Fill in missing days
    const reservationTrends = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      const match = reservationTrendsRaw.find(r => r._id === dateString);
      reservationTrends.push({
        date: dateString,
        reservations: match ? match.count : 0
      });
    }

    // 3. Inventory Stock by Category
    const inventoryTrends = await Medicine.aggregate([
      { $match: { pharmacyId } },
      {
        $group: {
          _id: "$category",
          totalStock: { $sum: "$quantity" },
          itemCount: { $sum: 1 }
        }
      },
      { $project: { name: "$_id", stock: "$totalStock", items: "$itemCount", _id: 0 } }
    ]);

    // 4. Medicine Demand (Top 5 items)
    const medicineDemand = await Reservation.aggregate([
      { $match: { pharmacyId } },
      {
        $group: {
          _id: "$medicineId",
          totalReserved: { $sum: "$quantity" }
        }
      },
      { $sort: { totalReserved: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "medicines",
          localField: "_id",
          foreignField: "_id",
          as: "medicineDetails"
        }
      },
      { $unwind: "$medicineDetails" },
      {
        $project: {
          name: "$medicineDetails.medicineName",
          value: "$totalReserved",
          _id: 0
        }
      }
    ]);

    // 5. List of Low Stock Medicines
    const lowStockList = await Medicine.find({
      pharmacyId,
      quantity: { $lte: 10 }
    }).limit(10);

    return res.status(200).json({
      summary: {
        totalMedicines,
        totalReservations,
        activeReservations,
        lowStockMedicines
      },
      reservationTrends,
      inventoryTrends,
      medicineDemand,
      lowStockList
    });
  } catch (error) {
    console.error('Owner Analytics Error:', error);
    return res.status(500).json({ message: 'Error retrieving analytics data' });
  }
};

// Admin Analytics & User/Pharmacy Management
export const getAdminAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });
    const totalPharmacies = await Pharmacy.countDocuments();
    const totalMedicines = await Medicine.countDocuments();
    const totalReservations = await Reservation.countDocuments();

    // 1. Reservation statuses breakdown
    const statusCounts = await Reservation.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const statusObj = {
      pending: 0, confirmed: 0, ready: 0, collected: 0, cancelled: 0, expired: 0
    };
    statusCounts.forEach(s => {
      if (statusObj[s._id] !== undefined) statusObj[s._id] = s.count;
    });

    const reservationPie = Object.keys(statusObj).map(key => ({
      name: key.toUpperCase(),
      value: statusObj[key]
    }));

    // 2. User roles distribution
    const roleCounts = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } }
    ]);

    // 3. User growth trend (mock monthly values for visual completeness)
    const userGrowth = [
      { month: 'Jan', users: 12 },
      { month: 'Feb', users: 25 },
      { month: 'Mar', users: 48 },
      { month: 'Apr', users: 76 },
      { month: 'May', users: 110 },
      { month: 'Jun', users: totalUsers }
    ];

    // 4. Medicine distribution per category
    const categoryDistribution = await Medicine.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $project: { name: "$_id", count: "$count", _id: 0 } },
      { $sort: { count: -1 } },
      { $limit: 6 }
    ]);

    return res.status(200).json({
      summary: {
        totalUsers,
        totalPharmacies,
        totalMedicines,
        totalReservations,
        monthlyGrowth: 18.5 // mock growth percentage
      },
      reservationPie,
      roleCounts,
      userGrowth,
      categoryDistribution
    });
  } catch (error) {
    console.error('Admin Analytics Error:', error);
    return res.status(500).json({ message: 'Error retrieving platform statistics' });
  }
};

// Admin: Manage Users list
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).select('-password').sort({ createdAt: -1 });
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving users' });
  }
};

// Admin: Toggle user status (Suspend / Activate)
export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Admin accounts cannot be suspended' });
    }

    user.isSuspended = !user.isSuspended;
    await user.save();

    return res.status(200).json({
      message: `User status changed to ${user.isSuspended ? 'suspended' : 'active'}`,
      user
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating user status' });
  }
};

// Admin: Manage Pharmacies list
export const getPharmacies = async (req, res) => {
  try {
    const pharmacies = await Pharmacy.find().populate('owner', 'name email').sort({ createdAt: -1 });
    return res.status(200).json(pharmacies);
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving pharmacies' });
  }
};
