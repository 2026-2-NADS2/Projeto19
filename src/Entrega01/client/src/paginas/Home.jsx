import { Link } from 'react-router-dom'
import notebook from '../assets/home-notebook.png'
import './Home.css'
import Cabecalho from '../componentes/Cabecalho.jsx'

function Home() {
  return (
    <div className="home">
      <Cabecalho />

      <main className="conteudo-home">
        <div className="texto-home">
          <h1>
            Transformando o Futuro com <span>KFKA</span>
          </h1>
          <p>
            Inovação, Eficiência e Soluções Sob Medida para o Seu Negócio.
          </p>

          <div className="botoes-home">
            <button>Saiba Mais</button>
            <Link to="/login" className="botao-plataforma">
              Acessar Plataforma
            </Link>
          </div>
        </div>

        <div className="area-imagem">
          <img className="imagem-home" src={notebook} alt="Notebook" />
        </div>
      </main>
    </div>
  )
}

export default Home