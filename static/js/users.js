$(document).ready(function() {
    const userId = localStorage.getItem('userId');
    if (userId) {
        $.ajax({
          url: `/user/get-user/${userId}`,
          type: 'GET',
          success: function(user) {
            $('#logged-in-user').text(`Logged in as ${user.username} and your public key is: ${user.publicKey}`);
          },
          error: function(jqXHR, textStatus, errorThrown) {
            console.error('AJAX error:', textStatus);
          }
        });
      } else {
        console.error('No user ID found in localStorage');
      }
    $.ajax({
      url: '/user/get-users',
      type: 'GET',
      success: function(data) {
        var usersList = $('#user-list');
        $.each(data, function(i, user) {
          usersList.append(`<h1> ${user.username} <span class='btn btn-primary btn-lg'>Chat</span> <u>PublicKey:</u> ${user.publicKey} </h1>`);
        });
        $('#users').append(usersList);
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.error('AJAX error:', textStatus);
      }
    });
  });