import { generateText } from '@/services/api';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { prompt } = req.body;

        try {
            const generatedText = await generateText(prompt);
            res.status(200).json({ text: generatedText });
        } catch (error) {
            console.error('Erreur lors de l\'appel API:', error);
            res.status(500).json({ error: 'Failed to generate text' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}


