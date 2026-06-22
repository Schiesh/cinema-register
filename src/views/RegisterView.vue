<template>
  <div class="register-layout">
    <!-- LEFT PANEL: Movie/Showing selection -->
    <div class="left-panel">
      <div class="panel-header">
        <h2>Select Showing</h2>
      </div>
      <div class="panel-body">
        <div v-if="loading.movies" class="loading">Loading...</div>
        <div v-else-if="movies.length === 0" class="empty">
          No movies currently showing.
        </div>
        <div v-else>
          <div
            v-for="movie in movies"
            :key="movie.id"
            class="movie-item"
            :class="{ active: selectedMovie?.id === movie.id }"
            @click="selectMovie(movie)"
          >
            <p class="movie-title">{{ movie.title }}</p>
            <p class="movie-meta">
              {{ movie.genre }} · {{ movie.duration }} mins · {{ movie.rating }}
            </p>
          </div>

          <div v-if="selectedMovie" class="screenings-section">
            <p class="section-label">Showings for {{ selectedMovie.title }}</p>
            <div v-if="loading.screenings" class="loading">Loading...</div>
            <div
              v-for="screening in bookableScreenings"
              :key="screening.id"
              class="screening-item"
              :class="{ active: selectedScreening?.id === screening.id }"
              @click="selectScreening(screening)"
            >
              <p class="screening-time">
                {{ formatShowtime(screening.showtime) }}
              </p>
              <p class="screening-meta">
                {{ screening.screen_name }} ·
                {{ screening.seats_available }} seats left
              </p>
            </div>
            <div
              v-if="bookableScreenings.length === 0 && !loading.screenings"
              class="empty"
            >
              No bookable showings available.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- CENTER PANEL: Seat selection -->
    <div class="center-panel">
      <div class="panel-header">
        <h2>
          Select Seats
          {{
            selectedScreening
              ? `— ${formatShowtime(selectedScreening.showtime)}`
              : ""
          }}
        </h2>
      </div>
      <div class="panel-body">
        <div v-if="!selectedScreening" class="empty">
          Select a showing to see seats.
        </div>
        <div v-else-if="loading.seats" class="loading">Loading seats...</div>
        <div v-else class="seat-grid">
          <div
            v-for="ticket in availableTickets"
            :key="ticket.id"
            class="seat-btn"
            :class="[ticket.seat_type, { selected: isSelected(ticket) }]"
            @click="toggleSeat(ticket)"
          >
            {{ ticket.seat_number }}
          </div>
        </div>
      </div>
    </div>

    <!-- RIGHT PANEL: Transaction summary -->
    <div class="right-panel">
      <div class="panel-header">
        <h2>Transaction</h2>
      </div>
      <div class="panel-body">
        <div v-if="selectedTickets.length === 0" class="empty">
          No seats selected.
        </div>
        <div v-else>
          <div
            v-for="ticket in selectedTickets"
            :key="ticket.id"
            class="ticket-line"
          >
            <span
              >{{ ticket.seat_number }}
              <small>{{ ticket.seat_type }}</small></span
            >
            <span>${{ parseFloat(selectedScreening.price).toFixed(2) }}</span>
          </div>
          <div class="total-line">
            <span>Total</span>
            <span>${{ total }}</span>
          </div>
        </div>
      </div>
      <div class="panel-footer">
        <div v-if="message" class="message" :class="message.type">
          {{ message.text }}
        </div>
        <button
          class="btn-print"
          :disabled="selectedTickets.length === 0 || processing"
          @click="processTransaction"
        >
          {{
            processing
              ? "Processing..."
              : `🖨 Print ${selectedTickets.length} Ticket${selectedTickets.length === 1 ? "" : "s"}`
          }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import {
  fetchNowShowing,
  fetchScreenings,
  fetchTickets,
  bookTicket,
} from "../api.js";

export default {
  name: "RegisterView",

  data() {
    return {
      movies: [],
      screenings: [],
      tickets: [],
      selectedMovie: null,
      selectedScreening: null,
      selectedTickets: [],
      processing: false,
      message: null,
      loading: { movies: false, screenings: false, seats: false },
    };
  },

  computed: {
    bookableScreenings() {
      return this.screenings.filter((s) => s.bookable);
    },

    availableTickets() {
      return this.tickets.filter((t) => t.status === "available");
    },

    total() {
      if (!this.selectedScreening) return "0.00";
      return (
        this.selectedTickets.length * parseFloat(this.selectedScreening.price)
      ).toFixed(2);
    },
  },

  async mounted() {
    await this.loadMovies();
  },

  methods: {
    async loadMovies() {
      this.loading.movies = true;
      try {
        this.movies = await fetchNowShowing();
      } catch (e) {
        this.showMessage(e.message, "error");
      } finally {
        this.loading.movies = false;
      }
    },

    async selectMovie(movie) {
      this.selectedMovie = movie;
      this.selectedScreening = null;
      this.selectedTickets = [];
      this.tickets = [];
      this.loading.screenings = true;
      try {
        this.screenings = await fetchScreenings(movie.id);
      } catch (e) {
        this.showMessage(e.message, "error");
      } finally {
        this.loading.screenings = false;
      }
    },

    async selectScreening(screening) {
      this.selectedScreening = screening;
      this.selectedTickets = [];
      this.loading.seats = true;
      try {
        this.tickets = await fetchTickets(screening.id);
      } catch (e) {
        this.showMessage(e.message, "error");
      } finally {
        this.loading.seats = false;
      }
    },

    isSelected(ticket) {
      return this.selectedTickets.some((t) => t.id === ticket.id);
    },

    toggleSeat(ticket) {
      if (this.isSelected(ticket)) {
        this.selectedTickets = this.selectedTickets.filter(
          (t) => t.id !== ticket.id,
        );
      } else {
        this.selectedTickets.push(ticket);
      }
    },

    async processTransaction() {
      if (!this.selectedTickets.length) return;
      this.processing = true;
      this.message = null;
      try {
        for (const ticket of this.selectedTickets) {
          await bookTicket(ticket.id, {
            customer_name: "Walk-in Customer",
            customer_email: "walkin@register.local",
          });
        }
        const receiptData = {
          movie: this.selectedMovie.title,
          showtime: this.formatShowtime(this.selectedScreening.showtime),
          screen: this.selectedScreening.screen_name,
          seats: this.selectedTickets.map((t) => t.seat_number),
          total: this.total,
          timestamp: new Date().toLocaleString(),
        };
        await window.electronAPI.printReceipt(receiptData);
        this.showMessage(
          `✓ ${this.selectedTickets.length} ticket(s) sold successfully`,
          "success",
        );
        await this.selectScreening(this.selectedScreening);
        this.selectedTickets = [];
      } catch (e) {
        this.showMessage(e.message, "error");
      } finally {
        this.processing = false;
      }
    },

    formatShowtime(showtime) {
      return new Date(showtime).toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    },

    showMessage(text, type) {
      this.message = { text, type };
      setTimeout(() => {
        this.message = null;
      }, 4000);
    },
  },
};
</script>

<style scoped>
.register-layout {
  display: grid;
  grid-template-columns: 280px 1fr 300px;
  width: 100%;
  height: 100%;
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
  padding: 0.75rem 1.25rem;
  background: #16213e;
  border-bottom: 1px solid #2a2a4a;
  flex-shrink: 0;
}

.panel-header h2 {
  font-size: 0.85rem;
  font-weight: bold;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 0.75rem;
}

.panel-footer {
  padding: 1rem;
  border-top: 1px solid #2a2a4a;
  flex-shrink: 0;
}

.loading {
  color: #555;
  font-size: 0.85rem;
  text-align: center;
  padding: 1rem;
}
.empty {
  color: #444;
  font-size: 0.8rem;
  text-align: center;
  padding: 1.5rem 0;
}

.movie-item {
  padding: 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid transparent;
  margin-bottom: 0.5rem;
  background: #16213e;
}

.movie-item:hover {
  border-color: #e50914;
}
.movie-item.active {
  border-color: #e50914;
  background: #1a1a2e;
}

.movie-title {
  font-size: 0.9rem;
  font-weight: bold;
  margin-bottom: 0.2rem;
}
.movie-meta {
  font-size: 0.7rem;
  color: #888;
}

.screenings-section {
  margin-top: 1rem;
}

.section-label {
  font-size: 0.7rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.screening-item {
  padding: 0.6rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid #2a2a4a;
  margin-bottom: 0.4rem;
  background: #16213e;
}

.screening-item:hover {
  border-color: #e50914;
}
.screening-item.active {
  border-color: #e50914;
}

.screening-time {
  font-size: 0.85rem;
  font-weight: bold;
}
.screening-meta {
  font-size: 0.7rem;
  color: #888;
  margin-top: 0.15rem;
}

.seat-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  padding: 0.5rem;
}

.seat-btn {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  border: 2px solid #333;
  background: #1a1a2e;
  color: #fff;
  font-size: 0.65rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  transition: all 0.1s;
}

.seat-btn:hover {
  border-color: #e50914;
}
.seat-btn.selected {
  background: #e50914;
  border-color: #e50914;
}
.seat-btn.premium {
  border-color: #4a9eff;
}
.seat-btn.wheelchair {
  border-color: #4caf50;
}

.ticket-line {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #2a2a4a;
  font-size: 0.85rem;
}

.ticket-line small {
  color: #888;
  font-size: 0.7rem;
  margin-left: 0.3rem;
}

.total-line {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  font-weight: bold;
  font-size: 1rem;
  color: #4caf50;
}

.message {
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  margin-bottom: 0.75rem;
  text-align: center;
}

.message.success {
  background: #1a3a1a;
  color: #4caf50;
}
.message.error {
  background: #3a1a1a;
  color: #f44336;
}

.btn-print {
  width: 100%;
  padding: 1rem;
  background: #e50914;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: bold;
  cursor: pointer;
}

.btn-print:disabled {
  background: #333;
  color: #555;
  cursor: not-allowed;
}

.btn-print:not(:disabled):hover {
  filter: brightness(0.85);
}
</style>
