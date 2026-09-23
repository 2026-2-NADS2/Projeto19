import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './paginas/Home.jsx'
import Login from './paginas/Login.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />  
      </Routes>
    </BrowserRouter>
  );
}

export default App