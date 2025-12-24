// import logo from './logo.svg';
import './App.css';
import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Clients from './pages/Clients';
import Placeorder from './pages/Placeorder';
import Clientsdetails from './pages/Clientsdetails';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>  
        {/* Redirect root (/) to /login */}
        <Route path="/" element={<Navigate to="/login" />} />
        {/* Define the login route */}
        <Route path="/login" element={<Login />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/place-order" element={<Placeorder />} />
        <Route path="/client-details" element={<Clientsdetails />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;