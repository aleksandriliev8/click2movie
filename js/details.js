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

    var omdbPromise = fetch("https://www.omdbapi.com/?t=" +
        encodeURIComponent(movie.title) +
        "&y=" + movie.year +
        "&apikey=" + OMDB_API_KEY)
        .then(function (response) {
            return response.json();
        })
        .catch(function () {
            return null;
        });

    var userPromise = loadUserData();

    Promise.all([omdbPromise, userPromise]).then(function (results) {
        renderDetails(movie, results[0], results[1]);
    });
}

function renderDetails(movie, omdbData, userData) {
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

    var favorites = (userData && userData.favorites) ? userData.favorites : [];
    var watched = (userData && userData.watched) ? userData.watched : [];

    var isFavorite = favorites.indexOf(movie.id) !== -1;
    var isWatched = watched.indexOf(movie.id) !== -1;

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

    var comments = (userData && userData.comments && userData.comments["m" + movie.id]) || [];

    if (previousScreen === "favorites-screen") {
        html += renderCommentSection(comments);
    }

    container.innerHTML = html;

    document.getElementById("toggle-favorite-btn").addEventListener("click", function () {
        toggleFavorite(movie.id).then(function () {
            showMovieDetails(movie, previousScreen);
        });
    });

    document.getElementById("toggle-watched-btn").addEventListener("click", function () {
        toggleWatched(movie.id).then(function () {
            showMovieDetails(movie, previousScreen);
        });
    });

    if (previousScreen === "favorites-screen") {
        setupCommentForm(movie);
    }
}

function renderCommentSection(comments) {
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

        var now = new Date();
        var dateStr = now.getFullYear() + "-" +
            String(now.getMonth() + 1).padStart(2, "0") + "-" +
            String(now.getDate()).padStart(2, "0");

        var newComment = {
            author: currentUser.email,
            date: dateStr,
            text: text
        };

        loadUserData().then(function (userData) {
            var comments = (userData && userData.comments) ? userData.comments : {};
            var key = "m" + movie.id;
            if (!comments[key]) {
                comments[key] = [];
            }
            comments[key].push(newComment);
            return saveUserData({ comments: comments });
        }).then(function () {
            showMovieDetails(movie, previousScreen);
        });
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
