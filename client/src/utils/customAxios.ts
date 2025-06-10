import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
// Custom Axios instance with no headers or credentials
export const axiosNoHeaders = axios.create({
  headers: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval'; img-src 'self' https: data:; font-src 'self' https: data:;",
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  },
});

// Custom Axios instance with credentials enabled
export const axiosWithCredentials = axios.create({
  withCredentials: true,
  headers: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval'; img-src 'self' https: data:; font-src 'self' https: data:;",
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  },
});

// Custom Axios instance with Authorization header and credentials enabled
export const axiosWithAuth = axios.create({
  withCredentials: true,
  headers: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval'; img-src 'self' https: data:; font-src 'self' https: data:;",
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  },
});

// Add a request interceptor to attach the Authorization header
axiosWithAuth.interceptors.request.use(async (config) => {
    console.log(JSON.parse( await SecureStore.getItemAsync("authToken")), 'this is auth token -----------');
    
  // Add Authorization header if token is available in localStorage
  const token = JSON.parse( await SecureStore.getItemAsync("authToken"))?.token;
  console.log(token, 'this is token -----------');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Usage: Some API needs credentials (Bearer and cookies), some don't. This is where customAxios comes in handy.
