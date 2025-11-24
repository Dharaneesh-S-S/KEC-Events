// src/services/venueService.js
// Frontend-only: localStorage used as a tiny store

export const saveBooking = (booking) => {
  const existing = JSON.parse(localStorage.getItem("venueBookings")) || [];
  existing.push(booking);
  localStorage.setItem("venueBookings", JSON.stringify(existing));
};

export const getBookings = () => {
  return JSON.parse(localStorage.getItem("venueBookings")) || [];
};
