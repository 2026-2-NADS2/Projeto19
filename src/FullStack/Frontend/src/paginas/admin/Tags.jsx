
import { useEffect, useState } from 'react'
import {
  Plus,
  Pencil,
  Archive,
  RotateCcw,
  Check,
  X
} from 'lucide-react'
import { api } from '../../servicos/api'
import CabecalhoPagina from './CabecalhoPagina'

export default function Tags() {
  const [tags, setTags] = useState([])
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [editandoId, setEditandoId] = useState(null)
  const [mostrarInativas, setMostrarInativas] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [processandoId, setProcessandoId] = useState(null)
  const [erro, setErro] = useState('')
  const [mensagem, setMensagem] = useState('')

  const tagAtiva = tag =>
    tag.ativo === true || Number(tag.ativo) === 1

  async function carregarTags() {
    setCarregando(true)

    try {
      const dados = await api('/tags')
      setTags(Array.isArray(dados) ? dados : [])
    } catch (error) {
      setErro(error.message)
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    // A mesma consulta atualiza o indicador no início e após alterações.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    carregarTags()
  }, [])

  function limparFormulario() {
    setNome('')
    setDescricao('')
    setEditandoId(null)
  }

  function iniciarEdicao(tag) {
    setEditandoId(tag.id)
    setNome(tag.nome)
    setDescricao(tag.descricao || '')
    setErro('')
    setMensagem('')
  }

  async function salvarTag(evento) {
    evento.preventDefault()

    if (!nome.trim()) {
      setErro('Informe o nome da tag.')
      return
    }

    setSalvando(true)
    setErro('')
    setMensagem('')

    try {
      const editando = editandoId !== null

      await api(
        editando ? `/tags/${editandoId}` : '/tags',
        {
          method: editando ? 'PUT' : 'POST',
          body: JSON.stringify({
            nome: nome.trim(),
            descricao: descricao.trim() || null
          })
        }
      )

      limparFormulario()
      await carregarTags()

      setMensagem(
        editando
          ? 'Tag atualizada com sucesso!'
          : 'Tag cadastrada com sucesso!'
      )
    } catch (error) {
      setErro(error.message)
    } finally {
      setSalvando(false)
    }
  }

  async function desativarTag(tag) {
    const confirmar = window.confirm(
      `Deseja desativar a tag "${tag.nome}"? O histórico será preservado.`
    )

    if (!confirmar) return

    setProcessandoId(tag.id)
    setErro('')
    setMensagem('')

    try {
      await api(`/tags/${tag.id}`, {
        method: 'DELETE'
      })

      if (editandoId === tag.id) {
        limparFormulario()
      }

      await carregarTags()
      setMensagem('Tag desativada com sucesso!')
    } catch (error) {
      setErro(error.message)
    } finally {
      setProcessandoId(null)
    }
  }

  async function reativarTag(tag) {
    setProcessandoId(tag.id)
    setErro('')
    setMensagem('')

    try {
      await api(`/tags/${tag.id}/reativar`, {
        method: 'PATCH'
      })

      await carregarTags()
      setMensagem('Tag reativada com sucesso!')
    } catch (error) {
      setErro(error.message)
    } finally {
      setProcessandoId(null)
    }
  }

  const tagsAtivas = tags.filter(tagAtiva).length

  const tagsVisiveis = tags.filter(
    tag => mostrarInativas || tagAtiva(tag)
  )

  return (
    <>
      <CabecalhoPagina
        titulo="Tags"
        descricao="Crie e organize as classificações utilizadas nos acompanhamentos."
      />

      <div className="admin-tags-pagina">
        <div className="admin-tags-layout">

          {/* Formulário */}

          <section className="admin-tags-formulario">
            <div className="admin-tags-secao-topo">
              <h3>
                {editandoId !== null
                  ? 'Editar tag'
                  : 'Nova tag'}
              </h3>

              <p>
                {editandoId !== null
                  ? 'Altere as informações da classificação.'
                  : 'Cadastre uma classificação para os acompanhamentos.'}
              </p>
            </div>

            <form onSubmit={salvarTag}>
              <div className="admin-tags-campos">
                <div className="admin-campo">
                  <label htmlFor="tag-nome">
                    Nome da tag
                  </label>

                  <input
                    id="tag-nome"
                    type="text"
                    maxLength={100}
                    required
                    placeholder="Ex.: Boa participação"
                    value={nome}
                    onChange={e => setNome(e.target.value)}
                  />
                </div>

                <div className="admin-campo">
                  <label htmlFor="tag-descricao">
                    Descrição (opcional)
                  </label>

                  <textarea
                    id="tag-descricao"
                    rows={3}
                    placeholder="Explique quando utilizar esta tag"
                    value={descricao}
                    onChange={e => setDescricao(e.target.value)}
                  />
                </div>
              </div>

              <div className="admin-tags-form-acoes">
                <button
                  type="submit"
                  className="admin-botao-principal"
                  disabled={salvando}
                >
                  {editandoId !== null
                    ? <Check size={17} />
                    : <Plus size={17} />}

                  {salvando
                    ? 'Salvando...'
                    : editandoId !== null
                      ? 'Salvar alterações'
                      : 'Cadastrar tag'}
                </button>

                {editandoId !== null && (
                  <button
                    type="button"
                    className="admin-botao-secundario"
                    onClick={limparFormulario}
                  >
                    <X size={16} />
                    Cancelar
                  </button>
                )}
              </div>
            </form>

            {erro && (
              <p className="admin-erro" role="alert">
                {erro}
              </p>
            )}

            {mensagem && (
              <p className="admin-mensagem" role="status">
                {mensagem}
              </p>
            )}
          </section>

          {/* Lista de tags */}

          <section className="admin-tags-listagem">
            <div className="admin-tags-listagem-topo">
              <div>
                <h3>Tags cadastradas</h3>

                <p>
                  {tagsAtivas} {tagsAtivas === 1 ? 'tag ativa' : 'tags ativas'}
                  {' de '}
                  {tags.length} {tags.length === 1 ? 'cadastrada' : 'cadastradas'}
                </p>
              </div>

              <label className="admin-tags-filtro">
                <input
                  type="checkbox"
                  checked={mostrarInativas}
                  onChange={e =>
                    setMostrarInativas(e.target.checked)
                  }
                />

                Mostrar desativadas
              </label>
            </div>

            {carregando ? (
              <p className="admin-tags-vazio">
                Carregando tags...
              </p>
            ) : tagsVisiveis.length === 0 ? (
              <div className="admin-tags-vazio">
                <p>
                  Nenhuma tag encontrada.
                </p>
              </div>
            ) : (
              <div className="admin-tags-lista">
                {tagsVisiveis.map(tag => {
                  const ativa = tagAtiva(tag)
                  const processando = processandoId === tag.id

                  return (
                    <article
                      className="admin-tags-item"
                      key={tag.id}
                    >
                      <div className="admin-tags-item-info">
                        <div className="admin-tags-item-nome">
                          <strong>{tag.nome}</strong>

                          <span
                            className={`admin-tags-status ${ativa ? 'ativa' : 'inativa'
                              }`}
                          >
                            {ativa ? 'Ativa' : 'Inativa'}
                          </span>
                        </div>

                        <p>
                          {tag.descricao || 'Sem descrição'}
                        </p>
                      </div>

                      <div className="admin-tags-item-acoes">
                        {ativa ? (
                          <>
                            <button
                              type="button"
                              className="admin-tags-acao"
                              onClick={() => iniciarEdicao(tag)}
                              disabled={processando}
                            >
                              <Pencil size={15} />
                              Editar
                            </button>

                            <button
                              type="button"
                              className="admin-tags-acao perigo"
                              onClick={() => desativarTag(tag)}
                              disabled={processando}
                            >
                              <Archive size={15} />
                              Desativar
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            className="admin-tags-acao"
                            onClick={() => reativarTag(tag)}
                            disabled={processando}
                          >
                            <RotateCcw size={15} />
                            Reativar
                          </button>
                        )}
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  )
}
