const movieInput = document.getElementById('movie-input');
const searchBtn = document.getElementById('search-btn');
const movieResult = document.getElementById('movie-result');

const apiKey = "c60eae1a"; // Replace with your OMDb API key

searchBtn.addEventListener('click', () => {
    const movieTitle = movieInput.value;
    if (movieTitle) {
        fetch(`http://www.omdbapi.com/?s=${movieTitle}&apikey=${apiKey}`)
            .then(response => response.json())
            .then((data) => {
                if (data.Response === 'True') {
                    movieResult.innerHTML = data.Search.map(
                        (movie) => `
                                <h2>${movie.Title}</h2>
                                <p><strong>Year:</strong> ${movie.Year}</p>
                                <p><strong>Genre:</strong> ${movie.Type}</p>
                                <p><strong>Plot:</strong> ${movie.imdbID}</p>
                                <img src="${movie.Poster}" alt="${movie.Title} Poster">
                        
                        `
                    );
                } else {
                    movieResult.innerHTML = `<p>${data.Error}</p>`;
                }
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
                movieResult.innerHTML = `<p>Something went wrong. Please try again later.</p>`;
            });
        }
    });
