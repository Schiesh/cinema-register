<template>
  <div class="register-app">
    <PinLoginView v-if="!authenticated" @authenticated="onAuthenticated" />

    <template v-else>
      <header class="register-header">
        <div class="header-left">
          <span class="logo">🎬</span>
          <span class="app-name">Cinema Register</span>
          <span class="employee-badge">Employee {{ employeeId }}</span>
        </div>
        <div class="header-right">
          <span class="clock">{{ currentTime }}</span>
          <button class="btn-lock" @click="lock">🔒 Lock</button>
        </div>
      </header>

      <main class="register-main" @click="resetTimer" @keydown="resetTimer">
        <RegisterView />
      </main>
    </template>
  </div>
</template>

<script>
import RegisterView from "./views/RegisterView.vue";
import PinLoginView from "./views/PinLoginView.vue";

const LOCK_AFTER_MINUTES = 5;

export default {
  name: "App",
  components: { RegisterView, PinLoginView },

  data() {
    return {
      authenticated: false,
      employeeId: null,
      currentTime: "",
      lockTimer: null,
    };
  },

  mounted() {
    this.updateClock();
    setInterval(this.updateClock, 1000);

    const token = sessionStorage.getItem("register_token");
    if (token) {
      this.authenticated = true;
      this.employeeId = sessionStorage.getItem("register_employee_id");
      this.startLockTimer();
    }
  },

  methods: {
    onAuthenticated(data) {
      this.authenticated = true;
      this.employeeId = data.employee_id;
      this.startLockTimer();
    },

    lock() {
      this.authenticated = false;
      this.employeeId = null;
      sessionStorage.removeItem("register_token");
      sessionStorage.removeItem("register_role");
      sessionStorage.removeItem("register_employee_id");
      clearTimeout(this.lockTimer);
    },

    startLockTimer() {
      clearTimeout(this.lockTimer);
      this.lockTimer = setTimeout(
        () => {
          this.lock();
        },
        LOCK_AFTER_MINUTES * 60 * 1000,
      );
    },

    resetTimer() {
      if (this.authenticated) this.startLockTimer();
    },

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

.employee-badge {
  font-size: 0.8rem;
  color: #888;
  background: #0f0f1a;
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  border: 1px solid #2a2a4a;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.clock {
  font-size: 1rem;
  font-family: monospace;
  color: #aaa;
}

.btn-lock {
  padding: 0.4rem 0.9rem;
  background: transparent;
  border: 1px solid #444;
  border-radius: 4px;
  color: #aaa;
  font-size: 0.8rem;
  cursor: pointer;
}

.btn-lock:hover {
  border-color: #e50914;
  color: #e50914;
}

.register-main {
  flex: 1;
  overflow: hidden;
  display: flex;
}
</style>
