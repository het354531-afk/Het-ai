import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: { message: 'Only POST allowed' } });
    }

    try {
        const body = req.body || {};
        let userText = body.message || body.prompt || body.text;
        if (!userText && body.contents && body.contents.at(0) && body.contents.at(0).parts) {
            userText = body.contents.at(0).parts.at(0).text;
        }
        userText = userText || 'Hello';

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: { message: 'Vercel માં GEMINI_API_KEY સેવ નથી.' } });
        }

        const ai = new GoogleGenAI({ apiKey: apiKey });
        const models = ['gemini-3.5-flash-lite', 'gemini-3.5-flash', 'gemini-3.8-flash'];
        let lastError = null;

        for (const modelName of models) {
            try {
                const response = await ai.models.generateContent({
                    model: modelName,
                    contents: userText,
                });
                const replyText = response.text || 'નમસ્તે! હું het AI છું.';
                return res.status(200).json({
                    reply: replyText,
                    text: replyText,
                    candidates: [{ content: { parts: [{ text: replyText }] } }]
                });
            } catch (err) {
                lastError = err;
            }
        }

        return res.status(503).json({ error: { message: lastError ? lastError.message : 'સર્વર વ્યસ્ત છે, ફરી પ્રયત્ન કરો.' } });
    } catch (error) {
        return res.status(500).json({ error: { message: error.message } });
    }
}
