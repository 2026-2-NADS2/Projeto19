
import { useEffect, useState } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  RotateCcw,
  Save,
  X
} from 'lucide-react'
import CabecalhoPagina from './CabecalhoPagina'

const API_URL = 'http://localhost:3333'

export default function Tags() {
  const [tags, setTags] = useState([])
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [editandoId, setEditandoId] = useState(null)
  const [mostrarInativas, setMostrarInativas] = useState(false)

  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [mensagem, setMensagem] = useState('')

  async function api(caminho, opcoes = {}) {
    const token = sessionStorage.getItem('kfka_token')

    const resposta = await fetch(`${API_URL}${caminho}`, {
      ...opcoes,
      headers: {
        'Content-Type': 'application/json',
        ...(token
          ? { Authorization: `Bearer ${token}` }
          : {}),
        ...opcoes.headers
      }
    })

    const dados = await resposta.json().catch(() => ({}))

    if (!resposta.ok) {
      throw new Error(
        dados.mensagem ||
        dados.erro ||
        `Erro HTTP ${resposta.status}`
      )
    }

    return dados
  }

  async function carregarTags() {
    setCarregando(true)
    setErro('')

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
    }
  }

  async function reativarTag(tag) {
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
    }
  }

  const tagsVisiveis = tags.filter(tag =>
    mostrarInativas || Number(tag.ativo) === 1
  )

  return (
    <>
      <CabecalhoPagina
        titulo="Gerenciar tags"
        descricao="Cadastre e organize as tags utilizadas nos acompanhamentos dos alunos."
      />

      <section className="admin-painel">
        <div className="admin-painel-topo">
          <div>
            <span>
              {editandoId !== null ? 'EDITAR TAG' : 'NOVA TAG'}
            </span>
            <h3>
              {editandoId !== null
                ? 'Editar tag existente'
                : 'Cadastrar tag'}
            </h3>
          </div>
        </div>

        <form onSubmit={salvarTag}>
          <div className="admin-form-grid">
            <div className="admin-campo">
              <label htmlFor="nome-tag">Nome da tag</label>
              <input
                id="nome-tag"
                type="text"
                maxLength={100}
                required
                placeholder="Ex.: Boa participação"
                value={nome}
                onChange={e => setNome(e.target.value)}
              />
            </div>

            <div className="admin-campo">
              <label htmlFor="descricao-tag">
                Descrição (opcional)
              </label>
              <input
                id="descricao-tag"
                type="text"
                maxLength={255}
                placeholder="Descreva a finalidade da tag"
                value={descricao}
                onChange={e => setDescricao(e.target.value)}
              />
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
              marginTop: 18
            }}
          >
            <button
              type="submit"
              className="admin-botao-principal"
              disabled={salvando}
            >
              {editandoId !== null
                ? <Save size={17} />
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
                <X size={17} />
                Cancelar edição
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

      <section className="admin-painel admin-painel-separado">
        <div className="admin-painel-topo">
          <div>
            <span>TAGS CADASTRADAS</span>
            <h3>Lista de tags</h3>
          </div>

          <span>{tagsVisiveis.length} registro(s)</span>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              cursor: 'pointer'
            }}
          >
            <input
              type="checkbox"
              checked={mostrarInativas}
              onChange={e =>
                setMostrarInativas(e.target.checked)
              }
            />
            Mostrar tags desativadas
          </label>
        </div>

        {carregando ? (
          <p>Carregando tags...</p>
        ) : tagsVisiveis.length === 0 ? (
          <p>Nenhuma tag encontrada.</p>
        ) : (
          <div className="admin-tabela-scroll">
            <table className="admin-tabela">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Descrição</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {tagsVisiveis.map(tag => {
                  const ativa = Number(tag.ativo) === 1

                  return (
                    <tr key={tag.id}>
                      <td>
                        <strong>{tag.nome}</strong>
                      </td>

                      <td>{tag.descricao || '—'}</td>

                      <td>
                        {ativa ? 'Ativa' : 'Desativada'}
                      </td>

                      <td>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            flexWrap: 'wrap'
                          }}
                        >
                          <button
                            type="button"
                            className="admin-botao-secundario"
                            onClick={() => iniciarEdicao(tag)}
                            disabled={!ativa}
                            title="Editar tag"
                          >
                            <Pencil size={16} />
                            Editar
                          </button>

                          {ativa ? (
                            <button
                              type="button"
                              className="admin-botao-secundario"
                              onClick={() => desativarTag(tag)}
                              title="Desativar tag"
                            >
                              <Trash2 size={16} />
                              Desativar
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="admin-botao-secundario"
                              onClick={() => reativarTag(tag)}
                              title="Reativar tag"
                            >
                              <RotateCcw size={16} />
                              Reativar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  )
}
