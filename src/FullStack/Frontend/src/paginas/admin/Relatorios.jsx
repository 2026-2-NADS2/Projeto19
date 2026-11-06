import { useAdmin } from './AdminContext'
import CabecalhoPagina from './CabecalhoPagina'
import TabelaAcompanhamentos from './TabelaAcompanhamentos'

export default function Relatorios() {
  const { filtros, setFiltros, alunosFiltrados, disciplinas } = useAdmin()

  const alterar = (campo, valor) =>
    setFiltros(anterior => ({ ...anterior, [campo]: valor }))

  return (
    <>
      <CabecalhoPagina
        titulo="Relatórios"
        descricao="Consulte acompanhamentos e filtre os resultados."
      />

      <section className="admin-painel">
        <div className="admin-painel-topo">
          <div>
            <span>CONSULTA</span>
            <h3>Relatório de acompanhamentos</h3>
          </div>
        </div>

        <div className="admin-filtros">
          <div className="admin-campo">
            <label>Aluno</label>
            <input
              value={filtros.aluno}
              onChange={e => alterar('aluno', e.target.value)}
              placeholder="Pesquisar aluno"
            />
          </div>

          <div className="admin-campo">
            <label>Disciplina</label>
            <select
              value={filtros.disciplina}
              onChange={e => alterar('disciplina', e.target.value)}
            >
              <option value="">Todas</option>
              {disciplinas.map(d => (
                <option key={d.id} value={d.nome}>
                  {d.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-campo">
            <label>Bimestre</label>
            <select
              value={filtros.bimestre}
              onChange={e => alterar('bimestre', e.target.value)}
            >
              <option value="">Todos</option>
              {[1, 2, 3, 4].map(n => (
                <option key={n}>{n}º Bimestre</option>
              ))}
            </select>
          </div>

          <div className="admin-campo">
            <label>Status</label>
            <select
              value={filtros.status}
              onChange={e => alterar('status', e.target.value)}
            >
              <option value="">Todos</option>
              <option>Rascunho</option>
              <option>Enviado para revisão</option>
              <option>Devolvido</option>
              <option>Publicado</option>
            </select>
          </div>
        </div>

        <TabelaAcompanhamentos lista={alunosFiltrados} />
      </section>
    </>
  )
}