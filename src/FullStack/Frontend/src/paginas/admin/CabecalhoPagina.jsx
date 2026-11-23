
import { UserRound } from 'lucide-react'

export default function CabecalhoPagina({ titulo, descricao }) {
  return (
    <header className="admin-topo admin-topo-clean">
      <div className="admin-topo-texto">
        <h2>{titulo}</h2>

        {descricao && (
          <p className="admin-subtitulo">
            {descricao}
          </p>
        )}
      </div>

      <div className="admin-usuario">
        <div className="admin-avatar">
          <UserRound size={19} strokeWidth={1.8} />
        </div>

        <div className="admin-usuario-info">
          <strong>Administrador</strong>
          <span>Gestão escolar</span>
        </div>
      </div>
    </header>
  )
}
