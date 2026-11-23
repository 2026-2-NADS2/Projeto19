
import { createElement, useEffect } from 'react'
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
import RecuperacaoSenha from './paginas/RecuperacaoSenha.jsx'
import PoliticaPrivacidade from './paginas/PoliticaPrivacidade.jsx'
import TermosUso from './paginas/TermosUso.jsx'

import WidgetAcessibilidade from './componentes/WidgetAcessibilidade.jsx'
import AvisoPrivacidade from './componentes/AvisoPrivacidade.jsx'
import CienciaDocumentos from './componentes/CienciaDocumentos.jsx'

// Atualiza o título da aba
function TituloPagina() {
  const { pathname } = useLocation()

  useEffect(() => {
    const titulos = {
      '/': 'Início',
      '/login': 'Login',
      '/recuperar-senha': 'Recuperar senha',
      '/redefinir-senha': 'Redefinir senha',
      '/politica-de-privacidade': 'Política de Privacidade',
      '/termos-de-uso': 'Termos de Uso',
      '/sobre-plataforma': 'Sobre a Plataforma',
      '/recursos': 'Recursos',
      '/sobre-nos': 'Sobre Nós',
      '/contato': 'Contato',
      '/professor': 'Área do Professor',
      '/responsavel': 'Área do Responsável'
    }

    let titulo = titulos[pathname]

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

  return createElement(CienciaDocumentos, { key: token, perfil }, children)
}

// Mostra o aviso nas páginas públicas
function AvisoPublico() {
  const { pathname } = useLocation()

  const paginasPublicas = [
    '/',
    '/login',
    '/sobre-plataforma',
    '/recursos',
    '/sobre-nos',
    '/contato'
  ]

  if (!paginasPublicas.includes(pathname)) {
    return null
  }

  return <AvisoPrivacidade />
}

function App() {
  return (
    <BrowserRouter>
      {/* Título da página */}
      <TituloPagina />

      {/* Acessibilidade */}
      <WidgetAcessibilidade />

      {/* Aviso de privacidade */}
      <AvisoPublico />

      <Routes>
        {/* Páginas públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/recuperar-senha" element={<RecuperacaoSenha key="pedido" />} />
        <Route path="/redefinir-senha" element={<RecuperacaoSenha key="redefinicao" redefinir />} />
        <Route path="/politica-de-privacidade" element={<PoliticaPrivacidade />} />
        <Route path="/termos-de-uso" element={<TermosUso />} />

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
