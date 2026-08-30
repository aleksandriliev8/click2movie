"use strict";

var OMDB_API_KEY = "9eb2b49";
var previousScreen = "catalog-screen";

function showMovieDetails(movie, fromScreen) {
    if (fromScreen) {
        previousScreen = fromScreen;
    } else {
        previousScreen = "catalog-screen";
    }

    showScreen("details-screen");

    var container = document.getElementById("movie-details");
    container.innerHTML = '<p class="empty-message">Loading movie details...</p>';

    var detailUrl = "https://www.omdbapi.com/?t=" +
        encodeURIComponent(movie.title) +
        "&y=" + movie.year +
        "&apikey=" + OMDB_API_KEY;

    fetch(detailUrl)
        .then(function (response) {
            return response.json();
        })
        .then(function (omdbData) {
            renderDetails(movie, omdbData);
        })
        .catch(function () {
            renderDetails(movie, null);
        });
}

function renderDetails(movie, omdbData) {
    var container = document.getElementById("movie-details");

    var posterUrl = "";
    var actors = "";
    var omdbPlot = "";
    var awards = "";

    if (omdbData && omdbData.Response === "True") {
        posterUrl = omdbData.Poster && omdbData.Poster !== "N/A" ? omdbData.Poster : "";
        actors = omdbData.Actors || "";
        omdbPlot = omdbData.Plot || "";
        awards = omdbData.Awards || "";
    }

    var plot = omdbPlot || movie.plot || "No plot available.";

    var currentUser = getCurrentUser();
    var users = getUsers();
    var user = users.find(function (u) {
        return u.email === currentUser.email;
    });

    var isFavorite = user && user.favorites && user.favorites.some(function (id) {
        return id === movie.id;
    });
    var isWatched = user && user.watched && user.watched.some(function (id) {
        return id === movie.id;
    });

    var html = '<div class="movie-details-header">';

    if (posterUrl) {
        html += '<div class="movie-details-poster"><img src="' + posterUrl + '" alt="' + movie.title + ' poster"></div>';
    } else {
        html += '<div class="poster-placeholder">No Poster Available</div>';
    }

    html += '<div class="movie-details-info">';
    html += '<h2>' + movie.title + '</h2>';
    html += '<div class="movie-details-meta">';
    html += '<span>' + movie.year + '</span>';
    html += '<span>' + movie.duration + '</span>';
    html += '<span>' + (movie.genre || "N/A") + '</span>';
    html += '<span>Director: ' + movie.director + '</span>';
    html += '</div>';
    html += '<p class="movie-details-rating">★ ' + movie.rating + '/10</p>';

    if (actors) {
        html += '<p class="movie-details-plot"><strong>Cast:</strong> ' + actors + '</p>';
    }
    if (awards && awards !== "N/A") {
        html += '<p class="movie-details-plot"><strong>Awards:</strong> ' + awards + '</p>';
    }

    html += '<p class="movie-details-plot">' + plot + '</p>';

    html += '<div class="movie-details-actions">';
    html += '<button class="btn ' + (isFavorite ? "btn-danger" : "btn-success") + '" id="toggle-favorite-btn">' +
        (isFavorite ? "Remove from Favorites" : "Add to Favorites") + '</button>';
    html += '<button class="btn ' + (isWatched ? "btn-danger" : "btn-secondary") + '" id="toggle-watched-btn">' +
        (isWatched ? "Remove from Watched" : "Mark as Watched") + '</button>';
    html += '</div>';

    html += '</div></div>';

    if (previousScreen === "favorites-screen") {
        html += renderCommentSection(movie);
    }

    container.innerHTML = html;

    document.getElementById("toggle-favorite-btn").addEventListener("click", function () {
        toggleFavorite(movie.id);
        showMovieDetails(movie, previousScreen);
    });

    document.getElementById("toggle-watched-btn").addEventListener("click", function () {
        toggleWatched(movie.id);
        showMovieDetails(movie, previousScreen);
    });

    if (previousScreen === "favorites-screen") {
        setupCommentForm(movie);
    }
}

function renderCommentSection(movie) {
    var currentUser = getCurrentUser();
    var users = getUsers();
    var user = users.find(function (u) {
        return u.email === currentUser.email;
    });

    var comments = (user && user.comments && user.comments[movie.id]) || [];

    var html = '<div class="comment-section">';
    html += '<h3>Comments</h3>';

    html += '<div class="comment-form">';
    html += '<textarea id="comment-text" maxlength="200" placeholder="Write your comment (max 200 characters)..."></textarea>';
    html += '<div class="comment-char-count"><span id="char-count">0</span>/200</div>';
    html += '<button class="btn btn-primary" id="submit-comment-btn">Add Comment</button>';
    html += '</div>';

    html += '<div class="comment-list" id="comment-list">';

    if (comments.length === 0) {
        html += '<p class="empty-message">No comments yet.</p>';
    } else {
        comments.forEach(function (comment) {
            html += '<div class="comment-item">';
            html += '<div class="comment-item-header">';
            html += '<span>' + comment.author + '</span>';
            html += '<span>' + comment.date + '</span>';
            html += '</div>';
            html += '<p class="comment-item-text">' + comment.text + '</p>';
            html += '</div>';
        });
    }

    html += '</div></div>';

    return html;
}

function setupCommentForm(movie) {
    var textarea = document.getElementById("comment-text");
    var charCount = document.getElementById("char-count");
    var submitBtn = document.getElementById("submit-comment-btn");

    if (!textarea) return;

    textarea.addEventListener("input", function () {
        charCount.textContent = textarea.value.length;
    });

    submitBtn.addEventListener("click", function () {
        var text = textarea.value.trim();

        if (text.length === 0) return;
        if (text.length > 200) return;

        var currentUser = getCurrentUser();
        var users = getUsers();
        var userIndex = users.findIndex(function (u) {
            return u.email === currentUser.email;
        });

        if (userIndex === -1) return;

        if (!users[userIndex].comments) {
            users[userIndex].comments = {};
        }
        if (!users[userIndex].comments[movie.id]) {
            users[userIndex].comments[movie.id] = [];
        }

        var now = new Date();
        var dateStr = now.getFullYear() + "-" +
            String(now.getMonth() + 1).padStart(2, "0") + "-" +
            String(now.getDate()).padStart(2, "0");

        users[userIndex].comments[movie.id].push({
            author: currentUser.email,
            date: dateStr,
            text: text
        });

        saveUsers(users);
        showMovieDetails(movie, previousScreen);
    });
}

document.addEventListener("DOMContentLoaded", function () {
    var backBtn = document.getElementById("back-to-catalog");
    if (backBtn) {
        backBtn.addEventListener("click", function () {
            history.back();
        });
    }
});
