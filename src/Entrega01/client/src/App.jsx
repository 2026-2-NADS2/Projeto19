import SobreNos from './paginas/SobreNos.jsx'
import SobrePlataforma from './paginas/SobrePlataforma.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './paginas/Home.jsx'
import Login from './paginas/Login.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/sobre-plataforma" element={<SobrePlataforma />} />
        <Route path="/sobre-nos" element={<SobreNos />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App