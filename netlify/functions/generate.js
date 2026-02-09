// Located at: netlify/functions/generate.js

/**
 * This is a Netlify Function that acts as a secure proxy to the Google Gemini API.
 * It reads the API key from environment variables, so you don't expose it on the client-side.
 */
exports.handler = async function(event) {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // Get the payload (image data and prompt) from the client request
        const clientPayload = JSON.parse(event.body);
        
        // Get the Gemini API key from Netlify's environment variables
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.error('GEMINI_API_KEY is not set in Netlify environment variables.');
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Server configuration error: API key is missing.' })
            };
        }

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

        // Make the actual request to the Gemini API
        const geminiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(clientPayload) // Forward the payload from the client
        });

        if (!geminiResponse.ok) {
            const errorBody = await geminiResponse.text();
            console.error('Gemini API Error:', errorBody);
            return {
                statusCode: geminiResponse.status,
                body: JSON.stringify({ error: `Gemini API request failed. Please check the server logs.` })
            };
        }

        const result = await geminiResponse.json();

        // Send the successful response from Gemini back to the client
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(result)
        };

    } catch (error) {
        console.error('Netlify Function Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'An internal server error occurred.' })
        };
    }
};


