/*!
 * Module dependencies
 */

var mongoose = require('mongoose')
var Schema = mongoose.Schema

var ChatItemSchema = new Schema({
  player_uuid: { type: String, default: '' },
  player_name: { type: String, default: '' },
  value: { type: String, default: '' },
  type: { type: String, default: '' },
  time: { type : Date, default: Date.now }
})

/**
 * Register
 */

mongoose.model('ChatItem', ChatItemSchema)