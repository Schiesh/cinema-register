<template>
  <div class="register-layout">
    <!-- LEFT PANEL: Movie/Showing selection -->
    <div class="left-panel">
      <div class="panel-header">
        <h2>Select Showing</h2>
      </div>
      <div class="panel-body">
        <p class="placeholder">Showings will load here</p>
      </div>
    </div>

    <!-- CENTER PANEL: Seat selection -->
    <div class="center-panel">
      <div class="panel-header">
        <h2>Select Seats</h2>
      </div>
      <div class="panel-body">
        <p class="placeholder">Seat map will appear here</p>
      </div>
    </div>

    <!-- RIGHT PANEL: Transaction summary -->
    <div class="right-panel">
      <div class="panel-header">
        <h2>Transaction</h2>
      </div>
      <div class="panel-body">
        <p class="placeholder">Selected tickets will appear here</p>
      </div>
      <div class="panel-footer">
        <button class="btn-print" disabled>🖨 Print Tickets</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "RegisterView",
};
</script>

<style scoped>
.register-layout {
  display: grid;
  grid-template-columns: 280px 1fr 300px;
  width: 100%;
  height: 100%;
  gap: 0;
}

.left-panel,
.center-panel,
.right-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-right: 1px solid #2a2a4a;
}

.right-panel {
  border-right: none;
}

.panel-header {
  padding: 1rem 1.25rem;
  background: #16213e;
  border-bottom: 1px solid #2a2a4a;
  flex-shrink: 0;
}

.panel-header h2 {
  font-size: 0.95rem;
  font-weight: bold;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.panel-footer {
  padding: 1rem;
  border-top: 1px solid #2a2a4a;
  flex-shrink: 0;
}

.placeholder {
  color: #444;
  font-size: 0.85rem;
  text-align: center;
  margin-top: 2rem;
}

.btn-print {
  width: 100%;
  padding: 1rem;
  background: #e50914;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
}

.btn-print:disabled {
  background: #333;
  color: #666;
  cursor: not-allowed;
}
</style>
