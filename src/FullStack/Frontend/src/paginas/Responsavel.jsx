import { useState } from 'react'
import { Link } from 'react-router-dom'

import {
  LayoutDashboard,
  BookOpen,
  TrendingUp,
  UserRound,
  ArrowLeft,
  CheckCircle2,
  MessageSquare,
  FileText,
  CalendarDays,
  Tag,
  ChevronRight,
  X,
  Save,
  Clock3,
  Eye
} from 'lucide-react'

import './Responsavel.css'


const alunos = [
  {
    id: 1,
    nome: 'Sofia Carvalho',
    turma: '7º A',
    ano: '2026'
  },
  {
    id: 2,
    nome: 'Felipe Carvalho',
    turma: '9º B',
    ano: '2026'
  }
]


const acompanhamentos = [
  {
    id: 1,
    alunoId: 1,
    ano: '2026',
    disciplina: 'Matemática',
    professor: 'Ana Souza',
    bimestre: '1º Bimestre',
    dataPublicacao: '10/04/2026',
    status: 'Publicado',
    media: '7.5',
    descricao:
      'Sofia apresentou bom envolvimento nas atividades e demonstrou evolução durante o primeiro bimestre.',
    situacao: 'Em desenvolvimento',
    tags: ['Participação', 'Boa evolução'],
    pontosPositivos:
      'Sofia participa das atividades, demonstra interesse pelos conteúdos e procura esclarecer suas dúvidas durante as aulas.',
    dificuldades:
      'Apresenta dificuldade em alguns exercícios que exigem interpretação de problemas e organização das etapas de resolução.',
    evolucao:
      'Durante o período apresentou melhora na participação e passou a realizar as atividades com maior segurança.',
    orientacao:
      'Continuar incentivando a realização das atividades e reservar momentos durante a semana para revisar os conteúdos trabalhados.'
  },
  {
    id: 2,
    alunoId: 1,
    ano: '2026',
    disciplina: 'Português',
    professor: 'Carlos Lima',
    bimestre: '2º Bimestre',
    dataPublicacao: '26/06/2026',
    status: 'Publicado',
    media: '8.2',
    descricao:
      'Sofia apresentou desenvolvimento positivo em leitura e produção textual durante o segundo bimestre.',
    situacao: 'Bom desenvolvimento',
    tags: ['Participação', 'Autonomia'],
    pontosPositivos:
      'Apresenta interesse pela leitura e participa das discussões realizadas durante as aulas.',
    dificuldades:
      'Ainda apresenta algumas dificuldades na organização de textos mais longos e na revisão da escrita.',
    evolucao:
      'Demonstrou evolução na leitura, na interpretação dos textos e passou a produzir atividades com maior autonomia.',
    orientacao:
      'Manter o hábito de leitura e incentivar pequenas produções de texto em casa.'
  },
  {
    id: 3,
    alunoId: 1,
    ano: '2026',
    disciplina: 'Matemática',
    professor: 'Ana Souza',
    bimestre: '3º Bimestre',
    dataPublicacao: '25/09/2026',
    status: 'Publicado',
    media: '8.6',
    descricao:
      'Sofia demonstrou maior segurança na resolução das atividades e apresentou evolução em relação aos períodos anteriores.',
    situacao: 'Boa evolução',
    tags: ['Boa evolução', 'Autonomia'],
    pontosPositivos:
      'Demonstra maior confiança durante as atividades e consegue desenvolver exercícios com menos auxílio.',
    dificuldades:
      'Ainda precisa de atenção em problemas que apresentam muitas informações no enunciado.',
    evolucao:
      'Em comparação aos períodos anteriores, apresentou avanço na interpretação e na organização do raciocínio matemático.',
    orientacao:
      'Continuar revisando os exercícios realizados em aula e estimular a leitura cuidadosa dos problemas.'
  },
  {
    id: 4,
    alunoId: 2,
    ano: '2026',
    disciplina: 'Geografia',
    professor: 'Marcos Oliveira',
    bimestre: '2º Bimestre',
    dataPublicacao: '27/06/2026',
    status: 'Publicado',
    media: '6.3',
    descricao:
      'Felipe participa das atividades, mas ainda necessita de acompanhamento em alguns conteúdos da disciplina.',
    situacao: 'Precisa de atenção',
    tags: [
      'Atenção necessária',
      'Dificuldade de aprendizagem'
    ],
    pontosPositivos:
      'Felipe demonstra interesse pelos temas discutidos e participa quando recebe orientação.',
    dificuldades:
      'Apresenta dificuldade para relacionar alguns conteúdos e organizar as informações estudadas.',
    evolucao:
      'Apresentou pequenos avanços durante o período, mas ainda necessita de acompanhamento mais frequente.',
    orientacao:
      'Estabelecer uma rotina de revisão dos conteúdos e utilizar mapas e resumos como apoio aos estudos.'
  },
  {
    id: 5,
    alunoId: 2,
    ano: '2026',
    disciplina: 'Ciências',
    professor: 'Juliana Martins',
    bimestre: '3º Bimestre',
    dataPublicacao: '29/09/2026',
    status: 'Publicado',
    media: '7.4',
    descricao:
      'Felipe apresentou maior participação nas atividades práticas e evolução durante o terceiro bimestre.',
    situacao: 'Em desenvolvimento',
    tags: ['Participação'],
    pontosPositivos:
      'Participa das atividades práticas e demonstra curiosidade pelos conteúdos trabalhados.',
    dificuldades:
      'Precisa melhorar a organização das anotações e revisar alguns conceitos fundamentais.',
    evolucao:
      'Apresentou maior participação durante o terceiro bimestre e passou a realizar mais atividades em sala.',
    orientacao:
      'Revisar as anotações semanalmente e manter uma rotina de estudo dos conceitos trabalhados.'
  }
]


function Responsavel() {
  const [alunoSelecionado, setAlunoSelecionado] = useState(1)

  const [anoSelecionado, setAnoSelecionado] = useState('Todos')
  const [bimestreSelecionado, setBimestreSelecionado] =
    useState('Todos')
  const [disciplinaSelecionada, setDisciplinaSelecionada] =
    useState('Todas')

  const [acompanhamentoAberto, setAcompanhamentoAberto] =
    useState(null)

  const [observacaoAberta, setObservacaoAberta] =
    useState(null)

  const [textoObservacao, setTextoObservacao] =
    useState('')

  const [erroObservacao, setErroObservacao] =
    useState('')

  const [mensagem, setMensagem] = useState('')

  const [ciencias, setCiencias] = useState([])
  const [observacoes, setObservacoes] = useState([])


  const alunoAtual = alunos.find(
    (aluno) => aluno.id === alunoSelecionado
  )


  const acompanhamentosPublicados = acompanhamentos.filter(
    (item) =>
      item.alunoId === alunoSelecionado &&
      item.status === 'Publicado'
  )


  const disciplinasDoAluno = [
    ...new Set(
      acompanhamentosPublicados.map(
        (item) => item.disciplina
      )
    )
  ]


  const anosDoAluno = [
    ...new Set(
      acompanhamentosPublicados.map(
        (item) => item.ano
      )
    )
  ]


  const acompanhamentosFiltrados =
    acompanhamentosPublicados.filter(
      (item) =>
        (anoSelecionado === 'Todos' ||
          item.ano === anoSelecionado) &&
        (bimestreSelecionado === 'Todos' ||
          item.bimestre === bimestreSelecionado) &&
        (disciplinaSelecionada === 'Todas' ||
          item.disciplina === disciplinaSelecionada)
    )


  const observacoesDoAluno = observacoes.filter(
    (item) => item.alunoId === alunoSelecionado
  )


  function selecionarAluno(id) {
    setAlunoSelecionado(id)

    setAnoSelecionado('Todos')
    setBimestreSelecionado('Todos')
    setDisciplinaSelecionada('Todas')

    setAcompanhamentoAberto(null)
    setObservacaoAberta(null)
    setMensagem('')
  }


  function confirmarCiencia(id) {
    if (!ciencias.includes(id)) {
      setCiencias([
        ...ciencias,
        id
      ])
    }

    setMensagem(
      'Ciência registrada neste acompanhamento.'
    )
  }


  function abrirObservacao(acompanhamento) {
    setObservacaoAberta(acompanhamento)
    setTextoObservacao('')
    setErroObservacao('')
    setMensagem('')
  }


  function salvarObservacao(evento) {
    evento.preventDefault()

    if (!textoObservacao.trim()) {
      setErroObservacao(
        'Digite uma observação antes de salvar.'
      )

      return
    }

    const novaObservacao = {
      id: Date.now(),
      alunoId: observacaoAberta.alunoId,
      acompanhamentoId: observacaoAberta.id,
      disciplina: observacaoAberta.disciplina,
      bimestre: observacaoAberta.bimestre,
      texto: textoObservacao.trim(),
      data: new Date().toLocaleDateString('pt-BR')
    }

    setObservacoes([
      ...observacoes,
      novaObservacao
    ])

    setTextoObservacao('')
    setErroObservacao('')
    setObservacaoAberta(null)

    setMensagem(
      'Observação registrada no histórico do acompanhamento.'
    )
  }


  function gerarPdf() {
    setMensagem(
      'A geração do PDF será conectada ao backend na próxima etapa.'
    )
  }


  const detalhes = acompanhamentoAberto
    ? [
        {
          titulo: 'Descrição geral',
          texto: acompanhamentoAberto.descricao
        },
        {
          titulo: 'Pontos positivos',
          texto: acompanhamentoAberto.pontosPositivos
        },
        {
          titulo: 'Dificuldades identificadas',
          texto: acompanhamentoAberto.dificuldades
        },
        {
          titulo: 'Evolução no período',
          texto: acompanhamentoAberto.evolucao
        },
        {
          titulo: 'Orientação à família',
          texto: acompanhamentoAberto.orientacao
        }
      ]
    : []


  return (
    <div className="responsavel">

      <aside className="responsavel-sidebar">

        <h1 className="responsavel-logo">
          K<span>F</span>KA
        </h1>

        <nav
          className="responsavel-menu"
          aria-label="Menu do responsável"
        >

          <a
            href="#dashboard"
            className="responsavel-menu-ativo"
          >
            <LayoutDashboard size={19} />
            Dashboard
          </a>

          <a href="#acompanhamentos">
            <BookOpen size={19} />
            Acompanhamentos
          </a>

          <a href="#evolucao">
            <TrendingUp size={19} />
            Evolução do aluno
          </a>

          <a href="#historico">
            <Clock3 size={19} />
            Histórico
          </a>

        </nav>

      </aside>


      <main className="responsavel-conteudo">

        <Link
          to="/"
          className="responsavel-voltar"
        >
          <ArrowLeft size={18} />
          Voltar ao início
        </Link>


        <header
          className="responsavel-topo"
          id="dashboard"
        >

          <div>
            <span className="responsavel-subtitulo">
              ÁREA DO RESPONSÁVEL
            </span>

            <h2>Acompanhamento escolar</h2>

            <p>
              Acompanhe o desenvolvimento escolar dos
              alunos vinculados ao seu cadastro.
            </p>
          </div>

          <div className="responsavel-perfil">

            <div className="responsavel-avatar">
              <UserRound size={21} />
            </div>

            <div>
              <strong>Responsável</strong>
              <span>Área da família</span>
            </div>

          </div>

        </header>


        <section className="responsavel-selecao">

          <div className="responsavel-secao-cabecalho">
            <span>ALUNOS VINCULADOS</span>
            <h3>Selecione o aluno</h3>
          </div>

          <div className="responsavel-alunos">

            {alunos.map((aluno) => (

              <button
                type="button"
                key={aluno.id}
                className={
                  alunoSelecionado === aluno.id
                    ? 'responsavel-aluno responsavel-aluno-ativo'
                    : 'responsavel-aluno'
                }
                onClick={() =>
                  selecionarAluno(aluno.id)
                }
              >

                <div>
                  <strong>{aluno.nome}</strong>
                  <span>{aluno.turma}</span>
                </div>

                <ChevronRight size={18} />

              </button>

            ))}

          </div>

        </section>


        <section className="responsavel-resumo">

          <div>
            <span>Aluno</span>
            <strong>{alunoAtual.nome}</strong>
          </div>

          <div>
            <span>Turma</span>
            <strong>{alunoAtual.turma}</strong>
          </div>

          <div>
            <span>Ano letivo</span>
            <strong>{alunoAtual.ano}</strong>
          </div>

          <div>
            <span>Relatórios publicados</span>
            <strong>
              {acompanhamentosPublicados.length}
            </strong>
          </div>

        </section>


        {mensagem && (
          <div className="responsavel-mensagem">
            <CheckCircle2 size={18} />
            {mensagem}
          </div>
        )}


        <section
          className="responsavel-acompanhamentos"
          id="acompanhamentos"
        >

          <div className="responsavel-secao-topo">

            <div>
              <span className="responsavel-secao-label">
                ACOMPANHAMENTOS PUBLICADOS
              </span>

              <h3>{alunoAtual.nome}</h3>

              <p>
                Consulte os registros publicados pela escola.
              </p>
            </div>


            <div className="responsavel-filtro">

              <label htmlFor="ano">
                Ano
              </label>

              <select
                id="ano"
                value={anoSelecionado}
                onChange={(evento) =>
                  setAnoSelecionado(
                    evento.target.value
                  )
                }
              >
                <option>Todos</option>

                {anosDoAluno.map((ano) => (
                  <option key={ano}>
                    {ano}
                  </option>
                ))}
              </select>


              <label htmlFor="bimestre">
                Período
              </label>

              <select
                id="bimestre"
                value={bimestreSelecionado}
                onChange={(evento) =>
                  setBimestreSelecionado(
                    evento.target.value
                  )
                }
              >
                <option>Todos</option>
                <option>1º Bimestre</option>
                <option>2º Bimestre</option>
                <option>3º Bimestre</option>
                <option>4º Bimestre</option>
              </select>


              <label htmlFor="disciplina">
                Disciplina
              </label>

              <select
                id="disciplina"
                value={disciplinaSelecionada}
                onChange={(evento) =>
                  setDisciplinaSelecionada(
                    evento.target.value
                  )
                }
              >
                <option>Todas</option>

                {disciplinasDoAluno.map(
                  (disciplina) => (
                    <option key={disciplina}>
                      {disciplina}
                    </option>
                  )
                )}

              </select>

            </div>

          </div>


          {acompanhamentosFiltrados.length === 0 ? (

            <div className="responsavel-vazio">

              <BookOpen size={28} />

              <h4>
                Nenhum acompanhamento publicado
              </h4>

              <p>
                Ainda não há registros publicados
                para os filtros selecionados.
              </p>

            </div>

          ) : (

            <div className="responsavel-grid">

              {acompanhamentosFiltrados.map(
                (acompanhamento) => {

                  const cienciaRegistrada =
                    ciencias.includes(
                      acompanhamento.id
                    )

                  return (

                    <article
                      className="responsavel-card"
                      key={acompanhamento.id}
                    >

                      <div className="responsavel-card-topo">

                        <div>
                          <span className="responsavel-disciplina-label">
                            {acompanhamento.disciplina}
                          </span>

                          <h4>
                            {acompanhamento.bimestre}
                          </h4>

                          <p>
                            Prof. {acompanhamento.professor}
                          </p>
                        </div>

                        <span className="responsavel-publicado">
                          Publicado
                        </span>

                      </div>


                      <div className="responsavel-situacao">

                        <span>Situação no período</span>

                        <strong>
                          {acompanhamento.situacao}
                        </strong>

                      </div>


                      <div className="responsavel-tags">

                        {acompanhamento.tags.map(
                          (tag) => (
                            <span key={tag}>
                              <Tag size={12} />
                              {tag}
                            </span>
                          )
                        )}

                      </div>


                      <p className="responsavel-descricao">
                        {acompanhamento.evolucao}
                      </p>


                      <div className="responsavel-data">
                        <CalendarDays size={15} />

                        Publicado em{' '}
                        {acompanhamento.dataPublicacao}
                      </div>


                      <div className="responsavel-acoes">

                        <button
                          type="button"
                          className="responsavel-detalhes"
                          onClick={() =>
                            setAcompanhamentoAberto(
                              acompanhamento
                            )
                          }
                        >
                          <Eye size={16} />
                          Ver detalhes
                        </button>


                        <button
                          type="button"
                          className={
                            cienciaRegistrada
                              ? 'responsavel-ciencia ciencia-confirmada'
                              : 'responsavel-ciencia'
                          }
                          onClick={() =>
                            confirmarCiencia(
                              acompanhamento.id
                            )
                          }
                          disabled={cienciaRegistrada}
                        >
                          <CheckCircle2 size={16} />

                          {cienciaRegistrada
                            ? 'Ciência registrada'
                            : 'Confirmar ciência'}
                        </button>

                      </div>

                    </article>

                  )
                }
              )}

            </div>

          )}

        </section>


        <section
          className="responsavel-evolucao"
          id="evolucao"
        >

          <div className="responsavel-secao-cabecalho">

            <span>EVOLUÇÃO DO ALUNO</span>

            <h3>
              Desenvolvimento ao longo do ano
            </h3>

            <p>
              Esta área será utilizada para visualizar
              a evolução do aluno entre os períodos.
            </p>

          </div>


          <div className="responsavel-grafico-futuro">

            <TrendingUp size={31} />

            <div>
              <strong>
                Gráfico de evolução
              </strong>

              <p>
                Os gráficos serão gerados a partir dos
                acompanhamentos registrados nos bimestres.
              </p>
            </div>

          </div>

        </section>


        <section
          className="responsavel-historico"
          id="historico"
        >

          <div className="responsavel-secao-cabecalho">

            <span>HISTÓRICO</span>

            <h3>Registros da família</h3>

            <p>
              Observações registradas nos acompanhamentos
              de {alunoAtual.nome}.
            </p>

          </div>


          {observacoesDoAluno.length === 0 ? (

            <div className="responsavel-vazio pequeno">

              <MessageSquare size={24} />

              <p>
                Nenhuma observação registrada até o momento.
              </p>

            </div>

          ) : (

            <div className="responsavel-observacoes">

              {observacoesDoAluno.map(
                (observacao) => (

                  <div
                    className="responsavel-observacao-item"
                    key={observacao.id}
                  >

                    <div>
                      <strong>
                        {observacao.disciplina}
                      </strong>

                      <span>
                        {observacao.bimestre}
                        {' • '}
                        {observacao.data}
                      </span>
                    </div>

                    <p>
                      {observacao.texto}
                    </p>

                  </div>

                )
              )}

            </div>

          )}

        </section>

      </main>


      {acompanhamentoAberto && (

        <div
          className="responsavel-modal-fundo"
          onClick={() =>
            setAcompanhamentoAberto(null)
          }
        >

          <section
            className="responsavel-modal"
            role="dialog"
            aria-modal="true"
            onClick={(evento) =>
              evento.stopPropagation()
            }
          >

            <header className="responsavel-modal-topo">

              <div>
                <span>
                  ACOMPANHAMENTO ESCOLAR
                </span>

                <h3>
                  {acompanhamentoAberto.disciplina}
                </h3>

                <p>
                  {acompanhamentoAberto.bimestre}
                  {' • '}
                  Prof. {acompanhamentoAberto.professor}
                </p>
              </div>

              <button
                type="button"
                className="responsavel-fechar"
                onClick={() =>
                  setAcompanhamentoAberto(null)
                }
                aria-label="Fechar acompanhamento"
              >
                <X size={20} />
              </button>

            </header>


            <div className="responsavel-modal-situacao">

              <span>Situação no período</span>

              <strong>
                {acompanhamentoAberto.situacao}
              </strong>

            </div>


            <div className="responsavel-modal-resumo">

              <div>
                <span>Média do período</span>

                <strong>
                  {acompanhamentoAberto.media ||
                    'Não informada'}
                </strong>
              </div>

              <div>
                <span>Ano letivo</span>

                <strong>
                  {acompanhamentoAberto.ano}
                </strong>
              </div>

            </div>


            <div className="responsavel-detalhe">

              <h4>Tags de acompanhamento</h4>

              <div className="responsavel-tags">

                {acompanhamentoAberto.tags.map(
                  (tag) => (
                    <span key={tag}>
                      <Tag size={12} />
                      {tag}
                    </span>
                  )
                )}

              </div>

            </div>


            {detalhes.map((detalhe) => (

              <div
                className="responsavel-detalhe"
                key={detalhe.titulo}
              >

                <h4>{detalhe.titulo}</h4>

                <p>
                  {detalhe.texto || 'Não informado.'}
                </p>

              </div>

            ))}


            <footer className="responsavel-modal-acoes">

              <button
                type="button"
                className="responsavel-pdf"
                onClick={gerarPdf}
              >
                <FileText size={16} />
                Gerar PDF
              </button>


              <button
                type="button"
                className="responsavel-observacao-botao"
                onClick={() => {
                  abrirObservacao(
                    acompanhamentoAberto
                  )

                  setAcompanhamentoAberto(null)
                }}
              >
                <MessageSquare size={16} />
                Registrar observação
              </button>


              <button
                type="button"
                className="responsavel-ciencia"
                onClick={() =>
                  confirmarCiencia(
                    acompanhamentoAberto.id
                  )
                }
                disabled={ciencias.includes(
                  acompanhamentoAberto.id
                )}
              >
                <CheckCircle2 size={16} />

                {ciencias.includes(
                  acompanhamentoAberto.id
                )
                  ? 'Ciência registrada'
                  : 'Confirmar ciência'}
              </button>

            </footer>

          </section>

        </div>

      )}


      {observacaoAberta && (

        <div
          className="responsavel-modal-fundo"
          onClick={() =>
            setObservacaoAberta(null)
          }
        >

          <form
            className="responsavel-modal responsavel-form-observacao"
            onSubmit={salvarObservacao}
            onClick={(evento) =>
              evento.stopPropagation()
            }
          >

            <header className="responsavel-modal-topo">

              <div>
                <span>REGISTRO DA FAMÍLIA</span>

                <h3>Registrar observação</h3>

                <p>
                  {observacaoAberta.disciplina}
                  {' • '}
                  {observacaoAberta.bimestre}
                </p>
              </div>

              <button
                type="button"
                className="responsavel-fechar"
                onClick={() =>
                  setObservacaoAberta(null)
                }
                aria-label="Fechar"
              >
                <X size={20} />
              </button>

            </header>


            <div className="responsavel-aviso-observacao">

              <MessageSquare size={18} />

              <p>
                Esta observação ficará registrada no
                histórico deste acompanhamento.
              </p>

            </div>


            <label htmlFor="observacao">
              Observação
            </label>

            <textarea
              id="observacao"
              value={textoObservacao}
              onChange={(evento) => {
                setTextoObservacao(
                  evento.target.value
                )

                setErroObservacao('')
              }}
              placeholder="Digite uma observação sobre este acompanhamento..."
            />


            {erroObservacao && (
              <p className="responsavel-erro">
                {erroObservacao}
              </p>
            )}


            <div className="responsavel-form-acoes">

              <button
                type="button"
                className="responsavel-cancelar"
                onClick={() =>
                  setObservacaoAberta(null)
                }
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="responsavel-enviar"
              >
                <Save size={16} />
                Salvar observação
              </button>

            </div>

          </form>

        </div>

      )}

    </div>
  )
}

export default Responsavel