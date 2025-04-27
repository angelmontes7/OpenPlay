import { useState } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import { Routes, Route } from 'react-router-dom'
import Home from './components/pages/public/Home';
import Services from './components/pages/public/Services';
import SignInPage from './components/pages/public/SignInPage'
import SignUpPage from './components/pages/public/SignUpPage'
import Products from './components/pages/public/Products';
import Dashboard from './components/pages/protected/Dashboard';
import Transactions from './components/pages/protected/Transactions';
import Profile from './components/pages/protected/Profile';
import ProtectedRoute from './routes/ProtectedRoute';

function App() {
  
  return (
    <>
      <Navbar/>
      <Routes>
        {/* Public Routes */}
        <Route path='/' element={<Home />} />
        <Route path='/services' element={<Services />} />
        <Route path='/products' element={<Products />} />
        <Route path='/sign-up' element={<SignUpPage />} />
        <Route path='/sign-in' element={<SignInPage />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <Transactions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  )
}

export default App
