// openai key
require('dotenv').config();
const openAiKey = process.env.NEXT_PUBLIC_OPENAI_KEY;

const openAiEndpoint = `https://api.openai.com/v1/chat/completions`;

export async function fetchFromOpenAI(conversation, model = 'gpt-3.5-turbo', maxTokens = 1024) {
    console.log(openAiKey);
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
