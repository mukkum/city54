/* variable declarations */ 

var socket

/* function declarations */

// type command in input field and submit to server
function autoType(text) {
  $('#input-command').focus()
  $('#input-command').val(text)
  setTimeout(submitCommand, 800)
}

// submit a command to the server and clear input field 
function submitCommand() {
  val = $('#input-command').val()
  socket.emit('chat-submit', { uuid: $.cookie('city54_uuid'), value: val })
  $('#input-command').val('')
}

/* let's go! */

$(document).ready(function() {

  // set up sockets
  socket = io.connect(window.location.origin)
  console.log(window.location.origin)
  
  // check for cookies
  if($.cookie('city54_uuid')) {
    console.log('uuid found: ' + $.cookie('city54_uuid'))
  } else {
    $.cookie('city54_uuid', uuid.v1())
    console.log('uuid set to' + $.cookie('city54_uuid'))
  }
  // send cookie to server for check 
  socket.emit('uuid-check', { uuid: $.cookie('city54_uuid') })

  // focus input field
  $('#input-command').focus()

  /* events */

  // a chat item comes in from the server
  socket.on('chat-update', function (data) {
    if(data.player_name == "System") {
      newElem = $('<li>' + data.value + '</li>')
    } else {
      newElem = $('<li>' + data.player_name + ': ' + data.value + '</li>')
    }
    $('ul#chat').append(newElem)
	  $('ul#chat').animate( {
		    scrollTop: $("ul#chat")[0].scrollHeight - $("ul#chat").innerHeight()
      }, {
	      duration: 300,//$("ul#chat li:last-child").height()*10,
        queue: false,
        easing: "swing"
      })
    })
    
  // user clicks on commands
  $("body").on("click","b[data-command]", null, function() { 
    autoType($(this).data("command")) 
  })

  // user hits enter in console
  $('#input-command').on("keypress", function(e) {
    if (e.keyCode == 13) { 
      submitCommand() 
    }
  })
  
})