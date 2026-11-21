import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: { message: 'Only POST allowed' } });
    }

    try {
        const body = req.body || {};
        const history = body.history || [];
        const userText = body.message || 'Hello';
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: { message: 'Vercel માં GEMINI_API_KEY સેવ નથી.' } });
        }

        const ai = new GoogleGenAI({ apiKey: apiKey });
        const models = ['gemini-3.5-flash-lite', 'gemini-3.5-flash', 'gemini-3.8-flash'];
        
        const contents = history.map(item => ({
            role: item.role,
            parts: [{ text: item.text }]
        }));
        contents.push({ role: 'user', parts: [{ text: userText }] });

        let lastError = null;

        for (const modelName of models) {
            try {
                const response = await ai.models.generateContent({
                    model: modelName,
                    contents: contents,
                    config: {
                        systemInstruction: "તારું નામ het AI છે. તને હેત પટેલ (Het Patel) એ બનાવ્યો છે. કોઈ પણ પૂછે કે તને કોણે બનાવ્યો કે તું કોણ છે, તો ગર્વથી કહેવું કે 'હું het AI છું અને મને હેત પટેલે બનાવ્યો છે.' હંમેશા મદદરૂપ, સરળ અને સ્પષ્ટ ગુજરાતી અથવા જે ભાષામાં સવાલ પૂછાય તે ભાષામાં જવાબ આપવો."
                    }
                });
                const replyText = response.text || 'નમસ્તે! હું het AI છું.';
                return res.status(200).json({ reply: replyText });
            } catch (err) {
                lastError = err;
            }
        }

        return res.status(503).json({ error: { message: lastError ? lastError.message : 'સર્વર વ્યસ્ત છે, ફરી પ્રયત્ન કરો.' } });
    } catch (error) {
        return res.status(500).json({ error: { message: error.message } });
    }
}
