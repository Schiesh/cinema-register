<template>
  <div class="register-app">
    <header class="register-header">
      <div class="header-left">
        <span class="logo">🎬</span>
        <span class="app-name">Cinema Register</span>
      </div>
      <div class="header-right">
        <span class="clock">{{ currentTime }}</span>
      </div>
    </header>

    <main class="register-main">
      <RegisterView />
    </main>
  </div>
</template>

<script>
import RegisterView from "./views/RegisterView.vue";

export default {
  name: "App",
  components: { RegisterView },

  data() {
    return {
      currentTime: "",
    };
  },

  mounted() {
    this.updateClock();
    setInterval(this.updateClock, 1000);
  },

  methods: {
    updateClock() {
      const now = new Date();
      this.currentTime = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
    },
  },
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  background: #1a1a2e;
  color: #ffffff;
  height: 100vh;
  overflow: hidden;
}

.register-app {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.register-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background: #16213e;
  border-bottom: 2px solid #e50914;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo {
  font-size: 1.5rem;
}

.app-name {
  font-size: 1.1rem;
  font-weight: bold;
  color: #e50914;
  letter-spacing: 0.05em;
}

.clock {
  font-size: 1rem;
  font-family: monospace;
  color: #aaa;
}

.register-main {
  flex: 1;
  overflow: hidden;
  display: flex;
}
</style>
