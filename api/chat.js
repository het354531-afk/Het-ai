import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: { message: 'Only POST allowed' } });
    }

    try {
        const body = req.body || {};
        const userText = body.message || body.prompt || body.text || 'Hello';
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: { message: 'Vercel માં GEMINI_API_KEY સેવ નથી.' } });
        }

        const ai = new GoogleGenAI({ apiKey: apiKey });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userText,
        });

        const reply = response.text;
        return res.status(200).json({ reply: reply });
    } catch (error) {
        return res.status(500).json({ error: { message: error.message } });
    }
}
