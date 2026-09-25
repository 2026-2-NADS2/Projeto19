import notebook from '../assets/home-notebook.png'
import './Home.css'
import Cabecalho from '../componentes/Cabecalho.jsx'
import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="home">
      <Cabecalho />

      <main className="conteudo-home">
        <div className="texto-home">
          <h1>
            Transformando a Educação com <span>KFKA</span>
          </h1>

          <p>
            Conectando escola e responsáveis para acompanhar de perto
            o desenvolvimento de cada aluno.
          </p>

          <div className="botoes-home">
            <Link to="/sobre-plataforma" className="botao-saiba-mais">
              Saiba Mais
            </Link>

            <Link to="/login" className="botao-plataforma">
              Acessar Plataforma
            </Link>
          </div>
        </div>

        <div className="area-imagem">
          <img
            className="imagem-home"
            src={notebook}
            alt="Plataforma escolar KFKA"
          />
        </div>
      </main>
    </div>
  )
}

export default Home