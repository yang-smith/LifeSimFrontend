<template>
  <div class="player">
    <h2>玩家信息</h2>
    <ul>
      <li>年龄：{{ age }}</li>
      <li>外貌：{{ appearance }}</li>
      <li>性别：{{ gender }}</li>
      <li>智力：{{ intelligence }}</li>
      <li>身体健康：{{ health }}</li>
      <li>心理健康：{{ mental_state }}</li>
      <li>财富：{{ wealth }}</li>
    </ul>
    <div>
      <h3>经历</h3>
      <ul>
        <li v-for="(experience, index) in experiences" :key="index">
          经历 {{ index + 1 }}: {{ experience }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { SYSTEM_MESSAGE, EVENT_UNDERGO, BRITH_EVENT, DEATH, EVENT_GEN, UPDATE_PROPERTIES } from '@/constants/prompts';
import fetchFromOpenAI from '@/services/openai';
export default {
  name: 'Player',
  data() {
    return {
      age: 0,
      appearance: Math.floor(Math.random() * 10) + 1,
      gender: Math.random() > 0.5 ? '男' : '女',
      intelligence: Math.floor(Math.random() * 10) + 1,
      health: Math.floor(Math.random() * 10) + 1,
      wealth: Math.floor(Math.random() * 10) + 1,
      mental_state: Math.floor(Math.random() * 10) + 1,
      experiences: [],
      systemMessage: SYSTEM_MESSAGE,
      birthEvent: BRITH_EVENT,
      eventGen: EVENT_GEN,
      eventUndergo: EVENT_UNDERGO,
      updateProperties: UPDATE_PROPERTIES,
      death: DEATH,
    };
  },
  methods: {
    async generateBirthEvent() {
      try {
            const palyerContent = `
              - **性别**: ${this.gender}

              ### 玩家属性
              - **长相**: ${this.appearance} 分
              - **智力**: ${this.intelligence} 分
              - **健康**: ${this.health} 分
              - **富裕**: ${this.wealth} 分
              - **心理**: ${this.mental_state} 分
            `;
            
            const messages = []
            messages.push({
              "role": "system",
              "content": this.systemMessage
            });
            messages.push({
              "role": "user",
              "content": `${palyerContent} ${this.birthEvent}`
            });
            const response = await fetchFromOpenAI(messages, 'gpt-3.5-turbo');
            this.experiences.push(response);
          } catch (error) {
              console.error("Error fetching data from OpenAI:", error);
          }        
 
    },
  }
};
</script>

<style scoped>
/* 这里添加组件的样式 */
.player {
  padding: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
}
</style>
