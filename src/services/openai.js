// 设置你的后端API的地址
const backendEndpoint = 'https://api.autumnriver.chat/api/v1/post';

export async function fetchFromOpenAI(conversation, model = 'gpt-3.5-turbo', maxTokens = 1024) {
    // 发送请求到你的后端API，而不是直接到OpenAI
    const response = await fetch(backendEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: model,
            messages: conversation,
            max_tokens: maxTokens,
        }),
    });

    // 检查响应是否成功
    if (!response.ok) {
        throw new Error(`Backend API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.message; // 注意这里的变化，根据你后端返回的结构
}
