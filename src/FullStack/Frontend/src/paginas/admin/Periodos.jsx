
import { CalendarDays, Check, Save } from 'lucide-react'
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
    periodos,
    periodoForm,
    setPeriodoForm,
    filtroPeriodoAno,
    setFiltroPeriodoAno,
    mensagemPeriodo,
    erroPeriodo,
    salvarPeriodo
  } = useAdmin()

  const alterar = (campo, valor) => {
    setPeriodoForm(anterior => ({
      ...anterior,
      [campo]: valor
    }))
  }

  const lista = periodos.filter(
    periodo => String(periodo.ano_letivo) === String(filtroPeriodoAno)
  )

  const formatarData = valor => {
    if (!valor) return '—'

    const data = String(valor).slice(0, 10)
    return data.split('-').reverse().join('/')
  }

  const buscarBimestre = nome => {
    return lista.find(periodo => periodo.nome === nome)
  }

  const renderizarBimestre = nome => {
    const periodo = buscarBimestre(nome)

    return (
      <div
        className={`admin-periodos-item ${!periodo ? 'pendente' : ''}`}
        key={nome}
      >
        <div className="admin-periodos-item-icone">
          <CalendarDays size={19} />
        </div>

        <div className="admin-periodos-item-conteudo">
          <div className="admin-periodos-item-topo">
            <strong>{nome}</strong>

            {periodo && (
              <span
                className={`admin-periodos-status ${periodo.ativo ? 'ativo' : 'inativo'
                  }`}
              >
                {periodo.ativo ? 'Ativo' : 'Inativo'}
              </span>
            )}
          </div>

          <p>
            {periodo
              ? `${formatarData(periodo.data_inicio)} até ${formatarData(periodo.data_fim)}`
              : 'Ainda não cadastrado'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <CabecalhoPagina
        titulo="Períodos letivos"
        descricao="Cadastre os bimestres e consulte as datas do calendário escolar."
      />

      <div className="admin-periodos-pagina">
        <div className="admin-periodos-layout">

          {/* Cadastro */}

          <section className="admin-periodos-cadastro">
            <div className="admin-periodos-cadastro-topo">
              <h3>Cadastrar bimestre</h3>
              <p>
                Escolha o bimestre e informe quando ele começa e termina.
              </p>
            </div>

            <form
              className="admin-periodos-formulario"
              onSubmit={salvarPeriodo}
            >
              <div className="admin-campo admin-periodos-ano">
                <label htmlFor="periodo-ano">Ano letivo</label>

                <input
                  id="periodo-ano"
                  type="number"
                  min="1901"
                  max="2155"
                  required
                  value={periodoForm.ano_letivo}
                  onChange={e =>
                    alterar('ano_letivo', e.target.value)
                  }
                />
              </div>

              <div>
                <label className="admin-periodos-label">
                  Bimestre
                </label>

                <div className="admin-periodos-opcoes">
                  {BIMESTRES.map((nome, indice) => {
                    const selecionado =
                      periodoForm.bimestre === nome

                    return (
                      <button
                        type="button"
                        key={nome}
                        className={`admin-periodos-opcao ${selecionado ? 'selecionado' : ''
                          }`}
                        onClick={() => alterar('bimestre', nome)}
                        aria-pressed={selecionado}
                      >
                        {indice + 1}º

                        {selecionado && <Check size={15} />}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="admin-periodos-datas">
                <div className="admin-campo">
                  <label htmlFor="periodo-inicio">
                    Data de início
                  </label>

                  <input
                    id="periodo-inicio"
                    type="date"
                    required
                    value={periodoForm.data_inicio}
                    onChange={e =>
                      alterar('data_inicio', e.target.value)
                    }
                  />
                </div>

                <div className="admin-campo">
                  <label htmlFor="periodo-fim">
                    Data de término
                  </label>

                  <input
                    id="periodo-fim"
                    type="date"
                    required
                    min={periodoForm.data_inicio || undefined}
                    value={periodoForm.data_fim}
                    onChange={e =>
                      alterar('data_fim', e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="admin-periodos-formulario-rodape">
                <button
                  type="submit"
                  className="admin-botao-principal"
                >
                  <Save size={17} />
                  Salvar bimestre
                </button>
              </div>
            </form>

            {erroPeriodo && (
              <p className="admin-erro" role="alert">
                {erroPeriodo}
              </p>
            )}

            {mensagemPeriodo && (
              <p className="admin-mensagem" role="status">
                {mensagemPeriodo}
              </p>
            )}
          </section>

          {/* Calendário */}

          <section className="admin-periodos-calendario">
            <div className="admin-periodos-calendario-topo">
              <div>
                <h3>Calendário escolar</h3>
                <p>
                  Consulte os bimestres cadastrados em cada semestre.
                </p>
              </div>

              <div className="admin-campo admin-periodos-filtro">
                <label htmlFor="periodo-filtro-ano">
                  Ano letivo
                </label>

                <select
                  id="periodo-filtro-ano"
                  value={filtroPeriodoAno}
                  onChange={e =>
                    setFiltroPeriodoAno(e.target.value)
                  }
                >
                  {[
                    ...new Set([
                      String(filtroPeriodoAno),
                      ...periodos.map(periodo =>
                        String(periodo.ano_letivo)
                      )
                    ])
                  ]
                    .filter(Boolean)
                    .sort((a, b) => Number(b) - Number(a))
                    .map(ano => (
                      <option key={ano} value={ano}>
                        {ano}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="admin-periodos-semestres">
              <div className="admin-periodos-semestre">
                <div className="admin-periodos-semestre-topo">
                  <h4>1º semestre</h4>
                </div>

                <div className="admin-periodos-lista">
                  {BIMESTRES.slice(0, 2).map(renderizarBimestre)}
                </div>
              </div>

              <div className="admin-periodos-semestre">
                <div className="admin-periodos-semestre-topo">
                  <h4>2º semestre</h4>
                </div>

                <div className="admin-periodos-lista">
                  {BIMESTRES.slice(2).map(renderizarBimestre)}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
