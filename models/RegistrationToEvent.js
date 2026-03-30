const mongoose = require('mongoose');

const registrationToEventSchema = new mongoose.Schema(
  {
    fullName:  { type: String, required: [true, 'Full name is required'] },
    contactNo: { type: String, required: [true, 'Contact number is required'] },
    email:     { type: String, required: [true, 'Email is required'] },
    eventId:   {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
    },
    eventTitle: { type: String }, // Denormalized for quick display without a join
    status:     { type: String, default: 'pending' },
  },
  { timestamps: true, collection: 'registration_to_event' } // explicit collection name
);

module.exports = mongoose.model('RegistrationToEvent', registrationToEventSchema);
