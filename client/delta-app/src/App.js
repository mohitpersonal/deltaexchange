// import logo from './logo.svg';
import './App.css';
import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import PrivateRoute from './routes/PrivateRoute';
import Login from './pages/Login';
import Clients from './pages/Clients';
import Placeorder from './pages/Placeorder';
import OrderPreview from './pages/OrderPreview';
import Clientsdetails from './pages/Clientsdetails';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>  
        {/* Redirect root (/) to /login */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        {/* Define routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/clients" element={<PrivateRoute> <Clients /> </PrivateRoute>} />
        <Route path="/place-order" element={<PrivateRoute><Placeorder /> </PrivateRoute>} />
        <Route path="/order-preview" element={<PrivateRoute><OrderPreview /> </PrivateRoute>} />
        <Route path="/clients/client-details/:client_id" element={<PrivateRoute><Clientsdetails /></PrivateRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
