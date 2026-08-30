"use strict";

function toggleFavorite(movieId) {
    return loadUserData().then(function (userData) {
        var favorites = (userData && userData.favorites) ? userData.favorites : [];
        var index = favorites.indexOf(movieId);

        if (index === -1) {
            favorites.push(movieId);
        } else {
            favorites.splice(index, 1);
        }

        return saveUserData({ favorites: favorites });
    });
}

function getFavoriteMovies() {
    return loadUserData().then(function (userData) {
        if (!userData || !userData.favorites) return [];

        return allMovies.filter(function (movie) {
            return userData.favorites.indexOf(movie.id) !== -1;
        });
    });
}

function renderFavorites() {
    var grid = document.getElementById("favorites-grid");
    var noFavorites = document.getElementById("no-favorites");

    grid.innerHTML = "";

    getFavoriteMovies().then(function (favorites) {
        if (favorites.length === 0) {
            noFavorites.hidden = false;
            return;
        }

        noFavorites.hidden = true;

        favorites.forEach(function (movie) {
            var card = createMovieCard(movie);

            var actions = card.querySelector(".movie-card-actions");

            var moreInfoBtn = actions.querySelector(".btn-primary");
            moreInfoBtn.addEventListener("click", function () {
                showMovieDetails(movie, "favorites-screen");
            });

            var removeBtn = document.createElement("button");
            removeBtn.className = "btn btn-danger";
            removeBtn.textContent = "Remove";
            removeBtn.addEventListener("click", function () {
                toggleFavorite(movie.id).then(function () {
                    renderFavorites();
                });
            });
            actions.appendChild(removeBtn);

            grid.appendChild(card);
        });
    });
}
