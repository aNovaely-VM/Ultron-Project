export default async function handler(req, res) {
    if (req.method === 'POST') {
      const { message } = req.body;
  
      try {
        console.log('Envoi de la requête à l\'API Cohere...');
        const cohereResponse = await fetch('https://api.cohere.ai/generate', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.COHERE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: message,
            max_tokens: 50,
          }),
        });
  
        console.log('Réponse API Cohere reçue...');
        const data = await cohereResponse.json();
        console.log('Données reçues:', data);
  
        // Utiliser la propriété `text` directement
        const generatedText = data.text;
        console.log('Texte généré:', generatedText);
        res.status(200).json({ text: generatedText.trim() });
  
      } catch (error) {
        console.error('Erreur lors de l\'appel API:', error);
        res.status(500).json({ error: 'Failed to generate text' });
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  }
  