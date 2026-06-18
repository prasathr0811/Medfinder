import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pharmacyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pharmacy',
    required: true
  },
  medicineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
    required: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  qrCode: {
    type: String, // Base64 Data URL or string representation
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'ready', 'collected', 'cancelled', 'expired'],
    default: 'pending'
  },
  reservationDate: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
  }
}, {
  timestamps: true
});

// Automatic index to expire documents or status transition.
// Note: We'll also run programmatic checks to update status to 'expired' rather than hard-deleting,
// because hard deleting would remove them from history.
// We can use mongoose middleware or a pre-find hook to mark expired reservations on the fly!
// This is much safer than TTL index which deletes the document. We want to preserve history but mark status as expired.
// Let's implement that in a post-init/pre-find query middleware.

reservationSchema.pre(/^find/, function(next) {
  // We don't update db directly in a query middleware unless we do updateMany, but we can do it programmatically
  // in our controllers. Let's make sure the controller checks for expired reservations and updates them.
  next();
});

const Reservation = mongoose.model('Reservation', reservationSchema);
export default Reservation;
