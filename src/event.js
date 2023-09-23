import { SYSTEM_MESSAGE, EVENT_UNDERGO, BRITH_EVENT, DEATH, EVENT_GEN, UPDATE_PROPERTIES } from '@/constants/prompts';
import {fetchFromOpenAI} from '@/services/openai';

export function generatePlayerContent(playerAttributes) {
    const playerContent = 
    "### 当前玩家属性\n" +
    "- **性别**: " + playerAttributes.gender + "\n" +
    "- **年龄**: " + playerAttributes.age + "\n" +
    "- **外貌**: " + playerAttributes.appearance + " \n" +
    "- **智力**: " + playerAttributes.intelligence + " \n" +
    "- **财富**: " + playerAttributes.wealth + " \n" +
    "- **身体健康**: " + playerAttributes.health + " \n" +
    "- **心理健康**: " + playerAttributes.mental_state + " \n" ;
    
  return playerContent;
}

export async function generateBirthEvent(playerAttributes) {
    try {
        const playerContent = generatePlayerContent(playerAttributes);
        const messages = [];
        messages.push({
          "role": "system",
          "content": SYSTEM_MESSAGE
        });
        messages.push({
          "role": "user",
          "content": `${playerContent} `
        });
        messages.push({
            "role": "user",
            "content": `${BRITH_EVENT}`
          });
        console.log(messages)
        const response = await fetchFromOpenAI(messages, 'gpt-3.5-turbo');
        return response;
    } catch (error) {
        console.error("Error fetching data from OpenAI:", error);
    }
}

export async function generateEvent(playerAttributes) {
    try {
        const playerContent = generatePlayerContent(playerAttributes);
        const messages = [];
        messages.push({
          "role": "system",
          "content": SYSTEM_MESSAGE 
        });
        messages.push({
            "role": "user",
            "content": `${playerAttributes.experiences[0]} `
        });
        messages.push({
            "role": "user",
            "content": `${playerContent} `
        });
        messages.push({
            "role": "user",
            "content": `${EVENT_GEN}`
        });
        console.log(messages)
        const response = await fetchFromOpenAI(messages, 'gpt-3.5-turbo-16k', 10000);
        return response;
    } catch (error) {
        console.error("Error fetching data from OpenAI:", error);
    }
}

export async function undergoEvent(playerAttributes, choices) {
    try {
        // const playerContent = generatePlayerContent(playerAttributes);
        const messages = [];
        messages.push({
          "role": "system",
          "content": SYSTEM_MESSAGE 
        });
        messages.push({
          "role": "assistant",
          "content": `${playerAttributes.experiences[playerAttributes.experiences.length - 1]} `
        });
        const content = `${choices} ${EVENT_UNDERGO}`
        messages.push({
            "role": "user",
            "content": content
        });
        const response = await fetchFromOpenAI(messages, 'gpt-3.5-turbo-16k', 10000);
        return response;
    } catch (error) {
        console.error("Error fetching data from OpenAI:", error);
    }
}

export async function update(playerAttributes) {
    try {
        const playerContent = generatePlayerContent(playerAttributes);
        const messages = [];
        messages.push({
          "role": "system",
          "content": SYSTEM_MESSAGE 
        });
        messages.push({
            "role": "assistant",
            "content": `${playerAttributes.experiences[playerAttributes.experiences.length - 1]}`
        });
        messages.push({
            "role": "user",
            "content": `${playerContent}`
        });
        messages.push({
            "role": "user",
            "content": `${UPDATE_PROPERTIES}`
        });
        console.log(messages);
        const response = await fetchFromOpenAI(messages, 'gpt-3.5-turbo-16k', 10000);
        return response;
    } catch (error) {
        console.error("Error fetching data from OpenAI:", error);
    }
}

export async function death(playerAttributes) {
    try {
        const messages = [];
        messages.push({
          "role": "system",
          "content": SYSTEM_MESSAGE 
        });
        messages.push({
            "role": "user",
            "content": `${playerAttributes.experiences.join('####')} ${DEATH}`
        });
        console.log(messages);
        const response = await fetchFromOpenAI(messages, 'gpt-3.5-turbo-16k', 10000);
        return response;
    } catch (error) {
        console.error("Error fetching data from OpenAI:", error);
    }
}
