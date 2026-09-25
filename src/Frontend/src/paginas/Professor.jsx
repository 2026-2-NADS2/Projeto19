import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
    ArrowLeft,
    BookOpen,
    ClipboardPlus,
    Clock3,
    Send,
    UserRound,
    FileText
} from 'lucide-react'

import './Professor.css'

function Professor() {
    const [aluno, setAluno] = useState('')
    const [turma, setTurma] = useState('')
    const [disciplina, setDisciplina] = useState('')
    const [bimestre, setBimestre] = useState('')
    const [acompanhamento, setAcompanhamento] = useState('')
    const [erro, setErro] = useState('')
    const [sucesso, setSucesso] = useState('')

    function enviarAcompanhamento(evento) {
        evento.preventDefault()

        if (
            aluno.trim() === '' ||
            turma.trim() === '' ||
            disciplina === '' ||
            bimestre === '' ||
            acompanhamento.trim() === ''
        ) {
            setErro('Preencha todos os campos.')
            setSucesso('')
            return
        }

        setErro('')
        setSucesso('Acompanhamento enviado para revisão.')

        setAluno('')
        setTurma('')
        setDisciplina('')
        setBimestre('')
        setAcompanhamento('')
    }

    return (
        <main className="professor">

            <aside className="professor-sidebar">

                <h1 className="professor-logo">
                    K<span>F</span>KA
                </h1>

                <div className="professor-menu">
                    <div className="professor-menu-ativo">
                        <ClipboardPlus size={19} />
                        Novo acompanhamento
                    </div>

                    <div>
                        <FileText size={19} />
                        Acompanhamentos
                    </div>
                </div>

                <Link to="/" className="professor-voltar">
                    <ArrowLeft size={18} />
                    Voltar ao início
                </Link>

            </aside>

            <section className="professor-conteudo">

                <header className="professor-topo">

                    <div>
                        <span>ÁREA DO PROFESSOR</span>
                        <h2>Acompanhamento escolar</h2>

                        <p>
                            Registre e envie informações sobre o
                            desenvolvimento dos alunos.
                        </p>
                    </div>

                    <div className="professor-usuario">
                        <div>
                            <strong>Professor</strong>
                            <span>Área acadêmica</span>
                        </div>

                        <div className="professor-avatar">
                            <UserRound size={22} />
                        </div>
                    </div>

                </header>

                <section className="professor-resumo">

                    <article>
                        <div className="professor-resumo-icone">
                            <BookOpen size={20} />
                        </div>

                        <div>
                            <span>Acompanhamentos</span>
                            <strong>12</strong>
                        </div>
                    </article>

                    <article>
                        <div className="professor-resumo-icone">
                            <Clock3 size={20} />
                        </div>

                        <div>
                            <span>Em revisão</span>
                            <strong>3</strong>
                        </div>
                    </article>

                </section>

                <section className="professor-form-container">

                    <div className="professor-form-titulo">
                        <div>
                            <span>NOVO REGISTRO</span>
                            <h3>Novo acompanhamento</h3>
                        </div>

                        <ClipboardPlus size={23} />
                    </div>

                    <form
                        className="professor-form"
                        onSubmit={enviarAcompanhamento}
                    >

                        <div>
                            <label htmlFor="aluno">
                                Aluno
                            </label>

                            <input
                                id="aluno"
                                type="text"
                                value={aluno}
                                onChange={(evento) =>
                                    setAluno(evento.target.value)
                                }
                                placeholder="Nome do aluno"
                            />
                        </div>

                        <div>
                            <label htmlFor="turma">
                                Turma
                            </label>

                            <input
                                id="turma"
                                type="text"
                                value={turma}
                                onChange={(evento) =>
                                    setTurma(evento.target.value)
                                }
                                placeholder="Ex: 7º A"
                            />
                        </div>

                        <div>
                            <label htmlFor="disciplina">
                                Disciplina
                            </label>

                            <select
                                id="disciplina"
                                value={disciplina}
                                onChange={(evento) =>
                                    setDisciplina(evento.target.value)
                                }
                            >
                                <option value="">
                                    Selecione
                                </option>

                                <option value="Matemática">
                                    Matemática
                                </option>

                                <option value="Português">
                                    Português
                                </option>

                                <option value="Geografia">
                                    Geografia
                                </option>

                                <option value="Ciências">
                                    Ciências
                                </option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="bimestre">
                                Bimestre
                            </label>

                            <select
                                id="bimestre"
                                value={bimestre}
                                onChange={(evento) =>
                                    setBimestre(evento.target.value)
                                }
                            >
                                <option value="">
                                    Selecione
                                </option>

                                <option value="1º">
                                    1º Bimestre
                                </option>

                                <option value="2º">
                                    2º Bimestre
                                </option>

                                <option value="3º">
                                    3º Bimestre
                                </option>

                                <option value="4º">
                                    4º Bimestre
                                </option>
                            </select>
                        </div>

                        <div className="professor-campo-completo">
                            <label htmlFor="acompanhamento">
                                Acompanhamento
                            </label>

                            <textarea
                                id="acompanhamento"
                                value={acompanhamento}
                                onChange={(evento) =>
                                    setAcompanhamento(evento.target.value)
                                }
                                placeholder="Descreva o desempenho, evolução ou pontos de atenção do aluno..."
                            />
                        </div>

                        {erro && (
                            <p className="professor-erro">
                                {erro}
                            </p>
                        )}

                        {sucesso && (
                            <p className="professor-sucesso">
                                {sucesso}
                            </p>
                        )}

                        <div className="professor-acoes">
                            <span>
                                O acompanhamento será enviado
                                para revisão.
                            </span>

                            <button type="submit">
                                <Send size={17} />
                                Enviar para revisão
                            </button>
                        </div>

                    </form>

                </section>

            </section>

        </main>
    )
}

export default Professor