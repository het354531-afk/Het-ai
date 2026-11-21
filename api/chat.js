export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: { message: 'Only POST allowed' } });
    }

    try {
        const body = req.body || {};
        const userText = body.message || body.prompt || body.text || 'Hello';
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: { message: 'API Key missing' } });
        }

        const response = await fetch('https://googleapis.com' + apiKey, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: userText }] }]
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            const errMsg = (data.error && data.error.message) ? data.error.message : 'Google API Error';
            return res.status(response.status).json({ error: { message: errMsg } });
        }

        const firstCandidate = data.candidates.at(0);
        const firstPart = firstCandidate.content.parts.at(0);
        const reply = firstPart.text;

        return res.status(200).json({ reply: reply, candidates: data.candidates });
    } catch (error) {
        return res.status(500).json({ error: { message: error.message } });
    }
}
