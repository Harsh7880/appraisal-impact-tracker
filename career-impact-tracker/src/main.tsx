import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import TestAuth from './pages/TestAuth'
import AddLog from './pages/AddLog'
import Logs from './pages/Logs'


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        {/* <Route path="/test" element={<TestAuth />} /> */}
        <Route path="/add" element={<AddLog />} />
        <Route path="/logs" element={<Logs />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
