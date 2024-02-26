

$(document).ready(function () {
  const currentUserId = localStorage.getItem('userId');
  console.log(currentUserId);
  function sendMessage(messageText) {
      // Retrieve userId from localStorage or sessionStorage


      $.ajax({
        type: 'POST',
        url: '/user/send-message', // Update this URL to match your Express route for sending messages
        contentType: 'application/json',
        data: JSON.stringify({
          text: messageText,
          userId: currentUserId // Include the retrieved user ID
        }),
        success: function (response) {
          console.log('Message sent:', response.message);
        },
        error: function (xhr) {
          console.error('Error sending message:', xhr.responseText);
        }
      });
    }
    

//     Function to receive messages and update the chatroom UI
function loadMessages() {
  $('#chatMessages').empty();
  $.ajax({
    type: 'GET',
    url: '/user/get-messages',
    success: function (messages) {
      messages.forEach(message => {
        // Using Bootstrap classes for styling
        const messageElement = $('<div>')
          .addClass('mb-2 p-2 bg-white rounded shadow-sm')
          .text(`${message.username}: ${message.text}`);

        $('#chatMessages').append(messageElement);
      });
    },
    error: function (error) {
      console.error('Error loading messages:', error);
    }
  });
}


$(document).ready(function () {
  loadMessages(); // Load messages initially
  setInterval(loadMessages, 5000); // Refresh messages every 5000 milliseconds (5 seconds)
});



// Example usage: send a message when the user clicks the 'send' button
$('#sendMessageButton').click(function () {
  const messageText = $('#messageInput').val(); // Get message text from input field
  sendMessage(messageText);
  // Clear the input field after sending the message
  $('#messageInput').val('');
});

});

// messageText needs to be encrypted before being sent to the server...

////////////////////////////////////////////////////////////////////////////////////
//                               AES Encryption                                   //
////////////////////////////////////////////////////////////////////////////////////