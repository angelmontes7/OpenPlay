import { useState } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import { Routes, Route } from 'react-router-dom'

function App() {
  
  return (
    <>
      <Navbar/>
      <Routes>
        <Route path='/' exact />
      </Routes>
    </>
  )
}

export default App
