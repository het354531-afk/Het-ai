export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Only POST allowed' });
    }

    try {
        const { message, contents } = req.body;
        const userText = message || contents?.[0]?.parts?.[0]?.text || 'Hello';
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: 'Vercel માં GEMINI_API_KEY સેવ નથી.' });
        }

        const response = await fetch(`https://googleapis.com{apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: userText }] }]
            })
        });

        const data = await response.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || data.error?.message || 'કોઈ જવાબ મળ્યો નથી.';
        
        return res.status(200).json({ reply, candidates: data.candidates });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
