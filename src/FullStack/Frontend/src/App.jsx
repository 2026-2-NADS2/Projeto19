
import { useEffect } from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation
} from 'react-router-dom'

import NaoEncontrada from './paginas/NaoEncontrada'
import Professor from './paginas/Professor'
import Administrador from './paginas/admin/Administrador.jsx'
import Responsavel from './paginas/Responsavel'
import SobreNos from './paginas/SobreNos.jsx'
import Contato from './paginas/Contato.jsx'
import Recursos from './paginas/Recursos.jsx'
import SobrePlataforma from './paginas/SobrePlataforma.jsx'
import Home from './paginas/Home.jsx'
import Login from './paginas/Login.jsx'
import WidgetAcessibilidade from './componentes/WidgetAcessibilidade.jsx'

// Atualiza o título da aba conforme a página acessada
function TituloPagina() {
  const { pathname } = useLocation()

  useEffect(() => {
    const titulos = {
      '/': 'Início',
      '/login': 'Login',
      '/sobre-plataforma': 'Sobre a Plataforma',
      '/recursos': 'Recursos',
      '/sobre-nos': 'Sobre Nós',
      '/contato': 'Contato',
      '/professor': 'Área do Professor',
      '/responsavel': 'Área do Responsável'
    }

    let titulo = titulos[pathname]

    // Identifica as páginas do administrador
    if (
      pathname === '/administrador' ||
      pathname.startsWith('/administrador/')
    ) {
      titulo = 'Administração'
    }

    document.title = `KFKA | ${titulo || 'Página não encontrada'}`
  }, [pathname])

  return null
}

// Verifica se o usuário está autenticado
function RotaProtegida({ perfil, children }) {
  const token = sessionStorage.getItem('kfka_token')
  const usuarioSalvo = sessionStorage.getItem('kfka_usuario')

  if (!token || !usuarioSalvo) {
    return <Navigate to="/login" replace />
  }

  let usuario

  try {
    usuario = JSON.parse(usuarioSalvo)
  } catch {
    return <Navigate to="/login" replace />
  }

  if (usuario.perfil !== perfil) {
    return <Navigate to="/login" replace />
  }

  return children
}

function App() {
  return (
    <BrowserRouter>
      {/* Atualiza o título automaticamente */}
      <TituloPagina />

      {/* Widget de acessibilidade */}
      <WidgetAcessibilidade />

      <Routes>
        {/* Páginas públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/sobre-plataforma"
          element={<SobrePlataforma />}
        />

        <Route path="/recursos" element={<Recursos />} />
        <Route path="/sobre-nos" element={<SobreNos />} />
        <Route path="/contato" element={<Contato />} />

        {/* Área do administrador */}
        <Route
          path="/administrador/*"
          element={
            <RotaProtegida perfil="administrador">
              <Administrador />
            </RotaProtegida>
          }
        />

        {/* Área do professor */}
        <Route
          path="/professor"
          element={
            <RotaProtegida perfil="professor">
              <Professor />
            </RotaProtegida>
          }
        />

        {/* Área do responsável */}
        <Route
          path="/responsavel"
          element={
            <RotaProtegida perfil="responsavel">
              <Responsavel />
            </RotaProtegida>
          }
        />

        {/* Página não encontrada */}
        <Route path="*" element={<NaoEncontrada />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
