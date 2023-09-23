// openai key
const openAiKey = process.env.OPENAI_KEY;

const openAiEndpoint = `https://api.openai.com/v1/chat/completions`;

export async function fetchFromOpenAI(conversation, model = 'gpt-3.5-turbo', maxTokens = 1024) {
    const response = await fetch(openAiEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openAiKey}`,
        },
        body: JSON.stringify({
            model: model,
            messages: conversation,
            max_tokens: maxTokens,
            // stream: true,
        }),
    });

    if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
    }
    const data = await response.json();
    return data.choices[0].message.content;
}
