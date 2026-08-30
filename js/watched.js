"use strict";

function toggleWatched(movieId) {
    return loadUserData().then(function (userData) {
        var watched = (userData && userData.watched) ? userData.watched : [];
        var index = watched.indexOf(movieId);

        if (index === -1) {
            watched.push(movieId);
        } else {
            watched.splice(index, 1);
        }

        return saveUserData({ watched: watched });
    });
}

function getWatchedMovies() {
    return loadUserData().then(function (userData) {
        if (!userData || !userData.watched) return [];

        return allMovies.filter(function (movie) {
            return userData.watched.indexOf(movie.id) !== -1;
        });
    });
}

function renderWatched() {
    var grid = document.getElementById("watched-grid");
    var noWatched = document.getElementById("no-watched");

    grid.innerHTML = "";

    getWatchedMovies().then(function (watched) {
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
                toggleWatched(movie.id).then(function () {
                    renderWatched();
                });
            });
            actions.appendChild(removeBtn);

            grid.appendChild(card);
        });
    });
}
