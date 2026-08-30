"use strict";

var allMovies = [];
var seedMovies = [];
var sortAscending = true;

function loadMovies() {
    fetch("data/movies.json")
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            seedMovies = data;
            return loadUserData();
        })
        .then(function (userData) {
            allMovies = seedMovies.slice();
            if (userData && userData.customMovies) {
                allMovies = allMovies.concat(userData.customMovies);
            }
            renderMovieGrid();
        })
        .catch(function (error) {
            console.error("Failed to load movies:", error);
            allMovies = seedMovies.slice();
            renderMovieGrid();
        });
}

function sortMovies(movies) {
    return movies.slice().sort(function (a, b) {
        var titleA = a.title.toLowerCase();
        var titleB = b.title.toLowerCase();
        if (titleA < titleB) return sortAscending ? -1 : 1;
        if (titleA > titleB) return sortAscending ? 1 : -1;
        return 0;
    });
}

function renderMovieGrid() {
    var grid = document.getElementById("movie-grid");
    var sorted = sortMovies(allMovies);

    grid.innerHTML = "";

    sorted.forEach(function (movie) {
        var card = createMovieCard(movie);
        grid.appendChild(card);
    });
}

function createMovieCard(movie) {
    var card = document.createElement("article");
    card.className = "movie-card";

    var body = document.createElement("div");
    body.className = "movie-card-body";

    var title = document.createElement("h3");
    title.className = "movie-card-title";
    title.textContent = movie.title;

    var meta = document.createElement("p");
    meta.className = "movie-card-meta";
    meta.textContent = movie.year + " • " + movie.duration + " • " + (movie.genre || "N/A");

    var rating = document.createElement("p");
    rating.className = "movie-card-rating";
    rating.textContent = "★ " + movie.rating + "/10";

    var plot = document.createElement("p");
    plot.className = "movie-card-plot";
    plot.textContent = movie.plot || "";

    var actions = document.createElement("div");
    actions.className = "movie-card-actions";

    var moreBtn = document.createElement("button");
    moreBtn.className = "btn btn-primary";
    moreBtn.textContent = "More Info";
    moreBtn.addEventListener("click", function () {
        showMovieDetails(movie);
    });

    actions.appendChild(moreBtn);

    body.appendChild(title);
    body.appendChild(meta);
    body.appendChild(rating);
    body.appendChild(plot);
    body.appendChild(actions);
    card.appendChild(body);

    return card;
}

document.addEventListener("DOMContentLoaded", function () {
    var sortBtn = document.getElementById("sort-btn");
    if (sortBtn) {
        sortBtn.addEventListener("click", function () {
            sortAscending = !sortAscending;
            sortBtn.textContent = sortAscending ? "Sort: A → Z" : "Sort: Z → A";
            renderMovieGrid();
        });
    }

    var addMovieForm = document.getElementById("add-movie-form");
    if (addMovieForm) {
        addMovieForm.addEventListener("submit", function (e) {
            e.preventDefault();
            hideError("add-movie-error");

            var title = document.getElementById("movie-title").value.trim();
            var duration = document.getElementById("movie-duration").value.trim();
            var year = parseInt(document.getElementById("movie-year").value, 10);
            var rating = parseFloat(document.getElementById("movie-rating").value);
            var director = document.getElementById("movie-director").value.trim();

            var duplicate = allMovies.some(function (m) {
                return m.title.toLowerCase() === title.toLowerCase();
            });

            if (duplicate) {
                showError("add-movie-error", "A movie with this title already exists.");
                return;
            }

            var newMovie = {
                id: Date.now(),
                title: title,
                year: year,
                duration: duration,
                rating: rating,
                director: director,
                genre: "User Added",
                plot: "",
                isCustom: true
            };

            loadUserData().then(function (userData) {
                var customMovies = (userData && userData.customMovies) ? userData.customMovies : [];
                customMovies.push(newMovie);
                return saveUserData({ customMovies: customMovies });
            }).then(function () {
                allMovies.push(newMovie);
                addMovieForm.reset();
                renderMovieGrid();
                renderCustomMovies();
            });
        });
    }
});

function renderCustomMovies() {
    var container = document.getElementById("custom-movies-list");
    var noCustom = document.getElementById("no-custom");

    container.innerHTML = "";

    loadUserData().then(function (userData) {
        var customMovies = (userData && userData.customMovies) ? userData.customMovies : [];

        if (customMovies.length === 0) {
            noCustom.hidden = false;
            return;
        }

        noCustom.hidden = true;

        customMovies.forEach(function (movie) {
            var card = createMovieCard(movie);

            var actions = card.querySelector(".movie-card-actions");
            var removeBtn = document.createElement("button");
            removeBtn.className = "btn btn-danger";
            removeBtn.textContent = "Remove";
            removeBtn.addEventListener("click", function () {
                removeCustomMovie(movie.id);
            });
            actions.appendChild(removeBtn);

            container.appendChild(card);
        });
    });
}

function removeCustomMovie(movieId) {
    loadUserData().then(function (userData) {
        var customMovies = (userData && userData.customMovies) ? userData.customMovies : [];
        customMovies = customMovies.filter(function (m) {
            return m.id !== movieId;
        });
        return saveUserData({ customMovies: customMovies });
    }).then(function () {
        allMovies = allMovies.filter(function (m) {
            return m.id !== movieId;
        });
        renderCustomMovies();
        renderMovieGrid();
    });
}
