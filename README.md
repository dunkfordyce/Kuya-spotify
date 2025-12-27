# Spotify Genre Sorter

A web application that organizes your Spotify liked songs by genre. Built with vanilla JavaScript and designed to work on GitHub Pages.

## Features

- 🎵 Connect to your Spotify account
- 📊 Automatically fetch all your liked songs
- 🎸 Organize songs by genre (using artist genre data)
- 🔍 Search through your songs and artists
- 📱 Responsive design that works on mobile and desktop
- ✨ Clean, Spotify-inspired interface
- 🎯 Collapsible genre sections
- 🔗 Direct links to play songs on Spotify

## Live Demo

Once deployed, your app will be available at: `https://[your-username].github.io/[repository-name]/`

## Setup Instructions

### 1. Create a Spotify App

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click **"Create app"**
4. Fill in the details:
   - **App name:** Spotify Genre Sorter (or any name you prefer)
   - **App description:** An app to sort my liked songs by genre
   - **Redirect URI:** `https://[your-username].github.io/[repository-name]/` (replace with your actual GitHub Pages URL)
     - For local testing, also add: `http://localhost:8000/` or `http://127.0.0.1:8000/`
   - **Which API/SDKs are you planning to use:** Web API
5. Click **"Save"**
6. In your app settings, copy the **Client ID**

### 2. Configure the Application

1. Open the `app.js` file
2. Find the line: `const CLIENT_ID = 'YOUR_SPOTIFY_CLIENT_ID';`
3. Replace `'YOUR_SPOTIFY_CLIENT_ID'` with your actual Client ID from step 1.6

Example:
```javascript
const CLIENT_ID = 'abc123def456ghi789';  // Your actual client ID
```

### 3. Deploy to GitHub Pages

#### Option A: Using GitHub UI

1. Go to your repository on GitHub
2. Click on **Settings**
3. Scroll down to **Pages** section (in the left sidebar)
4. Under **Source**, select the branch you want to deploy (usually `main` or `master`)
5. Click **Save**
6. Wait a few minutes and your site will be live at `https://[your-username].github.io/[repository-name]/`

#### Option B: Using Command Line

The app is already set up and ready to push. Your changes are on the branch `claude/spotify-genre-sorter-i2Rf3`.

### 4. Update Redirect URI (if needed)

After deploying, if your GitHub Pages URL is different from what you set in step 1.4:

1. Go back to your [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Open your app
3. Click **"Edit Settings"**
4. Update the **Redirect URI** to match your actual GitHub Pages URL
5. Click **Save**

## Local Development

To test locally before deploying:

1. Make sure you've configured your Client ID in `app.js`
2. Add `http://localhost:8000/` to your Spotify app's Redirect URIs
3. Start a local server:
   ```bash
   python -m http.server 8000
   # Or if you have Node.js:
   npx serve
   ```
4. Open your browser to `http://localhost:8000`

## How It Works

1. **Authentication:** Uses Spotify's OAuth 2.0 Implicit Grant Flow to authenticate users
2. **Fetch Liked Songs:** Retrieves all of your liked songs using the Spotify Web API
3. **Get Genre Data:** Fetches genre information for each artist
4. **Categorize:** Sorts songs into genres (songs can appear in multiple genres)
5. **Display:** Shows an organized, searchable view of your music collection

## Usage

1. Click **"Connect to Spotify"** and authorize the app
2. Wait while the app fetches your liked songs and genre data
3. Browse your music organized by genre
4. Use the search box to find specific songs or artists
5. Click on genre headers to collapse/expand sections
6. Click **"Play on Spotify"** to open a song in Spotify

## Technical Details

- **Frontend:** Pure HTML, CSS, and JavaScript (no frameworks)
- **API:** Spotify Web API
- **Authentication:** OAuth 2.0 Implicit Grant Flow
- **Hosting:** GitHub Pages (static hosting)
- **Permissions Required:** `user-library-read` (to access your liked songs)

## Browser Compatibility

Works on all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Privacy & Security

- Your access token is stored only in your browser's session storage
- No data is sent to any server except Spotify's official API
- All processing happens in your browser
- The app only requests permission to read your liked songs
- Your Spotify password is never exposed to this app

## Troubleshooting

### "Please configure your Spotify Client ID"
- Make sure you've replaced `YOUR_SPOTIFY_CLIENT_ID` in `app.js` with your actual Client ID

### "Authentication expired"
- Your session has expired. Click logout and log in again

### "Redirect URI mismatch" error
- Make sure the Redirect URI in your Spotify app settings exactly matches your GitHub Pages URL
- Include the trailing slash if present in your URL

### No genres showing up
- Some songs may not have genre data if the artist doesn't have genres assigned by Spotify
- These will appear in the "uncategorized" section

## Customization

You can customize the app by editing:

- `styles.css` - Change colors, fonts, layout
- `app.js` - Modify functionality, add features
- `index.html` - Update structure, add elements

## Limitations

- Genre data comes from artist information, not individual tracks
- Songs can appear in multiple genres if an artist has multiple genre tags
- Some artists may not have genre data (these songs go into "uncategorized")
- Access tokens expire after 1 hour (you'll need to log in again)

## Contributing

Feel free to fork this project and make your own improvements!

## License

This project is open source and available for personal use. Not affiliated with Spotify.

## Credits

Built with ❤️ for music lovers

Spotify is a registered trademark of Spotify AB.
