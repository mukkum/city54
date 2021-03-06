var mongoose = require('mongoose')
var ChatItem = mongoose.model('ChatItem')

// handle errors
var handleError = function(err) {
  console.log(err)
  return err
}

// returns first word
var getCommand = function(input) {
  if(input) {
    var words = input.split(" ")
    return words[0]
  } else {
    return null
  }
}

// returns string without first word
var getObject = function(input) {
  var words = input.split(" ")
  if(words.length < 2) {
    return ""
  }
  words.splice(0,1)
  return words.join(" ")
}

// parse world descriptions for links
var linkify = function(text) {
  text = text.replace(/\[(.*?)\|(.*?)\]/g,'<b data-command="$2">$1</b>') // parse old links
  text = text.replace(/\[(.*?)\]/g,'<b data-command="$1"></b>') // parse new links
  
	return text
}

// send text to client
// player: playing belonging to the socket, both causing the message
// emitter: player object of the sender ( usually the player again, or {name: "System"})
// value: the message
// mode: the recipients group
// type: info about the message type for the front end
//
// IDEE / REFACTOR : instead of taking metadata from player (which does not work for group messages to socket.io rooms)
// , pass only the relevant ones in the arguments if required
//
var write = function(socket, player, emitter, value, mode, type, recipient) {

  var chat_item = new ChatItem({ 
    player_uuid: player.uuid, 
    sender_name: emitter.name,
    player_name: (mode == "sender" || mode == "socket") ? player.name : null, 
    player_room: (mode == "sender" || mode == "socket") ? player.currentRoom : null, 
    player_state: (mode == "sender" || mode == "socket") ? player.state : null,
    value: value, 
    type: type
  })
  chat_item.save()

  if (recipient != undefined)
    recipient_uuid = recipient.uuid
  else
    recipient_uuid = null

  // broadcast to everyone
  if(mode == "everyone")  
    socket.broadcast.emit('chat-update', chat_item)

  // broadcast to everyone else in room
  if(mode == "everyone else") {
    socket.broadcast.to(player.currentRoom).emit('chat-update', chat_item) 
  }

  // broadcast to everyone else in room and sender
  if(mode == "everyone else and me") {
    socket.to(player.currentRoom).emit('chat-update', chat_item)
    socket.broadcast.to(player.currentRoom).to(recipient_uuid).emit('chat-update', chat_item) 
  }

  // send to chat
  if(mode == "chat") {
    socket.broadcast.to(player.currentChat).emit('chat-update', chat_item) 
  }

  // send to player
  if(mode == "everyone" || mode == "sender") {
    socket.to(player.uuid).emit('chat-update', chat_item) 
  }

  // send back to socket
  if(mode == "everyone" || mode == "socket") {
    socket.emit('chat-update', chat_item) 
  }  
}

module.exports.linkify = linkify
module.exports.getCommand = getCommand
module.exports.getObject = getObject
module.exports.handleError = handleError
module.exports.write = write