import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import FormComponent from './Components/FormComponent';
import ServiceTracking from './Components/ServiceTracking';
import Auth from './Components/Auth';
import Header from './Header';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <div className="App">
      <Router>
        <Header />
        <div className="main-content">
          <Routes>
            {/* Public Route - Login/Register */}
            <Route path="/login" element={<Auth />} />
            
            {/* Protected Routes */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <FormComponent />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/track-service" 
              element={
                <ProtectedRoute>
                  <ServiceTracking />
                </ProtectedRoute>
              } 
            />
            
            {/* Redirect root to login if not authenticated */}
            <Route 
              path="*" 
              element={
                <Navigate to="/login" replace />
              } 
            />
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App;