import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import AddLog from './pages/AddLog'
import Logs from './pages/logs/Logs'
import Summary from './pages/summary/Summary'
import RequireAuth from './components/RequireAuth'
import Header from './components/Header'
import EditLog from './pages/logs/EditLog'
import Dashboard from './pages/Dashboard'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />

        <Route
          path="/logs"
          element={
            <RequireAuth>
              <Logs />
            </RequireAuth>
          }
        />
        <Route
          path="/add"
          element={
            <RequireAuth>
              <AddLog />
            </RequireAuth>
          }
        />

        <Route
          path="/summary"
          element={
            <RequireAuth>
              <Summary />
            </RequireAuth>
          }
        />
        <Route path="/logs/edit/:id" element={<EditLog />} />


      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
