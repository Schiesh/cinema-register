const API = import.meta.env.VITE_API_URL || "http://192.168.1.158:3000";

export async function fetchNowShowing() {
  const res = await fetch(`${API}/movies/now_showing`);
  if (!res.ok) throw new Error("Failed to fetch showings");
  return res.json();
}

export async function fetchScreenings(movieId) {
  const res = await fetch(`${API}/movies/${movieId}/screenings`);
  if (!res.ok) throw new Error("Failed to fetch screenings");
  return res.json();
}

export async function fetchSeatMap(screenId) {
  const res = await fetch(`${API}/screens/${screenId}/seat_map`);
  if (!res.ok) throw new Error("Failed to fetch seat map");
  return res.json();
}

export async function fetchTickets(screeningId) {
  const res = await fetch(`${API}/screenings/${screeningId}/tickets`);
  if (!res.ok) throw new Error("Failed to fetch tickets");
  return res.json();
}

export async function bookTicket(ticketId, customerData) {
  const res = await fetch(`${API}/tickets/${ticketId}/book`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(customerData),
  });
  if (!res.ok) throw new Error("Failed to book ticket");
  return res.json();
}

export async function pinLogin(employeeId, pin) {
  const res = await fetch(`${API}/auth/pin_login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ employee_id: employeeId, pin: pin }),
  });
  if (!res.ok) throw new Error("Invalid employee ID or PIN");
  return res.json();
}

export function authHeaders() {
  const token = sessionStorage.getItem("register_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}
