import Reservation from '../models/reservation.model.js';
import Medicine from '../models/medicine.model.js';
import Pharmacy from '../models/pharmacy.model.js';
import QRCode from 'qrcode';
import PDFDocument from 'pdfkit';

// Helper to auto-expire reservations on query (self-healing mechanism)
const expireOutdatedReservations = async () => {
  try {
    const now = new Date();
    // Find reservations that are past expiresAt and still active
    const expired = await Reservation.find({
      expiresAt: { $lte: now },
      status: { $in: ['pending', 'confirmed', 'ready'] }
    });

    for (const res of expired) {
      res.status = 'expired';
      await res.save();

      // Return stock to inventory
      await Medicine.findByIdAndUpdate(res.medicineId, {
        $inc: { quantity: res.quantity }
      });
    }
  } catch (error) {
    console.error('Error auto-expiring reservations:', error);
  }
};

// Create reservation
export const createReservation = async (req, res) => {
  try {
    const { medicineId, quantity } = req.body;
    const userId = req.user._id;

    if (!medicineId || !quantity || quantity < 1) {
      return res.status(400).json({ message: 'Valid medicine ID and quantity are required' });
    }

    const medicine = await Medicine.findById(medicineId).populate('pharmacyId');
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    if (medicine.quantity < quantity) {
      return res.status(400).json({ message: `Only ${medicine.quantity} unit(s) available in stock` });
    }

    // Decrement stock
    medicine.quantity -= quantity;
    await medicine.save();

    // Create reservation placeholder to get ID
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    // Create actual reservation doc
    const reservation = new Reservation({
      userId,
      pharmacyId: medicine.pharmacyId._id,
      medicineId,
      quantity,
      status: 'pending',
      expiresAt: expires,
      qrCode: 'temp'
    });

    // Generate QR Code containing verification details
    const qrData = JSON.stringify({
      reservationId: reservation._id,
      userId,
      medicineName: medicine.medicineName,
      quantity,
      verificationKey: 'MEDFINDER-SECURE-PICKUP'
    });

    const qrCodeUrl = await QRCode.toDataURL(qrData);
    reservation.qrCode = qrCodeUrl;
    await reservation.save();

    return res.status(201).json(reservation);
  } catch (error) {
    console.error('Create Reservation Error:', error);
    return res.status(500).json({ message: error.message || 'Error creating reservation' });
  }
};

// Get reservations for customer
export const getCustomerReservations = async (req, res) => {
  try {
    await expireOutdatedReservations(); // Sync first
    const reservations = await Reservation.find({ userId: req.user._id })
      .populate('medicineId')
      .populate('pharmacyId')
      .sort({ reservationDate: -1 });

    return res.status(200).json(reservations);
  } catch (error) {
    console.error('Get Customer Reservations Error:', error);
    return res.status(500).json({ message: 'Error fetching reservations' });
  }
};

// Get reservations for pharmacy owner
export const getPharmacyReservations = async (req, res) => {
  try {
    await expireOutdatedReservations(); // Sync first
    const pharmacy = await Pharmacy.findOne({ owner: req.user._id });
    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    const reservations = await Reservation.find({ pharmacyId: pharmacy._id })
      .populate('medicineId')
      .populate('userId', 'name email')
      .sort({ reservationDate: -1 });

    return res.status(200).json(reservations);
  } catch (error) {
    console.error('Get Pharmacy Reservations Error:', error);
    return res.status(500).json({ message: 'Error fetching reservations' });
  }
};

// Update reservation status (Confirm, Ready, Collected, Cancel, Reject)
export const updateReservationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Role verification
    const isOwner = req.user.role === 'owner';
    const isCustomer = req.user.role === 'customer';

    if (isCustomer && status !== 'cancelled') {
      return res.status(403).json({ message: 'Customers can only cancel reservations' });
    }

    if (status === 'cancelled') {
      if (reservation.status !== 'pending' && reservation.status !== 'confirmed') {
        return res.status(400).json({ message: 'Reservation cannot be cancelled in current state' });
      }
      reservation.status = 'cancelled';
      // Restore stock
      await Medicine.findByIdAndUpdate(reservation.medicineId, {
        $inc: { quantity: reservation.quantity }
      });
    } else if (isOwner) {
      // Owner states: confirmed, ready, collected, cancelled (rejection)
      if (status === 'cancelled') { // Rejection
        reservation.status = 'cancelled';
        await Medicine.findByIdAndUpdate(reservation.medicineId, {
          $inc: { quantity: reservation.quantity }
        });
      } else {
        reservation.status = status;
      }
    }

    await reservation.save();
    return res.status(200).json(reservation);
  } catch (error) {
    console.error('Update Reservation Error:', error);
    return res.status(500).json({ message: error.message || 'Error updating reservation' });
  }
};

// Download Reservation Receipt PDF
export const downloadReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    const reservation = await Reservation.findById(id)
      .populate('medicineId')
      .populate('pharmacyId')
      .populate('userId', 'name email');

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Verify authorized user
    if (req.user.role !== 'admin' && 
        req.user._id.toString() !== reservation.userId._id.toString() && 
        req.user._id.toString() !== reservation.pharmacyId.owner.toString()) {
      return res.status(403).json({ message: 'You are not authorized to download this receipt' });
    }

    // Setup PDF doc
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=MedFinder-Receipt-${reservation._id}.pdf`);
    doc.pipe(res);

    // Header / Branding
    doc.fillColor('#4f46e5').fontSize(26).text('MedFinder', 50, 50);
    doc.fillColor('#6b7280').fontSize(10).text('Smart Medicine Availability & Reservation Platform', 50, 80);
    doc.moveTo(50, 100).lineTo(545, 100).strokeColor('#e5e7eb').stroke();

    // Title
    doc.fillColor('#111827').fontSize(16).text('RESERVATION RECEIPT', 50, 120, { align: 'center' });
    doc.moveDown(1.5);

    // Two column details layout
    const startY = 160;
    
    // Column 1: Reservation Details
    doc.fontSize(12).fillColor('#374151').text('Reservation Details:', 50, startY);
    doc.fontSize(10).fillColor('#6b7280').text('Reservation ID:', 50, startY + 20);
    doc.fillColor('#111827').text(reservation._id.toString(), 150, startY + 20);
    
    doc.fillColor('#6b7280').text('Status:', 50, startY + 35);
    doc.fillColor('#4f46e5').text(reservation.status.toUpperCase(), 150, startY + 35);
    
    doc.fillColor('#6b7280').text('Date Reserved:', 50, startY + 50);
    doc.fillColor('#111827').text(new Date(reservation.reservationDate).toLocaleString(), 150, startY + 50);
    
    doc.fillColor('#6b7280').text('Expires At:', 50, startY + 65);
    doc.fillColor('#ef4444').text(new Date(reservation.expiresAt).toLocaleString(), 150, startY + 65);

    // Column 2: Customer info
    doc.fontSize(12).fillColor('#374151').text('Customer Details:', 320, startY);
    doc.fontSize(10).fillColor('#6b7280').text('Name:', 320, startY + 20);
    doc.fillColor('#111827').text(reservation.userId.name, 400, startY + 20);
    
    doc.fillColor('#6b7280').text('Email:', 320, startY + 35);
    doc.fillColor('#111827').text(reservation.userId.email, 400, startY + 35);

    doc.moveTo(50, 260).lineTo(545, 260).strokeColor('#e5e7eb').stroke();

    // Medicine details table header
    const tableY = 280;
    doc.fillColor('#374151').fontSize(11).text('Medicine / Composition', 50, tableY);
    doc.text('Manufacturer', 220, tableY);
    doc.text('Qty', 370, tableY);
    doc.text('Unit Price', 420, tableY);
    doc.text('Total Price', 490, tableY);

    doc.moveTo(50, 295).lineTo(545, 295).strokeColor('#e5e7eb').stroke();

    // Medicine Row
    const rowY = 310;
    doc.fillColor('#111827').fontSize(10).text(reservation.medicineId.medicineName, 50, rowY);
    doc.fontSize(8).fillColor('#6b7280').text(reservation.medicineId.composition, 50, rowY + 12);
    
    doc.fontSize(10).fillColor('#111827').text(reservation.medicineId.manufacturer, 220, rowY);
    doc.text(reservation.quantity.toString(), 370, rowY);
    doc.text(`Rs. ${reservation.medicineId.price.toFixed(2)}`, 420, rowY);
    
    const totalPrice = reservation.quantity * reservation.medicineId.price;
    doc.text(`Rs. ${totalPrice.toFixed(2)}`, 490, rowY);

    doc.moveTo(50, 345).lineTo(545, 345).strokeColor('#e5e7eb').stroke();

    // Pharmacy Details
    const pharmY = 365;
    doc.fontSize(12).fillColor('#374151').text('Pickup Pharmacy Location:', 50, pharmY);
    doc.fontSize(10).fillColor('#111827').text(reservation.pharmacyId.pharmacyName, 50, pharmY + 20);
    doc.fontSize(9).fillColor('#6b7280').text(reservation.pharmacyId.address, 50, pharmY + 35, { width: 220 });
    doc.text(`Phone: ${reservation.pharmacyId.phone}`, 50, pharmY + 65);
    doc.text(`Hours: ${reservation.pharmacyId.workingHours}`, 50, pharmY + 80);

    // QR code embed
    if (reservation.qrCode) {
      try {
        const qrBase64 = reservation.qrCode.replace(/^data:image\/png;base64,/, "");
        const qrBuffer = Buffer.from(qrBase64, 'base64');
        doc.image(qrBuffer, 380, pharmY, { width: 120, height: 120 });
        doc.fontSize(8).fillColor('#9ca3af').text('Scan QR code at pharmacy counter for instant verification', 330, pharmY + 125, { align: 'center', width: 220 });
      } catch (err) {
        console.error('Error embedding QR into PDF:', err);
      }
    }

    // Footer note
    doc.moveTo(50, 520).lineTo(545, 520).strokeColor('#e5e7eb').stroke();
    doc.fontSize(9).fillColor('#9ca3af').text('Please present this receipt and scan the QR code to pick up your reserved medicines within 24 hours. The reservation will expire automatically after 24 hours.', 50, 535, { align: 'center', width: 495 });

    doc.end();
  } catch (error) {
    console.error('Download Receipt Error:', error);
    return res.status(500).json({ message: 'Error generating PDF receipt' });
  }
};
