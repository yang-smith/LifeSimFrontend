// const openAiKey = process.env.OPENAI_KEY;
const openAiEndpoint = `https://api.openai.com/v1/chat/completions`;

export async function fetchFromOpenAI(conversation, model = 'gpt-3.5-turbo', maxTokens = 1024) {
    const openAiKey = await getKey();
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

const backendEndpoint = "https://api.autumnriver.chat";  // 替换为你的后端地址

export async function getKey() {
    try {
        const response = await fetch(backendEndpoint + "/api/getkey");  // 确保你的URL指向正确的后端端点
        if (!response.ok) {
            throw new Error(`Failed to fetch key: ${response.statusText}`);
        }
        const data = await response.json();
        if (data && data.key) { 
            return String(data.key);
        } else {
            throw new Error("Key not found in response data");
        }
    } catch (error) {
        console.error("Error fetching key:", error);
        throw error;
    }
}

