import { useState } from 'react'
import { CircleUserRound, ChevronDown, Menu } from 'lucide-react'
import './Cabecalho.css'
import { Link } from 'react-router-dom'

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

          <h2 className="logo">K<span>F</span>KA</h2>
        </div>
        <nav className="menu">
          <Link className="ativo" to="/">Home</Link>
          <div className="servicos-menu">
            <a href="#" className="link-servicos">
              Serviços
              <ChevronDown size={16} />
            </a>
            <div className="dropdown-servicos">
              <a href="#">Sobre a Plataforma</a>
              <a href="#">Avaliações</a>
              <a href="#">Acompanhamento</a>
            </div>
          </div>
          <a href="#">Projetos</a>
          <a href="#">Sobre Nós</a>
          <a href="#">Contato</a>
          <Link className="botao-entrar" to="/login">Entrar</Link>
          <Link to="/login" className="botao-perfil">
            <CircleUserRound size={28} />
          </Link>
        </nav>
      </header>

      {menuAberto && (
        <aside className="menu-lateral">
          <Link to="/">Home</Link>
          <a href="#">Serviços</a>
          <a href="#">Projetos</a>
          <a href="#">Sobre Nós</a>
          <a href="#">Contato</a>
        </aside>
      )}
    </>
  )
}

export default Cabecalho