"use strict";

var navigatingBack = false;

function showScreen(screenId, addToHistory) {
    var screens = document.querySelectorAll("main .screen");
    screens.forEach(function (screen) {
        screen.hidden = true;
    });

    var target = document.getElementById(screenId);
    if (target) {
        target.hidden = false;
    }

    var navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach(function (link) {
        link.classList.remove("active");
        if (link.dataset.screen === screenId) {
            link.classList.add("active");
        }
    });

    if (addToHistory !== false && !navigatingBack) {
        history.pushState({ screen: screenId }, "", "#" + screenId);
    }

    closeMobileMenu();
    window.scrollTo(0, 0);
}

function showAuthScreen() {
    document.getElementById("auth-screen").hidden = false;
    document.getElementById("app").hidden = true;
}

function showApp() {
    document.getElementById("auth-screen").hidden = true;
    document.getElementById("app").hidden = false;
    var currentUser = getCurrentUser();
    if (currentUser) {
        document.getElementById("user-email").textContent = currentUser.email;
    }
    showScreen("catalog-screen");
    loadMovies();
}

function closeMobileMenu() {
    var navLinks = document.querySelector(".nav-links");
    var navUser = document.querySelector(".nav-user");
    if (navLinks) navLinks.classList.remove("open");
    if (navUser) navUser.classList.remove("open");
}

function refreshScreenContent(screenId) {
    if (screenId === "favorites-screen") {
        renderFavorites();
    } else if (screenId === "watched-screen") {
        renderWatched();
    } else if (screenId === "add-movie-screen") {
        renderCustomMovies();
    } else if (screenId === "catalog-screen") {
        renderMovieGrid();
    }
}

window.addEventListener("popstate", function (e) {
    if (e.state && e.state.screen) {
        navigatingBack = true;
        showScreen(e.state.screen, false);
        refreshScreenContent(e.state.screen);
        navigatingBack = false;
    }
});

document.addEventListener("DOMContentLoaded", function () {
    var navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach(function (link) {
        link.addEventListener("click", function (e) {
            e.preventDefault();
            var screenId = this.dataset.screen;
            showScreen(screenId);
            refreshScreenContent(screenId);
        });
    });

    var hamburger = document.getElementById("hamburger-btn");
    if (hamburger) {
        hamburger.addEventListener("click", function () {
            document.querySelector(".nav-links").classList.toggle("open");
            document.querySelector(".nav-user").classList.toggle("open");
        });
    }

    var logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function () {
            logoutUser();
        });
    }

    if (getCurrentUser()) {
        showApp();
    } else {
        showAuthScreen();
    }
});
