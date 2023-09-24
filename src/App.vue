<template>
  <div id="app">
    <div class="content-wrapper"> 


      <h1>人生模拟器</h1>

      <!-- 开始游戏按钮 -->
      <button v-if="!gameStarted" @click="startGame">开始游戏</button>
      <div v-if="isStartLoading" class="loading-indicator">
        <div class="spinner"></div>正在生成人生剧本...
      </div>

      <div v-if="gameOver">
        <p>游戏结束</p>
        <div v-html="compiledMarkdown"></div>
        <button @click="resetGame">重新开始</button> <!-- 添加一个重新开始的按钮 -->
      </div>


      <div v-if="gameStarted && !gameOver">
        <!-- 游戏中的内容 -->
        <div>
          <p>{{ playerAttributes }}</p>
          <div v-html="compiledMarkdown"></div>
          <div v-if="isEventLoading" class="loading-indicator">
            <div class="spinner"></div>正在生成事件...
          </div>
          <div v-if="continueOrchoice & !isStartLoading">
            <button @click="continueGame">继续</button>
          </div>
          <div v-if="isChoiceLoading" class="loading-indicator">
            <div class="spinner"></div>正在评估你的选择...
          </div>     
          <div v-if="!continueOrchoice">
            <input v-model="userChoice" placeholder="请输入你的选择">
            <button @click="handleChoice(userChoice)">选择</button>        
          </div>

        </div>
      </div>
    </div>

    <!-- 玩家属性 -->
    <div v-if="gameStarted && !isStartLoading" class="card player-card">
      <h2>玩家属性</h2>
        <ul>
          <li v-for="(value, key) in filteredPlayerAttributes" :key="key">{{ key }}: {{ value }}</li>
        </ul>
    </div>

  </div>
</template>

<script>
// import axios from "axios";
import MarkdownIt from 'markdown-it';
import { generateBirthEvent, generateEvent, undergoEvent, update, death } from './event.js';
export default {
  data() {
    return {
      player: {
            age: 0,
            gender: Math.random() > 0.5 ? '男' : '女',
            appearance: Math.floor(Math.random() * 10) + 1,
            intelligence: Math.floor(Math.random() * 10) + 1,
            wealth: Math.floor(Math.random() * 10) + 1,
            health: Math.floor(Math.random() * 10) + 1,
            mental_state: Math.floor(Math.random() * 10) + 1,
            experiences: [],
        },
      eventDescription: "",
      preloadedEvent: null,
      update:"",
      gameOver: false,
      gameStarted: false,
      md: new MarkdownIt(),
      userChoice: "",
      isStartLoading: false,
      isEventLoading: false,
      isChoiceLoading: false,
      continueOrchoice: true,
      attributeTranslations: {
        age: "年龄",
        gender: "性别",
        appearance: "外貌",
        intelligence: "智力",
        wealth: "财富",
        health: "身体健康",
        mental_state: "心理健康",
        // 如果还有其他属性，也可以在这里添加
      },
    };
  },
  computed: {
    playerAttributes() {
      return this.player ? this.player.display_attributes : "";
    },
    filteredPlayerAttributes() {
      return Object.keys(this.player).reduce((acc, key) => {
        if (key !== 'experiences') {
          acc[this.attributeTranslations[key] || key] = this.player[key];
        }
        return acc;
      }, {});
    },
    compiledMarkdown() {
            return this.md.render(this.eventDescription);
            // return this.eventDescription;
    },
  },
  watch: {
    // player: {
    //   deep: true,
    //   handler(newValue) {
    //     localStorage.setItem('playerState', JSON.stringify(newValue));
    //   }
    // }
  },
  methods: {
    async startGame() {
      this.isStartLoading = true;
      try {
        this.gameStarted = true;
        const response = await generateBirthEvent(this.player);
        console.log(response)
        this.eventDescription = response;
        this.player.experiences.push(response);
      } catch (error) {
        console.error("Error starting the game:", error);
      }
      this.isStartLoading = false;
      this.preloadNextEvent();
    },
    async continueGame() {
      this.isEventLoading = true;
      if (this.preloadedEvent) {
            this.eventDescription = this.preloadedEvent;
            this.player.experiences.push(this.preloadedEvent);
            if(this.player.age > this.player.health*10 || this.player.wealth < 0 || this.player.mental_state < 0) {
              this.gameOver = true;
            }
            this.isEventLoading = false;
            this.continueOrchoice = false;  
            return;
      }
      try {
        if(this.player.age > this.player.health*10 || this.player.wealth < 0 || this.player.mental_state < 0) {
          const response = await death(this.player);
          this.eventDescription = response;
          this.player.experiences.push(response);
          this.gameOver = true;
          return;
        }
        const response = await generateEvent(this.player);
        this.eventDescription = response;
        this.player.experiences.push(response);
      } catch (error) {
        console.error("Error continuing the game:", error);
      }
      this.isEventLoading = false;
      this.continueOrchoice = false;
    },
    async handleChoice(choice) {
      this.isChoiceLoading = true;
      try {

        const response = await undergoEvent(this.player, choice);
        this.eventDescription = response;
        this.player.experiences.push(response);
        this.update = await update(this.player);
        this.player.experiences.push(this.update);
        this.updatePlayer(this.update);
      } catch (error) {
        console.error("Error handling choice:", error);
      }
      this.eventDescription += this.update;
      this.isChoiceLoading = false;
      this.continueOrchoice = true;
      this.player.age += 10;
      this.preloadNextEvent();  // 处理用户选择后预加载下一个事件
    },
    resetGame() {
      // localStorage.removeItem('playerState');
      this.player = {
      age: 0,
      gender: Math.random() > 0.5 ? '男' : '女',
      appearance: Math.floor(Math.random() * 10) + 1,
      intelligence: Math.floor(Math.random() * 10) + 1,
      wealth: Math.floor(Math.random() * 10) + 1,
      health: Math.floor(Math.random() * 10) + 1,
      mental_state: Math.floor(Math.random() * 10) + 1,
      experiences: [],
      };
      this.eventDescription = "";
      this.gameOver = false;
      this.gameStarted = false;
      this.isStartLoading = false,
      this.isEventLoading = false,
      this.isChoiceLoading = false,
      this.continueOrchoice = true,
      this.startGame();
    },
    async preloadNextEvent() {
      this.preloadedEvent = null;
        try {
            if(this.player.age > this.player.health*10 || this.player.wealth < 0 || this.player.mental_state < 0) {
                this.preloadedEvent = await death(this.player);
            } else {
                this.preloadedEvent = await generateEvent(this.player);
            }
        } catch (error) {
            console.error("Error preloading the next event:", error);
        }
    },
    updatePlayer(inputString) {
      // 提取JSON部分
      const jsonMatch = inputString.match(/\{[^}]+\}/);
      if (!jsonMatch) {
        console.error("No JSON found in the provided string.");
        return;
      }
      console.log(jsonMatch[0]);
      const extractedJson = jsonMatch[0];
      // 将JSON字符串解析为一个对象
      const attributesToUpdate = JSON.parse(extractedJson);
      console.log(attributesToUpdate);
      // 使用解析的对象来更新player的相关属性
      for (let key in attributesToUpdate) {
        // 翻译键
        const attributeKey = Object.keys(this.attributeTranslations).find(k => this.attributeTranslations[k] === key);
        if (attributeKey && Object.prototype.hasOwnProperty.call(this.player, attributeKey)) {
          this.player[attributeKey] = attributesToUpdate[key];
        }
      }
    }

  },
  mounted() {

  },
};
</script>

<style scoped>
/* 你可以添加任何你需要的样式 */
@import "./index.css";
</style>
