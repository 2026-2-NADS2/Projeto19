import { useAdmin } from './AdminContext'
import CabecalhoPagina from './CabecalhoPagina'
import TabelaAcompanhamentos from './TabelaAcompanhamentos'

export default function Dashboard() {
  const {
    alunos, usuarios, disciplinas, acompanhamentos,
    carregando, erro, contarStatus
  } = useAdmin()

  return (
    <>
      <CabecalhoPagina
        titulo="Dashboard"
        descricao="Revise os registros enviados pelos professores."
      />

      <section className="admin-cards">
        <div className="admin-card">
          <span>Alunos</span>
          <strong>{alunos.length}</strong>
        </div>
        <div className="admin-card">
          <span>Professores</span>
          <strong>
            {usuarios.filter(u => u.perfil === 'professor').length}
          </strong>
        </div>
        <div className="admin-card">
          <span>Disciplinas</span>
          <strong>{disciplinas.length}</strong>
        </div>
      </section>

      <section className="admin-status">
        {[
          ['Aguardando revisão', 'Enviado para revisão'],
          ['Devolvidos', 'Devolvido'],
          ['Publicados', 'Publicado']
        ].map(([titulo, status]) => (
          <div key={titulo}>
            <span>{titulo}</span>
            <strong>{contarStatus(status)}</strong>
          </div>
        ))}
      </section>

      <section className="admin-painel">
        <div className="admin-painel-topo">
          <div>
            <span>REVISÃO</span>
            <h3>Acompanhamentos enviados</h3>
            <p>Revise os registros antes da publicação.</p>
          </div>
        </div>

        {carregando && <p>Carregando acompanhamentos...</p>}
        {erro && <p className="admin-erro">{erro}</p>}

        {!carregando && !erro && (
          <TabelaAcompanhamentos
            lista={acompanhamentos}
            mostrarAcoes
          />
        )}
      </section>
    </>
  )
}