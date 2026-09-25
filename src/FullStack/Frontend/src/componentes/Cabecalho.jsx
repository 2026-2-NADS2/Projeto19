import { useState } from 'react'
import {
  CircleUserRound,
  ChevronDown,
  Menu
} from 'lucide-react'

import { Link } from 'react-router-dom'
import './Cabecalho.css'

function Cabecalho() {
  const [menuAberto, setMenuAberto] = useState(false)

  return (
    <>
      <header className="cabecalho">

        <div className="cabecalho-esquerda">

          <button
            type="button"
            className="botao-menu"
            onClick={() => setMenuAberto(!menuAberto)}
            aria-label={
              menuAberto
                ? 'Fechar menu'
                : 'Abrir menu'
            }
            aria-expanded={menuAberto}
          >
            <Menu size={26} />
          </button>

          <h2 className="logo">
            K<span>F</span>KA
          </h2>

        </div>

        <nav
          className="menu"
          aria-label="Navegação principal"
        >

          <Link
            className="ativo"
            to="/"
          >
            Home
          </Link>

          <div className="servicos-menu">

            <a
              href="#"
              className="link-servicos"
            >
              Plataforma
              <ChevronDown size={16} />
            </a>

            <div className="dropdown-servicos">

              <Link to="/sobre-plataforma">
                Sobre a Plataforma
              </Link>

              <Link to="/responsavel">
                Responsável
              </Link>

              <Link to="/professor">
                Professor
              </Link>

              <Link to="/administrador">
                Administrador
              </Link>

            </div>

          </div>

          <a href="#">
            Recursos
          </a>

          <Link to="/sobre-nos">
            Sobre Nós
          </Link>

          <a href="#">
            Contato
          </a>

          <Link
            className="botao-entrar"
            to="/login"
          >
            Entrar
          </Link>

          <Link
            to="/login"
            className="botao-perfil"
            aria-label="Acessar área de login"
          >
            <CircleUserRound size={28} />
          </Link>

        </nav>

      </header>

      {menuAberto && (

        <aside
          className="menu-lateral"
          aria-label="Menu de navegação"
        >

          <Link
            to="/"
            onClick={() => setMenuAberto(false)}
          >
            Home
          </Link>

          <Link
            to="/sobre-plataforma"
            onClick={() => setMenuAberto(false)}
          >
            Plataforma
          </Link>

          <a href="#">
            Recursos
          </a>

          <Link
            to="/sobre-nos"
            onClick={() => setMenuAberto(false)}
          >
            Sobre Nós
          </Link>

          <a href="#">
            Contato
          </a>

        </aside>

      )}

    </>
  )
}

export default Cabecalho