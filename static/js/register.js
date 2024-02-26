//This will contain the front end code for Privacy Pulse Henry Daley and Dallas Lacombs Final Project
$(document).ready(function () {
  $('#registerButton').click(function () {
    console.log('Register button clicked')
    const username = $('#username').val();
    const password = $('#password').val();
    const confirmPassword = $('#confirmPassword').val();
    // const privateKey = '';
    // const publicKey = '';

    // Perform client-side validation here if needed

    // Make a POST request to your Express.js server to handle registration
    $.ajax({
      type: 'POST',
      url: '/user/register', // This should match the route defined in Express server. E.g., app.post('/user/register', ...)
      contentType: 'application/json',
      data: JSON.stringify({ username, password, confirmPassword}),
      success: function (data) {
        // Handle the server's response here
        console.log(data);
        window.location.href = 'login.html'; // Update with your path

      },
      error: function (error) {
        // Handle error here
        console.error('Error:', error);
      },
    });
    
  });

});