import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  FileText,
  MessageCircle,
  Settings,
  BookOpen,
  Download,
  CheckCircle,
  ArrowLeft,
  Send,
  X
} from 'lucide-react'
import './Responsavel.css'

function Responsavel() {
  const [alunoSelecionado, setAlunoSelecionado] = useState('sofia')
  const [mensagem, setMensagem] = useState('')
  const [cardObservacao, setCardObservacao] = useState(null)
  const [observacao, setObservacao] = useState('')
  const [erroObservacao, setErroObservacao] = useState('')

  const alunos = {
    sofia: {
      nome: 'Sofia Martins',
      turma: '6º B',
      bimestre: '3º Bimestre',
      acompanhamentos: [
        {
          id: 1,
          disciplina: 'Matemática',
          professor: 'Eduardo Savino',
          nota: '9,5',
          status: 'Publicado',
          texto:
            'Sofia demonstrou ótimo raciocínio lógico nas atividades sobre frações e ajudou os colegas em grupo.',
          data: '12/09'
        },
        {
          id: 2,
          disciplina: 'Ciências',
          professor: 'Renata Muniz',
          nota: '8,0',
          status: 'Publicado',
          texto:
            'Bom desempenho nos experimentos de laboratório, com registros bem organizados no caderno.',
          data: '12/09'
        }
      ]
    },

    felipe: {
      nome: 'Felipe Martins',
      turma: '7º B',
      bimestre: '3º Bimestre',
      acompanhamentos: [
        {
          id: 3,
          disciplina: 'Português',
          professor: 'Mariana Alves',
          nota: '8,7',
          status: 'Publicado',
          texto:
            'Felipe apresentou boa evolução na interpretação de textos e participação nas atividades.',
          data: '15/09'
        },
        {
          id: 4,
          disciplina: 'Geografia',
          professor: 'Carlos Mendes',
          nota: '7,8',
          status: 'Publicado',
          texto:
            'Apresentou evolução durante o bimestre e boa participação nos trabalhos realizados em grupo.',
          data: '16/09'
        }
      ]
    }
  }

  const aluno = alunos[alunoSelecionado]

  function confirmarCiencia(disciplina) {
    setMensagem(`Ciência confirmada no acompanhamento de ${disciplina}.`)
  }

  function abrirObservacao(id) {
    setCardObservacao(id)
    setObservacao('')
    setErroObservacao('')
    setMensagem('')
  }

  function cancelarObservacao() {
    setCardObservacao(null)
    setObservacao('')
    setErroObservacao('')
  }

  function enviarObservacao(evento, disciplina) {
    evento.preventDefault()

    if (observacao.trim() === '') {
      setErroObservacao('Digite uma observação antes de enviar.')
      return
    }

    setErroObservacao('')
    setMensagem(`Observação sobre ${disciplina} enviada com sucesso.`)
    setObservacao('')
    setCardObservacao(null)
  }

  return (
    <div className="responsavel">
      <aside className="responsavel-sidebar">
        <h1 className="responsavel-logo">
          K<span>F</span>KA
        </h1>

        <nav className="responsavel-menu">
          <a href="#acompanhamentos" className="responsavel-menu-ativo">
            <LayoutDashboard size={19} />
            Dashboard
          </a>

          <a href="#alunos">
            <Users size={19} />
            Alunos vinculados
          </a>

          <a href="#acompanhamentos">
            <BookOpen size={19} />
            Acompanhamentos
          </a>

          <a href="#relatorios">
            <FileText size={19} />
            Relatórios
          </a>

          <a href="#mensagens">
            <MessageCircle size={19} />
            Mensagens
          </a>

          <a href="#configuracoes">
            <Settings size={19} />
            Configurações
          </a>
        </nav>

        <Link to="/" className="responsavel-sair">
          <ArrowLeft size={18} />
          Voltar ao início
        </Link>
      </aside>

      <main className="responsavel-conteudo">
        <header className="responsavel-topo">
          <div>
            <span className="responsavel-subtitulo">
              ÁREA DO RESPONSÁVEL
            </span>

            <h2>Acompanhamento escolar</h2>

            <p>
              Consulte o desenvolvimento e as atualizações dos alunos
              vinculados.
            </p>
          </div>

          <div className="responsavel-perfil">
            <div className="responsavel-avatar">RM</div>

            <div>
              <strong>Responsável</strong>
              <span>Família Martins</span>
            </div>
          </div>
        </header>

        <section className="responsavel-alunos" id="alunos">
          {Object.entries(alunos).map(([chave, dados]) => (
            <button
              key={chave}
              type="button"
              className={
                alunoSelecionado === chave
                  ? 'responsavel-aluno responsavel-aluno-ativo'
                  : 'responsavel-aluno'
              }
              onClick={() => {
                setAlunoSelecionado(chave)
                setMensagem('')
                setCardObservacao(null)
              }}
            >
              <span>{dados.nome}</span>
              <small>{dados.turma}</small>
            </button>
          ))}
        </section>

        <section
          className="responsavel-acompanhamentos"
          id="acompanhamentos"
        >
          <div className="responsavel-secao-topo">
            <div>
              <span className="responsavel-secao-label">
                ACOMPANHAMENTOS PUBLICADOS
              </span>

              <h3>{aluno.nome}</h3>

              <p>
                {aluno.turma} • {aluno.bimestre}
              </p>
            </div>

            <span className="responsavel-atualizado">
              Atualizado recentemente
            </span>
          </div>

          {mensagem && (
            <div className="responsavel-mensagem">
              <CheckCircle size={18} />
              {mensagem}
            </div>
          )}

          <div className="responsavel-grid">
            {aluno.acompanhamentos.map((acompanhamento) => (
              <article
                className="responsavel-card"
                key={acompanhamento.id}
              >
                <div className="responsavel-card-topo">
                  <div>
                    <span className="responsavel-disciplina-label">
                      DISCIPLINA
                    </span>

                    <h4>{acompanhamento.disciplina}</h4>

                    <p>Prof. {acompanhamento.professor}</p>
                  </div>

                  <div className="responsavel-nota">
                    <span>Média</span>
                    <strong>{acompanhamento.nota}</strong>
                  </div>
                </div>

                <span className="responsavel-status">
                  {acompanhamento.status}
                </span>

                <p className="responsavel-descricao">
                  {acompanhamento.texto}
                </p>

                <div className="responsavel-card-rodape">
                  <span className="responsavel-data">
                    <CheckCircle size={16} />
                    Publicado em {acompanhamento.data}
                  </span>

                  <div className="responsavel-acoes">
                    <button type="button" className="responsavel-pdf">
                      <Download size={16} />
                      PDF
                    </button>

                    <button
                      type="button"
                      className="responsavel-observacao-botao"
                      onClick={() =>
                        abrirObservacao(acompanhamento.id)
                      }
                    >
                      <MessageCircle size={16} />
                      Observação
                    </button>

                    <button
                      type="button"
                      className="responsavel-ciencia"
                      onClick={() =>
                        confirmarCiencia(acompanhamento.disciplina)
                      }
                    >
                      Confirmar ciência
                    </button>
                  </div>
                </div>

                {cardObservacao === acompanhamento.id && (
                  <form
                    className="responsavel-form-observacao"
                    onSubmit={(evento) =>
                      enviarObservacao(
                        evento,
                        acompanhamento.disciplina
                      )
                    }
                  >
                    <div className="responsavel-form-topo">
                      <div>
                        <strong>Enviar observação</strong>
                        <span>
                          A observação será vinculada a este acompanhamento.
                        </span>
                      </div>

                      <button
                        type="button"
                        className="responsavel-fechar"
                        onClick={cancelarObservacao}
                        aria-label="Fechar formulário de observação"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <label htmlFor={`observacao-${acompanhamento.id}`}>
                      Comentário ou observação
                    </label>

                    <textarea
                      id={`observacao-${acompanhamento.id}`}
                      value={observacao}
                      onChange={(evento) =>
                        setObservacao(evento.target.value)
                      }
                      placeholder="Escreva sua observação..."
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
                        onClick={cancelarObservacao}
                      >
                        Cancelar
                      </button>

                      <button
                        type="submit"
                        className="responsavel-enviar"
                      >
                        <Send size={16} />
                        Enviar
                      </button>
                    </div>
                  </form>
                )}
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default Responsavel