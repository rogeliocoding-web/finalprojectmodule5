const movieInput = document.getElementById('movie-input');
const searchBtn = document.getElementById('search-btn');
const movieResult = document.getElementById('movie-result');
const sortFilter = document.getElementById('sort-filter');

const apiKey = "c60eae1a";

let cachedMovies = [];

// Maps sort values to human-readable labels
const sortLabels = {
    '':       'Top Rated Movies',
    'A_TO_Z': 'Alphabetical A to Z',
    'Z_TO_A': 'Alphabetical Z to A',
    'NEWEST': 'Newest to Oldest',
    'OLDEST': 'Oldest to Newest',
}

// Returns the correct header string based on context
function getHeaderText(movieTitle = '') {
    const sortValue = sortFilter.value;
    const sortLabel = sortLabels[sortValue] || 'Top Rated Movies';

    if (movieTitle) {
        // Search results — show title + sort if one is active
        return sortValue
            ? `Results for "${movieTitle}" — ${sortLabel}`
            : `Results for "${movieTitle}"`;
    } else {
        // Default top-rated view — just show the sort label
        return sortLabel;
    }
}

// Builds a single movie card as an HTML string
function buildMovieCard(movie) {
    const poster = movie.Poster !== 'N/A'
        ? movie.Poster
        : 'https://via.placeholder.com/300x450?text=No+Poster';

    return `
        <div class="movie-card">
            <img src="${poster}" alt="${movie.Title} Poster">
            <div class="movie-card__info">
                <h2>${movie.Title}</h2>
                <p><strong>Year:</strong> ${movie.Year}</p>
                <p><strong>Rated:</strong> ${movie.Rated}</p>
                <p><strong>Runtime:</strong> ${movie.Runtime}</p>
                <p><strong>Genre:</strong> ${movie.Genre}</p>
                <p><strong>Director:</strong> ${movie.Director}</p>
                <p><strong>Actors:</strong> ${movie.Actors}</p>
                <p><strong>Plot:</strong> ${movie.Plot}</p>
                <p><strong>Language:</strong> ${movie.Language}</p>
                <p><strong>IMDB Rating:</strong> ${movie.imdbRating}</p>
                <p><strong>Box Office:</strong> ${movie.BoxOffice}</p>
            </div>
        </div>
    `;
}

// Sorts the cached movies and renders them — no API call
function sortAndRender(movies, headerText = '') {
    const sortValue = sortFilter.value;
    const sorted = [...movies];

    if (sortValue === 'A_TO_Z') {
        sorted.sort((a, b) => a.Title.localeCompare(b.Title));
    } else if (sortValue === 'Z_TO_A') {
        sorted.sort((a, b) => b.Title.localeCompare(a.Title));
    } else if (sortValue === 'NEWEST') {
        sorted.sort((a, b) => parseInt(b.Year) - parseInt(a.Year));
    } else if (sortValue === 'OLDEST') {
        sorted.sort((a, b) => parseInt(a.Year) - parseInt(b.Year));
    }

    const header = headerText
        ? `<p class="results-header">${headerText}</p>`
        : '';

    movieResult.innerHTML = header + sorted.map(buildMovieCard).join('');
}

// Fetches ALL pages of search results (up to 5 pages = 50 results)
async function fetchAllResults(movieTitle) {
    const MAX_PAGES = 5;

    const firstPage = await fetch(
        `https://www.omdbapi.com/?s=${encodeURIComponent(movieTitle)}&apikey=${apiKey}&page=1`
    ).then(res => res.json());

    if (firstPage.Response !== 'True') {
        return { success: false, error: firstPage.Error };
    }

    const totalResults = parseInt(firstPage.totalResults);
    const totalPages = Math.min(Math.ceil(totalResults / 10), MAX_PAGES);

    const additionalPageFetches = [];
    for (let page = 2; page <= totalPages; page++) {
        additionalPageFetches.push(
            fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(movieTitle)}&apikey=${apiKey}&page=${page}`)
                .then(res => res.json())
        );
    }

    const additionalPages = await Promise.all(additionalPageFetches);

    let allBasicResults = [...firstPage.Search];
    for (const page of additionalPages) {
        if (page.Response === 'True') {
            allBasicResults = allBasicResults.concat(page.Search);
        }
    }

    const detailedMovies = await Promise.all(
        allBasicResults.map(movie =>
            fetch(`https://www.omdbapi.com/?i=${movie.imdbID}&apikey=${apiKey}`)
                .then(res => res.json())
        )
    );

    return { success: true, movies: detailedMovies, total: totalResults };
}

// Main search function
async function searchMovies() {
    const movieTitle = movieInput.value.trim();
    if (!movieTitle) return;

    movieResult.innerHTML = `<p class="results-header">Searching for "${movieTitle}"...</p>`;

    try {
        const result = await fetchAllResults(movieTitle);

        if (!result.success) {
            cachedMovies = [];
            movieResult.innerHTML = `<p class="results-header">${result.error}</p>`;
            return;
        }

        cachedMovies = result.movies;

        const showing = result.movies.length;
        const total = result.total;
        const countText = total > showing
            ? `Showing ${showing} of ${total} results for "${movieTitle}"`
            : `${showing} result${showing !== 1 ? 's' : ''} for "${movieTitle}"`;

        // Append sort label if one is active
        const sortValue = sortFilter.value;
        const headerText = sortValue
            ? `${countText} — ${sortLabels[sortValue]}`
            : countText;

        sortAndRender(cachedMovies, headerText);

    } catch (error) {
        console.error('Error:', error);
        movieResult.innerHTML = `<p class="results-header">Something went wrong. Please try again.</p>`;
    }
}

// --- Event Listeners ---

searchBtn.addEventListener('click', searchMovies);

movieInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') searchMovies();
});

sortFilter.addEventListener('change', () => {
    if (cachedMovies.length > 0) {
        const currentTitle = movieInput.value.trim();
        sortAndRender(cachedMovies, getHeaderText(currentTitle));
    } else if (movieInput.value.trim()) {
        searchMovies();
    }
});

// --- Page Load: show top rated movies ---

const topRatedMovies = [
    "The Shawshank Redemption",
    "The Godfather",
    "The Dark Knight",
    "Schindler's List",
    "Pulp Fiction",
    "The Lord of the Rings",
    "Forrest Gump",
    "Goodfellas"
];

async function loadTopRated() {
    movieResult.innerHTML = `<p class="results-header">Loading Top Rated Movies...</p>`;

    const movies = await Promise.all(
        topRatedMovies.map(title =>
            fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${apiKey}`)
                .then(res => res.json())
        )
    );

    cachedMovies = movies;
    sortAndRender(cachedMovies, getHeaderText());
}

loadTopRated();
