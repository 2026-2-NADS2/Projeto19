
import { useState, useEffect } from 'react'
import {
    Plus,
    Save,
    Pencil,
    Trash2,
    RotateCcw,
    X,
    Eye
} from 'lucide-react'
import { useAdmin } from './AdminContext'
import CabecalhoPagina from './CabecalhoPagina'
import { api } from '../../servicos/api'

const cadastroVazio = {
    nome: '',
    matricula: '',
    data_nascimento: '',
    email: '',
    senha: '',
    turma_id: '',
    disciplina_id: '',
    aluno_id: ''
}

const nomesPeriodos = {
    manha: 'Manhã',
    tarde: 'Tarde',
    noite: 'Noite',
    integral: 'Integral'
}

function ativo(item) {
    return item.ativo !== false &&
        item.ativo !== 0 &&
        item.ativo !== '0'
}

function dataParaISO(valor) {
    if (!valor) return ''
    return String(valor).slice(0, 10)
}

function dataParaBR(valor) {
    if (!valor) return ''
    const iso = String(valor).slice(0, 10)
    const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
    return partes ? `${partes[3]}/${partes[2]}/${partes[1]}` : ''
}

function dataValidaBR(valor) {
    const partes = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(valor)
    if (!partes) return false

    const dia = Number(partes[1])
    const mes = Number(partes[2])
    const ano = Number(partes[3])

    if (ano < 1900 || mes < 1 || mes > 12) return false

    const data = new Date(Date.UTC(ano, mes - 1, dia))

    return data.getUTCFullYear() === ano &&
        data.getUTCMonth() === mes - 1 &&
        data.getUTCDate() === dia
}

function Campo({
    label,
    value,
    onChange,
    type = 'text',
    required = false,
    minLength,
    placeholder,
    children
}) {
    return (
        <div className="admin-campo">
            <label>{label}</label>
            {children || (
                <input
                    type={type}
                    value={value ?? ''}
                    onChange={e => onChange(e.target.value)}
                    required={required}
                    minLength={minLength}
                    placeholder={placeholder}
                />
            )}
        </div>
    )
}

function CampoDataNascimento({ value, onChange }) {
    const [texto, setTexto] = useState(() => dataParaBR(value))
    const [erro, setErro] = useState('')

    useEffect(() => {
        if (!value) {
            setTexto('')
            setErro('')
        } else if (dataValidaBR(dataParaBR(value))) {
            setTexto(dataParaBR(value))
            setErro('')
        }
    }, [value])

    function atualizar(valor) {
        const digitos = valor.replace(/\D/g, '').slice(0, 8)

        const formatado = [
            digitos.slice(0, 2),
            digitos.slice(2, 4),
            digitos.slice(4, 8)
        ].filter(Boolean).join('/')

        setTexto(formatado)
        setErro('')

        if (dataValidaBR(formatado)) {
            const [dia, mes, ano] = formatado.split('/')
            onChange(`${ano}-${mes}-${dia}`)
        } else {
            onChange('')
        }
    }

    return (
        <div className="admin-campo">
            <label>Data de nascimento</label>
            <input
                type="text"
                inputMode="numeric"
                autoComplete="bday"
                placeholder="DD/MM/AAAA"
                maxLength={10}
                value={texto}
                onChange={e => atualizar(e.target.value)}
                onBlur={() => {
                    if (texto && !dataValidaBR(texto)) {
                        setErro('Informe uma data válida no formato DD/MM/AAAA.')
                    }
                }}
                required
                aria-invalid={Boolean(erro)}
            />
            {erro && <small role="alert">{erro}</small>}
        </div>
    )
}

function BotaoAcao({
    titulo,
    onClick,
    disabled,
    children
}) {
    return (
        <button
            type="button"
            className="admin-botao-icone"
            title={titulo}
            aria-label={titulo}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    )
}

function Detalhe({ titulo, valor }) {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 5,
            minWidth: 0
        }}>
            <span style={{
                fontSize: 12,
                color: '#b9a6d0',
                fontWeight: 600
            }}>
                {titulo}
            </span>
            <span style={{
                fontSize: 14,
                color: '#fff',
                fontWeight: 500,
                overflowWrap: 'anywhere'
            }}>
                {valor || 'Não informado'}
            </span>
        </div>
    )
}

function ModalDetalhes({ registro, onClose }) {
    useEffect(() => {
        function fecharComEscape(evento) {
            if (evento.key === 'Escape') onClose()
        }

        document.addEventListener('keydown', fecharComEscape)
        return () => document.removeEventListener('keydown', fecharComEscape)
    }, [onClose])

    if (!registro) return null

    const ehAluno = registro.perfil === 'Aluno'
    const dados = registro.original

    return (
        <div
            role="presentation"
            onMouseDown={evento => {
                if (evento.target === evento.currentTarget) {
                    onClose()
                }
            }}
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.75)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                padding: 20
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="titulo-detalhes-cadastro"
                style={{
                    background: '#21102f',
                    border: '1px solid #57316e',
                    borderRadius: 16,
                    width: '100%',
                    maxWidth: 550,
                    padding: 26,
                    boxShadow: '0 20px 60px rgba(0,0,0,0.45)'
                }}
            >
                <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 16,
                    marginBottom: 24
                }}>
                    <div>
                        <span style={{
                            color: '#bc91e9',
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: 1
                        }}>
                            DETALHES DO CADASTRO
                        </span>
                        <h2
                            id="titulo-detalhes-cadastro"
                            style={{
                                color: '#fff',
                                fontSize: 22,
                                margin: '8px 0 0'
                            }}
                        >
                            {registro.nome}
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Fechar detalhes"
                        style={{
                            background: '#432057',
                            color: '#fff',
                            border: 0,
                            borderRadius: 8,
                            padding: 9,
                            cursor: 'pointer',
                            display: 'flex'
                        }}
                    >
                        <X size={19} />
                    </button>
                </div>

                <div style={{
                    display: 'flex',
                    gap: 10,
                    marginBottom: 24
                }}>
                    <span style={{
                        padding: '7px 12px',
                        borderRadius: 8,
                        background: '#552476',
                        color: '#fff',
                        fontSize: 12,
                        fontWeight: 600
                    }}>
                        {registro.perfil}
                    </span>
                    <span style={{
                        padding: '7px 12px',
                        borderRadius: 8,
                        background: registro.status === 'Ativo'
                            ? '#174d36'
                            : '#5b2532',
                        color: registro.status === 'Ativo'
                            ? '#8df0b8'
                            : '#ffb4c2',
                        fontSize: 12,
                        fontWeight: 600
                    }}>
                        {registro.status}
                    </span>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                    gap: 24,
                    padding: 20,
                    borderRadius: 12,
                    background: '#170b22',
                    border: '1px solid #3c254d'
                }}>
                    <Detalhe titulo="Nome completo" valor={dados.nome} />
                    <Detalhe titulo="Perfil" valor={registro.perfil} />

                    {ehAluno ? (
                        <>
                            <Detalhe
                                titulo="Matrícula"
                                valor={dados.matricula}
                            />
                            <Detalhe
                                titulo="Data de nascimento"
                                valor={dataParaBR(dados.data_nascimento)}
                            />
                            <Detalhe
                                titulo="Turma(s)"
                                valor={registro.vinculo}
                            />
                            <Detalhe
                                titulo="Status"
                                valor={registro.status}
                            />
                        </>
                    ) : (
                        <>
                            <Detalhe
                                titulo="E-mail"
                                valor={dados.email}
                            />
                            <Detalhe
                                titulo="Vínculos"
                                valor={registro.vinculo}
                            />
                            <Detalhe
                                titulo="Status"
                                valor={registro.status}
                            />
                        </>
                    )}
                </div>

                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    marginTop: 24
                }}>
                    <button
                        type="button"
                        onClick={onClose}
                        className="admin-botao-principal"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function Cadastros() {
    const {
        alunos,
        usuarios,
        turmas,
        disciplinas,
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
        carregarCadastros
    } = useAdmin()

    const [visualizando, setVisualizando] = useState(null)
    const [editando, setEditando] = useState(null)
    const [editandoTurma, setEditandoTurma] = useState(null)
    const [processando, setProcessando] = useState(false)
    const [mensagemLocal, setMensagemLocal] = useState('')
    const [erroLocal, setErroLocal] = useState('')

    const [formEdicao, setFormEdicao] = useState({
        nome: '',
        matricula: '',
        data_nascimento: '',
        email: '',
        senha: ''
    })

    const [formTurmaEdicao, setFormTurmaEdicao] = useState({
        nome: '',
        ano_letivo: '',
        periodo: 'manha'
    })

    function limparMensagens() {
        setMensagemLocal('')
        setErroLocal('')
        setMensagemCadastro('')
        setErroCadastro('')
    }

    function alterarCadastro(campo, valor) {
        setCadastroForm(anterior => ({
            ...anterior,
            [campo]: valor
        }))
    }

    function alterarTurma(campo, valor) {
        setTurmaForm(anterior => ({
            ...anterior,
            [campo]: valor
        }))
    }

    function alterarFiltro(campo, valor) {
        setFiltroCadastro(anterior => ({
            ...anterior,
            [campo]: valor
        }))
    }

    function alterarEdicao(campo, valor) {
        setFormEdicao(anterior => ({
            ...anterior,
            [campo]: valor
        }))
    }

    function alterarEdicaoTurma(campo, valor) {
        setFormTurmaEdicao(anterior => ({
            ...anterior,
            [campo]: valor
        }))
    }

    function iniciarEdicao(registro) {
        limparMensagens()
        setEditando(registro)
        setEditandoTurma(null)

        setFormEdicao({
            nome: registro.nome || '',
            matricula: registro.matricula || '',
            data_nascimento: dataParaISO(
                registro.data_nascimento
            ),
            email: registro.email || '',
            senha: ''
        })
    }

    function iniciarEdicaoTurma(turma) {
        limparMensagens()
        setEditando(null)
        setEditandoTurma(turma.id)

        setFormTurmaEdicao({
            nome: turma.nome || '',
            ano_letivo: String(turma.ano_letivo || ''),
            periodo: turma.periodo || 'manha'
        })
    }

    async function executar(operacao, sucesso) {
        if (processando) return

        limparMensagens()
        setProcessando(true)

        try {
            await operacao()
            await carregarCadastros()
            setMensagemLocal(sucesso)
        } catch (error) {
            setErroLocal(error.message)
        } finally {
            setProcessando(false)
        }
    }

    async function salvarEdicao(evento) {
        evento.preventDefault()
        if (!editando) return

        if (editando.tipo === 'aluno' && !formEdicao.data_nascimento) {
            setErroLocal('Informe uma data de nascimento válida.')
            return
        }

        await executar(async () => {
            const ehAluno = editando.tipo === 'aluno'

            const caminho = ehAluno
                ? `/alunos/${editando.id}`
                : `/usuarios/${editando.id}`

            const corpo = ehAluno
                ? {
                    nome: formEdicao.nome.trim(),
                    matricula: formEdicao.matricula.trim(),
                    data_nascimento:
                        formEdicao.data_nascimento || null
                }
                : {
                    nome: formEdicao.nome.trim(),
                    email: formEdicao.email.trim(),
                    ...(formEdicao.senha
                        ? { senha: formEdicao.senha }
                        : {})
                }

            await api(caminho, {
                method: 'PUT',
                body: JSON.stringify(corpo)
            })

            setEditando(null)
        }, 'Cadastro atualizado com sucesso!')
    }

    async function desativarRegistro(registro) {
        if (!window.confirm(
            `Deseja desativar "${registro.nome}"?`
        )) return

        await executar(async () => {
            const caminho = registro.tipo === 'aluno'
                ? `/alunos/${registro.id}`
                : `/usuarios/${registro.id}`

            await api(caminho, { method: 'DELETE' })

            if (
                editando?.id === registro.id &&
                editando?.tipo === registro.tipo
            ) {
                setEditando(null)
            }

            setVisualizando(null)
        }, 'Cadastro desativado com sucesso!')
    }

    async function reativarRegistro(registro) {
        await executar(async () => {
            const caminho = registro.tipo === 'aluno'
                ? `/alunos/${registro.id}/reativar`
                : `/usuarios/${registro.id}/reativar`

            await api(caminho, { method: 'PATCH' })
        }, 'Cadastro reativado com sucesso!')
    }

    async function salvarEdicaoTurma(evento) {
        evento.preventDefault()
        if (editandoTurma === null) return

        await executar(async () => {
            await api(`/turmas/${editandoTurma}`, {
                method: 'PUT',
                body: JSON.stringify({
                    nome: formTurmaEdicao.nome.trim(),
                    ano_letivo: Number(
                        formTurmaEdicao.ano_letivo
                    ),
                    periodo: formTurmaEdicao.periodo
                })
            })

            setEditandoTurma(null)
        }, 'Turma atualizada com sucesso!')
    }

    async function desativarTurma(turma) {
        if (!window.confirm(
            `Deseja desativar a turma "${turma.nome}"?`
        )) return

        await executar(async () => {
            await api(`/turmas/${turma.id}`, {
                method: 'DELETE'
            })

            if (
                Number(editandoTurma) === Number(turma.id)
            ) {
                setEditandoTurma(null)
            }
        }, 'Turma desativada com sucesso!')
    }

    async function reativarTurma(turma) {
        await executar(async () => {
            await api(`/turmas/${turma.id}/reativar`, {
                method: 'PATCH'
            })
        }, 'Turma reativada com sucesso!')
    }

    function turmasDoAluno(alunoId) {
        return Object.entries(alunosTurmas || {})
            .filter(([, lista]) =>
                Array.isArray(lista) &&
                lista.some(item =>
                    Number(
                        item.aluno_id ??
                        item.aluno?.id ??
                        item.id
                    ) === Number(alunoId)
                )
            )
            .map(([id]) => Number(id))
    }

    const registrosAlunos = alunos.map(aluno => {
        const ids = turmasDoAluno(aluno.id)

        return {
            chave: `aluno-${aluno.id}`,
            original: { ...aluno, tipo: 'aluno' },
            nome: aluno.nome,
            perfil: 'Aluno',
            detalhes: `Matrícula: ${aluno.matricula || '—'}`,
            turmasIds: ids,
            vinculo: ids
                .map(id =>
                    turmas.find(t =>
                        Number(t.id) === id
                    )?.nome
                )
                .filter(Boolean)
                .join(', ') || 'Sem turma',
            status: ativo(aluno) ? 'Ativo' : 'Inativo'
        }
    })

    const registrosUsuarios = usuarios
        .filter(usuario =>
            usuario.perfil === 'professor' ||
            usuario.perfil === 'responsavel'
        )
        .map(usuario => {
            const professor =
                usuario.perfil === 'professor'

            const vinculos = professor
                ? vinculosProfessores.filter(v =>
                    Number(v.professor_id) ===
                    Number(usuario.id)
                )
                : vinculosResponsaveis.filter(v =>
                    Number(v.responsavel_id) ===
                    Number(usuario.id)
                )

            const idsTurmas = professor
                ? vinculos.map(v => Number(v.turma_id))
                : vinculos.flatMap(v =>
                    turmasDoAluno(v.aluno_id)
                )

            const vinculoTexto = professor
                ? vinculos.map(v => {
                    const turma = turmas.find(t =>
                        Number(t.id) === Number(v.turma_id)
                    )

                    const disciplina = disciplinas.find(d =>
                        Number(d.id) ===
                        Number(v.disciplina_id)
                    )

                    return `${turma?.nome || 'Turma'
                        } / ${disciplina?.nome || 'Disciplina'
                        }`
                }).join(', ')
                : vinculos.map(v => {
                    const aluno = alunos.find(a =>
                        Number(a.id) === Number(v.aluno_id)
                    )

                    return aluno?.nome ||
                        v.aluno?.nome ||
                        'Aluno'
                }).join(', ')

            return {
                chave: `usuario-${usuario.id}`,
                original: {
                    ...usuario,
                    tipo: 'usuario'
                },
                nome: usuario.nome,
                perfil: professor
                    ? 'Professor'
                    : 'Responsável',
                detalhes: usuario.email || '—',
                turmasIds: idsTurmas,
                vinculo: vinculoTexto || 'Sem vínculo',
                status: ativo(usuario)
                    ? 'Ativo'
                    : 'Inativo'
            }
        })

    const registros = [
        ...registrosAlunos,
        ...registrosUsuarios
    ]

    const filtrados = registros.filter(registro => {
        const busca = String(
            filtroCadastro.busca || ''
        ).trim().toLowerCase()

        const buscaOk = !busca ||
            `${registro.nome} ${registro.detalhes}`
                .toLowerCase()
                .includes(busca)

        const perfilOk =
            !filtroCadastro.perfil ||
            registro.perfil === filtroCadastro.perfil

        const turmaOk =
            !filtroCadastro.turma ||
            registro.turmasIds.includes(
                Number(filtroCadastro.turma)
            )

        const anoOk =
            !filtroCadastro.ano ||
            registro.turmasIds.some(id => {
                const turma = turmas.find(t =>
                    Number(t.id) === id
                )

                return String(turma?.ano_letivo) ===
                    String(filtroCadastro.ano)
            })

        return buscaOk && perfilOk && turmaOk && anoOk
    })

    const anos = [
        ...new Set(
            turmas.map(t => String(t.ano_letivo))
        )
    ].sort().reverse()

    return (
        <>
            <CabecalhoPagina
                titulo="Cadastros e vínculos"
                descricao="Gerencie alunos, professores, responsáveis e turmas."
            />

            <section className="admin-painel">
                <div className="admin-painel-topo">
                    <div>
                        <span>NOVO CADASTRO</span>
                        <h3>Cadastrar usuário</h3>
                    </div>
                </div>

                <div
                    className="admin-campo"
                    style={{ marginBottom: 18 }}
                >
                    <label>Tipo de cadastro</label>

                    <select
                        value={tipoCadastro}
                        onChange={e => {
                            setTipoCadastro(e.target.value)
                            setCadastroForm({ ...cadastroVazio })
                            limparMensagens()
                        }}
                    >
                        <option value="aluno">Aluno</option>
                        <option value="professor">Professor</option>
                        <option value="responsavel">Responsável</option>
                    </select>
                </div>

                <form
                    className="admin-form-grid"
                    onSubmit={evento => {
                        if (tipoCadastro === 'aluno' && !cadastroForm.data_nascimento) {
                            evento.preventDefault()
                            setErroCadastro('Informe uma data de nascimento válida.')
                            return
                        }
                        salvarCadastro(evento)
                    }}
                >
                    <Campo
                        label="Nome completo"
                        value={cadastroForm.nome}
                        onChange={v => alterarCadastro('nome', v)}
                        required
                        placeholder="Digite o nome completo"
                    />

                    {tipoCadastro === 'aluno' ? (
                        <>
                            <Campo
                                label="Matrícula"
                                value={cadastroForm.matricula}
                                onChange={v =>
                                    alterarCadastro('matricula', v)
                                }
                                required
                            />

                            <CampoDataNascimento
                                value={cadastroForm.data_nascimento}
                                onChange={v =>
                                    alterarCadastro('data_nascimento', v)
                                }
                            />

                            <Campo label="Turma">
                                <select
                                    value={cadastroForm.turma_id}
                                    onChange={e =>
                                        alterarCadastro(
                                            'turma_id',
                                            e.target.value
                                        )
                                    }
                                >
                                    <option value="">Vincular depois</option>
                                    {turmas.filter(ativo).map(turma => (
                                        <option
                                            key={turma.id}
                                            value={turma.id}
                                        >
                                            {turma.nome} — {turma.ano_letivo}
                                        </option>
                                    ))}
                                </select>
                            </Campo>
                        </>
                    ) : (
                        <>
                            <Campo
                                label="E-mail"
                                type="email"
                                value={cadastroForm.email}
                                onChange={v =>
                                    alterarCadastro('email', v)
                                }
                                required
                            />

                            <Campo
                                label="Senha inicial"
                                type="password"
                                value={cadastroForm.senha}
                                onChange={v =>
                                    alterarCadastro('senha', v)
                                }
                                required
                                minLength={8}
                                placeholder="Mínimo de 8 caracteres"
                            />

                            {tipoCadastro === 'professor' ? (
                                <>
                                    <Campo label="Turma">
                                        <select
                                            value={cadastroForm.turma_id}
                                            onChange={e =>
                                                alterarCadastro(
                                                    'turma_id',
                                                    e.target.value
                                                )
                                            }
                                        >
                                            <option value="">
                                                Vincular depois
                                            </option>

                                            {turmas.filter(ativo).map(turma => (
                                                <option
                                                    key={turma.id}
                                                    value={turma.id}
                                                >
                                                    {turma.nome} — {turma.ano_letivo}
                                                </option>
                                            ))}
                                        </select>
                                    </Campo>

                                    <Campo label="Disciplina">
                                        <select
                                            value={cadastroForm.disciplina_id}
                                            required={Boolean(
                                                cadastroForm.turma_id
                                            )}
                                            onChange={e =>
                                                alterarCadastro(
                                                    'disciplina_id',
                                                    e.target.value
                                                )
                                            }
                                        >
                                            <option value="">Selecione</option>

                                            {disciplinas.map(disciplina => (
                                                <option
                                                    key={disciplina.id}
                                                    value={disciplina.id}
                                                >
                                                    {disciplina.nome}
                                                </option>
                                            ))}
                                        </select>
                                    </Campo>
                                </>
                            ) : (
                                <Campo label="Aluno vinculado">
                                    <select
                                        value={cadastroForm.aluno_id}
                                        onChange={e =>
                                            alterarCadastro(
                                                'aluno_id',
                                                e.target.value
                                            )
                                        }
                                    >
                                        <option value="">
                                            Vincular depois
                                        </option>

                                        {alunos.filter(ativo).map(aluno => (
                                            <option
                                                key={aluno.id}
                                                value={aluno.id}
                                            >
                                                {aluno.nome}
                                            </option>
                                        ))}
                                    </select>
                                </Campo>
                            )}
                        </>
                    )}

                    <div className="admin-form-acoes">
                        <button
                            type="submit"
                            className="admin-botao-principal"
                            disabled={salvandoCadastro}
                        >
                            <Plus size={17} />
                            {salvandoCadastro
                                ? 'Salvando...'
                                : 'Cadastrar'}
                        </button>
                    </div>
                </form>
            </section>

            <section className="admin-painel">
                <div className="admin-painel-topo">
                    <div>
                        <span>ORGANIZAÇÃO ESCOLAR</span>
                        <h3>Cadastrar turma</h3>
                    </div>
                </div>

                <form
                    className="admin-form-grid"
                    onSubmit={salvarTurma}
                >
                    <Campo
                        label="Nome da turma"
                        value={turmaForm.nome}
                        onChange={v =>
                            alterarTurma('nome', v)
                        }
                        required
                        placeholder="Ex.: 6º Ano A"
                    />

                    <Campo
                        label="Ano letivo"
                        type="number"
                        value={turmaForm.ano_letivo}
                        onChange={v =>
                            alterarTurma('ano_letivo', v)
                        }
                        required
                    />

                    <Campo label="Período">
                        <select
                            value={turmaForm.periodo}
                            onChange={e =>
                                alterarTurma(
                                    'periodo',
                                    e.target.value
                                )
                            }
                        >
                            {Object.entries(nomesPeriodos).map(
                                ([valor, nome]) => (
                                    <option
                                        key={valor}
                                        value={valor}
                                    >
                                        {nome}
                                    </option>
                                )
                            )}
                        </select>
                    </Campo>

                    <div className="admin-form-acoes">
                        <button
                            type="submit"
                            className="admin-botao-principal"
                        >
                            <Plus size={17} />
                            Cadastrar turma
                        </button>
                    </div>
                </form>
            </section>

            <section className="admin-painel">
                <div className="admin-painel-topo">
                    <div>
                        <span>TURMAS CADASTRADAS</span>
                        <h3>Gerenciar turmas</h3>
                    </div>
                </div>

                {editandoTurma !== null && (
                    <form
                        className="admin-form-grid"
                        onSubmit={salvarEdicaoTurma}
                    >
                        <Campo
                            label="Nome da turma"
                            value={formTurmaEdicao.nome}
                            onChange={v =>
                                alterarEdicaoTurma('nome', v)
                            }
                            required
                        />

                        <Campo
                            label="Ano letivo"
                            type="number"
                            value={formTurmaEdicao.ano_letivo}
                            onChange={v =>
                                alterarEdicaoTurma('ano_letivo', v)
                            }
                            required
                        />

                        <Campo label="Período">
                            <select
                                value={formTurmaEdicao.periodo}
                                onChange={e =>
                                    alterarEdicaoTurma(
                                        'periodo',
                                        e.target.value
                                    )
                                }
                            >
                                {Object.entries(nomesPeriodos).map(
                                    ([valor, nome]) => (
                                        <option
                                            key={valor}
                                            value={valor}
                                        >
                                            {nome}
                                        </option>
                                    )
                                )}
                            </select>
                        </Campo>

                        <div className="admin-form-acoes">
                            <button
                                type="submit"
                                className="admin-botao-principal"
                                disabled={processando}
                            >
                                <Save size={17} />
                                Salvar alterações
                            </button>

                            <button
                                type="button"
                                className="admin-botao-secundario"
                                onClick={() =>
                                    setEditandoTurma(null)
                                }
                            >
                                <X size={17} />
                                Cancelar
                            </button>
                        </div>
                    </form>
                )}

                <div className="admin-tabela-container">
                    <table className="admin-tabela">
                        <thead>
                            <tr>
                                <th>Turma</th>
                                <th>Ano letivo</th>
                                <th>Período</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>

                        <tbody>
                            {turmas.map(turma => (
                                <tr key={turma.id}>
                                    <td>{turma.nome}</td>
                                    <td>{turma.ano_letivo}</td>
                                    <td>
                                        {nomesPeriodos[turma.periodo] ||
                                            turma.periodo}
                                    </td>
                                    <td>
                                        {ativo(turma)
                                            ? 'Ativa'
                                            : 'Inativa'}
                                    </td>
                                    <td>
                                        <div className="admin-tabela-acoes">
                                            <BotaoAcao
                                                titulo="Editar turma"
                                                onClick={() =>
                                                    iniciarEdicaoTurma(turma)
                                                }
                                            >
                                                <Pencil size={16} />
                                            </BotaoAcao>

                                            {ativo(turma) ? (
                                                <BotaoAcao
                                                    titulo="Desativar turma"
                                                    disabled={processando}
                                                    onClick={() =>
                                                        desativarTurma(turma)
                                                    }
                                                >
                                                    <Trash2 size={16} />
                                                </BotaoAcao>
                                            ) : (
                                                <BotaoAcao
                                                    titulo="Reativar turma"
                                                    disabled={processando}
                                                    onClick={() =>
                                                        reativarTurma(turma)
                                                    }
                                                >
                                                    <RotateCcw size={16} />
                                                </BotaoAcao>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {turmas.length === 0 && (
                                <tr>
                                    <td colSpan={5}>
                                        Nenhuma turma cadastrada.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="admin-painel">
                <div className="admin-painel-topo">
                    <div>
                        <span>GERENCIAMENTO</span>
                        <h3>
                            Alunos, professores e responsáveis
                        </h3>
                    </div>
                </div>

                <div className="admin-filtros">
                    <Campo
                        label="Buscar"
                        type="search"
                        value={filtroCadastro.busca}
                        onChange={v =>
                            alterarFiltro('busca', v)
                        }
                        placeholder="Nome, matrícula ou e-mail"
                    />

                    <Campo label="Perfil">
                        <select
                            value={filtroCadastro.perfil}
                            onChange={e =>
                                alterarFiltro(
                                    'perfil',
                                    e.target.value
                                )
                            }
                        >
                            <option value="">Todos</option>
                            <option value="Aluno">Aluno</option>
                            <option value="Professor">
                                Professor
                            </option>
                            <option value="Responsável">
                                Responsável
                            </option>
                        </select>
                    </Campo>

                    <Campo label="Turma">
                        <select
                            value={filtroCadastro.turma}
                            onChange={e =>
                                alterarFiltro(
                                    'turma',
                                    e.target.value
                                )
                            }
                        >
                            <option value="">Todas</option>

                            {turmas.map(turma => (
                                <option
                                    key={turma.id}
                                    value={turma.id}
                                >
                                    {turma.nome}
                                </option>
                            ))}
                        </select>
                    </Campo>

                    <Campo label="Ano letivo">
                        <select
                            value={filtroCadastro.ano}
                            onChange={e =>
                                alterarFiltro(
                                    'ano',
                                    e.target.value
                                )
                            }
                        >
                            <option value="">Todos</option>

                            {anos.map(ano => (
                                <option
                                    key={ano}
                                    value={ano}
                                >
                                    {ano}
                                </option>
                            ))}
                        </select>
                    </Campo>
                </div>

                {editando && (
                    <div className="admin-edicao">
                        <div className="admin-painel-topo">
                            <div>
                                <span>EDITAR CADASTRO</span>
                                <h3>{editando.nome}</h3>
                            </div>

                            <button
                                type="button"
                                onClick={() => setEditando(null)}
                                aria-label="Fechar edição"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form
                            className="admin-form-grid"
                            onSubmit={salvarEdicao}
                        >
                            <Campo
                                label="Nome completo"
                                value={formEdicao.nome}
                                onChange={v =>
                                    alterarEdicao('nome', v)
                                }
                                required
                            />

                            {editando.tipo === 'aluno' ? (
                                <>
                                    <Campo
                                        label="Matrícula"
                                        value={formEdicao.matricula}
                                        onChange={v =>
                                            alterarEdicao('matricula', v)
                                        }
                                        required
                                    />

                                    <CampoDataNascimento
                                        key={`aluno-${editando.id}`}
                                        value={formEdicao.data_nascimento}
                                        onChange={v =>
                                            alterarEdicao(
                                                'data_nascimento',
                                                v
                                            )
                                        }
                                    />
                                </>
                            ) : (
                                <>
                                    <Campo
                                        label="E-mail"
                                        type="email"
                                        value={formEdicao.email}
                                        onChange={v =>
                                            alterarEdicao('email', v)
                                        }
                                        required
                                    />

                                    <Campo
                                        label="Nova senha (opcional)"
                                        type="password"
                                        value={formEdicao.senha}
                                        onChange={v =>
                                            alterarEdicao('senha', v)
                                        }
                                        minLength={8}
                                        placeholder="Deixe em branco para manter"
                                    />
                                </>
                            )}

                            <div className="admin-form-acoes">
                                <button
                                    type="submit"
                                    className="admin-botao-principal"
                                    disabled={processando}
                                >
                                    <Save size={17} />
                                    Salvar alterações
                                </button>

                                <button
                                    type="button"
                                    className="admin-botao-secundario"
                                    onClick={() => setEditando(null)}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="admin-tabela-container">
                    <table className="admin-tabela">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Perfil</th>
                                <th>Informações</th>
                                <th>Vínculos</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filtrados.map(registro => (
                                <tr key={registro.chave}>
                                    <td>{registro.nome}</td>
                                    <td>{registro.perfil}</td>
                                    <td>{registro.detalhes}</td>
                                    <td>{registro.vinculo}</td>
                                    <td>{registro.status}</td>
                                    <td>
                                        <div className="admin-tabela-acoes">
                                            <BotaoAcao
                                                titulo="Visualizar detalhes"
                                                onClick={() =>
                                                    setVisualizando(registro)
                                                }
                                            >
                                                <Eye size={16} />
                                            </BotaoAcao>

                                            <BotaoAcao
                                                titulo="Editar cadastro"
                                                onClick={() =>
                                                    iniciarEdicao(
                                                        registro.original
                                                    )
                                                }
                                            >
                                                <Pencil size={16} />
                                            </BotaoAcao>

                                            {registro.status === 'Ativo' ? (
                                                <BotaoAcao
                                                    titulo="Desativar cadastro"
                                                    disabled={processando}
                                                    onClick={() =>
                                                        desativarRegistro(
                                                            registro.original
                                                        )
                                                    }
                                                >
                                                    <Trash2 size={16} />
                                                </BotaoAcao>
                                            ) : (
                                                <BotaoAcao
                                                    titulo="Reativar cadastro"
                                                    disabled={processando}
                                                    onClick={() =>
                                                        reativarRegistro(
                                                            registro.original
                                                        )
                                                    }
                                                >
                                                    <RotateCcw size={16} />
                                                </BotaoAcao>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {filtrados.length === 0 && (
                                <tr>
                                    <td colSpan={6}>
                                        Nenhum cadastro encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {(erroLocal || erroCadastro) && (
                <p
                    className="admin-mensagem admin-mensagem-erro"
                    role="alert"
                >
                    {erroLocal || erroCadastro}
                </p>
            )}

            {(mensagemLocal || mensagemCadastro) && (
                <p
                    className="admin-mensagem admin-mensagem-sucesso"
                    role="status"
                >
                    {mensagemLocal || mensagemCadastro}
                </p>
            )}

            {visualizando && (
                <ModalDetalhes
                    registro={visualizando}
                    onClose={() => setVisualizando(null)}
                />
            )}
        </>
    )
}
