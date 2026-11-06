import { CalendarDays, Save } from 'lucide-react'
import { useAdmin } from './AdminContext'
import CabecalhoPagina from './CabecalhoPagina'

const BIMESTRES = [
  '1º Bimestre',
  '2º Bimestre',
  '3º Bimestre',
  '4º Bimestre'
]

export default function Periodos() {
  const {
    periodos, periodoForm, setPeriodoForm,
    filtroPeriodoAno, setFiltroPeriodoAno,
    mensagemPeriodo, erroPeriodo, salvarPeriodo
  } = useAdmin()

  const alterar = (campo, valor) =>
    setPeriodoForm(anterior => ({
      ...anterior,
      [campo]: valor
    }))

  const lista = periodos.filter(
    p => String(p.ano_letivo) === filtroPeriodoAno
  )

  const formatarData = valor =>
    valor ? String(valor).slice(0, 10).split('-').reverse().join('/') : '—'

  return (
    <>
      <CabecalhoPagina
        titulo="Períodos letivos"
        descricao="Organize o ano em dois semestres, com dois bimestres cada."
      />

      <section className="admin-painel">
        <div className="admin-painel-topo">
          <div>
            <span>NOVO PERÍODO</span>
            <h3>Cadastrar bimestre</h3>
          </div>
        </div>

        <form className="admin-form-grid" onSubmit={salvarPeriodo}>
          <div className="admin-campo">
            <label>Ano letivo</label>
            <input
              type="number"
              min="1901"
              max="2155"
              required
              value={periodoForm.ano_letivo}
              onChange={e => alterar('ano_letivo', e.target.value)}
            />
          </div>

          <div className="admin-campo">
            <label>Bimestre</label>
            <select
              value={periodoForm.bimestre}
              onChange={e => alterar('bimestre', e.target.value)}
            >
              {BIMESTRES.map(nome => (
                <option key={nome}>{nome}</option>
              ))}
            </select>
          </div>

          {[
            ['data_inicio', 'Data de início'],
            ['data_fim', 'Data de término']
          ].map(([campo, titulo]) => (
            <div className="admin-campo" key={campo}>
              <label>{titulo}</label>
              <input
                type="date"
                required
                value={periodoForm[campo]}
                onChange={e => alterar(campo, e.target.value)}
              />
            </div>
          ))}

          <button className="admin-botao-principal">
            <Save size={17} /> Salvar bimestre
          </button>
        </form>

        {erroPeriodo && <p className="admin-erro">{erroPeriodo}</p>}
        {mensagemPeriodo && <p className="admin-mensagem">{mensagemPeriodo}</p>}
      </section>

      <section className="admin-painel admin-painel-separado">
        <div className="admin-painel-topo">
          <div>
            <span>CALENDÁRIO ESCOLAR</span>
            <h3>Bimestres por semestre</h3>
          </div>
        </div>

        <div className="admin-campo">
          <label>Ano letivo</label>
          <select
            value={filtroPeriodoAno}
            onChange={e => setFiltroPeriodoAno(e.target.value)}
          >
            {[...new Set([
              filtroPeriodoAno,
              ...periodos.map(p => String(p.ano_letivo))
            ])].sort().reverse().map(ano => (
              <option key={ano}>{ano}</option>
            ))}
          </select>
        </div>

        {[1, 2].map(semestre => {
          const nomes = semestre === 1
            ? BIMESTRES.slice(0, 2)
            : BIMESTRES.slice(2)

          const itens = lista.filter(p => nomes.includes(p.nome))

          return (
            <div key={semestre} style={{ marginTop: 24 }}>
              <h3>{semestre}º Semestre</h3>

              <div className="admin-periodos">
                {itens.map(p => (
                  <article className="admin-periodo" key={p.id}>
                    <div className="admin-periodo-topo">
                      <div>
                        <CalendarDays size={21} />
                        <h3>{p.nome}</h3>
                      </div>
                      <span className={`admin-badge ${p.ativo ? 'publicado' : ''}`}>
                        {p.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <p>Início: {formatarData(p.data_inicio)}</p>
                    <p>Término: {formatarData(p.data_fim)}</p>
                  </article>
                ))}

                {!itens.length && <p>Nenhum bimestre cadastrado.</p>}
              </div>
            </div>
          )
        })}
      </section>
    </>
  )
}