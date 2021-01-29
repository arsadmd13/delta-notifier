const mongoose = require('mongoose');

const recipientSchema = {
  app: {
    type: String,
    required: true
  },
  events: {
    type: Array,
    required: true
  },
  to: {
    type: Array,
    required: true
  },
  cc: {
    type: Array,
    required: true
  },
  bcc: {
    type: Array,
    required: true
  }
}

const Recipient = mongoose.model('Recipient', recipientSchema)

module.exports = Recipient