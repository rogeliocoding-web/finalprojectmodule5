const movieInput = document.getElementById('movie-input');
const searchBtn = document.getElementById('search-btn');
const movieResult = document.getElementById('movie-result');

const apiKey = "http://www.omdbapi.com/?i=tt3896198&apikey=c60eae1a"; // Replace with your OMDb API key

searchBtn.addEventListener('click', () => {
    const movieTitle = movieInput.value;
    if (movieTitle) {
        fetch(`http://www.omdbapi.com/?t=${movieTitle}&apikey=${apiKey}`)
            .then(response => response.json())
            .then(data => {
                if (data.Response === 'True') {
                    movieResult.innerHTML = `
                        <h2>${data.Title}</h2>
                        <p><strong>Year:</strong> ${data.Year}</p>
                        <p><strong>Genre:</strong> ${data.Genre}</p>
                        <p><strong>Plot:</strong> ${data.Plot}</p>
                        <img src="${data.Poster}" alt="${data.Title} Poster">
                    `;
                } else {
                    movieResult.innerHTML = `<p>${data.Error}</p>`;
                }
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                movieResult.innerHTML = `<p>Something went wrong. Please try again later.</p>`;
            });
    }
});