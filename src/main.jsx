import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { initializeApp } from 'firebase/app'
import './index.css'
import App from './App.jsx'

const firebaseConfig = {
  apiKey: 'AIzaSyCGcn7pWKrTTqGHjiVqdtkh6g5voNroCzA',
  authDomain: 'cinema-online-booking-3fd1b.firebaseapp.com',
  projectId: 'cinema-online-booking-3fd1b',
  storageBucket: 'cinema-online-booking-3fd1b.firebasestorage.app',
  messagingSenderId: '92735155195',
  appId: '1:92735155195:web:4d58b5204207e2da92b95e',
  measurementId: 'G-MVGC1XWSBL',
}

initializeApp(firebaseConfig)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
