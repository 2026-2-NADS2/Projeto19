
import { Users, GraduationCap, BookOpen, Clock3, RotateCcw, CheckCircle2 } from 'lucide-react'
import { useAdmin } from './AdminContext'
import CabecalhoPagina from './CabecalhoPagina'
import TabelaAcompanhamentos from './TabelaAcompanhamentos'

export default function Dashboard() {
  const {
    alunos,
    usuarios,
    disciplinas,
    acompanhamentos,
    carregando,
    erro,
    contarStatus
  } = useAdmin()

  const professores = usuarios.filter(
    usuario => usuario.perfil === 'professor'
  ).length

  const indicadores = [
    {
      titulo: 'Alunos',
      valor: alunos.length,
      Icone: Users
    },
    {
      titulo: 'Professores',
      valor: professores,
      Icone: GraduationCap
    },
    {
      titulo: 'Disciplinas',
      valor: disciplinas.length,
      Icone: BookOpen
    }
  ]

  const situacoes = [
    {
      titulo: 'Aguardando revisão',
      valor: contarStatus('Enviado para revisão'),
      Icone: Clock3,
      classe: 'pendente'
    },
    {
      titulo: 'Devolvidos',
      valor: contarStatus('Devolvido'),
      Icone: RotateCcw,
      classe: 'devolvido'
    },
    {
      titulo: 'Publicados',
      valor: contarStatus('Publicado'),
      Icone: CheckCircle2,
      classe: 'publicado'
    }
  ]

  return (
    <div className="admin-dashboard">
      <CabecalhoPagina
        titulo="Visão geral"
        descricao="Acompanhe os registros e a organização escolar."
      />

      <section className="admin-dashboard-indicadores">
        {indicadores.map(({ titulo, valor, Icone }) => (
          <article className="admin-dashboard-indicador" key={titulo}>
            <div className="admin-dashboard-indicador-topo">
              <span>{titulo}</span>
              <Icone size={19} strokeWidth={1.7} />
            </div>

            <strong>{valor}</strong>
          </article>
        ))}
      </section>

      <section className="admin-dashboard-revisao">
        <div className="admin-dashboard-secao-topo">
          <div>
            <h3>Situação dos acompanhamentos</h3>
            <p>Resumo dos registros enviados pelos professores.</p>
          </div>
        </div>

        <div className="admin-dashboard-status">
          {situacoes.map(({ titulo, valor, Icone, classe }) => (
            <div
              className={`admin-dashboard-situacao ${classe}`}
              key={titulo}
            >
              <span className="admin-dashboard-situacao-icone">
                <Icone size={18} strokeWidth={1.8} />
              </span>

              <div>
                <strong>{valor}</strong>
                <span>{titulo}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="admin-dashboard-tabela">
        <div className="admin-dashboard-secao-topo">
          <div>
            <h3>Acompanhamentos</h3>
            <p>Consulte, revise e publique os registros recebidos.</p>
          </div>

          <span className="admin-dashboard-total">
            {acompanhamentos.length} registros
          </span>
        </div>

        {carregando && (
          <p className="admin-dashboard-aviso">
            Carregando acompanhamentos...
          </p>
        )}

        {erro && (
          <p className="admin-erro" role="alert">
            {erro}
          </p>
        )}

        {!carregando && !erro && (
          <TabelaAcompanhamentos
            lista={acompanhamentos}
            mostrarAcoes
          />
        )}
      </section>
    </div>
  )
}
