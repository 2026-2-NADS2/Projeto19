import { useState } from 'react'
import { CircleUserRound, ChevronDown, Menu } from 'lucide-react'
import { Link } from 'react-router-dom'
import './Cabecalho.css'

function Cabecalho() {
  const [menuAberto, setMenuAberto] = useState(false)

  return (
    <>
      <header className="cabecalho">
        <div className="cabecalho-esquerda">
          <button
            className="botao-menu"
            onClick={() => setMenuAberto(!menuAberto)}
          >
            <Menu size={26} />
          </button>

          <h2 className="logo">
            K<span>F</span>KA
          </h2>
        </div>

        <nav className="menu">
          <Link className="ativo" to="/">Home</Link>

          <div className="servicos-menu">
            <a href="#" className="link-servicos">
              Plataforma
              <ChevronDown size={16} />
            </a>

            <div className="dropdown-servicos">
              <Link to="/sobre-plataforma">Sobre a Plataforma</Link>
              <a href="#">Responsável</a>
              <Link to="/professor">Professor</Link>
              <Link to="/administrador">Administrador</Link>
            </div>
          </div>

          <a href="#">Recursos</a>

          <Link to="/sobre-nos">Sobre Nós</Link>

          <a href="#">Contato</a>

          <Link className="botao-entrar" to="/login">
            Entrar
          </Link>

          <Link to="/login" className="botao-perfil">
            <CircleUserRound size={28} />
          </Link>
        </nav>
      </header>

      {menuAberto && (
        <aside className="menu-lateral">
          <Link to="/">Home</Link>
          <Link to="/sobre-plataforma">Plataforma</Link>
          <a href="#">Recursos</a>
          <Link to="/sobre-nos">Sobre Nós</Link>
          <a href="#">Contato</a>
        </aside>
      )}
    </>
  )
}

export default Cabecalho