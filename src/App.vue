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
          <div v-if="continueOrchoice & !isStartLoading">
            <button @click="continueGame">继续</button>
          </div>
          <div v-if="isEventLoading" class="loading-indicator">
            <div class="spinner"></div>正在生成事件...
          </div>
          <div v-if="!continueOrchoice">
            <input v-model="userChoice" placeholder="请输入你的选择">
            <button @click="handleChoice(userChoice)">选择</button>        
          </div>
          <div v-if="isChoiceLoading" class="loading-indicator">
            <div class="spinner"></div>正在评估你的选择...
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
import axios from "axios";
import MarkdownIt from 'markdown-it';

export default {
  data() {
    return {
      player: {},
      baseURL: 'http://127.0.0.1:5000',
      eventDescription: "",
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
        appearance: "外貌",
        gender: "性别",
        intelligence: "智力",
        health: "身体健康",
        wealth: "财富",
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
    },
  },
  watch: {
    player: {
      deep: true,
      handler(newValue) {
        localStorage.setItem('playerState', JSON.stringify(newValue));
      }
    }
  },
  methods: {
    async startGame() {
      this.isStartLoading = true;
      try {
        this.gameStarted = true;
        const response = await axios.get("${this.baseURL}/start");
        this.player = response.data.player;
        this.eventDescription = response.data.event_description;
      } catch (error) {
        console.error("Error starting the game:", error);
      }
      this.isStartLoading = false;
    },
    async continueGame() {
      this.isEventLoading = true;
      try {
        const response = await axios.post("${this.baseURL}/continue", {
            player: this.player
        }, {
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if (response.data.game_over) {
          this.gameOver = true;
          this.player = response.data.player;
          this.eventDescription = response.data.event_description;
        } else {
          this.player = response.data.player;
          this.eventDescription = response.data.event_description;
        }
      } catch (error) {
        console.error("Error continuing the game:", error);
      }
      this.isEventLoading = false;
      this.continueOrchoice = false;
    },
    async handleChoice(choice) {
      this.isChoiceLoading = true;
      try {
        const response = await axios.post("${this.baseURL}/choice", {
            player: this.player,
            choice: choice
        },{
            headers: {
                'Content-Type': 'application/json',
            }
        });
        this.player = response.data.player;
        this.eventDescription = response.data.event_description;
        this.update = response.data.update;
      } catch (error) {
        console.error("Error handling choice:", error);
      }
      this.eventDescription += this.update;
      this.isChoiceLoading = false;
      this.continueOrchoice = true;
    },
    resetGame() {
      localStorage.removeItem('playerState');
      this.player = {};
      this.eventDescription = "";
      this.gameOver = false;
      this.gameStarted = false;
      this.startGame();
    }
  },
  mounted() {
    const savedPlayerState = localStorage.getItem('playerState');
    if (savedPlayerState) {
        this.player = JSON.parse(savedPlayerState);
    } else {
        this.startGame();
    }
  },
};
</script>

<style scoped>
/* 你可以添加任何你需要的样式 */
@import "./index.css";
</style>
