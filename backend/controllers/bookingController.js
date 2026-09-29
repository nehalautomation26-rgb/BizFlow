const Booking = require('../models/Booking');
const sendEmail = require('../utils/sendEmail');

// @route   POST /api/bookings
// @desc    Create a new appointment/booking
const createBooking = async (req, res) => {
  try {
    const { customerName, customerPhone, customerEmail, serviceName, bookingDate, timeSlot, notes } = req.body;

    if (!customerName || !customerPhone || !serviceName || !bookingDate || !timeSlot) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    const booking = await Booking.create({
      customerName,
      customerPhone,
      customerEmail,
      serviceName,
      bookingDate: new Date(bookingDate),
      timeSlot,
      notes,
      owner: req.user.id,
    });

    // Send email confirmation if customer email is provided
    if (customerEmail) {
      const formattedDate = new Date(bookingDate).toLocaleDateString();
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #1a365d;">Appointment Confirmation</h2>
          <p>Dear <strong>${customerName}</strong>,</p>
          <p>Your appointment for <strong>${serviceName}</strong> has been successfully booked!</p>
          <div style="background: #f4f6f9; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <p>📅 <strong>Date:</strong> ${formattedDate}</p>
            <p>⏰ <strong>Time Slot:</strong> ${timeSlot}</p>
            <p>📌 <strong>Status:</strong> Pending Confirmation</p>
            ${notes ? `<p>📝 <strong>Notes:</strong> ${notes}</p>` : ''}
          </div>
          <p>Thank you for choosing our services!</p>
        </div>
      `;

      await sendEmail({
        to: customerEmail,
        subject: `Appointment Confirmed - ${serviceName}`,
        html: emailHtml,
      });
    }

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET /api/bookings
// @desc    Get all bookings for the logged-in user
const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ owner: req.user.id }).sort({ bookingDate: 1, timeSlot: 1 });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   PATCH /api/bookings/:id/status
// @desc    Update status of a booking
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const booking = await Booking.findOne({ _id: req.params.id, owner: req.user.id });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = status;
    await booking.save();

    // Send status update email if customer email exists
    if (booking.customerEmail) {
      await sendEmail({
        to: booking.customerEmail,
        subject: `Appointment Status Update: ${status}`,
        html: `<p>Dear ${booking.customerName}, your appointment for ${booking.serviceName} is now <strong>${status}</strong>.</p>`,
      });
    }

    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   DELETE /api/bookings/:id
// @desc    Delete a booking
const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findOneAndDelete({ _id: req.params.id, owner: req.user.id });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.status(200).json({ message: 'Booking cancelled and removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createBooking,
  getBookings,
  updateBookingStatus,
  deleteBooking,
};