
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  LayoutDashboard, BookOpen, TrendingUp, UserRound,
  ArrowLeft, CheckCircle2, MessageSquare, FileText,
  CalendarDays, Tag, ChevronRight, X, Save, Clock3,
  Eye, Menu
} from 'lucide-react'
import { api } from '../servicos/api'
import './Responsavel.css'

function lerDescricao(valor) {
  try {
    const dados = JSON.parse(valor)
    if (dados?.formato === 'kfka-professor-v1') {
      return dados
    }
  } catch {
    // Compatibilidade com registros antigos.
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

function formatarData(valor) {
  if (!valor) return 'Data não informada'
  const data = new Date(valor)

  return Number.isNaN(data.getTime())
    ? 'Data não informada'
    : data.toLocaleDateString('pt-BR')
}

function adaptarAcompanhamento(item) {
  const detalhes = lerDescricao(item.descricao)

  return {
    id: item.id,
    alunoId: item.aluno_id,
    ano: String(item.ano_letivo ?? ''),
    disciplina: item.disciplina,
    professor: item.professor,
    bimestre: item.periodo,
    dataPublicacao: formatarData(item.publicado_em),
    status: 'Publicado',
    media: item.media == null ? null : Number(item.media),
    tags: [],
    ...detalhes
  }
}

export default function Responsavel() {
  const [menuAberto, setMenuAberto] = useState(false)
  const [alunos, setAlunos] = useState([])
  const [acompanhamentos, setAcompanhamentos] = useState([])
  const [alunoSelecionado, setAlunoSelecionado] = useState(null)

  const [carregando, setCarregando] = useState(true)
  const [erroDados, setErroDados] = useState('')

  const [anoSelecionado, setAnoSelecionado] = useState('Todos')
  const [bimestreSelecionado, setBimestreSelecionado] = useState('Todos')
  const [disciplinaSelecionada, setDisciplinaSelecionada] = useState('Todas')

  const [acompanhamentoAberto, setAcompanhamentoAberto] = useState(null)
  const [observacaoAberta, setObservacaoAberta] = useState(null)
  const [textoObservacao, setTextoObservacao] = useState('')
  const [erroObservacao, setErroObservacao] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [ciencias, setCiencias] = useState([])
  const [observacoes, setObservacoes] = useState([])

  const [usuario] = useState(() => {
    try {
      return JSON.parse(
        sessionStorage.getItem('kfka_usuario') || '{}'
      )
    } catch {
      return {}
    }
  })

  useEffect(() => {
    let ativo = true

    async function carregar() {
      setCarregando(true)

      try {
        const [filhos, registros] = await Promise.all([
          api('/acompanhamentos/responsavel/alunos'),
          api('/acompanhamentos/responsavel/publicados')
        ])

        if (!ativo) return

        const listaAlunos = Array.isArray(filhos) ? filhos : []
        const listaRegistros = Array.isArray(registros) ? registros : []

        setAlunos(listaAlunos)
        setAcompanhamentos(
          listaRegistros.map(adaptarAcompanhamento)
        )
        setAlunoSelecionado(listaAlunos[0]?.id ?? null)
        setErroDados('')
      } catch (erro) {
        if (ativo) {
          setErroDados(
            erro.message || 'Não foi possível carregar os dados.'
          )
        }
      } finally {
        if (ativo) setCarregando(false)
      }
    }

    carregar()

    return () => {
      ativo = false
    }
  }, [])

  const alunoAtual = alunos.find(
    aluno => String(aluno.id) === String(alunoSelecionado)
  )

  const acompanhamentosPublicados = useMemo(
    () => acompanhamentos.filter(
      item =>
        String(item.alunoId) === String(alunoSelecionado) &&
        item.status === 'Publicado'
    ),
    [acompanhamentos, alunoSelecionado]
  )

  const disciplinasDoAluno = [
    ...new Set(
      acompanhamentosPublicados.map(item => item.disciplina)
    )
  ]

  const anosDoAluno = [
    ...new Set(
      acompanhamentosPublicados.map(item => item.ano)
    )
  ]

  const periodosDoAluno = [
    ...new Set(
      acompanhamentosPublicados.map(item => item.bimestre)
    )
  ]

  const acompanhamentosFiltrados = acompanhamentosPublicados.filter(
    item =>
      (anoSelecionado === 'Todos' || item.ano === anoSelecionado) &&
      (bimestreSelecionado === 'Todos' ||
        item.bimestre === bimestreSelecionado) &&
      (disciplinaSelecionada === 'Todas' ||
        item.disciplina === disciplinaSelecionada)
  )

  const observacoesDoAluno = observacoes.filter(
    item => String(item.alunoId) === String(alunoSelecionado)
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
    setCiencias(atual =>
      atual.includes(id) ? atual : [...atual, id]
    )

    setMensagem(
      'Ciência marcada apenas nesta sessão. O registro definitivo será implementado na próxima etapa.'
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
      setErroObservacao('Digite uma observação antes de salvar.')
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

    setObservacoes(atual => [...atual, novaObservacao])
    setTextoObservacao('')
    setErroObservacao('')
    setObservacaoAberta(null)

    setMensagem(
      'Observação salva apenas nesta sessão. A persistência no banco será implementada depois.'
    )
  }

  function gerarPdf() {
    setMensagem(
      'A geração do PDF será conectada ao backend na próxima etapa.'
    )
  }

  const detalhes = acompanhamentoAberto
    ? [
      ['Descrição geral', acompanhamentoAberto.descricao],
      ['Pontos positivos', acompanhamentoAberto.pontosPositivos],
      ['Dificuldades identificadas', acompanhamentoAberto.dificuldades],
      ['Evolução no período', acompanhamentoAberto.evolucao],
      ['Orientação à família', acompanhamentoAberto.orientacao]
    ]
    : []

  return (
    <div className="responsavel">
      <aside className="responsavel-sidebar">
        <div className="responsavel-sidebar-topo">
          <h1 className="responsavel-logo">
            K<span>F</span>KA
          </h1>

          <button
            type="button"
            className="responsavel-menu-botao"
            aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuAberto}
            aria-controls="responsavel-navegacao"
            onClick={() => setMenuAberto(!menuAberto)}
          >
            {menuAberto ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        <nav
          id="responsavel-navegacao"
          className={
            menuAberto
              ? 'responsavel-menu responsavel-menu-aberto'
              : 'responsavel-menu'
          }
          aria-label="Menu do responsável"
        >
          <a
            href="#dashboard"
            onClick={() => setMenuAberto(false)}
            className="responsavel-menu-ativo"
          >
            <LayoutDashboard size={19} />
            Dashboard
          </a>

          <a
            href="#acompanhamentos"
            onClick={() => setMenuAberto(false)}
          >
            <BookOpen size={19} />
            Acompanhamentos
          </a>

          <a href="#evolucao" onClick={() => setMenuAberto(false)}>
            <TrendingUp size={19} />
            Evolução do aluno
          </a>

          <a href="#historico" onClick={() => setMenuAberto(false)}>
            <Clock3 size={19} />
            Histórico
          </a>
        </nav>
      </aside>

      <main className="responsavel-conteudo">
        <Link to="/" className="responsavel-voltar">
          <ArrowLeft size={18} />
          Voltar ao início
        </Link>

        <header className="responsavel-topo" id="dashboard">
          <div>
            <span className="responsavel-subtitulo">
              ÁREA DO RESPONSÁVEL
            </span>

            <h2>Acompanhamento escolar</h2>

            <p>
              Acompanhe o desenvolvimento escolar dos alunos
              vinculados ao seu cadastro.
            </p>
          </div>

          <div className="responsavel-perfil">
            <div className="responsavel-avatar">
              <UserRound size={21} />
            </div>

            <div>
              <strong>{usuario.nome || 'Responsável'}</strong>
              <span>Área da família</span>
            </div>
          </div>
        </header>

        {carregando && (
          <p>Carregando alunos e acompanhamentos...</p>
        )}

        {erroDados && (
          <p className="responsavel-erro" role="alert">
            {erroDados}
          </p>
        )}

        {!carregando && !erroDados && alunos.length === 0 && (
          <div className="responsavel-vazio">
            <BookOpen size={28} />
            <h4>Nenhum aluno vinculado</h4>
            <p>
              Peça ao administrador para vincular um aluno
              à sua conta.
            </p>
          </div>
        )}

        {alunoAtual && (
          <>
            <section className="responsavel-selecao">
              <div className="responsavel-secao-cabecalho">
                <span>ALUNOS VINCULADOS</span>
                <h3>Selecione o aluno</h3>
              </div>

              <div className="responsavel-alunos">
                {alunos.map(aluno => (
                  <button
                    type="button"
                    key={aluno.id}
                    className={
                      String(alunoSelecionado) === String(aluno.id)
                        ? 'responsavel-aluno responsavel-aluno-ativo'
                        : 'responsavel-aluno'
                    }
                    onClick={() => selecionarAluno(aluno.id)}
                  >
                    <div>
                      <strong>{aluno.nome}</strong>
                      <span>{aluno.turma || 'Turma não informada'}</span>
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
                <strong>{alunoAtual.turma || 'Não informada'}</strong>
              </div>

              <div>
                <span>Ano letivo</span>
                <strong>{alunoAtual.ano_letivo || 'Não informado'}</strong>
              </div>

              <div>
                <span>Relatórios publicados</span>
                <strong>{acompanhamentosPublicados.length}</strong>
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
                  <label htmlFor="ano">Ano</label>
                  <select
                    id="ano"
                    value={anoSelecionado}
                    onChange={e => setAnoSelecionado(e.target.value)}
                  >
                    <option value="Todos">Todos</option>
                    {anosDoAluno.map(ano => (
                      <option key={ano} value={ano}>
                        {ano}
                      </option>
                    ))}
                  </select>

                  <label htmlFor="bimestre">Período</label>
                  <select
                    id="bimestre"
                    value={bimestreSelecionado}
                    onChange={e =>
                      setBimestreSelecionado(e.target.value)
                    }
                  >
                    <option value="Todos">Todos</option>
                    {periodosDoAluno.map(periodo => (
                      <option key={periodo} value={periodo}>
                        {periodo}
                      </option>
                    ))}
                  </select>

                  <label htmlFor="disciplina">Disciplina</label>
                  <select
                    id="disciplina"
                    value={disciplinaSelecionada}
                    onChange={e =>
                      setDisciplinaSelecionada(e.target.value)
                    }
                  >
                    <option value="Todas">Todas</option>
                    {disciplinasDoAluno.map(disciplina => (
                      <option key={disciplina} value={disciplina}>
                        {disciplina}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {acompanhamentosFiltrados.length === 0 ? (
                <div className="responsavel-vazio">
                  <BookOpen size={28} />

                  <h4>Nenhum acompanhamento publicado</h4>

                  <p>
                    Ainda não há registros publicados para
                    os filtros selecionados.
                  </p>
                </div>
              ) : (
                <div className="responsavel-grid">
                  {acompanhamentosFiltrados.map(acompanhamento => {
                    const cienciaRegistrada = ciencias.includes(
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

                            <h4>{acompanhamento.bimestre}</h4>

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
                            {acompanhamento.situacao ||
                              'Não informada'}
                          </strong>
                        </div>

                        <div className="responsavel-tags">
                          {acompanhamento.tags.map(tag => (
                            <span key={tag}>
                              <Tag size={12} />
                              {tag}
                            </span>
                          ))}
                        </div>

                        <p className="responsavel-descricao">
                          {acompanhamento.evolucao ||
                            acompanhamento.descricao ||
                            'Nenhuma descrição informada.'}
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
                              setAcompanhamentoAberto(acompanhamento)
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
                              confirmarCiencia(acompanhamento.id)
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
                  })}
                </div>
              )}
            </section>

            <section
              className="responsavel-evolucao"
              id="evolucao"
            >
              <div className="responsavel-secao-cabecalho">
                <span>EVOLUÇÃO DO ALUNO</span>
                <h3>Desenvolvimento ao longo do ano</h3>

                <p>
                  Esta área será utilizada para visualizar
                  a evolução do aluno entre os períodos.
                </p>
              </div>

              <div className="responsavel-grafico-futuro">
                <TrendingUp size={31} />

                <div>
                  <strong>Gráfico de evolução</strong>
                  <p>
                    O gráfico será conectado às médias
                    publicadas na próxima etapa.
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
                  {observacoesDoAluno.map(observacao => (
                    <div
                      className="responsavel-observacao-item"
                      key={observacao.id}
                    >
                      <div>
                        <strong>{observacao.disciplina}</strong>
                        <span>
                          {observacao.bimestre}
                          {' • '}
                          {observacao.data}
                        </span>
                      </div>

                      <p>{observacao.texto}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {acompanhamentoAberto && (
        <div
          className="responsavel-modal-fundo"
          onClick={() => setAcompanhamentoAberto(null)}
        >
          <section
            className="responsavel-modal"
            role="dialog"
            aria-modal="true"
            onClick={e => e.stopPropagation()}
          >
            <header className="responsavel-modal-topo">
              <div>
                <span>ACOMPANHAMENTO ESCOLAR</span>
                <h3>{acompanhamentoAberto.disciplina}</h3>

                <p>
                  {acompanhamentoAberto.bimestre}
                  {' • '}
                  Prof. {acompanhamentoAberto.professor}
                </p>
              </div>

              <button
                type="button"
                className="responsavel-fechar"
                onClick={() => setAcompanhamentoAberto(null)}
                aria-label="Fechar acompanhamento"
              >
                <X size={20} />
              </button>
            </header>

            <div className="responsavel-modal-situacao">
              <span>Situação no período</span>
              <strong>
                {acompanhamentoAberto.situacao ||
                  'Não informada'}
              </strong>
            </div>

            <div className="responsavel-modal-resumo">
              <div>
                <span>Média do período</span>
                <strong>
                  {acompanhamentoAberto.media ??
                    'Não informada'}
                </strong>
              </div>

              <div>
                <span>Ano letivo</span>
                <strong>
                  {acompanhamentoAberto.ano ||
                    'Não informado'}
                </strong>
              </div>
            </div>

            <div className="responsavel-detalhe">
              <h4>Tags de acompanhamento</h4>

              <div className="responsavel-tags">
                {acompanhamentoAberto.tags.map(tag => (
                  <span key={tag}>
                    <Tag size={12} />
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {detalhes.map(([titulo, texto]) => (
              <div
                className="responsavel-detalhe"
                key={titulo}
              >
                <h4>{titulo}</h4>
                <p>{texto || 'Não informado.'}</p>
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
                  abrirObservacao(acompanhamentoAberto)
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
                  confirmarCiencia(acompanhamentoAberto.id)
                }
                disabled={ciencias.includes(
                  acompanhamentoAberto.id
                )}
              >
                <CheckCircle2 size={16} />

                {ciencias.includes(acompanhamentoAberto.id)
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
          onClick={() => setObservacaoAberta(null)}
        >
          <form
            className="responsavel-modal responsavel-form-observacao"
            onSubmit={salvarObservacao}
            onClick={e => e.stopPropagation()}
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
                onClick={() => setObservacaoAberta(null)}
                aria-label="Fechar"
              >
                <X size={20} />
              </button>
            </header>

            <div className="responsavel-aviso-observacao">
              <MessageSquare size={18} />
              <p>
                Esta observação ficará disponível no histórico
                durante a sessão atual.
              </p>
            </div>

            <label htmlFor="observacao">
              Observação
            </label>

            <textarea
              id="observacao"
              value={textoObservacao}
              onChange={e => {
                setTextoObservacao(e.target.value)
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
                onClick={() => setObservacaoAberta(null)}
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
