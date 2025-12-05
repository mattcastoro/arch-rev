import './App.css'
import { Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login/Login"
import SignUp from './pages/SignUp/SignUp'
import Home from "./pages/Home/Home"

function App() {

  return (
    <div className='page-container'>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </div>
  )
}

export default App
