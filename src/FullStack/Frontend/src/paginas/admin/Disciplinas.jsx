
import { useState } from 'react'
import { Plus, Save } from 'lucide-react'
import { useAdmin } from './AdminContext'
import CabecalhoPagina from './CabecalhoPagina'

export default function Disciplinas() {
  const {
    areas,
    nomeArea,
    setNomeArea,
    areaEditando,
    setAreaEditando,
    disciplinas,
    disciplinaForm,
    setDisciplinaForm,
    disciplinaEditando,
    setDisciplinaEditando,
    salvarArea,
    excluirArea,
    salvarDisciplina
  } = useAdmin()

  const [buscaArea, setBuscaArea] = useState('')
  const [buscaDisciplina, setBuscaDisciplina] = useState('')

  const areasFiltradas = areas.filter(area =>
    area.nome.toLowerCase().includes(buscaArea.toLowerCase())
  )

  const disciplinasFiltradas = disciplinas.filter(disciplina =>
    `${disciplina.nome} ${disciplina.area || ''}`
      .toLowerCase()
      .includes(buscaDisciplina.toLowerCase())
  )

  const cancelarEdicaoArea = () => {
    setAreaEditando(null)
    setNomeArea('')
  }

  const cancelarEdicaoDisciplina = () => {
    setDisciplinaEditando(null)
    setDisciplinaForm({
      nome: '',
      area: areas[0]?.nome || ''
    })
  }

  const editarArea = area => {
    setAreaEditando(area.id)
    setNomeArea(area.nome)
  }

  const editarDisciplina = disciplina => {
    setDisciplinaEditando(disciplina.id)
    setDisciplinaForm({
      nome: disciplina.nome,
      area: disciplina.area || areas[0]?.nome || ''
    })
  }

  const confirmarExclusaoArea = area => {
    const confirmar = window.confirm(
      `Deseja realmente excluir a área "${area.nome}"?`
    )

    if (!confirmar) return

    excluirArea(area.id)
  }

  return (
    <>
      <CabecalhoPagina
        titulo="Áreas e disciplinas"
        descricao="Organize as áreas de conhecimento e as disciplinas da escola."
      />

      <div className="admin-disciplinas-layout">

        {/* Áreas */}

        <section className="admin-disciplinas-secao">
          <div className="admin-disciplinas-topo">
            <div>
              <h3>Áreas de conhecimento</h3>
              <p>
                Cadastre e gerencie as áreas utilizadas pela escola.
              </p>
            </div>

            <span className="admin-disciplinas-contador">
              {areas.length} {areas.length === 1 ? 'área' : 'áreas'}
            </span>
          </div>

          <form
            className="admin-disciplinas-formulario"
            onSubmit={salvarArea}
          >
            <div className="admin-campo">
              <label htmlFor="nome-area">
                {areaEditando != null
                  ? 'Editar nome da área'
                  : 'Nome da área'}
              </label>

              <input
                id="nome-area"
                type="text"
                required
                placeholder="Ex.: Linguagens"
                value={nomeArea}
                onChange={e => setNomeArea(e.target.value)}
              />
            </div>

            <div className="admin-disciplinas-form-acoes">
              <button
                type="submit"
                className="admin-botao-principal"
              >
                {areaEditando != null ? (
                  <>
                    <Save size={16} />
                    Salvar alterações
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Cadastrar área
                  </>
                )}
              </button>

              {areaEditando != null && (
                <button
                  type="button"
                  className="admin-botao-secundario"
                  onClick={cancelarEdicaoArea}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>

          <div className="admin-disciplinas-listagem">
            <div className="admin-disciplinas-listagem-topo">
              <h4>Áreas cadastradas</h4>

              {areas.length > 4 && (
                <input
                  type="search"
                  placeholder="Buscar área"
                  aria-label="Buscar área"
                  value={buscaArea}
                  onChange={e => setBuscaArea(e.target.value)}
                />
              )}
            </div>

            <div className="admin-disciplinas-lista">
              {areasFiltradas.length === 0 ? (
                <p className="admin-disciplinas-vazio">
                  {areas.length === 0
                    ? 'Nenhuma área cadastrada.'
                    : 'Nenhuma área encontrada.'}
                </p>
              ) : (
                areasFiltradas.map(area => {
                  const quantidade = disciplinas.filter(
                    disciplina => disciplina.area === area.nome
                  ).length

                  return (
                    <div
                      className="admin-disciplinas-item"
                      key={area.id}
                    >
                      <div className="admin-disciplinas-item-info">
                        <strong>{area.nome}</strong>

                        <span>
                          {quantidade}{' '}
                          {quantidade === 1
                            ? 'disciplina'
                            : 'disciplinas'}
                        </span>
                      </div>

                      <div className="admin-disciplinas-item-acoes">
                        <button
                          type="button"
                          className="admin-disciplinas-acao"
                          onClick={() => editarArea(area)}
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          className="admin-disciplinas-acao excluir"
                          onClick={() => confirmarExclusaoArea(area)}
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </section>

        {/* Disciplinas */}

        <section className="admin-disciplinas-secao">
          <div className="admin-disciplinas-topo">
            <div>
              <h3>Disciplinas</h3>
              <p>
                Vincule cada disciplina à sua área de conhecimento.
              </p>
            </div>

            <span className="admin-disciplinas-contador">
              {disciplinas.length}{' '}
              {disciplinas.length === 1
                ? 'disciplina'
                : 'disciplinas'}
            </span>
          </div>

          <form
            className="admin-disciplinas-formulario"
            onSubmit={salvarDisciplina}
          >
            <div className="admin-campo">
              <label htmlFor="nome-disciplina">
                {disciplinaEditando != null
                  ? 'Editar disciplina'
                  : 'Nome da disciplina'}
              </label>

              <input
                id="nome-disciplina"
                type="text"
                required
                placeholder="Ex.: História"
                value={disciplinaForm.nome}
                onChange={e =>
                  setDisciplinaForm(anterior => ({
                    ...anterior,
                    nome: e.target.value
                  }))
                }
              />
            </div>

            <div className="admin-campo">
              <label htmlFor="area-disciplina">
                Área de conhecimento
              </label>

              <select
                id="area-disciplina"
                required
                value={disciplinaForm.area}
                onChange={e =>
                  setDisciplinaForm(anterior => ({
                    ...anterior,
                    area: e.target.value
                  }))
                }
              >
                <option value="" disabled>
                  Selecione uma área
                </option>

                {areas.map(area => (
                  <option
                    key={area.id}
                    value={area.nome}
                  >
                    {area.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-disciplinas-form-acoes">
              <button
                type="submit"
                className="admin-botao-principal"
                disabled={areas.length === 0}
              >
                {disciplinaEditando != null ? (
                  <>
                    <Save size={16} />
                    Salvar alterações
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Cadastrar disciplina
                  </>
                )}
              </button>

              {disciplinaEditando != null && (
                <button
                  type="button"
                  className="admin-botao-secundario"
                  onClick={cancelarEdicaoDisciplina}
                >
                  Cancelar
                </button>
              )}
            </div>

            {areas.length === 0 && (
              <p className="admin-disciplinas-aviso">
                Cadastre uma área antes de adicionar disciplinas.
              </p>
            )}
          </form>

          <div className="admin-disciplinas-listagem">
            <div className="admin-disciplinas-listagem-topo">
              <h4>Disciplinas cadastradas</h4>

              {disciplinas.length > 4 && (
                <input
                  type="search"
                  placeholder="Buscar disciplina"
                  aria-label="Buscar disciplina"
                  value={buscaDisciplina}
                  onChange={e => setBuscaDisciplina(e.target.value)}
                />
              )}
            </div>

            <div className="admin-disciplinas-lista">
              {disciplinasFiltradas.length === 0 ? (
                <p className="admin-disciplinas-vazio">
                  {disciplinas.length === 0
                    ? 'Nenhuma disciplina cadastrada.'
                    : 'Nenhuma disciplina encontrada.'}
                </p>
              ) : (
                disciplinasFiltradas.map(disciplina => (
                  <div
                    className="admin-disciplinas-item"
                    key={disciplina.id}
                  >
                    <div className="admin-disciplinas-item-info">
                      <strong>{disciplina.nome}</strong>
                      <span>
                        {disciplina.area || 'Sem área definida'}
                      </span>
                    </div>

                    <div className="admin-disciplinas-item-acoes">
                      <button
                        type="button"
                        className="admin-disciplinas-acao"
                        onClick={() => editarDisciplina(disciplina)}
                      >
                        Editar
                      </button>

                      <span
                        className="admin-disciplinas-indisponivel"
                        title="Exclusão ainda não implementada no backend"
                      >
                        Exclusão indisponível
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
