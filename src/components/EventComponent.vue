<template>
  <div>
    <p>{{ eventDescription }}</p>
    <input v-model="userChoice" placeholder="输入你的选择" />
    <button @click="submitChoice">确认</button>
    <p>{{ result }}</p>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      eventDescription: "",
      userChoice: "",
      result: "",
    };
  },
  methods: {
    async fetchEvent() {
      try {
        const response = await axios.get("http://localhost:5001/get-event");
        this.eventDescription = response.data.event;
      } catch (error) {
        console.error("Error fetching event:", error);
      }
    },
    async submitChoice() {
      try {
        const response = await axios.post("http://localhost:5001/choose", {
          choice: this.userChoice,
        });
        this.result = response.data.result;
      } catch (error) {
        console.error("Error submitting choice:", error);
      }
    },
  },
  mounted() {
    this.fetchEvent();
  },
};
</script>
