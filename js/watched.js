"use strict";

function toggleWatched(movieId) {
    var currentUser = getCurrentUser();
    var users = getUsers();
    var userIndex = users.findIndex(function (u) {
        return u.email === currentUser.email;
    });

    if (userIndex === -1) return;

    if (!users[userIndex].watched) {
        users[userIndex].watched = [];
    }

    var watchedIndex = users[userIndex].watched.indexOf(movieId);

    if (watchedIndex === -1) {
        users[userIndex].watched.push(movieId);
    } else {
        users[userIndex].watched.splice(watchedIndex, 1);
    }

    saveUsers(users);
}

function getWatchedMovies() {
    var currentUser = getCurrentUser();
    if (!currentUser) return [];

    var users = getUsers();
    var user = users.find(function (u) {
        return u.email === currentUser.email;
    });

    if (!user || !user.watched) return [];

    return allMovies.filter(function (movie) {
        return user.watched.indexOf(movie.id) !== -1;
    });
}

function renderWatched() {
    var grid = document.getElementById("watched-grid");
    var noWatched = document.getElementById("no-watched");
    var watched = getWatchedMovies();

    grid.innerHTML = "";

    if (watched.length === 0) {
        noWatched.hidden = false;
        return;
    }

    noWatched.hidden = true;

    watched.forEach(function (movie) {
        var card = createMovieCard(movie);

        var actions = card.querySelector(".movie-card-actions");

        var moreInfoBtn = actions.querySelector(".btn-primary");
        moreInfoBtn.addEventListener("click", function () {
            showMovieDetails(movie, "watched-screen");
        });

        var removeBtn = document.createElement("button");
        removeBtn.className = "btn btn-danger";
        removeBtn.textContent = "Remove";
        removeBtn.addEventListener("click", function () {
            toggleWatched(movie.id);
            renderWatched();
        });
        actions.appendChild(removeBtn);

        grid.appendChild(card);
    });
}
