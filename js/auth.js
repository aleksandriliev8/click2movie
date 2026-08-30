"use strict";

function getCurrentUser() {
    var user = auth.currentUser;
    return user ? { email: user.email, uid: user.uid } : null;
}

function logoutUser() {
    auth.signOut().then(function () {
        showAuthScreen();
    });
}

function getUserDocRef() {
    var user = auth.currentUser;
    if (!user) return null;
    return db.collection("users").doc(user.uid);
}

function loadUserData() {
    var ref = getUserDocRef();
    if (!ref) return Promise.resolve(null);

    return ref.get().then(function (doc) {
        if (doc.exists) {
            return doc.data();
        }
        return null;
    });
}

function saveUserData(data) {
    var ref = getUserDocRef();
    if (!ref) return Promise.resolve();
    return ref.set(data, { merge: true });
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

function getFirebaseErrorMessage(errorCode) {
    switch (errorCode) {
        case "auth/email-already-in-use":
            return "An account with this email already exists.";
        case "auth/invalid-email":
            return "Please enter a valid email address.";
        case "auth/weak-password":
            return "Password must be at least 6 characters.";
        case "auth/user-not-found":
            return "No account found with this email.";
        case "auth/wrong-password":
            return "Invalid email or password.";
        case "auth/invalid-credential":
            return "Invalid email or password.";
        case "auth/too-many-requests":
            return "Too many attempts. Please try again later.";
        default:
            return "An error occurred. Please try again.";
    }
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

        auth.signInWithEmailAndPassword(email, password)
            .then(function () {
                loginForm.reset();
                showApp();
            })
            .catch(function (error) {
                showError("login-error", getFirebaseErrorMessage(error.code));
            });
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

        auth.createUserWithEmailAndPassword(email, password)
            .then(function (userCredential) {
                return db.collection("users").doc(userCredential.user.uid).set({
                    email: email,
                    favorites: [],
                    watched: [],
                    customMovies: [],
                    comments: {}
                });
            })
            .then(function () {
                registerForm.reset();
                showApp();
            })
            .catch(function (error) {
                showError("register-error", getFirebaseErrorMessage(error.code));
            });
    });

    auth.onAuthStateChanged(function (user) {
        if (user) {
            showApp();
        } else {
            showAuthScreen();
        }
    });
});
