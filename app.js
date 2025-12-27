// Spotify API Configuration
const CLIENT_ID = 'a466b55b1db4456b83ff93541c00d767';
const REDIRECT_URI = window.location.origin + window.location.pathname;
const SCOPES = 'user-library-read';
const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const API_BASE = 'https://api.spotify.com/v1';

// State management
let accessToken = null;
let allSongs = [];
let genreMap = new Map();

// DOM Elements (will be initialized after DOM loads)
let authSection, loadingSection, resultsSection, errorSection;
let loginBtn, logoutBtn, refreshBtn, retryBtn;
let searchInput, genreContainer, totalSongsEl, totalGenresEl;
let loadingText, progressText, errorText;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Initialize DOM elements
    authSection = document.getElementById('auth-section');
    loadingSection = document.getElementById('loading-section');
    resultsSection = document.getElementById('results-section');
    errorSection = document.getElementById('error-section');
    loginBtn = document.getElementById('login-btn');
    logoutBtn = document.getElementById('logout-btn');
    refreshBtn = document.getElementById('refresh-btn');
    retryBtn = document.getElementById('retry-btn');
    searchInput = document.getElementById('search-input');
    genreContainer = document.getElementById('genre-container');
    totalSongsEl = document.getElementById('total-songs');
    totalGenresEl = document.getElementById('total-genres');
    loadingText = document.getElementById('loading-text');
    progressText = document.getElementById('progress-text');
    errorText = document.getElementById('error-text');

    // Check for access token in URL hash
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const token = params.get('access_token');

    if (token) {
        accessToken = token;
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
        // Start fetching data
        startDataFetch();
    } else {
        // Check if token exists in session storage
        const storedToken = sessionStorage.getItem('spotify_token');
        if (storedToken) {
            accessToken = storedToken;
            startDataFetch();
        } else {
            showSection('auth');
        }
    }

    // Event listeners
    loginBtn.addEventListener('click', login);
    logoutBtn.addEventListener('click', logout);
    refreshBtn.addEventListener('click', refresh);
    retryBtn.addEventListener('click', retry);
    searchInput.addEventListener('input', handleSearch);
});

// Authentication
function login() {
    console.log('Login button clicked');
    console.log('CLIENT_ID:', CLIENT_ID);
    console.log('REDIRECT_URI:', REDIRECT_URI);

    if (CLIENT_ID === 'YOUR_SPOTIFY_CLIENT_ID') {
        showError('Please configure your Spotify Client ID in app.js. See README for instructions.');
        return;
    }

    const authUrl = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES)}&response_type=token&show_dialog=true`;
    console.log('Auth URL:', authUrl);
    console.log('Redirecting to Spotify...');
    window.location.href = authUrl;
}

function logout() {
    accessToken = null;
    sessionStorage.removeItem('spotify_token');
    allSongs = [];
    genreMap.clear();
    showSection('auth');
}

function refresh() {
    allSongs = [];
    genreMap.clear();
    startDataFetch();
}

function retry() {
    showSection('auth');
}

// API Calls
async function makeSpotifyRequest(url) {
    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('Authentication expired. Please log in again.');
        }
        throw new Error(`Spotify API error: ${response.status}`);
    }

    return response.json();
}

async function fetchAllLikedSongs() {
    let url = `${API_BASE}/me/tracks?limit=50`;
    let allTracks = [];
    let offset = 0;

    while (url) {
        updateProgress(`Fetching songs... (${allTracks.length} so far)`);

        try {
            const data = await makeSpotifyRequest(url);
            allTracks = allTracks.concat(data.items);
            url = data.next;
            offset += 50;
        } catch (error) {
            throw error;
        }
    }

    return allTracks;
}

async function fetchArtistGenres(artistIds) {
    // Spotify allows up to 50 artists per request
    const chunks = [];
    for (let i = 0; i < artistIds.length; i += 50) {
        chunks.push(artistIds.slice(i, i + 50));
    }

    const artistGenres = new Map();

    for (let i = 0; i < chunks.length; i++) {
        updateProgress(`Fetching artist genres... (${i + 1}/${chunks.length})`);

        const chunk = chunks[i];
        const url = `${API_BASE}/artists?ids=${chunk.join(',')}`;

        try {
            const data = await makeSpotifyRequest(url);
            data.artists.forEach(artist => {
                if (artist && artist.genres && artist.genres.length > 0) {
                    artistGenres.set(artist.id, artist.genres);
                }
            });
        } catch (error) {
            console.error('Error fetching artist genres:', error);
        }
    }

    return artistGenres;
}

function categorizeByGenre(tracks, artistGenres) {
    const genreMap = new Map();
    const uncategorized = [];

    tracks.forEach(item => {
        const track = item.track;
        if (!track) return;

        const artistId = track.artists[0]?.id;
        const genres = artistId ? artistGenres.get(artistId) : null;

        const songData = {
            name: track.name,
            artist: track.artists.map(a => a.name).join(', '),
            image: track.album.images[0]?.url || '',
            url: track.external_urls.spotify,
            genres: genres || []
        };

        if (genres && genres.length > 0) {
            // Add song to each of its genres
            genres.forEach(genre => {
                if (!genreMap.has(genre)) {
                    genreMap.set(genre, []);
                }
                genreMap.get(genre).push(songData);
            });
        } else {
            uncategorized.push(songData);
        }
    });

    // Add uncategorized if there are any
    if (uncategorized.length > 0) {
        genreMap.set('uncategorized', uncategorized);
    }

    // Sort genres by number of songs
    return new Map([...genreMap.entries()].sort((a, b) => b[1].length - a[1].length));
}

async function startDataFetch() {
    try {
        showSection('loading');
        sessionStorage.setItem('spotify_token', accessToken);

        // Fetch all liked songs
        updateProgress('Starting to fetch your liked songs...');
        const tracks = await fetchAllLikedSongs();

        if (tracks.length === 0) {
            showError('No liked songs found. Like some songs on Spotify and try again!');
            return;
        }

        allSongs = tracks;

        // Get unique artist IDs
        const artistIds = [...new Set(tracks.map(item => item.track?.artists[0]?.id).filter(Boolean))];

        // Fetch genres for all artists
        updateProgress('Fetching genre information...');
        const artistGenres = await fetchArtistGenres(artistIds);

        // Categorize songs by genre
        updateProgress('Organizing songs by genre...');
        genreMap = categorizeByGenre(tracks, artistGenres);

        // Display results
        displayResults();
        showSection('results');

    } catch (error) {
        console.error('Error:', error);
        showError(error.message || 'An error occurred while fetching your music. Please try again.');
    }
}

function displayResults(filteredMap = null) {
    const mapToDisplay = filteredMap || genreMap;

    // Update stats
    const totalSongs = allSongs.length;
    const totalGenres = genreMap.size;
    totalSongsEl.textContent = totalSongs;
    totalGenresEl.textContent = totalGenres;

    // Clear existing content
    genreContainer.innerHTML = '';

    // Create genre sections
    mapToDisplay.forEach((songs, genre) => {
        const genreSection = createGenreSection(genre, songs);
        genreContainer.appendChild(genreSection);
    });

    if (mapToDisplay.size === 0) {
        genreContainer.innerHTML = '<div class="error-message"><p>No songs match your search.</p></div>';
    }
}

function createGenreSection(genre, songs) {
    const section = document.createElement('div');
    section.className = 'genre-section';
    section.dataset.genre = genre;

    const header = document.createElement('div');
    header.className = 'genre-header';
    header.innerHTML = `
        <h2>${genre}</h2>
        <span class="genre-count">${songs.length} song${songs.length !== 1 ? 's' : ''}</span>
    `;

    const songList = document.createElement('div');
    songList.className = 'song-list';

    songs.forEach(song => {
        const songCard = document.createElement('div');
        songCard.className = 'song-card';
        songCard.innerHTML = `
            <img src="${song.image || 'https://via.placeholder.com/60'}" alt="${song.name}" class="song-image">
            <div class="song-info">
                <div class="song-name">${song.name}</div>
                <div class="song-artist">${song.artist}</div>
            </div>
            <a href="${song.url}" target="_blank" class="song-link">Play on Spotify</a>
        `;
        songList.appendChild(songCard);
    });

    // Toggle collapse on header click
    header.addEventListener('click', () => {
        section.classList.toggle('collapsed');
    });

    section.appendChild(header);
    section.appendChild(songList);

    return section;
}

function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase().trim();

    if (searchTerm === '') {
        displayResults();
        return;
    }

    // Filter songs by search term
    const filteredMap = new Map();

    genreMap.forEach((songs, genre) => {
        const filteredSongs = songs.filter(song =>
            song.name.toLowerCase().includes(searchTerm) ||
            song.artist.toLowerCase().includes(searchTerm)
        );

        if (filteredSongs.length > 0) {
            filteredMap.set(genre, filteredSongs);
        }
    });

    displayResults(filteredMap);
}

// UI Helpers
function showSection(section) {
    authSection.classList.add('hidden');
    loadingSection.classList.add('hidden');
    resultsSection.classList.add('hidden');
    errorSection.classList.add('hidden');

    switch(section) {
        case 'auth':
            authSection.classList.remove('hidden');
            break;
        case 'loading':
            loadingSection.classList.remove('hidden');
            break;
        case 'results':
            resultsSection.classList.remove('hidden');
            break;
        case 'error':
            errorSection.classList.remove('hidden');
            break;
    }
}

function updateProgress(message) {
    progressText.textContent = message;
}

function showError(message) {
    errorText.textContent = message;
    showSection('error');
}
