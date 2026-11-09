
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  UserRound,
  ArrowLeft,
  Save,
  Send,
  Eye,
  Pencil,
  X,
  Tag,
  CheckCircle2,
  Clock3,
  AlertCircle,
  Menu
} from 'lucide-react'
import { api } from '../servicos/api'
import './Professor.css'

const vazio = {
  aluno_id: '',
  disciplina_id: '',
  periodo_id: '',
  media: '',
  descricao: '',
  situacao: '',
  pontosPositivos: '',
  dificuldades: '',
  evolucao: '',
  orientacao: '',
  tags: []
}

const situacoes = [
  'Precisa de atenção',
  'Em desenvolvimento',
  'Em evolução',
  'Bom desenvolvimento',
  'Excelente desenvolvimento'
]

const campos = [
  ['pontosPositivos', 'Pontos positivos *'],
  ['dificuldades', 'Dificuldades identificadas *'],
  ['evolucao', 'Evolução no período *'],
  ['orientacao', 'Orientação à família *']
]

function montarDescricao(formulario) {
  return JSON.stringify({
    formato: 'kfka-professor-v1',
    descricao: formulario.descricao.trim(),
    situacao: formulario.situacao,
    pontosPositivos: formulario.pontosPositivos.trim(),
    dificuldades: formulario.dificuldades.trim(),
    evolucao: formulario.evolucao.trim(),
    orientacao: formulario.orientacao.trim()
  })
}

function lerDescricao(valor) {
  try {
    const dados = JSON.parse(valor)

    if (dados?.formato === 'kfka-professor-v1') {
      return dados
    }
  } catch {
    // Permite ler registros antigos.
  }

  return {
    descricao: valor || '',
    situacao: '',
    pontosPositivos: '',
    dificuldades: '',
    evolucao: '',
    orientacao: ''
  }
}

function nomeStatus(status) {
  return {
    rascunho: 'Rascunho',
    pendente: 'Em Revisão',
    devolvido: 'Devolvido',
    publicado: 'Publicado'
  }[status] || status
}

function classeStatus(status) {
  return {
    rascunho: 'professor-rascunho',
    pendente: 'professor-revisao',
    devolvido: 'professor-devolvido',
    publicado: 'professor-publicado'
  }[status] || ''
}

export default function Professor() {
  const [pagina, setPagina] = useState('novo')
  const [menuMobileAberto, setMenuMobileAberto] = useState(false)

  const [formulario, setFormulario] = useState({
    ...vazio,
    tags: []
  })

  const [vinculos, setVinculos] = useState([])
  const [periodos, setPeriodos] = useState([])
  const [tags, setTags] = useState([])
  const [registros, setRegistros] = useState([])
  const [tagsPorRegistro, setTagsPorRegistro] = useState({})

  const [editandoId, setEditandoId] = useState(null)
  const [selecionado, setSelecionado] = useState(null)

  // Justificativas das devoluções
  const [motivosDevolucao, setMotivosDevolucao] = useState({})
  const [carregandoMotivo, setCarregandoMotivo] = useState(false)
  const [erroMotivo, setErroMotivo] = useState('')

  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)

  const [usuario] = useState(() => {
    try {
      return JSON.parse(
        sessionStorage.getItem('kfka_usuario') || '{}'
      )
    } catch {
      return {}
    }
  })

  // CARREGAR DADOS

  const carregar = useCallback(async () => {
    setCarregando(true)

    try {
      const [opcoes, lista, tagsDisponiveis] = await Promise.all([
        api('/acompanhamentos/opcoes'),
        api('/acompanhamentos'),
        api('/tags')
      ])

      const registrosRecebidos = Array.isArray(lista)
        ? lista
        : []

      const tagsRecebidas = Array.isArray(tagsDisponiveis)
        ? tagsDisponiveis
        : []

      setVinculos(opcoes.vinculos || [])
      setPeriodos(opcoes.periodos || [])
      setRegistros(registrosRecebidos)

      setTags(
        tagsRecebidas.filter(item =>
          item.ativo === true ||
          item.ativo === 1 ||
          item.ativo === '1'
        )
      )

      const resultados = await Promise.allSettled(
        registrosRecebidos.map(item =>
          api(`/acompanhamentos/${item.id}/tags`)
        )
      )

      const mapa = {}

      resultados.forEach((resultado, indice) => {
        if (resultado.status === 'fulfilled') {
          mapa[registrosRecebidos[indice].id] =
            Array.isArray(resultado.value)
              ? resultado.value
              : []
        }
      })

      setTagsPorRegistro(mapa)
      setErro('')
    } catch (e) {
      setErro(e.message)
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  // ALUNOS E DISCIPLINAS

  const alunos = useMemo(() => {
    const mapa = new Map()

    vinculos.forEach(v => {
      if (!mapa.has(v.aluno_id)) {
        mapa.set(v.aluno_id, {
          id: v.aluno_id,
          nome: v.aluno,
          turma: v.turma
        })
      }
    })

    return [...mapa.values()]
  }, [vinculos])

  const vinculosAluno = vinculos.filter(
    v =>
      String(v.aluno_id) ===
      String(formulario.aluno_id)
  )

  const disciplinas = [
    ...new Map(
      vinculosAluno.map(v => [
        v.disciplina_id,
        {
          id: v.disciplina_id,
          nome: v.disciplina
        }
      ])
    ).values()
  ]

  const vinculoEscolhido = vinculosAluno.find(
    v =>
      String(v.disciplina_id) ===
      String(formulario.disciplina_id)
  )

  const periodosDisponiveis = periodos.filter(
    p =>
      !vinculoEscolhido ||
      Number(p.ano_letivo) ===
      Number(vinculoEscolhido.ano_letivo)
  )

  const alunoEscolhido = alunos.find(
    a =>
      String(a.id) ===
      String(formulario.aluno_id)
  )

  const resumo = {
    rascunhos: registros.filter(
      r => r.status === 'rascunho'
    ).length,

    aguardando: registros.filter(
      r => r.status === 'pendente'
    ).length,

    devolvidos: registros.filter(
      r => r.status === 'devolvido'
    ).length,

    publicados: registros.filter(
      r => r.status === 'publicado'
    ).length
  }

  // FORMULÁRIO

  function alterarCampo(e) {
    const { name, value } = e.target

    setFormulario(atual => ({
      ...atual,
      [name]: value,
      ...(name === 'disciplina_id'
        ? { periodo_id: '' }
        : {})
    }))
  }

  function selecionarAluno(e) {
    setFormulario(atual => ({
      ...atual,
      aluno_id: e.target.value,
      disciplina_id: '',
      periodo_id: ''
    }))
  }

  function selecionarTag(id) {
    const tagId = Number(id)

    setFormulario(atual => ({
      ...atual,
      tags: atual.tags.some(
        t => Number(t) === tagId
      )
        ? atual.tags.filter(
          t => Number(t) !== tagId
        )
        : [...atual.tags, tagId]
    }))

    setErro('')
  }

  function limpar() {
    setFormulario({
      ...vazio,
      tags: []
    })

    setEditandoId(null)
  }

  function validar(completo) {
    if (
      !formulario.aluno_id ||
      !formulario.disciplina_id ||
      !formulario.periodo_id ||
      !formulario.descricao.trim()
    ) {
      throw new Error(
        'Informe aluno, disciplina, período e descrição para salvar.'
      )
    }

    const media =
      formulario.media === ''
        ? null
        : Number(
          String(formulario.media).replace(',', '.')
        )

    if (
      media !== null &&
      (
        !Number.isFinite(media) ||
        media < 0 ||
        media > 10
      )
    ) {
      throw new Error(
        'A média deve estar entre 0 e 10.'
      )
    }

    if (
      completo &&
      (
        !formulario.situacao ||
        !formulario.pontosPositivos.trim() ||
        !formulario.dificuldades.trim() ||
        !formulario.evolucao.trim() ||
        !formulario.orientacao.trim()
      )
    ) {
      throw new Error(
        'Preencha todos os campos de avaliação antes de enviar para revisão.'
      )
    }

    if (
      completo &&
      formulario.tags.length === 0
    ) {
      throw new Error(
        'Selecione pelo menos uma tag.'
      )
    }

    if (
      montarDescricao(formulario).length > 16000
    ) {
      throw new Error(
        'A descrição está muito longa.'
      )
    }

    return media
  }

  // SALVAR E ENVIAR

  async function salvar(enviar = false) {
    if (salvando) return

    setSalvando(true)
    setErro('')
    setSucesso('')

    try {
      const media = validar(enviar)
      const descricao = montarDescricao(formulario)

      let registroId = editandoId

      if (editandoId) {
        const anterior = registros.find(
          r =>
            String(r.id) ===
            String(editandoId)
        )

        if (
          !anterior ||
          String(anterior.aluno_id) !==
          String(formulario.aluno_id) ||
          String(anterior.disciplina_id) !==
          String(formulario.disciplina_id) ||
          String(anterior.periodo_id) !==
          String(formulario.periodo_id)
        ) {
          throw new Error(
            'Não é possível trocar aluno, disciplina ou período de um registro existente.'
          )
        }

        if (
          !['rascunho', 'devolvido'].includes(
            anterior.status
          )
        ) {
          throw new Error(
            'Este acompanhamento não pode mais ser editado.'
          )
        }

        await api(
          `/acompanhamentos/${editandoId}`,
          {
            method: 'PATCH',
            body: JSON.stringify({
              descricao,
              media
            })
          }
        )
      } else {
        const resultado = await api(
          '/acompanhamentos',
          {
            method: 'POST',
            body: JSON.stringify({
              aluno_id: Number(
                formulario.aluno_id
              ),
              disciplina_id: Number(
                formulario.disciplina_id
              ),
              periodo_id: Number(
                formulario.periodo_id
              ),
              descricao,
              media
            })
          }
        )

        registroId = resultado.acompanhamento.id
      }

      // ATUALIZAR TAGS

      const anteriores = (
        tagsPorRegistro[registroId] || []
      ).map(t => Number(t.id))

      const selecionadas =
        formulario.tags.map(Number)

      for (
        const id of selecionadas.filter(
          t => !anteriores.includes(t)
        )
      ) {
        await api(
          `/acompanhamentos/${registroId}/tags`,
          {
            method: 'POST',
            body: JSON.stringify({
              tag_id: id
            })
          }
        )
      }

      for (
        const id of anteriores.filter(
          t => !selecionadas.includes(t)
        )
      ) {
        await api(
          `/acompanhamentos/${registroId}/tags/${id}`,
          {
            method: 'DELETE'
          }
        )
      }

      if (enviar) {
        await api(
          `/acompanhamentos/${registroId}/enviar`,
          {
            method: 'PATCH'
          }
        )
      }

      limpar()
      setPagina('acompanhamentos')

      await carregar()

      setSucesso(
        enviar
          ? 'Acompanhamento enviado para revisão.'
          : 'Rascunho salvo com sucesso.'
      )
    } catch (e) {
      setErro(
        e.message +
        (
          editandoId
            ? ''
            : ' Se o registro foi criado, confira a lista antes de tentar novamente.'
        )
      )
    } finally {
      setSalvando(false)
    }
  }

  // BUSCAR MOTIVO DA DEVOLUÇÃO

  async function abrirDetalhes(item) {
    setSelecionado(item)
    setErroMotivo('')
    setCarregandoMotivo(false)

    if (item.status !== 'devolvido') {
      return
    }

    setCarregandoMotivo(true)

    try {
      const resposta = await api(
        `/acompanhamentos/${item.id}/revisoes`
      )

      const revisoes = Array.isArray(resposta)
        ? resposta
        : Array.isArray(resposta?.revisoes)
          ? resposta.revisoes
          : []

      const devolucao = [...revisoes]
        .filter(
          revisao =>
            revisao.acao === 'devolvido'
        )
        .sort(
          (a, b) =>
            Number(b.id) - Number(a.id)
        )[0]

      const motivo =
        typeof devolucao?.observacao === 'string'
          ? devolucao.observacao.trim()
          : ''

      setMotivosDevolucao(atual => ({
        ...atual,
        [item.id]: motivo
      }))
    } catch (e) {
      setErroMotivo(
        e.message ||
        'Não foi possível consultar a justificativa.'
      )
    } finally {
      setCarregandoMotivo(false)
    }
  }

  // EDITAR ACOMPANHAMENTO

  function editar(item) {
    const detalhes = lerDescricao(
      item.descricao
    )

    setFormulario({
      ...vazio,
      ...detalhes,
      aluno_id: String(item.aluno_id),
      disciplina_id: String(
        item.disciplina_id
      ),
      periodo_id: String(item.periodo_id),
      media:
        item.media == null
          ? ''
          : String(item.media),
      tags: (
        tagsPorRegistro[item.id] || []
      ).map(t => Number(t.id))
    })

    setEditandoId(item.id)
    setSelecionado(null)
    setPagina('novo')
    setErro('')
    setSucesso('')

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  const detalhesSelecionado = selecionado
    ? lerDescricao(selecionado.descricao)
    : null

  // INTERFACE

  return (
    <div className="professor">

      {/* MENU LATERAL */}

      <aside className="professor-sidebar">
        <div className="professor-sidebar-topo">
          <h1 className="professor-logo">
            K<span>F</span>KA
          </h1>

          <button
            type="button"
            className="professor-menu-mobile-botao"
            onClick={() =>
              setMenuMobileAberto(
                !menuMobileAberto
              )
            }
            aria-label="Abrir menu"
          >
            {menuMobileAberto
              ? <X size={23} />
              : <Menu size={23} />}
          </button>
        </div>

        <nav
          className={`professor-menu ${menuMobileAberto
              ? 'professor-menu-aberto'
              : ''
            }`}
        >
          <button
            type="button"
            className={
              pagina === 'novo'
                ? 'professor-menu-ativo'
                : ''
            }
            onClick={() => {
              setPagina('novo')
              setMenuMobileAberto(false)
              setErro('')
              setSucesso('')
            }}
          >
            <BookOpen size={19} />
            Novo acompanhamento
          </button>

          <button
            type="button"
            className={
              pagina === 'acompanhamentos'
                ? 'professor-menu-ativo'
                : ''
            }
            onClick={() => {
              setPagina('acompanhamentos')
              setMenuMobileAberto(false)
              setErro('')
              setSucesso('')
            }}
          >
            <LayoutDashboard size={19} />
            Meus acompanhamentos
          </button>
        </nav>
      </aside>

      {/* CONTEÚDO */}

      <main className="professor-conteudo">
        <Link
          to="/"
          className="professor-voltar"
        >
          <ArrowLeft size={18} />
          Voltar ao início
        </Link>

        {/* CABEÇALHO */}

        <header className="professor-topo">
          <div>
            <span className="professor-area">
              ÁREA DO PROFESSOR
            </span>

            <h2>Acompanhamento escolar</h2>

            <p>
              Registre e acompanhe o
              desenvolvimento dos seus alunos.
            </p>
          </div>

          <div className="professor-usuario">
            <div className="professor-avatar">
              <UserRound size={21} />
            </div>

            <div>
              <strong>
                {usuario.nome || 'Professor'}
              </strong>

              <span>Área docente</span>
            </div>
          </div>
        </header>

        {/* RESUMO */}

        <section className="professor-resumo">
          <div>
            <span>Rascunhos</span>
            <strong>
              {resumo.rascunhos}
            </strong>
          </div>

          <div>
            <span>Aguardando revisão</span>
            <strong>
              {resumo.aguardando}
            </strong>
          </div>

          <div>
            <span>Devolvidos</span>
            <strong>
              {resumo.devolvidos}
            </strong>
          </div>

          <div>
            <span>Publicados</span>
            <strong>
              {resumo.publicados}
            </strong>
          </div>
        </section>

        {carregando && (
          <p>Carregando dados...</p>
        )}

        {sucesso && (
          <div className="professor-sucesso">
            <CheckCircle2 size={18} />
            {sucesso}
          </div>
        )}

        {erro && (
          <div className="professor-erro">
            <AlertCircle size={18} />
            {erro}
          </div>
        )}

        {/* NOVO ACOMPANHAMENTO */}

        {pagina === 'novo' && (
          <section className="professor-painel">

            <div className="professor-painel-topo">
              <div>
                <span>
                  {editandoId
                    ? 'EDIÇÃO'
                    : 'NOVO REGISTRO'}
                </span>

                <h3>
                  {editandoId
                    ? 'Corrigir acompanhamento'
                    : 'Novo acompanhamento'}
                </h3>

                <p>
                  Registre o desenvolvimento
                  do aluno durante o período.
                </p>
              </div>

              <BookOpen size={24} />
            </div>

            <form
              className="professor-formulario"
              onSubmit={e => {
                e.preventDefault()
                salvar(true)
              }}
            >
              <div className="professor-form-grid">

                {/* ALUNO */}

                <div className="professor-campo">
                  <label htmlFor="aluno">
                    Aluno *
                  </label>

                  <select
                    id="aluno"
                    value={formulario.aluno_id}
                    onChange={selecionarAluno}
                    disabled={Boolean(editandoId)}
                  >
                    <option value="">
                      Selecione o aluno
                    </option>

                    {alunos.map(a => (
                      <option
                        key={a.id}
                        value={a.id}
                      >
                        {a.nome}
                      </option>
                    ))}
                  </select>
                </div>

                {/* TURMA */}

                <div className="professor-campo">
                  <label htmlFor="turma">
                    Turma
                  </label>

                  <input
                    id="turma"
                    value={
                      alunoEscolhido?.turma || ''
                    }
                    readOnly
                    placeholder="Turma do aluno"
                  />
                </div>

                {/* DISCIPLINA */}

                <div className="professor-campo">
                  <label htmlFor="disciplina">
                    Disciplina *
                  </label>

                  <select
                    id="disciplina"
                    name="disciplina_id"
                    value={
                      formulario.disciplina_id
                    }
                    onChange={alterarCampo}
                    disabled={Boolean(editandoId)}
                  >
                    <option value="">
                      Selecione
                    </option>

                    {disciplinas.map(d => (
                      <option
                        key={d.id}
                        value={d.id}
                      >
                        {d.nome}
                      </option>
                    ))}
                  </select>
                </div>

                {/* PERÍODO */}

                <div className="professor-campo">
                  <label htmlFor="bimestre">
                    Período *
                  </label>

                  <select
                    id="bimestre"
                    name="periodo_id"
                    value={
                      formulario.periodo_id
                    }
                    onChange={alterarCampo}
                    disabled={Boolean(editandoId)}
                  >
                    <option value="">
                      Selecione
                    </option>

                    {periodosDisponiveis.map(
                      p => (
                        <option
                          key={p.id}
                          value={p.id}
                        >
                          {p.nome} — {p.ano_letivo}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* MÉDIA */}

                <div className="professor-campo">
                  <label htmlFor="media">
                    Média do período
                  </label>

                  <input
                    id="media"
                    name="media"
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={formulario.media}
                    onChange={alterarCampo}
                    placeholder="Ex.: 8.5"
                  />
                </div>

                {/* SITUAÇÃO */}

                <div className="professor-campo">
                  <label htmlFor="situacao">
                    Situação atual *
                  </label>

                  <select
                    id="situacao"
                    name="situacao"
                    value={
                      formulario.situacao
                    }
                    onChange={alterarCampo}
                  >
                    <option value="">
                      Selecione
                    </option>

                    {situacoes.map(s => (
                      <option
                        key={s}
                        value={s}
                      >
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* DESCRIÇÃO */}

              <div className="professor-campo">
                <label htmlFor="descricao">
                  Descrição geral *
                </label>

                <textarea
                  id="descricao"
                  name="descricao"
                  rows={4}
                  value={
                    formulario.descricao
                  }
                  onChange={alterarCampo}
                  placeholder="Descreva o acompanhamento escolar..."
                />
              </div>

              {/* DEMAIS CAMPOS */}

              {campos.map(
                ([name, label]) => (
                  <div
                    className="professor-campo"
                    key={name}
                  >
                    <label htmlFor={name}>
                      {label}
                    </label>

                    <textarea
                      id={name}
                      name={name}
                      rows={3}
                      value={
                        formulario[name]
                      }
                      onChange={alterarCampo}
                      placeholder={
                        label.replace(' *', '')
                      }
                    />
                  </div>
                )
              )}

              {/* TAGS */}

              <div className="professor-campo">
                <label>
                  <Tag size={17} />
                  Tags de acompanhamento *
                </label>

                <div
                  className="professor-tags"
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 10,
                    marginTop: 12
                  }}
                >
                  {tags.map(tag => {
                    const selecionada =
                      formulario.tags.some(
                        id =>
                          Number(id) ===
                          Number(tag.id)
                      )

                    return (
                      <button
                        key={tag.id}
                        type="button"
                        className={
                          selecionada
                            ? 'professor-tag-selecionada'
                            : ''
                        }
                        onClick={() =>
                          selecionarTag(tag.id)
                        }
                        aria-pressed={
                          selecionada
                        }
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 7,
                          padding: '10px 16px',
                          borderRadius: 10,
                          border: selecionada
                            ? '1px solid #b875ff'
                            : '1px solid #75439c',
                          background: selecionada
                            ? '#7928ca'
                            : '#29153c',
                          color: '#ffffff',
                          fontFamily: 'inherit',
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: 'pointer',
                          pointerEvents: 'auto',
                          position: 'relative',
                          zIndex: 1,
                          transition:
                            'background 0.2s'
                        }}
                      >
                        {selecionada && (
                          <CheckCircle2 size={15} />
                        )}

                        {tag.nome}
                      </button>
                    )
                  })}
                </div>

                {tags.length === 0 &&
                  !carregando && (
                    <p
                      style={{
                        color: '#ffb4c2',
                        fontSize: 13,
                        marginTop: 10
                      }}
                    >
                      Nenhuma tag ativa
                      disponível. Verifique
                      as tags cadastradas
                      pelo administrador.
                    </p>
                  )}

                {formulario.tags.length > 0 && (
                  <p
                    style={{
                      color: '#c9a7ec',
                      fontSize: 12,
                      marginTop: 10
                    }}
                  >
                    {formulario.tags.length}
                    {' '}tag(s) selecionada(s).
                  </p>
                )}
              </div>

              {/* BOTÕES */}

              <div className="professor-form-acoes">

                {editandoId && (
                  <button
                    type="button"
                    className="professor-botao-secundario"
                    onClick={() => {
                      limpar()
                      setErro('')
                      setSucesso('')
                    }}
                  >
                    Cancelar edição
                  </button>
                )}

                <button
                  type="button"
                  className="professor-botao-secundario"
                  disabled={
                    salvando || carregando
                  }
                  onClick={() =>
                    salvar(false)
                  }
                >
                  <Save size={17} />
                  Salvar rascunho
                </button>

                <button
                  type="submit"
                  className="professor-botao-principal"
                  disabled={
                    salvando || carregando
                  }
                >
                  <Send size={17} />

                  {salvando
                    ? 'Salvando...'
                    : 'Enviar para revisão'}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* MEUS ACOMPANHAMENTOS */}

        {pagina === 'acompanhamentos' && (
          <section className="professor-painel">

            <div className="professor-painel-topo">
              <div>
                <span>MEUS REGISTROS</span>

                <h3>Acompanhamentos</h3>

                <p>
                  Consulte o andamento
                  dos registros enviados
                  para a escola.
                </p>
              </div>

              <Clock3 size={24} />
            </div>

            <div className="professor-tabela-scroll">
              <table className="professor-tabela">
                <thead>
                  <tr>
                    <th>Aluno</th>
                    <th>Turma</th>
                    <th>Disciplina</th>
                    <th>Período</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {registros.map(item => (
                    <tr key={item.id}>
                      <td>
                        <strong>
                          {item.aluno}
                        </strong>
                      </td>

                      <td>
                        {item.turma || '—'}
                      </td>

                      <td>
                        {item.disciplina}
                      </td>

                      <td>
                        {item.periodo}
                      </td>

                      <td>
                        <span
                          className={`professor-status ${classeStatus(
                            item.status
                          )}`}
                        >
                          {nomeStatus(
                            item.status
                          )}
                        </span>
                      </td>

                      <td>
                        <div className="professor-acoes">

                          <button
                            type="button"
                            className="professor-botao-secundario"
                            onClick={() =>
                              abrirDetalhes(item)
                            }
                          >
                            <Eye size={15} />
                            Ver
                          </button>

                          {[
                            'rascunho',
                            'devolvido'
                          ].includes(
                            item.status
                          ) && (
                              <button
                                type="button"
                                className="professor-editar"
                                onClick={() =>
                                  editar(item)
                                }
                              >
                                <Pencil size={15} />
                                Editar
                              </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))}

                  {!registros.length && (
                    <tr>
                      <td colSpan={6}>
                        Nenhum acompanhamento
                        cadastrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      {/* MODAL DE DETALHES */}

      {selecionado && (
        <div
          className="professor-modal-fundo"
          onClick={() =>
            setSelecionado(null)
          }
        >
          <section
            className="professor-modal"
            role="dialog"
            aria-modal="true"
            onClick={e =>
              e.stopPropagation()
            }
          >
            <header className="professor-modal-topo">
              <div>
                <span>
                  ACOMPANHAMENTO ESCOLAR
                </span>

                <h3>
                  {selecionado.aluno}
                </h3>

                <p>
                  {selecionado.disciplina}
                  {' • '}
                  {selecionado.periodo}
                  {' • '}
                  {selecionado.turma ||
                    'Turma não informada'}
                </p>
              </div>

              <button
                type="button"
                className="professor-modal-fechar"
                onClick={() =>
                  setSelecionado(null)
                }
                aria-label="Fechar"
              >
                <X size={20} />
              </button>
            </header>

            {/* RESUMO */}

            <div className="professor-modal-resumo">
              <div>
                <span>Status</span>
                <strong>
                  {nomeStatus(
                    selecionado.status
                  )}
                </strong>
              </div>

              <div>
                <span>Média</span>
                <strong>
                  {selecionado.media ??
                    'Não informada'}
                </strong>
              </div>

              <div>
                <span>Situação</span>
                <strong>
                  {detalhesSelecionado.situacao ||
                    'Não informada'}
                </strong>
              </div>
            </div>

            {/* MOTIVO DA DEVOLUÇÃO */}

            {selecionado.status ===
              'devolvido' && (
                <div
                  className="professor-motivo"
                  role="status"
                >
                  <AlertCircle size={19} />

                  <div>
                    <strong>
                      Motivo da devolução
                    </strong>

                    {carregandoMotivo ? (
                      <p>
                        Carregando justificativa...
                      </p>
                    ) : erroMotivo ? (
                      <p>
                        {erroMotivo}
                      </p>
                    ) : (
                      <p>
                        {motivosDevolucao[
                          selecionado.id
                        ] ||
                          'Nenhuma justificativa foi encontrada para esta devolução.'}
                      </p>
                    )}
                  </div>
                </div>
              )}

            {/* TAGS */}

            <div className="professor-detalhe">
              <h4>
                Tags de acompanhamento
              </h4>

              <div className="professor-tags-modal">
                {(
                  tagsPorRegistro[
                  selecionado.id
                  ] || []
                ).map(t => (
                  <span key={t.id}>
                    {t.nome}
                  </span>
                ))}
              </div>
            </div>

            {/* DESCRIÇÕES */}

            {[
              [
                'descricao',
                'Descrição geral'
              ],
              ...campos.map(
                ([name, label]) => [
                  name,
                  label.replace(' *', '')
                ]
              )
            ].map(
              ([campo, titulo]) => (
                <div
                  className="professor-detalhe"
                  key={campo}
                >
                  <h4>
                    {titulo}
                  </h4>

                  <p>
                    {detalhesSelecionado[
                      campo
                    ] || 'Não informado.'}
                  </p>
                </div>
              )
            )}

            {/* EDITAR */}

            {[
              'rascunho',
              'devolvido'
            ].includes(
              selecionado.status
            ) && (
                <footer className="professor-modal-rodape">
                  <button
                    type="button"
                    className="professor-editar"
                    onClick={() =>
                      editar(selecionado)
                    }
                  >
                    <Pencil size={16} />
                    Editar acompanhamento
                  </button>
                </footer>
              )}
          </section>
        </div>
      )}
    </div>
  )
}
