const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add an event title'],
    trim: true,
  },
  date: {
    type: String,
    required: [true, 'Please add an event date'],
  },
  time: {
    type: String,
  },
  location: {
    type: String,
    required: [true, 'Please add a location'],
  },
  slots: {
    type: Number,
    required: [true, 'Please add available slots'],
    default: 0,
  },
  price: {
    type: String,
    default: 'Free',
  },
  category: {
    type: String,
    enum: ['Seminar', 'Workshop', 'Bootcamp', 'Masterclass', 'Webinar'],
    default: 'Masterclass',
  },
  description: {
    type: String,
  },
  image: {
    type: String,
    default: 'default-event.jpg',
  },
  status: {
    type: String,
    enum: ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'],
    default: 'Upcoming',
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Event', eventSchema);
