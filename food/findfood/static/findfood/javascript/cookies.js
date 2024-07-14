document.addEventListener('DOMContentLoaded', function() {
    // Function to set a cookie
    function setCookie(name, value) {
        document.cookie = name + "=" + (value || "") + "; path=/";
    }

    // Function to update the username cookie based on user input [username]
    function updateUsernameCookie() {
        const usernameInput = document.getElementById('usernameInput').value;
        if (usernameInput) {
            setCookie('username', usernameInput);
            window.location.href = "ws/chat.html";
        } else {
            alert('Please enter a username.');
        }
    }

    // Add event listener to the button
    const setCookieButton = document.getElementById('setCookieButton');
    if (setCookieButton) {
        setCookieButton.addEventListener('click', updateUsernameCookie);
    }

});
