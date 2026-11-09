
import { UserRound } from 'lucide-react'

export default function CabecalhoPagina({ titulo, descricao }) {
  return (
    <header className="admin-topo">
      <div>
        <span className="admin-area">
          ÁREA DO ADMINISTRADOR
        </span>

        <h2>{titulo}</h2>

        <p className="admin-subtitulo">
          {descricao}
        </p>
      </div>

      <div className="admin-usuario">
        <div className="admin-avatar">
          <UserRound size={20} />
        </div>

        <div className="admin-usuario-info">
          <strong>Administrador</strong>
          <span>Área administrativa</span>
        </div>
      </div>
    </header>
  )
}
