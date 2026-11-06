
import { Plus, Save } from 'lucide-react'
import { useAdmin } from './AdminContext'
import CabecalhoPagina from './CabecalhoPagina'

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
        salvarTurma
    } = useAdmin()

    function atualizarCadastro(campo, valor) {
        setCadastroForm(anterior => ({
            ...anterior,
            [campo]: valor
        }))
    }

    function atualizarTurma(campo, valor) {
        setTurmaForm(anterior => ({
            ...anterior,
            [campo]: valor
        }))
    }

    function atualizarFiltro(campo, valor) {
        setFiltroCadastro(anterior => ({
            ...anterior,
            [campo]: valor
        }))
    }

    const registrosAlunos = alunos.map(aluno => {
        const idsTurmas = Object.entries(alunosTurmas)
            .filter(([, lista]) =>
                lista.some(item =>
                    Number(item.id ?? item.aluno_id ?? item.aluno?.id) === Number(aluno.id)
                )
            )
            .map(([id]) => Number(id))

        return {
            chave: `aluno-${aluno.id}`,
            nome: aluno.nome,
            perfil: 'Aluno',
            detalhes: `Matrícula: ${aluno.matricula || '—'}`,
            turmasIds: idsTurmas,
            vinculo: idsTurmas
                .map(id => turmas.find(t => Number(t.id) === id)?.nome)
                .filter(Boolean)
                .join(', ') || 'Sem turma',
            status: aluno.ativo === false || aluno.ativo === 0
                ? 'Inativo'
                : 'Ativo'
        }
    })

    const registrosUsuarios = usuarios
        .filter(usuario =>
            usuario.perfil === 'professor' ||
            usuario.perfil === 'responsavel'
        )
        .map(usuario => {
            const professor = usuario.perfil === 'professor'

            const vinculos = professor
                ? vinculosProfessores.filter(v =>
                    Number(v.professor_id) === Number(usuario.id)
                )
                : vinculosResponsaveis.filter(v =>
                    Number(v.responsavel_id) === Number(usuario.id)
                )

            const idsTurmas = professor
                ? vinculos.map(v => Number(v.turma_id))
                : vinculos.flatMap(v =>
                    Object.entries(alunosTurmas)
                        .filter(([, lista]) =>
                            lista.some(aluno =>
                                Number(aluno.id ?? aluno.aluno_id ?? aluno.aluno?.id) ===
                                Number(v.aluno_id)
                            )
                        )
                        .map(([id]) => Number(id))
                )

            const vinculoTexto = professor
                ? vinculos.map(v => {
                    const turma = turmas.find(t =>
                        Number(t.id) === Number(v.turma_id)
                    )
                    const disciplina = disciplinas.find(d =>
                        Number(d.id) === Number(v.disciplina_id)
                    )

                    return `${turma?.nome || 'Turma'} / ${disciplina?.nome || 'Disciplina'}`
                }).join(', ')
                : vinculos.map(v => {
                    const aluno = alunos.find(a =>
                        Number(a.id) === Number(v.aluno_id)
                    )
                    return aluno?.nome || v.aluno?.nome || 'Aluno'
                }).join(', ')

            return {
                chave: `usuario-${usuario.id}`,
                nome: usuario.nome,
                perfil: professor ? 'Professor' : 'Responsável',
                detalhes: usuario.email || '—',
                turmasIds: idsTurmas,
                vinculo: vinculoTexto || 'Sem vínculo',
                status: usuario.ativo === false || usuario.ativo === 0
                    ? 'Inativo'
                    : 'Ativo'
            }
        })

    const registros = [...registrosAlunos, ...registrosUsuarios]

    const filtrados = registros.filter(item => {
        const busca = filtroCadastro.busca.toLowerCase()

        if (
            busca &&
            !`${item.nome} ${item.detalhes}`
                .toLowerCase()
                .includes(busca)
        ) return false

        if (
            filtroCadastro.perfil &&
            item.perfil !== filtroCadastro.perfil
        ) return false

        if (
            filtroCadastro.turma &&
            !item.turmasIds.includes(Number(filtroCadastro.turma))
        ) return false

        if (
            filtroCadastro.ano &&
            !item.turmasIds.some(id => {
                const turma = turmas.find(t => Number(t.id) === id)
                return String(turma?.ano_letivo) === filtroCadastro.ano
            })
        ) return false

        return true
    })

    const anos = [
        ...new Set(turmas.map(t => String(t.ano_letivo)))
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

                <div className="admin-campo">
                    <label>Tipo de cadastro</label>
                    <select
                        value={tipoCadastro}
                        onChange={e => {
                            setTipoCadastro(e.target.value)
                            setCadastroForm({
                                nome: '',
                                matricula: '',
                                data_nascimento: '',
                                email: '',
                                senha: '',
                                turma_id: '',
                                disciplina_id: '',
                                aluno_id: ''
                            })
                            setErroCadastro('')
                            setMensagemCadastro('')
                        }}
                    >
                        <option value="aluno">Aluno</option>
                        <option value="professor">Professor</option>
                        <option value="responsavel">Responsável</option>
                    </select>
                </div>

                <form className="admin-form-grid" onSubmit={salvarCadastro}>
                    <div className="admin-campo">
                        <label>Nome completo</label>
                        <input
                            type="text"
                            required
                            value={cadastroForm.nome}
                            onChange={e => atualizarCadastro('nome', e.target.value)}
                            placeholder="Digite o nome completo"
                        />
                    </div>

                    {tipoCadastro === 'aluno' ? (
                        <>
                            <div className="admin-campo">
                                <label>Matrícula</label>
                                <input
                                    type="text"
                                    required
                                    value={cadastroForm.matricula}
                                    onChange={e =>
                                        atualizarCadastro('matricula', e.target.value)
                                    }
                                    placeholder="Número da matrícula"
                                />
                            </div>

                            <div className="admin-campo">
                                <label>Data de nascimento</label>
                                <input
                                    type="date"
                                    value={cadastroForm.data_nascimento}
                                    onChange={e =>
                                        atualizarCadastro('data_nascimento', e.target.value)
                                    }
                                />
                            </div>

                            <div className="admin-campo">
                                <label>Turma</label>
                                <select
                                    value={cadastroForm.turma_id}
                                    onChange={e =>
                                        atualizarCadastro('turma_id', e.target.value)
                                    }
                                >
                                    <option value="">Vincular depois</option>
                                    {turmas.filter(t => t.ativo !== false && t.ativo !== 0)
                                        .map(turma => (
                                            <option key={turma.id} value={turma.id}>
                                                {turma.nome} — {turma.ano_letivo}
                                            </option>
                                        ))}
                                </select>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="admin-campo">
                                <label>E-mail</label>
                                <input
                                    type="email"
                                    required
                                    value={cadastroForm.email}
                                    onChange={e =>
                                        atualizarCadastro('email', e.target.value)
                                    }
                                    placeholder="email@exemplo.com"
                                />
                            </div>

                            <div className="admin-campo">
                                <label>Senha inicial</label>
                                <input
                                    type="password"
                                    required
                                    value={cadastroForm.senha}
                                    onChange={e =>
                                        atualizarCadastro('senha', e.target.value)
                                    }
                                    placeholder="Senha do usuário"
                                />
                            </div>

                            {tipoCadastro === 'professor' ? (
                                <>
                                    <div className="admin-campo">
                                        <label>Turma</label>
                                        <select
                                            value={cadastroForm.turma_id}
                                            onChange={e =>
                                                atualizarCadastro('turma_id', e.target.value)
                                            }
                                        >
                                            <option value="">Vincular depois</option>
                                            {turmas.map(turma => (
                                                <option key={turma.id} value={turma.id}>
                                                    {turma.nome} — {turma.ano_letivo}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="admin-campo">
                                        <label>Disciplina</label>
                                        <select
                                            value={cadastroForm.disciplina_id}
                                            required={Boolean(cadastroForm.turma_id)}
                                            onChange={e =>
                                                atualizarCadastro('disciplina_id', e.target.value)
                                            }
                                        >
                                            <option value="">Selecione</option>
                                            {disciplinas.map(disciplina => (
                                                <option key={disciplina.id} value={disciplina.id}>
                                                    {disciplina.nome}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </>
                            ) : (
                                <div className="admin-campo">
                                    <label>Aluno vinculado</label>
                                    <select
                                        value={cadastroForm.aluno_id}
                                        onChange={e =>
                                            atualizarCadastro('aluno_id', e.target.value)
                                        }
                                    >
                                        <option value="">Vincular depois</option>
                                        {alunos.map(aluno => (
                                            <option key={aluno.id} value={aluno.id}>
                                                {aluno.nome} — {aluno.matricula}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </>
                    )}

                    <button
                        type="submit"
                        className="admin-botao-principal"
                        disabled={salvandoCadastro}
                    >
                        <Save size={17} />
                        {salvandoCadastro ? 'Salvando...' : 'Cadastrar'}
                    </button>
                </form>

                {erroCadastro && (
                    <p className="admin-erro">{erroCadastro}</p>
                )}

                {mensagemCadastro && (
                    <p className="admin-mensagem">{mensagemCadastro}</p>
                )}
            </section>

            <section className="admin-painel admin-painel-separado">
                <div className="admin-painel-topo">
                    <div>
                        <span>ORGANIZAÇÃO ESCOLAR</span>
                        <h3>Cadastrar turma</h3>
                    </div>
                </div>

                <form className="admin-form-grid" onSubmit={salvarTurma}>
                    <div className="admin-campo">
                        <label>Nome da turma</label>
                        <input
                            required
                            value={turmaForm.nome}
                            onChange={e =>
                                atualizarTurma('nome', e.target.value)
                            }
                            placeholder="Ex.: 6º Ano A"
                        />
                    </div>

                    <div className="admin-campo">
                        <label>Ano letivo</label>
                        <input
                            type="number"
                            min="1901"
                            max="2155"
                            required
                            value={turmaForm.ano_letivo}
                            onChange={e =>
                                atualizarTurma('ano_letivo', e.target.value)
                            }
                        />
                    </div>

                    <div className="admin-campo">
                        <label>Turno</label>
                        <select
                            value={turmaForm.periodo}
                            onChange={e =>
                                atualizarTurma('periodo', e.target.value)
                            }
                        >
                            <option value="manha">Manhã</option>
                            <option value="tarde">Tarde</option>
                            <option value="noite">Noite</option>
                            <option value="integral">Integral</option>
                        </select>
                    </div>

                    <button type="submit" className="admin-botao-principal">
                        <Plus size={17} /> Criar turma
                    </button>
                </form>

                <div className="admin-lista-itens">
                    {turmas.map(turma => (
                        <div className="admin-item" key={turma.id}>
                            <span>
                                {turma.nome} — {turma.ano_letivo} — {turma.periodo}
                            </span>
                        </div>
                    ))}
                </div>
            </section>

            <section className="admin-painel admin-painel-separado">
                <div className="admin-painel-topo">
                    <div>
                        <span>REGISTROS</span>
                        <h3>Todos os cadastrados</h3>
                    </div>
                    <span>{filtrados.length} registro(s)</span>
                </div>

                <div className="admin-filtros">
                    <div className="admin-campo">
                        <label>Pesquisar</label>
                        <input
                            value={filtroCadastro.busca}
                            onChange={e =>
                                atualizarFiltro('busca', e.target.value)
                            }
                            placeholder="Nome, matrícula ou e-mail"
                        />
                    </div>

                    <div className="admin-campo">
                        <label>Perfil</label>
                        <select
                            value={filtroCadastro.perfil}
                            onChange={e =>
                                atualizarFiltro('perfil', e.target.value)
                            }
                        >
                            <option value="">Todos</option>
                            <option value="Aluno">Aluno</option>
                            <option value="Professor">Professor</option>
                            <option value="Responsável">Responsável</option>
                        </select>
                    </div>

                    <div className="admin-campo">
                        <label>Turma</label>
                        <select
                            value={filtroCadastro.turma}
                            onChange={e =>
                                atualizarFiltro('turma', e.target.value)
                            }
                        >
                            <option value="">Todas</option>
                            {turmas.map(turma => (
                                <option key={turma.id} value={turma.id}>
                                    {turma.nome}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="admin-campo">
                        <label>Ano letivo</label>
                        <select
                            value={filtroCadastro.ano}
                            onChange={e =>
                                atualizarFiltro('ano', e.target.value)
                            }
                        >
                            <option value="">Todos</option>
                            {anos.map(ano => (
                                <option key={ano} value={ano}>
                                    {ano}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="admin-tabela-scroll">
                    <table className="admin-tabela">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Perfil</th>
                                <th>Matrícula / E-mail</th>
                                <th>Turma / Vínculo</th>
                                <th>Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filtrados.map(item => (
                                <tr key={item.chave}>
                                    <td><strong>{item.nome}</strong></td>
                                    <td>{item.perfil}</td>
                                    <td>{item.detalhes}</td>
                                    <td>{item.vinculo}</td>
                                    <td>{item.status}</td>
                                </tr>
                            ))}

                            {filtrados.length === 0 && (
                                <tr>
                                    <td colSpan={5}>
                                        Nenhum cadastro encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </>
    )
}
