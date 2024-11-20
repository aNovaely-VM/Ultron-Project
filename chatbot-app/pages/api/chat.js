export default async function handler(req, res) {
  if (req.method === 'POST') {
      const { prompt } = req.body;

      try {
          const cohereResponse = await fetch('https://api.cohere.ai/generate', {
              method: 'POST',
              headers: {
                  'Authorization': `Bearer ${process.env.COHERE_API_KEY}`,
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                  prompt: prompt, // Le prompt complet (Ultron + historique)
                  model: "command-r-08-2024",
                  max_tokens: 500,
              }),
          });

          const data = await cohereResponse.json();
          const generatedText = data.text;

          res.status(200).json({ text: generatedText.trim() });
      } catch (error) {
          console.error('Erreur lors de l\'appel API:', error);
          res.status(500).json({ error: 'Failed to generate text' });
      }
  } else {
      res.status(405).json({ error: 'Method not allowed' });
  }
}
