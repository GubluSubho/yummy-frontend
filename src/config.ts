import axios from 'axios';

export const API_URL = 'https://ripping-scuff-mutiny.ngrok-free.dev/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'ngrok-skip-browser-warning': 'true' }
});