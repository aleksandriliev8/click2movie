"use strict";

function toggleFavorite(movieId) {
    var currentUser = getCurrentUser();
    var users = getUsers();
    var userIndex = users.findIndex(function (u) {
        return u.email === currentUser.email;
    });

    if (userIndex === -1) return;

    if (!users[userIndex].favorites) {
        users[userIndex].favorites = [];
    }

    var favIndex = users[userIndex].favorites.indexOf(movieId);

    if (favIndex === -1) {
        users[userIndex].favorites.push(movieId);
    } else {
        users[userIndex].favorites.splice(favIndex, 1);
    }

    saveUsers(users);
}

function getFavoriteMovies() {
    var currentUser = getCurrentUser();
    if (!currentUser) return [];

    var users = getUsers();
    var user = users.find(function (u) {
        return u.email === currentUser.email;
    });

    if (!user || !user.favorites) return [];

    return allMovies.filter(function (movie) {
        return user.favorites.indexOf(movie.id) !== -1;
    });
}

function renderFavorites() {
    var grid = document.getElementById("favorites-grid");
    var noFavorites = document.getElementById("no-favorites");
    var favorites = getFavoriteMovies();

    grid.innerHTML = "";

    if (favorites.length === 0) {
        noFavorites.hidden = false;
        return;
    }

    noFavorites.hidden = true;

    favorites.forEach(function (movie) {
        var card = createMovieCard(movie);

        var actions = card.querySelector(".movie-card-actions");

        var moreInfoBtn = actions.querySelector(".btn-primary");
        moreInfoBtn.removeEventListener("click", moreInfoBtn._handler);
        moreInfoBtn.addEventListener("click", function () {
            showMovieDetails(movie, "favorites-screen");
        });

        var removeBtn = document.createElement("button");
        removeBtn.className = "btn btn-danger";
        removeBtn.textContent = "Remove";
        removeBtn.addEventListener("click", function () {
            toggleFavorite(movie.id);
            renderFavorites();
        });
        actions.appendChild(removeBtn);

        grid.appendChild(card);
    });
}
