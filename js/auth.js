"use strict";

function getUsers() {
    var users = localStorage.getItem("click2movie_users");
    return users ? JSON.parse(users) : [];
}

function saveUsers(users) {
    localStorage.setItem("click2movie_users", JSON.stringify(users));
}

function getCurrentUser() {
    var user = localStorage.getItem("click2movie_current_user");
    return user ? JSON.parse(user) : null;
}

function setCurrentUser(user) {
    localStorage.setItem("click2movie_current_user", JSON.stringify(user));
}

function logoutUser() {
    localStorage.removeItem("click2movie_current_user");
    showAuthScreen();
}

function validateEmail(email) {
    var pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
}

function showError(elementId, message) {
    var el = document.getElementById(elementId);
    el.textContent = message;
    el.hidden = false;
}

function hideError(elementId) {
    var el = document.getElementById(elementId);
    el.textContent = "";
    el.hidden = true;
}

document.addEventListener("DOMContentLoaded", function () {
    var loginForm = document.getElementById("login-form");
    var registerForm = document.getElementById("register-form");
    var showRegisterLink = document.getElementById("show-register");
    var showLoginLink = document.getElementById("show-login");

    showRegisterLink.addEventListener("click", function (e) {
        e.preventDefault();
        loginForm.hidden = true;
        registerForm.hidden = false;
        hideError("login-error");
    });

    showLoginLink.addEventListener("click", function (e) {
        e.preventDefault();
        registerForm.hidden = true;
        loginForm.hidden = false;
        hideError("register-error");
    });

    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();
        hideError("login-error");

        var email = document.getElementById("login-email").value.trim();
        var password = document.getElementById("login-password").value;

        if (!validateEmail(email)) {
            showError("login-error", "Please enter a valid email address.");
            return;
        }

        if (password.length < 6) {
            showError("login-error", "Password must be at least 6 characters.");
            return;
        }

        var users = getUsers();
        var user = users.find(function (u) {
            return u.email === email && u.password === password;
        });

        if (!user) {
            showError("login-error", "Invalid email or password.");
            return;
        }

        setCurrentUser({ email: user.email });
        loginForm.reset();
        showApp();
    });

    registerForm.addEventListener("submit", function (e) {
        e.preventDefault();
        hideError("register-error");

        var email = document.getElementById("register-email").value.trim();
        var password = document.getElementById("register-password").value;
        var confirm = document.getElementById("register-confirm").value;

        if (!validateEmail(email)) {
            showError("register-error", "Please enter a valid email address.");
            return;
        }

        if (password.length < 6) {
            showError("register-error", "Password must be at least 6 characters.");
            return;
        }

        if (password !== confirm) {
            showError("register-error", "Passwords do not match.");
            return;
        }

        var users = getUsers();
        var exists = users.some(function (u) {
            return u.email === email;
        });

        if (exists) {
            showError("register-error", "An account with this email already exists.");
            return;
        }

        users.push({
            email: email,
            password: password,
            favorites: [],
            watched: [],
            customMovies: [],
            comments: {}
        });
        saveUsers(users);

        setCurrentUser({ email: email });
        registerForm.reset();
        showApp();
    });
});
