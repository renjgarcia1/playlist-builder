const fetch = require('node-fetch');

exports.handler = async (event, context) => {
    const client_id = process.env.SPOTIFY_CLIENT_ID;
    const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
    const redirect_uri = process.env.REDIRECT_URI;

    const query = event.queryStringParameters || {};

    // Check if this is a profile request
    if (query.profile) {
        const token = query.token || null; // You need to manage token storage
        if (!token) return { statusCode: 401, body: JSON.stringify({ error: "Not logged in" }) };
        // Fetch Spotify profile
        const profileRes = await fetch("https://api.spotify.com/v1/me", {
            headers: { Authorization: `Bearer ${token}` }
        });
        const profileData = await profileRes.json();
        return { statusCode: 200, body: JSON.stringify(profileData) };
    }

    // Otherwise, redirect user to Spotify login
    const scopes = 'playlist-modify-public';
    const authURL = `https://accounts.spotify.com/authorize?client_id=${client_id}&response_type=code&redirect_uri=${encodeURIComponent(redirect_uri)}&scope=${encodeURIComponent(scopes)}`;

    return {
        statusCode: 302,
        headers: {
            Location: authURL
        },
        body: ""
    };
};
