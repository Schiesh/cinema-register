<template>
  <div class="pin-login">
    <div class="pin-card">
      <div class="pin-header">
        <span class="logo">🎬</span>
        <h1>Cinema Register</h1>
        <p class="subtitle">Enter your Employee ID and PIN to continue</p>
      </div>

      <!-- Step 1: Employee ID -->
      <div v-if="step === 'employee_id'" class="pin-step">
        <p class="step-label">Employee ID</p>
        <div class="pin-display">
          <span
            v-for="(_, i) in 4"
            :key="i"
            class="pin-digit"
            :class="{ filled: employeeId.length > i }"
          >
            {{ employeeId[i] || "" }}
          </span>
        </div>
        <div class="numpad">
          <button
            v-for="num in [
              '1',
              '2',
              '3',
              '4',
              '5',
              '6',
              '7',
              '8',
              '9',
              '',
              '0',
              '⌫',
            ]"
            :key="num"
            class="numpad-btn"
            :class="{ empty: num === '' }"
            @click="handleEmployeeInput(num)"
          >
            {{ num }}
          </button>
        </div>
        <div v-if="error" class="error-message">{{ error }}</div>
      </div>

      <!-- Step 2: PIN -->
      <div v-if="step === 'pin'" class="pin-step">
        <p class="step-label">PIN for Employee {{ employeeId }}</p>
        <div class="pin-display">
          <span
            v-for="(_, i) in pinLength"
            :key="i"
            class="pin-digit"
            :class="{ filled: pin.length > i }"
          >
            ●
          </span>
        </div>
        <div class="numpad">
          <button
            v-for="num in [
              '1',
              '2',
              '3',
              '4',
              '5',
              '6',
              '7',
              '8',
              '9',
              '',
              '0',
              '⌫',
            ]"
            :key="num"
            class="numpad-btn"
            :class="{ empty: num === '' }"
            :disabled="loading"
            @click="handlePinInput(num)"
          >
            {{ num }}
          </button>
        </div>
        <button class="btn-back" @click="resetToEmployeeId">← Back</button>
        <div v-if="error" class="error-message">{{ error }}</div>
        <div v-if="loading" class="loading">Verifying...</div>
      </div>
    </div>
  </div>
</template>

<script>
import { pinLogin } from "../api.js";

export default {
  name: "PinLoginView",

  data() {
    return {
      step: "employee_id",
      employeeId: "",
      pin: "",
      pinLength: 4,
      loading: false,
      error: null,
    };
  },

  methods: {
    handleEmployeeInput(key) {
      if (key === "⌫") {
        this.employeeId = this.employeeId.slice(0, -1);
        return;
      }
      if (key === "" || this.employeeId.length >= 4) return;
      this.employeeId += key;
      if (this.employeeId.length === 4) {
        this.error = null;
        this.step = "pin";
      }
    },

    handlePinInput(key) {
      if (key === "⌫") {
        this.pin = this.pin.slice(0, -1);
        return;
      }
      if (key === "" || this.pin.length >= this.pinLength) return;
      this.pin += key;
      if (this.pin.length === this.pinLength) {
        this.submitPin();
      }
    },

    async submitPin() {
      this.loading = true;
      this.error = null;
      try {
        const data = await pinLogin(this.employeeId, this.pin);
        sessionStorage.setItem("register_token", data.token);
        sessionStorage.setItem("register_role", data.role);
        sessionStorage.setItem("register_employee_id", data.employee_id);
        this.$emit("authenticated", data);
      } catch (e) {
        this.error = "Invalid employee ID or PIN. Please try again.";
        this.pin = "";
        setTimeout(() => {
          this.error = null;
        }, 3000);
      } finally {
        this.loading = false;
      }
    },

    resetToEmployeeId() {
      this.step = "employee_id";
      this.employeeId = "";
      this.pin = "";
      this.error = null;
    },
  },
};
</script>

<style scoped>
.pin-login {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1a1a2e;
}

.pin-card {
  background: #16213e;
  border-radius: 12px;
  padding: 2rem;
  width: 320px;
  border: 1px solid #2a2a4a;
}

.pin-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.logo {
  font-size: 2rem;
}

.pin-header h1 {
  font-size: 1.1rem;
  margin-top: 0.5rem;
  color: #e50914;
}

.subtitle {
  color: #666;
  font-size: 0.75rem;
  margin-top: 0.3rem;
}

.step-label {
  text-align: center;
  color: #aaa;
  font-size: 0.85rem;
  margin-bottom: 1rem;
}

.pin-display {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.pin-digit {
  width: 44px;
  height: 52px;
  border: 2px solid #2a2a4a;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: bold;
  color: #fff;
  background: #0f0f1a;
  transition: border-color 0.1s;
}

.pin-digit.filled {
  border-color: #e50914;
}

.numpad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.numpad-btn {
  padding: 1rem;
  background: #0f0f1a;
  border: 1px solid #2a2a4a;
  border-radius: 8px;
  color: #fff;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.1s;
}

.numpad-btn:hover:not(.empty):not(:disabled) {
  background: #2a2a4a;
  border-color: #e50914;
}

.numpad-btn:active:not(.empty) {
  transform: scale(0.95);
}

.numpad-btn.empty {
  background: transparent;
  border-color: transparent;
  cursor: default;
}

.numpad-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-back {
  width: 100%;
  padding: 0.6rem;
  background: transparent;
  border: 1px solid #2a2a4a;
  border-radius: 6px;
  color: #888;
  font-size: 0.85rem;
  cursor: pointer;
  margin-bottom: 0.75rem;
}

.btn-back:hover {
  border-color: #555;
  color: #aaa;
}

.error-message {
  text-align: center;
  color: #f44336;
  font-size: 0.8rem;
  padding: 0.5rem;
  background: rgba(244, 67, 54, 0.1);
  border-radius: 4px;
}

.loading {
  text-align: center;
  color: #888;
  font-size: 0.8rem;
}
</style>
