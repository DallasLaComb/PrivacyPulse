
$('#loginButton').click(function () {
  const username = $('#username').val();
  const password = $('#password').val();

  $.ajax({
    type: 'POST',
    url: '/user/login',
    contentType: 'application/json',
    data: JSON.stringify({ username, password }),
    success: function (response) {
      if (response.uid) {
        // User is successfully logged in
        // Store userId in localStorage or sessionStorage
        localStorage.setItem('userId', response.uid);

        // Redirect to the users page
        window.location.href = 'users.html'; // Update with your path
      }
    },
    error: function (error) {
      console.error("Login failed:", error);
    }
  });
});