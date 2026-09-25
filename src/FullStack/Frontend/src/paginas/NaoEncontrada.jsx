import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import './NaoEncontrada.css'

function NaoEncontrada() {
  return (
    <main className="nao-encontrada">

      <div className="nao-encontrada-conteudo">

        <h1>404</h1>

        <h2>Página não encontrada</h2>

        <p>
          A página que você está procurando não existe
          ou foi removida.
        </p>

        <Link to="/" className="nao-encontrada-botao">
          <ArrowLeft size={18} />
          Voltar para o início
        </Link>

      </div>

    </main>
  )
}

export default NaoEncontrada