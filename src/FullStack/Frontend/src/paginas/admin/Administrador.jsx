
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Tags as TagsIcon,
  CalendarDays,
  FileBarChart,
  BookOpen,
  Menu,
  X,
  ArrowLeft
} from 'lucide-react'

import './Administrador.css'
import { api, verificarSessao } from '../../servicos/api'
import { AdminContext } from './AdminContext'
import Dashboard from './Dashboard'
import Cadastros from './Cadastros'
import Tags from './Tags'
import Periodos from './Periodos'
import Relatorios from './Relatorios'
import Disciplinas from './Disciplinas'

const ANO_ATUAL = String(new Date().getFullYear())

const cadastroInicial = {
  nome: '',
  matricula: '',
  data_nascimento: '',
  email: '',
  senha: '',
  turma_id: '',
  disciplina_id: '',
  aluno_id: ''
}

const statusNomes = {
  rascunho: 'Rascunho',
  pendente: 'Enviado para revisão',
  devolvido: 'Devolvido',
  publicado: 'Publicado'
}

function nomeDe(valor, padrao = '—') {
  if (typeof valor === 'string') return valor
  return valor?.nome || padrao
}

function normalizarAcompanhamento(item) {
  return {
    ...item,
    nome: nomeDe(item.aluno, 'Aluno não informado'),
    disciplina: nomeDe(item.disciplina),
    bimestre: nomeDe(item.periodo),
    turma: nomeDe(item.turma),
    status: statusNomes[item.status] || item.status
  }
}

const itensMenu = [
  {
    caminho: '/administrador',
    nome: 'Dashboard',
    icone: LayoutDashboard
  },
  {
    caminho: '/administrador/cadastros',
    nome: 'Cadastros',
    icone: Users
  },
  {
    caminho: '/administrador/tags',
    nome: 'Tags',
    icone: TagsIcon
  },
  {
    caminho: '/administrador/periodos',
    nome: 'Períodos',
    icone: CalendarDays
  },
  {
    caminho: '/administrador/relatorios',
    nome: 'Relatórios',
    icone: FileBarChart
  },
  {
    caminho: '/administrador/disciplinas',
    nome: 'Disciplinas',
    icone: BookOpen
  }
]

export default function Administrador() {
  const location = useLocation()

  const [menuAberto, setMenuAberto] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const [usuarios, setUsuarios] = useState([])
  const [alunos, setAlunos] = useState([])
  const [turmas, setTurmas] = useState([])
  const [disciplinas, setDisciplinas] = useState([])
  const [periodos, setPeriodos] = useState([])
  const [acompanhamentos, setAcompanhamentos] = useState([])

  const [vinculosProfessores, setVinculosProfessores] = useState([])
  const [vinculosResponsaveis, setVinculosResponsaveis] = useState([])
  const [alunosTurmas, setAlunosTurmas] = useState({})

  const [tipoCadastro, setTipoCadastro] = useState('aluno')
  const [cadastroForm, setCadastroForm] = useState(cadastroInicial)

  const [turmaForm, setTurmaForm] = useState({
    nome: '',
    ano_letivo: ANO_ATUAL,
    periodo: 'manha'
  })

  const [filtroCadastro, setFiltroCadastro] = useState({
    busca: '',
    perfil: '',
    turma: '',
    ano: ''
  })

  const [mensagemCadastro, setMensagemCadastro] = useState('')
  const [erroCadastro, setErroCadastro] = useState('')
  const [salvandoCadastro, setSalvandoCadastro] = useState(false)

  const [periodoForm, setPeriodoForm] = useState({
    ano_letivo: ANO_ATUAL,
    bimestre: '1º Bimestre',
    data_inicio: '',
    data_fim: ''
  })

  const [filtroPeriodoAno, setFiltroPeriodoAno] = useState(ANO_ATUAL)
  const [mensagemPeriodo, setMensagemPeriodo] = useState('')
  const [erroPeriodo, setErroPeriodo] = useState('')

  const [tags, setTags] = useState([])
  const [nomeTag, setNomeTag] = useState('')
  const [tagEditando, setTagEditando] = useState(null)

  const [areas, setAreas] = useState([
    { id: 1, nome: 'Linguagens' },
    { id: 2, nome: 'Matemática' },
    { id: 3, nome: 'Ciências da Natureza' },
    { id: 4, nome: 'Ciências Humanas' }
  ])

  const [nomeArea, setNomeArea] = useState('')
  const [areaEditando, setAreaEditando] = useState(null)

  const [disciplinaForm, setDisciplinaForm] = useState({
    nome: '',
    area: 'Linguagens'
  })

  const [disciplinaEditando, setDisciplinaEditando] = useState(null)

  const [filtros, setFiltros] = useState({
    aluno: '',
    disciplina: '',
    bimestre: '',
    status: ''
  })

  const [alunoSelecionado, setAlunoSelecionado] = useState(null)

  async function carregarCadastros() {
    const [
      listaUsuarios,
      listaAlunos,
      listaTurmas,
      listaDisciplinas,
      listaProfessores,
      listaResponsaveis
    ] = await Promise.all([
      api('/usuarios'),
      api('/alunos'),
      api('/turmas'),
      api('/disciplinas'),
      api('/professores-turmas'),
      api('/responsaveis-alunos')
    ])

    const usuariosDados = Array.isArray(listaUsuarios)
      ? listaUsuarios
      : []

    const alunosDados = Array.isArray(listaAlunos)
      ? listaAlunos
      : []

    const turmasDados = Array.isArray(listaTurmas)
      ? listaTurmas
      : []

    const disciplinasDados = Array.isArray(listaDisciplinas)
      ? listaDisciplinas
      : []

    setUsuarios(usuariosDados)
    setAlunos(alunosDados)
    setTurmas(turmasDados)
    setDisciplinas(disciplinasDados)

    setVinculosProfessores(
      Array.isArray(listaProfessores) ? listaProfessores : []
    )

    setVinculosResponsaveis(
      Array.isArray(listaResponsaveis) ? listaResponsaveis : []
    )

    const resultados = await Promise.all(
      turmasDados.map(async turma => {
        try {
          const lista = await api(`/turmas/${turma.id}/alunos`)

          return [
            turma.id,
            Array.isArray(lista) ? lista : []
          ]
        } catch {
          return [turma.id, []]
        }
      })
    )

    setAlunosTurmas(Object.fromEntries(resultados))
  }

  async function carregarPeriodos() {
    const dados = await api('/periodos')
    setPeriodos(Array.isArray(dados) ? dados : [])
  }

  async function carregarAcompanhamentos() {
    const dados = await api('/acompanhamentos')

    setAcompanhamentos(
      Array.isArray(dados)
        ? dados.map(normalizarAcompanhamento)
        : []
    )
  }

  async function carregarTudo() {
    setCarregando(true)
    setErro('')

    try {
      await Promise.all([
        carregarCadastros(),
        carregarPeriodos(),
        carregarAcompanhamentos()
      ])
    } catch (error) {
      setErro(error.message)
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    // Confere a sessão ao abrir ou retornar à aba.
    function conferirSessao() {
      if (document.visibilityState === 'visible') {
        verificarSessao()
      }
    }

    verificarSessao()
    carregarTudo()

    window.addEventListener('focus', conferirSessao)
    document.addEventListener('visibilitychange', conferirSessao)

    return () => {
      window.removeEventListener('focus', conferirSessao)
      document.removeEventListener('visibilitychange', conferirSessao)
    }
  }, [])

  async function salvarCadastro(evento) {
    evento.preventDefault()
    setErroCadastro('')
    setMensagemCadastro('')
    setSalvandoCadastro(true)

    try {
      if (tipoCadastro === 'aluno') {
        const dados = await api('/alunos', {
          method: 'POST',
          body: JSON.stringify({
            nome: cadastroForm.nome,
            matricula: cadastroForm.matricula,
            data_nascimento: cadastroForm.data_nascimento || null
          })
        })

        if (cadastroForm.turma_id) {
          await api(`/turmas/${cadastroForm.turma_id}/alunos`, {
            method: 'POST',
            body: JSON.stringify({
              aluno_id: dados.aluno.id
            })
          })
        }
      } else {
        const dados = await api('/usuarios', {
          method: 'POST',
          body: JSON.stringify({
            nome: cadastroForm.nome,
            email: cadastroForm.email,
            senha: cadastroForm.senha,
            perfil: tipoCadastro
          })
        })

        const usuarioId = dados.usuario.id

        if (
          tipoCadastro === 'professor' &&
          cadastroForm.turma_id &&
          cadastroForm.disciplina_id
        ) {
          await api('/professores-turmas', {
            method: 'POST',
            body: JSON.stringify({
              professor_id: usuarioId,
              turma_id: Number(cadastroForm.turma_id),
              disciplina_id: Number(cadastroForm.disciplina_id)
            })
          })
        }

        if (
          tipoCadastro === 'responsavel' &&
          cadastroForm.aluno_id
        ) {
          await api('/responsaveis-alunos', {
            method: 'POST',
            body: JSON.stringify({
              responsavel_id: usuarioId,
              aluno_id: Number(cadastroForm.aluno_id)
            })
          })
        }
      }

      setMensagemCadastro('Cadastro realizado com sucesso!')
      setCadastroForm({ ...cadastroInicial })
      await carregarCadastros()
    } catch (error) {
      setErroCadastro(error.message)
    } finally {
      setSalvandoCadastro(false)
    }
  }

  async function salvarTurma(evento) {
    evento.preventDefault()
    setErroCadastro('')
    setMensagemCadastro('')

    try {
      await api('/turmas', {
        method: 'POST',
        body: JSON.stringify({
          nome: turmaForm.nome,
          ano_letivo: Number(turmaForm.ano_letivo),
          periodo: turmaForm.periodo
        })
      })

      setMensagemCadastro('Turma cadastrada com sucesso!')

      setTurmaForm({
        nome: '',
        ano_letivo: ANO_ATUAL,
        periodo: 'manha'
      })

      await carregarCadastros()
    } catch (error) {
      setErroCadastro(error.message)
    }
  }

  async function salvarPeriodo(evento) {
    evento.preventDefault()
    setErroPeriodo('')
    setMensagemPeriodo('')

    try {
      if (periodoForm.data_fim < periodoForm.data_inicio) {
        throw new Error(
          'A data final não pode ser anterior à inicial.'
        )
      }

      await api('/periodos', {
        method: 'POST',
        body: JSON.stringify({
          nome: periodoForm.bimestre,
          ano_letivo: Number(periodoForm.ano_letivo),
          data_inicio: periodoForm.data_inicio,
          data_fim: periodoForm.data_fim
        })
      })

      setFiltroPeriodoAno(String(periodoForm.ano_letivo))
      setMensagemPeriodo('Bimestre cadastrado com sucesso!')

      setPeriodoForm(anterior => ({
        ...anterior,
        data_inicio: '',
        data_fim: ''
      }))

      await carregarPeriodos()
    } catch (error) {
      setErroPeriodo(error.message)
    }
  }

  async function publicarAcompanhamento(id) {
    try {
      await api(`/acompanhamentos/${id}/publicar`, {
        method: 'PATCH'
      })

      await carregarAcompanhamentos()
      setAlunoSelecionado(null)
    } catch (error) {
      window.alert(error.message)
    }
  }

  async function devolverAcompanhamento(id) {
    const motivo = window.prompt('Informe o motivo da devolução:')
    if (!motivo?.trim()) return

    try {
      await api(`/acompanhamentos/${id}/revisoes`, {
        method: 'POST',
        body: JSON.stringify({
          acao: 'devolvido',
          observacao: motivo.trim()
        })
      })

      await carregarAcompanhamentos()
      setAlunoSelecionado(null)
    } catch (error) {
      window.alert(error.message)
    }
  }

  function contarStatus(status) {
    return acompanhamentos.filter(
      item => item.status === status
    ).length
  }

  function classeStatus(status) {
    const classes = {
      Rascunho: 'rascunho',
      'Enviado para revisão': 'em-revisao',
      Devolvido: 'devolvido',
      Publicado: 'publicado'
    }

    return classes[status] || ''
  }

  function salvarTag(evento) {
    evento.preventDefault()
    if (!nomeTag.trim()) return

    if (tagEditando !== null) {
      setTags(lista => lista.map(tag =>
        tag.id === tagEditando
          ? { ...tag, nome: nomeTag.trim() }
          : tag
      ))
    } else {
      setTags(lista => [
        ...lista,
        {
          id: Date.now(),
          nome: nomeTag.trim()
        }
      ])
    }

    setNomeTag('')
    setTagEditando(null)
  }

  function salvarArea(evento) {
    evento.preventDefault()
    if (!nomeArea.trim()) return

    if (areaEditando !== null) {
      setAreas(lista => lista.map(area =>
        area.id === areaEditando
          ? { ...area, nome: nomeArea.trim() }
          : area
      ))
    } else {
      setAreas(lista => [
        ...lista,
        {
          id: Date.now(),
          nome: nomeArea.trim()
        }
      ])
    }

    setNomeArea('')
    setAreaEditando(null)
  }

  function excluirArea(id) {
    setAreas(lista =>
      lista.filter(area => area.id !== id)
    )
  }

  async function salvarDisciplina(evento) {
    evento.preventDefault()
    if (!disciplinaForm.nome.trim()) return

    if (disciplinaEditando !== null) {
      window.alert(
        'A edição de disciplinas precisa de uma rota de atualização no backend.'
      )
      return
    }

    try {
      await api('/disciplinas', {
        method: 'POST',
        body: JSON.stringify({
          nome: disciplinaForm.nome.trim()
        })
      })

      setDisciplinaForm({
        nome: '',
        area: 'Linguagens'
      })

      const dados = await api('/disciplinas')
      setDisciplinas(Array.isArray(dados) ? dados : [])
    } catch (error) {
      window.alert(error.message)
    }
  }

  const alunosFiltrados = acompanhamentos.filter(item => {
    const alunoOk = item.nome.toLowerCase().includes(
      filtros.aluno.toLowerCase()
    )

    const disciplinaOk =
      !filtros.disciplina ||
      item.disciplina === filtros.disciplina

    const bimestreOk =
      !filtros.bimestre ||
      item.bimestre === filtros.bimestre

    const statusOk =
      !filtros.status ||
      item.status === filtros.status

    return (
      alunoOk &&
      disciplinaOk &&
      bimestreOk &&
      statusOk
    )
  })

  const contexto = {
    carregarCadastros,
    usuarios,
    alunos,
    turmas,
    disciplinas,
    setDisciplinas,
    periodos,
    acompanhamentos,
    carregando,
    erro,

    vinculosProfessores,
    vinculosResponsaveis,
    alunosTurmas,

    tipoCadastro,
    setTipoCadastro,
    cadastroForm,
    setCadastroForm,
    turmaForm,
    setTurmaForm,
    filtroCadastro,
    setFiltroCadastro,
    mensagemCadastro,
    setMensagemCadastro,
    erroCadastro,
    setErroCadastro,
    salvandoCadastro,
    salvarCadastro,
    salvarTurma,

    periodoForm,
    setPeriodoForm,
    filtroPeriodoAno,
    setFiltroPeriodoAno,
    mensagemPeriodo,
    erroPeriodo,
    salvarPeriodo,

    tags,
    setTags,
    nomeTag,
    setNomeTag,
    tagEditando,
    setTagEditando,
    salvarTag,

    areas,
    nomeArea,
    setNomeArea,
    areaEditando,
    setAreaEditando,
    salvarArea,
    excluirArea,

    disciplinaForm,
    setDisciplinaForm,
    disciplinaEditando,
    setDisciplinaEditando,
    salvarDisciplina,

    filtros,
    setFiltros,
    alunosFiltrados,

    alunoSelecionado,
    setAlunoSelecionado,
    publicarAcompanhamento,
    devolverAcompanhamento,
    contarStatus,
    classeStatus
  }

  const pagina = location.pathname.replace(/\/$/, '')

  function renderizarPagina() {
    switch (pagina) {
      case '/administrador/cadastros':
        return <Cadastros />

      case '/administrador/tags':
        return <Tags />

      case '/administrador/periodos':
        return <Periodos />

      case '/administrador/relatorios':
        return <Relatorios />

      case '/administrador/disciplinas':
        return <Disciplinas />

      default:
        return <Dashboard />
    }
  }

  return (
    <AdminContext.Provider value={contexto}>
      <div className="admin">
        <aside className="admin-sidebar">
          <div className="admin-sidebar-topo">
            {/* Logo igual à do professor, usando classe própria do admin */}
            <h1 className="admin-logo">
              K<span>F</span>KA
            </h1>

            <button
              type="button"
              className="admin-menu-mobile-botao"
              onClick={() => setMenuAberto(!menuAberto)}
              aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
            >
              {menuAberto ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          <nav className={`admin-menu ${menuAberto ? 'admin-menu-aberto' : ''}`}>
            {itensMenu.map(item => {
              const Icone = item.icone
              const ativo = pagina === item.caminho

              return (
                <Link
                  key={item.caminho}
                  to={item.caminho}
                  className={ativo ? 'admin-menu-ativo' : ''}
                  onClick={() => setMenuAberto(false)}
                >
                  <Icone size={18} />
                  <span>{item.nome}</span>
                </Link>
              )
            })}
          </nav>
        </aside>

        <main className="admin-conteudo">
          <Link to="/" className="admin-voltar">
            <ArrowLeft size={16} />
            Voltar ao início
          </Link>

          {renderizarPagina()}
        </main>

        {alunoSelecionado && (
          <div
            className="admin-modal-fundo"
            onClick={() => setAlunoSelecionado(null)}
          >
            <div
              className="admin-modal"
              onClick={evento => evento.stopPropagation()}
            >
              <div className="admin-modal-topo">
                <div>
                  <span>ACOMPANHAMENTO</span>
                  <h3>{alunoSelecionado.nome}</h3>
                  <p>{alunoSelecionado.disciplina}</p>
                </div>

                <button
                  type="button"
                  className="admin-modal-fechar"
                  onClick={() => setAlunoSelecionado(null)}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="admin-modal-resumo">
                <div>
                  <span>Período</span>
                  <strong>{alunoSelecionado.bimestre}</strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong>{alunoSelecionado.status}</strong>
                </div>
              </div>

              <div className="admin-detalhe">
                <h4>Descrição</h4>
                <p>
                  {alunoSelecionado.descricao || 'Sem descrição.'}
                </p>
              </div>

              {alunoSelecionado.media != null && (
                <div className="admin-detalhe">
                  <h4>Média</h4>
                  <p>{alunoSelecionado.media}</p>
                </div>
              )}

              {alunoSelecionado.status === 'Enviado para revisão' && (
                <div className="admin-modal-rodape">
                  <button
                    type="button"
                    className="admin-botao-secundario"
                    onClick={() =>
                      devolverAcompanhamento(alunoSelecionado.id)
                    }
                  >
                    Devolver
                  </button>

                  <button
                    type="button"
                    className="admin-botao-principal"
                    onClick={() =>
                      publicarAcompanhamento(alunoSelecionado.id)
                    }
                  >
                    Publicar
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminContext.Provider>
  )
}
