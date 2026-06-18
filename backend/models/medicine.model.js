import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema({
  pharmacyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pharmacy',
    required: true
  },
  medicineName: {
    type: String,
    required: [true, 'Medicine name is required'],
    trim: true
  },
  manufacturer: {
    type: String,
    required: [true, 'Manufacturer is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  composition: {
    type: String,
    required: [true, 'Composition is required'],
    trim: true
  },
  strength: {
    type: String,
    required: [true, 'Strength is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative'],
    default: 0
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  }
}, {
  timestamps: true
});

// Create text index for search functionality
medicineSchema.index({
  medicineName: 'text',
  category: 'text',
  composition: 'text',
  manufacturer: 'text'
});

const Medicine = mongoose.model('Medicine', medicineSchema);
export default Medicine;
