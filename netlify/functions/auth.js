const fetch = require("node-fetch");

exports.handler = async (event) => {
    const client_id = process.env.SPOTIFY_CLIENT_ID;
    const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
    const redirect_uri = process.env.REDIRECT_URI;

    // STEP 1: Send user to Spotify
    if (!event.queryStringParameters.code && !event.queryStringParameters.profile) {
        const scope = "user-read-private playlist-modify-public";
        const authURL =
            "https://accounts.spotify.com/authorize?" +
            new URLSearchParams({
                response_type: "code",
                client_id,
                scope,
                redirect_uri
            });

        return {
            statusCode: 302,
            headers: { Location: authURL }
        };
    }

    // STEP 2: Exchange code for token
    if (event.queryStringParameters.code) {
        const code = event.queryStringParameters.code;

        const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                "Authorization":
                    "Basic " +
                    Buffer.from(client_id + ":" + client_secret).toString("base64"),
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                grant_type: "authorization_code",
                code,
                redirect_uri
            })
        });

        const tokenData = await tokenRes.json();

        return {
            statusCode: 302,
            headers: {
                "Set-Cookie": `access_token=${tokenData.access_token}; Path=/; HttpOnly`,
                Location: "/"
            }
        };
    }

    // STEP 3: Get profile
    if (event.queryStringParameters.profile) {
        const cookie = event.headers.cookie || "";
        const token = cookie.split("access_token=")[1];
        if (!token) return { statusCode: 401 };

        const profileRes = await fetch("https://api.spotify.com/v1/me", {
            headers: {
                Authorization: "Bearer " + token
            }
        });

        const profile = await profileRes.json();

        return {
            statusCode: 200,
            body: JSON.stringify(profile)
        };
    }
};
