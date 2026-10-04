import { useState } from 'react'
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
  AlertCircle
} from 'lucide-react'

import './Professor.css'


const alunos = [
  { id: 1, nome: 'Eric Carvalho', turma: '7º A' },
  { id: 2, nome: 'Gustavo Cocoloti', turma: '9º A' },
  { id: 3, nome: 'Douglas Macario', turma: '9º B' },
  { id: 4, nome: 'Gabriel Vaz', turma: '8º C' }
]

const disciplinas = [
  'Matemática',
  'Português',
  'Geografia',
  'Ciências'
]

const bimestres = [
  '1º Bimestre',
  '2º Bimestre',
  '3º Bimestre',
  '4º Bimestre'
]

const situacoes = [
  'Precisa de atenção',
  'Em desenvolvimento',
  'Em evolução',
  'Bom desenvolvimento',
  'Excelente desenvolvimento'
]

const tagsDisponiveis = [
  'Boa evolução',
  'Participação',
  'Bom desempenho',
  'Atenção necessária',
  'Dificuldade de aprendizagem',
  'Autonomia'
]


const dadosIniciais = [
  {
    id: 1,
    aluno: 'Eric Carvalho',
    turma: '7º A',
    disciplina: 'Matemática',
    bimestre: '3º Bimestre',
    media: '8.5',
    descricao:
      'O aluno apresentou bom desenvolvimento durante o período, participando das aulas e demonstrando interesse pelos conteúdos trabalhados.',
    situacao: 'Em evolução',
    tags: ['Boa evolução', 'Participação'],
    pontosPositivos:
      'Participa das atividades e demonstra interesse pelos conteúdos apresentados.',
    dificuldades:
      'Apresenta dificuldade em alguns exercícios que envolvem interpretação de problemas.',
    evolucao:
      'Apresentou melhora na participação e maior segurança durante as atividades do período.',
    orientacao:
      'Continuar incentivando a realização das atividades e a revisão dos conteúdos em casa.',
    status: 'Enviado para revisão'
  },
  {
    id: 2,
    aluno: 'Gustavo Cocoloti',
    turma: '9º A',
    disciplina: 'Português',
    bimestre: '3º Bimestre',
    media: '7.8',
    descricao:
      'O aluno mantém bom desenvolvimento na disciplina e participa das atividades propostas durante as aulas.',
    situacao: 'Bom desenvolvimento',
    tags: ['Participação'],
    pontosPositivos:
      'Demonstra boa participação nas aulas e interesse nas atividades propostas.',
    dificuldades:
      'Ainda apresenta dificuldade na organização de algumas produções escritas.',
    evolucao:
      'Teve evolução na leitura e passou a participar com mais frequência das atividades.',
    orientacao:
      'Manter o hábito de leitura e incentivar pequenas produções de texto.',
    status: 'Em Revisão'
  },
  {
    id: 3,
    aluno: 'Douglas Macario',
    turma: '9º B',
    disciplina: 'Geografia',
    bimestre: '3º Bimestre',
    media: '6.4',
    descricao:
      'O aluno apresenta avanços pontuais, mas ainda necessita de acompanhamento mais próximo durante as atividades.',
    situacao: 'Precisa de atenção',
    tags: [
      'Atenção necessária',
      'Dificuldade de aprendizagem'
    ],
    pontosPositivos:
      'Participa das atividades quando recebe orientação durante a aula.',
    dificuldades:
      'Apresenta dificuldade para relacionar alguns conteúdos e organizar as informações estudadas.',
    evolucao:
      'Apresentou pequenos avanços, mas ainda necessita de acompanhamento mais frequente.',
    orientacao:
      'Revisar os conteúdos trabalhados e incentivar uma rotina de estudos durante a semana.',
    status: 'Devolvido',
    motivoDevolucao:
      'Detalhe melhor a evolução apresentada pelo aluno durante o período.'
  },
  {
    id: 4,
    aluno: 'Gabriel Vaz',
    turma: '8º C',
    disciplina: 'Ciências',
    bimestre: '2º Bimestre',
    media: '9.0',
    descricao:
      'O aluno demonstrou ótimo desenvolvimento durante o bimestre, com participação constante e autonomia nas atividades.',
    situacao: 'Bom desenvolvimento',
    tags: ['Bom desempenho', 'Autonomia'],
    pontosPositivos:
      'Apresenta interesse pelos conteúdos e boa participação nas atividades.',
    dificuldades:
      'Possui algumas dúvidas pontuais durante atividades mais complexas.',
    evolucao:
      'Demonstrou evolução durante o período e maior autonomia na realização das atividades.',
    orientacao:
      'Continuar acompanhando as atividades e incentivar a revisão dos conteúdos estudados.',
    status: 'Publicado'
  }
]


const formularioVazio = {
  aluno: '',
  turma: '',
  disciplina: '',
  bimestre: '',
  media: '',
  descricao: '',
  situacao: '',
  pontosPositivos: '',
  dificuldades: '',
  evolucao: '',
  orientacao: '',
  tags: []
}


function Professor() {
  const [pagina, setPagina] = useState('novo')
  const [formulario, setFormulario] = useState(formularioVazio)
  const [acompanhamentos, setAcompanhamentos] = useState(dadosIniciais)

  const [selecionado, setSelecionado] = useState(null)
  const [editandoId, setEditandoId] = useState(null)

  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')


  function alterarCampo(evento) {
    const { name, value } = evento.target

    setFormulario({
      ...formulario,
      [name]: value
    })
  }


  function selecionarAluno(evento) {
    const nome = evento.target.value
    const alunoEncontrado = alunos.find(
      (item) => item.nome === nome
    )

    setFormulario({
      ...formulario,
      aluno: nome,
      turma: alunoEncontrado?.turma || ''
    })
  }


  function selecionarTag(tag) {
    const selecionada = formulario.tags.includes(tag)

    setFormulario({
      ...formulario,
      tags: selecionada
        ? formulario.tags.filter((item) => item !== tag)
        : [...formulario.tags, tag]
    })
  }


  function limparFormulario() {
    setFormulario(formularioVazio)
    setEditandoId(null)
  }


  function validarFormulario() {
    const {
      aluno,
      turma,
      disciplina,
      bimestre,
      media,
      descricao,
      situacao,
      pontosPositivos,
      dificuldades,
      evolucao,
      orientacao,
      tags
    } = formulario

    if (
      !aluno ||
      !turma ||
      !disciplina ||
      !bimestre ||
      !media ||
      !descricao.trim() ||
      !situacao ||
      !pontosPositivos.trim() ||
      !dificuldades.trim() ||
      !evolucao.trim() ||
      !orientacao.trim()
    ) {
      setErro('Preencha todos os campos obrigatórios.')
      return false
    }

    const mediaNumero = Number(
      String(media).replace(',', '.')
    )

    if (
      Number.isNaN(mediaNumero) ||
      mediaNumero < 0 ||
      mediaNumero > 10
    ) {
      setErro('A média deve ser um valor entre 0 e 10.')
      return false
    }

    if (tags.length === 0) {
      setErro(
        'Selecione pelo menos uma tag de acompanhamento.'
      )
      return false
    }

    setErro('')
    return true
  }


  function salvarRegistro(status) {
    const registro = {
      id: editandoId || Date.now(),
      ...formulario,
      status
    }

    if (editandoId) {
      setAcompanhamentos(
        acompanhamentos.map((item) =>
          item.id === editandoId ? registro : item
        )
      )
    } else {
      setAcompanhamentos([
        registro,
        ...acompanhamentos
      ])
    }

    limparFormulario()
  }


  function salvarRascunho() {
    if (
      !formulario.aluno ||
      !formulario.disciplina ||
      !formulario.bimestre
    ) {
      setErro(
        'Para salvar como rascunho, informe pelo menos aluno, disciplina e bimestre.'
      )
      setSucesso('')
      return
    }

    salvarRegistro('Rascunho')

    setErro('')
    setSucesso('Rascunho salvo com sucesso.')
  }


  function enviarParaRevisao(evento) {
    evento.preventDefault()

    if (!validarFormulario()) {
      setSucesso('')
      return
    }

    salvarRegistro('Enviado para revisão')

    setErro('')
    setSucesso(
      'Acompanhamento enviado para revisão.'
    )
    setPagina('acompanhamentos')
  }


  function editarAcompanhamento(item) {
    setFormulario({
      aluno: item.aluno || '',
      turma: item.turma || '',
      disciplina: item.disciplina || '',
      bimestre: item.bimestre || '',
      media: item.media || '',
      descricao: item.descricao || '',
      situacao: item.situacao || '',
      pontosPositivos: item.pontosPositivos || '',
      dificuldades: item.dificuldades || '',
      evolucao: item.evolucao || '',
      orientacao: item.orientacao || '',
      tags: item.tags || []
    })

    setEditandoId(item.id)
    setErro('')
    setSucesso('')
    setPagina('novo')

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }


  function cancelarEdicao() {
    limparFormulario()
    setErro('')
    setSucesso('')
  }


  function classeStatus(status) {
    const classes = {
      Publicado: 'professor-publicado',
      Devolvido: 'professor-devolvido',
      'Em Revisão': 'professor-revisao',
      Rascunho: 'professor-rascunho'
    }

    return classes[status] || 'professor-enviado'
  }


  const resumo = {
    rascunhos: acompanhamentos.filter(
      (item) => item.status === 'Rascunho'
    ).length,

    aguardando: acompanhamentos.filter(
      (item) =>
        item.status === 'Enviado para revisão' ||
        item.status === 'Em Revisão'
    ).length,

    devolvidos: acompanhamentos.filter(
      (item) => item.status === 'Devolvido'
    ).length,

    publicados: acompanhamentos.filter(
      (item) => item.status === 'Publicado'
    ).length
  }


  const camposTexto = [
    {
      name: 'pontosPositivos',
      label: 'Pontos positivos *',
      placeholder:
        'Descreva os pontos positivos observados durante o período...'
    },
    {
      name: 'dificuldades',
      label: 'Dificuldades identificadas *',
      placeholder:
        'Descreva as principais dificuldades identificadas...'
    },
    {
      name: 'evolucao',
      label: 'Evolução no período *',
      placeholder:
        'Descreva como o aluno evoluiu durante o período...'
    },
    {
      name: 'orientacao',
      label: 'Orientação à família *',
      placeholder:
        'Registre orientações para continuidade do acompanhamento...'
    }
  ]


  const detalhesModal = selecionado
    ? [
        {
          titulo: 'Descrição geral',
          texto: selecionado.descricao
        },
        {
          titulo: 'Pontos positivos',
          texto: selecionado.pontosPositivos
        },
        {
          titulo: 'Dificuldades identificadas',
          texto: selecionado.dificuldades
        },
        {
          titulo: 'Evolução no período',
          texto: selecionado.evolucao
        },
        {
          titulo: 'Orientação à família',
          texto: selecionado.orientacao
        }
      ]
    : []


  return (
    <div className="professor">

      <aside className="professor-sidebar">

        <h1 className="professor-logo">
          K<span>F</span>KA
        </h1>

        <nav
          className="professor-menu"
          aria-label="Menu do professor"
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
              setErro('')
              setSucesso('')
            }}
          >
            <LayoutDashboard size={19} />
            Meus acompanhamentos
          </button>

        </nav>

      </aside>


      <main className="professor-conteudo">

        <Link
          to="/"
          className="professor-voltar"
        >
          <ArrowLeft size={18} />
          Voltar ao início
        </Link>


        <header className="professor-topo">

          <div>
            <span className="professor-area">
              ÁREA DO PROFESSOR
            </span>

            <h2>Acompanhamento escolar</h2>

            <p>
              Registre e acompanhe o desenvolvimento
              dos seus alunos.
            </p>
          </div>

          <div className="professor-usuario">

            <div className="professor-avatar">
              <UserRound size={21} />
            </div>

            <div>
              <strong>Professor</strong>
              <span>Área docente</span>
            </div>

          </div>

        </header>


        <section className="professor-resumo">

          <div>
            <span>Rascunhos</span>
            <strong>{resumo.rascunhos}</strong>
          </div>

          <div>
            <span>Aguardando revisão</span>
            <strong>{resumo.aguardando}</strong>
          </div>

          <div>
            <span>Devolvidos</span>
            <strong>{resumo.devolvidos}</strong>
          </div>

          <div>
            <span>Publicados</span>
            <strong>{resumo.publicados}</strong>
          </div>

        </section>


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


        {pagina === 'novo' && (

          <section className="professor-painel">

            <div className="professor-painel-topo">

              <div>
                <span>
                  {editandoId ? 'EDIÇÃO' : 'NOVO REGISTRO'}
                </span>

                <h3>
                  {editandoId
                    ? 'Corrigir acompanhamento'
                    : 'Novo acompanhamento'}
                </h3>

                <p>
                  Registre o desenvolvimento do aluno
                  durante o período.
                </p>
              </div>

              <BookOpen size={24} />

            </div>


            <form
              className="professor-formulario"
              onSubmit={enviarParaRevisao}
            >

              <div className="professor-form-grid">

                <div className="professor-campo">
                  <label htmlFor="aluno">
                    Aluno *
                  </label>

                  <select
                    id="aluno"
                    value={formulario.aluno}
                    onChange={selecionarAluno}
                  >
                    <option value="">
                      Selecione o aluno
                    </option>

                    {alunos.map((item) => (
                      <option
                        key={item.id}
                        value={item.nome}
                      >
                        {item.nome}
                      </option>
                    ))}
                  </select>
                </div>


                <div className="professor-campo">
                  <label htmlFor="turma">
                    Turma *
                  </label>

                  <input
                    id="turma"
                    value={formulario.turma}
                    readOnly
                    placeholder="Turma do aluno"
                  />
                </div>


                <div className="professor-campo">
                  <label htmlFor="disciplina">
                    Disciplina *
                  </label>

                  <select
                    id="disciplina"
                    name="disciplina"
                    value={formulario.disciplina}
                    onChange={alterarCampo}
                  >
                    <option value="">
                      Selecione
                    </option>

                    {disciplinas.map((item) => (
                      <option key={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>


                <div className="professor-campo">
                  <label htmlFor="bimestre">
                    Bimestre *
                  </label>

                  <select
                    id="bimestre"
                    name="bimestre"
                    value={formulario.bimestre}
                    onChange={alterarCampo}
                  >
                    <option value="">
                      Selecione
                    </option>

                    {bimestres.map((item) => (
                      <option key={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>


                <div className="professor-campo">
                  <label htmlFor="media">
                    Média do período *
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


                <div className="professor-campo">
                  <label htmlFor="situacao">
                    Situação atual *
                  </label>

                  <select
                    id="situacao"
                    name="situacao"
                    value={formulario.situacao}
                    onChange={alterarCampo}
                  >
                    <option value="">
                      Selecione
                    </option>

                    {situacoes.map((item) => (
                      <option key={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

              </div>


              <div className="professor-textos">

                <div className="professor-campo">
                  <label htmlFor="descricao">
                    Descrição geral do acompanhamento *
                  </label>

                  <textarea
                    id="descricao"
                    name="descricao"
                    value={formulario.descricao}
                    onChange={alterarCampo}
                    placeholder="Descreva de forma geral o desenvolvimento e o acompanhamento do aluno durante o período..."
                  />
                </div>

              </div>


              <div className="professor-bloco">

                <div className="professor-bloco-titulo">
                  <Tag size={17} />

                  <div>
                    <h4>
                      Tags de acompanhamento *
                    </h4>

                    <p>
                      Selecione uma ou mais classificações.
                    </p>
                  </div>
                </div>

                <div className="professor-tags">

                  {tagsDisponiveis.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className={
                        formulario.tags.includes(tag)
                          ? 'professor-tag professor-tag-ativa'
                          : 'professor-tag'
                      }
                      onClick={() => selecionarTag(tag)}
                    >
                      {tag}
                    </button>
                  ))}

                </div>

              </div>


              <div className="professor-textos">

                {camposTexto.map((campo) => (
                  <div
                    className="professor-campo"
                    key={campo.name}
                  >
                    <label htmlFor={campo.name}>
                      {campo.label}
                    </label>

                    <textarea
                      id={campo.name}
                      name={campo.name}
                      value={formulario[campo.name]}
                      onChange={alterarCampo}
                      placeholder={campo.placeholder}
                    />
                  </div>
                ))}

              </div>


              <div className="professor-form-acoes">

                {editandoId && (
                  <button
                    type="button"
                    className="professor-cancelar"
                    onClick={cancelarEdicao}
                  >
                    <X size={17} />
                    Cancelar edição
                  </button>
                )}

                <button
                  type="button"
                  className="professor-rascunho-botao"
                  onClick={salvarRascunho}
                >
                  <Save size={17} />
                  Salvar rascunho
                </button>

                <button
                  type="submit"
                  className="professor-enviar"
                >
                  <Send size={17} />

                  {editandoId
                    ? 'Salvar e enviar'
                    : 'Enviar para revisão'}
                </button>

              </div>

            </form>

          </section>

        )}


        {pagina === 'acompanhamentos' && (

          <section className="professor-painel">

            <div className="professor-painel-topo">

              <div>
                <span>MEUS REGISTROS</span>

                <h3>Acompanhamentos</h3>

                <p>
                  Consulte o andamento dos registros
                  enviados para a escola.
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
                    <th>Bimestre</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>

                <tbody>

                  {acompanhamentos.map((item) => (

                    <tr key={item.id}>

                      <td>
                        <strong>{item.aluno}</strong>
                      </td>

                      <td>{item.turma}</td>

                      <td>{item.disciplina}</td>

                      <td>{item.bimestre}</td>

                      <td>
                        <span
                          className={`professor-status ${classeStatus(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td>

                        <div className="professor-acoes">

                          <button
                            type="button"
                            className="professor-botao-secundario"
                            onClick={() =>
                              setSelecionado(item)
                            }
                          >
                            <Eye size={15} />
                            Ver
                          </button>

                          {(item.status === 'Rascunho' ||
                            item.status === 'Devolvido') && (

                            <button
                              type="button"
                              className="professor-editar"
                              onClick={() =>
                                editarAcompanhamento(item)
                              }
                            >
                              <Pencil size={15} />

                              {item.status === 'Devolvido'
                                ? 'Corrigir'
                                : 'Editar'}
                            </button>

                          )}

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </section>

        )}

      </main>


      {selecionado && (

        <div
          className="professor-modal-fundo"
          onClick={() => setSelecionado(null)}
        >

          <section
            className="professor-modal"
            role="dialog"
            aria-modal="true"
            onClick={(evento) =>
              evento.stopPropagation()
            }
          >

            <header className="professor-modal-topo">

              <div>
                <span>
                  ACOMPANHAMENTO ESCOLAR
                </span>

                <h3>{selecionado.aluno}</h3>

                <p>
                  {selecionado.disciplina}
                  {' • '}
                  {selecionado.bimestre}
                  {' • '}
                  {selecionado.turma}
                </p>
              </div>

              <button
                type="button"
                className="professor-modal-fechar"
                onClick={() => setSelecionado(null)}
                aria-label="Fechar"
              >
                <X size={20} />
              </button>

            </header>


            <div className="professor-modal-resumo">

              <div>
                <span>Status</span>
                <strong>{selecionado.status}</strong>
              </div>

              <div>
                <span>Média</span>
                <strong>
                  {selecionado.media || 'Não informada'}
                </strong>
              </div>

              <div>
                <span>Situação</span>
                <strong>
                  {selecionado.situacao || 'Não informada'}
                </strong>
              </div>

            </div>


            {selecionado.status === 'Devolvido' &&
              selecionado.motivoDevolucao && (

                <div className="professor-motivo">

                  <AlertCircle size={18} />

                  <div>
                    <strong>
                      Devolvido pelo administrador
                    </strong>

                    <p>
                      {selecionado.motivoDevolucao}
                    </p>
                  </div>

                </div>

              )}


            <div className="professor-detalhe">

              <h4>Tags de acompanhamento</h4>

              <div className="professor-tags-modal">

                {selecionado.tags?.map((tag) => (
                  <span key={tag}>
                    {tag}
                  </span>
                ))}

              </div>

            </div>


            {detalhesModal.map((detalhe) => (

              <div
                className="professor-detalhe"
                key={detalhe.titulo}
              >
                <h4>{detalhe.titulo}</h4>

                <p>
                  {detalhe.texto || 'Não informado.'}
                </p>
              </div>

            ))}


            {(selecionado.status === 'Rascunho' ||
              selecionado.status === 'Devolvido') && (

              <footer className="professor-modal-rodape">

                <button
                  type="button"
                  className="professor-editar"
                  onClick={() => {
                    editarAcompanhamento(selecionado)
                    setSelecionado(null)
                  }}
                >
                  <Pencil size={16} />

                  {selecionado.status === 'Devolvido'
                    ? 'Corrigir acompanhamento'
                    : 'Editar rascunho'}
                </button>

              </footer>

            )}

          </section>

        </div>

      )}

    </div>
  )
}

export default Professor