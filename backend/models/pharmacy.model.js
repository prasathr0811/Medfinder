import mongoose from 'mongoose';

const pharmacySchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pharmacyName: {
    type: String,
    required: [true, 'Pharmacy name is required'],
    trim: true
  },
  licenseNumber: {
    type: String,
    required: [true, 'License number is required'],
    unique: true,
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  logo: {
    type: String,
    default: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  },
  workingHours: {
    type: String,
    default: '09:00 AM - 09:00 PM'
  }
}, {
  timestamps: true
});

// Create 2dsphere index for location search
pharmacySchema.index({ coordinates: '2dsphere' });

const Pharmacy = mongoose.model('Pharmacy', pharmacySchema);
export default Pharmacy;
