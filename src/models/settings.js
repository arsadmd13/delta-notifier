const mongoose = require('mongoose');

const settingSchema = {
  group:{
    type: String,
    required: true
  },
  name:{
    type: String,
    required: true
  },
  value:{
    type: String,
    required: true
  }
}

const Setting = mongoose.model('Setting', settingSchema)

module.exports = Setting