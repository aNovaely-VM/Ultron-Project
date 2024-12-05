export async function generateText(prompt) {
    const response = await fetch('https://api.cohere.ai/generate', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.COHERE_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            prompt: prompt,
            model: "command-r-08-2024",
            max_tokens: 500,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${errorData.message}`);
    }

    const data = await response.json();
    return data.text.trim();
}
