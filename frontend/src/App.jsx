import React, { useState } from 'react';
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState('home');

  return (
    <>
      {currentRoute === 'home' && (
        <HomePage onEnterDashboard={() => setCurrentRoute('dashboard')} />
      )}
      
      {currentRoute === 'dashboard' && (
        <Dashboard onBackToHome={() => setCurrentRoute('home')} />
      )}
    </>
  );
}
