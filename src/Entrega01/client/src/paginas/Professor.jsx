import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
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
            aluno === '' ||
            turma === '' ||
            disciplina === '' ||
            bimestre === '' ||
            acompanhamento === ''
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
            <section className="professor-container">

                <Link to="/" className="professor-voltar">
                    <ArrowLeft size={18} />
                    Voltar
                </Link>

                <h1>Área do Professor</h1>
                <h2>Novo acompanhamento</h2>

                <form
                    className="professor-form"
                    onSubmit={enviarAcompanhamento}
                >

                    <div>
                        <label htmlFor="aluno">Aluno</label>

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
                        <label htmlFor="turma">Turma</label>

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
                            <option value="">Selecione</option>
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
                            <option value="">Selecione</option>
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

                    <div>
                        <label htmlFor="acompanhamento">
                            Acompanhamento
                        </label>

                        <textarea
                            id="acompanhamento"
                            value={acompanhamento}
                            onChange={(evento) =>
                                setAcompanhamento(evento.target.value)
                            }
                            placeholder="Descreva o acompanhamento do aluno"
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

                    <button type="submit">
                        Enviar para revisão
                    </button>

                </form>

            </section>
        </main>
    )
}

export default Professor