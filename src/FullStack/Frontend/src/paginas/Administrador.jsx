import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Tag, CalendarDays, ChartNoAxesCombined,
  Users, BookOpen, UserRound, ArrowLeft, Eye, X,
  Plus, Pencil, Trash2, Save, Search
} from 'lucide-react'

import { buscarAlunos } from '../servicos/alunoService'
import './Administrador.css'


function Administrador() {
  const location = useLocation()

  const [alunos, setAlunos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [alunoSelecionado, setAlunoSelecionado] = useState(null)

  const [usuarios, setUsuarios] = useState([
    { id: 1, nome: 'Ana Souza', perfil: 'Professor', vinculo: 'Matemática - 7º A', status: 'Ativo' },
    { id: 2, nome: 'Carlos Lima', perfil: 'Professor', vinculo: 'Português - 9º A', status: 'Ativo' },
    { id: 3, nome: 'Mariana Carvalho', perfil: 'Responsável', vinculo: 'Eric Carvalho', status: 'Ativo' },
    { id: 4, nome: 'Paulo Santos', perfil: 'Responsável', vinculo: 'Gabriel Vaz', status: 'Ativo' }
  ])

  const [usuarioForm, setUsuarioForm] = useState({
    nome: '',
    perfil: 'Professor',
    vinculo: ''
  })

  const [usuarioEditando, setUsuarioEditando] = useState(null)

  const [tags, setTags] = useState([
    { id: 1, nome: 'Boa evolução' },
    { id: 2, nome: 'Participação' },
    { id: 3, nome: 'Bom desempenho' },
    { id: 4, nome: 'Atenção necessária' },
    { id: 5, nome: 'Dificuldade de aprendizagem' },
    { id: 6, nome: 'Autonomia' }
  ])

  const [nomeTag, setNomeTag] = useState('')
  const [tagEditando, setTagEditando] = useState(null)

  const [areas, setAreas] = useState([
    { id: 1, nome: 'Matemática' },
    { id: 2, nome: 'Linguagens' },
    { id: 3, nome: 'Ciências Humanas' },
    { id: 4, nome: 'Ciências da Natureza' }
  ])

  const [nomeArea, setNomeArea] = useState('')
  const [areaEditando, setAreaEditando] = useState(null)

  const [disciplinas, setDisciplinas] = useState([
    { id: 1, nome: 'Matemática', area: 'Matemática' },
    { id: 2, nome: 'Português', area: 'Linguagens' },
    { id: 3, nome: 'Geografia', area: 'Ciências Humanas' },
    { id: 4, nome: 'Ciências', area: 'Ciências da Natureza' }
  ])

  const [disciplinaForm, setDisciplinaForm] = useState({
    nome: '',
    area: 'Matemática'
  })

  const [disciplinaEditando, setDisciplinaEditando] = useState(null)

  const [periodos, setPeriodos] = useState([
    { id: 1, nome: '1º Bimestre', inicio: '2026-02-03', fim: '2026-04-10', status: 'Encerrado' },
    { id: 2, nome: '2º Bimestre', inicio: '2026-04-13', fim: '2026-06-26', status: 'Encerrado' },
    { id: 3, nome: '3º Bimestre', inicio: '2026-08-03', fim: '2026-10-09', status: 'Aberto' },
    { id: 4, nome: '4º Bimestre', inicio: '2026-10-13', fim: '2026-12-11', status: 'Programado' }
  ])

  const [filtros, setFiltros] = useState({
    aluno: '',
    disciplina: '',
    status: ''
  })


  useEffect(() => {
    async function carregarAlunos() {
      try {
        const dados = await buscarAlunos()

        const detalhes = [
          {
            media: '8,5',
            descricao: 'O aluno apresentou bom desenvolvimento durante o período.',
            tags: ['Boa evolução', 'Participação'],
            situacao: 'Em evolução',
            pontosPositivos: 'Participa das atividades e demonstra interesse pelos conteúdos.',
            dificuldades: 'Apresenta dificuldade na interpretação de alguns problemas.',
            evolucao: 'Apresentou melhora na participação e maior segurança.',
            orientacao: 'Continuar incentivando a revisão dos conteúdos em casa.'
          },
          {
            media: '7,8',
            descricao: 'O aluno apresentou evolução na leitura e participação.',
            tags: ['Participação'],
            situacao: 'Bom desenvolvimento',
            pontosPositivos: 'Demonstra interesse nas atividades propostas.',
            dificuldades: 'Apresenta dificuldade na organização de algumas produções escritas.',
            evolucao: 'Passou a participar com mais frequência.',
            orientacao: 'Manter o hábito de leitura e incentivar produções de texto.'
          },
          {
            media: '6,4',
            descricao: 'O aluno necessita de acompanhamento mais frequente.',
            tags: ['Atenção necessária', 'Dificuldade de aprendizagem'],
            situacao: 'Precisa de atenção',
            pontosPositivos: 'Participa bem quando recebe orientação.',
            dificuldades: 'Apresenta dificuldade para relacionar conteúdos.',
            evolucao: 'Apresentou pequenos avanços durante o período.',
            orientacao: 'Incentivar uma rotina de estudos durante a semana.'
          },
          {
            media: '9,0',
            descricao: 'O aluno apresentou ótimo desenvolvimento e autonomia.',
            tags: ['Bom desempenho', 'Autonomia'],
            situacao: 'Bom desenvolvimento',
            pontosPositivos: 'Apresenta interesse e boa participação.',
            dificuldades: 'Possui dúvidas pontuais em atividades mais complexas.',
            evolucao: 'Demonstrou maior autonomia durante o período.',
            orientacao: 'Continuar acompanhando e incentivando a revisão.'
          }
        ]

        setAlunos(
          dados.map((aluno, indice) => ({
            ...aluno,
            ...detalhes[indice % detalhes.length],
            status:
              aluno.status === 'Enviado'
                ? 'Enviado para revisão'
                : aluno.status
          }))
        )
      } catch {
        setErro('Não foi possível carregar os acompanhamentos.')
      } finally {
        setCarregando(false)
      }
    }

    carregarAlunos()
  }, [])


  function atualizarAcompanhamento(id, alteracoes) {
    setAlunos((lista) =>
      lista.map((aluno) =>
        aluno.id === id ? { ...aluno, ...alteracoes } : aluno
      )
    )

    setAlunoSelecionado((aluno) =>
      aluno?.id === id ? { ...aluno, ...alteracoes } : aluno
    )
  }


  function publicarAcompanhamento(id) {
    atualizarAcompanhamento(id, {
      status: 'Publicado',
      motivoDevolucao: ''
    })
  }


  function devolverAcompanhamento(id) {
    const motivo = window.prompt(
      'Informe o motivo da devolução para o professor:'
    )

    if (!motivo?.trim()) return

    atualizarAcompanhamento(id, {
      status: 'Devolvido',
      motivoDevolucao: motivo.trim()
    })
  }


  function salvarUsuario(evento) {
    evento.preventDefault()

    if (!usuarioForm.nome.trim() || !usuarioForm.vinculo.trim()) return

    if (usuarioEditando) {
      setUsuarios((lista) =>
        lista.map((usuario) =>
          usuario.id === usuarioEditando
            ? { ...usuario, ...usuarioForm }
            : usuario
        )
      )

      setUsuarioEditando(null)
    } else {
      setUsuarios((lista) => [
        ...lista,
        {
          id: Date.now(),
          ...usuarioForm,
          status: 'Ativo'
        }
      ])
    }

    setUsuarioForm({
      nome: '',
      perfil: 'Professor',
      vinculo: ''
    })
  }


  function editarUsuario(usuario) {
    setUsuarioEditando(usuario.id)

    setUsuarioForm({
      nome: usuario.nome,
      perfil: usuario.perfil,
      vinculo: usuario.vinculo
    })
  }


  function alterarStatusUsuario(id) {
    setUsuarios((lista) =>
      lista.map((usuario) =>
        usuario.id === id
          ? {
              ...usuario,
              status: usuario.status === 'Ativo' ? 'Inativo' : 'Ativo'
            }
          : usuario
      )
    )
  }


  function salvarTag(evento) {
    evento.preventDefault()

    const nome = nomeTag.trim()
    if (!nome) return

    if (tagEditando) {
      setTags((lista) =>
        lista.map((tag) =>
          tag.id === tagEditando ? { ...tag, nome } : tag
        )
      )

      setTagEditando(null)
    } else {
      const existe = tags.some(
        (tag) => tag.nome.toLowerCase() === nome.toLowerCase()
      )

      if (existe) return

      setTags((lista) => [...lista, { id: Date.now(), nome }])
    }

    setNomeTag('')
  }


  function salvarArea(evento) {
    evento.preventDefault()

    const nome = nomeArea.trim()
    if (!nome) return

    if (areaEditando) {
      const antiga = areas.find((area) => area.id === areaEditando)

      setAreas((lista) =>
        lista.map((area) =>
          area.id === areaEditando ? { ...area, nome } : area
        )
      )

      if (antiga) {
        setDisciplinas((lista) =>
          lista.map((disciplina) =>
            disciplina.area === antiga.nome
              ? { ...disciplina, area: nome }
              : disciplina
          )
        )
      }

      setAreaEditando(null)
    } else {
      setAreas((lista) => [...lista, { id: Date.now(), nome }])
    }

    setNomeArea('')
  }


  function excluirArea(id) {
    const area = areas.find((item) => item.id === id)
    if (!area) return

    const possuiDisciplina = disciplinas.some(
      (disciplina) => disciplina.area === area.nome
    )

    if (possuiDisciplina) {
      alert('Esta área possui disciplinas vinculadas.')
      return
    }

    setAreas((lista) => lista.filter((item) => item.id !== id))
  }


  function salvarDisciplina(evento) {
    evento.preventDefault()

    if (!disciplinaForm.nome.trim() || !disciplinaForm.area) return

    if (disciplinaEditando) {
      setDisciplinas((lista) =>
        lista.map((disciplina) =>
          disciplina.id === disciplinaEditando
            ? { ...disciplina, ...disciplinaForm }
            : disciplina
        )
      )

      setDisciplinaEditando(null)
    } else {
      setDisciplinas((lista) => [
        ...lista,
        {
          id: Date.now(),
          ...disciplinaForm
        }
      ])
    }

    setDisciplinaForm({
      nome: '',
      area: areas[0]?.nome || ''
    })
  }


  function alterarPeriodo(id, campo, valor) {
    setPeriodos((lista) =>
      lista.map((periodo) =>
        periodo.id === id
          ? { ...periodo, [campo]: valor }
          : periodo
      )
    )
  }


  function alternarPeriodo(id) {
    setPeriodos((lista) =>
      lista.map((periodo) =>
        periodo.id === id
          ? {
              ...periodo,
              status: periodo.status === 'Aberto' ? 'Encerrado' : 'Aberto'
            }
          : periodo
      )
    )
  }


  function classeStatus(status) {
    if (status === 'Publicado') return 'publicado'
    if (status === 'Devolvido') return 'devolvido'

    if (
      status === 'Em Revisão' ||
      status === 'Enviado para revisão'
    ) {
      return 'em-revisao'
    }

    return ''
  }


  const contarStatus = (status) =>
    alunos.filter((aluno) => aluno.status === status).length


  const alunosFiltrados = alunos.filter((aluno) => {
    const nomeValido = aluno.nome
      .toLowerCase()
      .includes(filtros.aluno.toLowerCase())

    const disciplinaValida =
      !filtros.disciplina ||
      aluno.disciplina === filtros.disciplina

    const statusValido =
      !filtros.status ||
      aluno.status === filtros.status

    return nomeValido && disciplinaValida && statusValido
  })


  function itemAtivo(caminho) {
    return location.pathname === caminho ? 'admin-menu-ativo' : ''
  }


  function CabecalhoPagina({ titulo, descricao }) {
    return (
      <header className="admin-topo">
        <div>
          <span className="admin-area">ÁREA DO ADMINISTRADOR</span>
          <h2>{titulo}</h2>
          <p className="admin-subtitulo">{descricao}</p>
        </div>

        <div className="admin-usuario">
          <UserRound size={25} />

          <div>
            <strong>Administrador</strong>
            <span>Área administrativa</span>
          </div>
        </div>
      </header>
    )
  }


  function Dashboard() {
    return (
      <>
        <CabecalhoPagina
          titulo="Dashboard"
          descricao="Revise os registros enviados pelos professores."
        />

        <section className="admin-cards">
          <div className="admin-card">
            <span>Alunos</span>
            <strong>{alunos.length}</strong>
          </div>

          <div className="admin-card">
            <span>Professores</span>
            <strong>
              {usuarios.filter((u) => u.perfil === 'Professor').length}
            </strong>
          </div>

          <div className="admin-card">
            <span>Disciplinas</span>
            <strong>{disciplinas.length}</strong>
          </div>
        </section>

        <section className="admin-status">
          <div>
            <span>Aguardando revisão</span>
            <strong>{contarStatus('Enviado para revisão')}</strong>
          </div>

          <div>
            <span>Em revisão</span>
            <strong>{contarStatus('Em Revisão')}</strong>
          </div>

          <div>
            <span>Devolvidos</span>
            <strong>{contarStatus('Devolvido')}</strong>
          </div>

          <div>
            <span>Publicados</span>
            <strong>{contarStatus('Publicado')}</strong>
          </div>
        </section>

        <section className="admin-painel">
          <div className="admin-painel-topo">
            <div>
              <span>REVISÃO</span>
              <h3>Acompanhamentos enviados</h3>
              <p>Revise os registros antes da publicação.</p>
            </div>
          </div>

          {carregando && (
            <p className="admin-mensagem">
              Carregando acompanhamentos...
            </p>
          )}

          {erro && <p className="admin-erro">{erro}</p>}

          {!carregando && !erro && (
            <TabelaAcompanhamentos
              lista={alunos}
              mostrarAcoes
            />
          )}
        </section>
      </>
    )
  }


  function TabelaAcompanhamentos({ lista, mostrarAcoes = false }) {
    return (
      <div className="admin-tabela-scroll">
        <table className="admin-tabela">
          <thead>
            <tr>
              <th>Aluno</th>
              <th>Turma</th>
              <th>Disciplina</th>
              <th>Bimestre</th>
              <th>Status</th>

              {mostrarAcoes && <th>Ações</th>}
            </tr>
          </thead>

          <tbody>
            {lista.map((aluno) => (
              <tr key={aluno.id}>
                <td><strong>{aluno.nome}</strong></td>
                <td>{aluno.turma}</td>
                <td>{aluno.disciplina}</td>
                <td>{aluno.bimestre}</td>

                <td>
                  <span className={`admin-badge ${classeStatus(aluno.status)}`}>
                    {aluno.status}
                  </span>
                </td>

                {mostrarAcoes && (
                  <td>
                    <div className="admin-acoes">
                      <button
                        type="button"
                        className="admin-botao-secundario"
                        onClick={() => setAlunoSelecionado(aluno)}
                      >
                        <Eye size={15} />
                        Ver
                      </button>

                      {aluno.status !== 'Publicado' && (
                        <>
                          <button
                            type="button"
                            className="admin-botao-principal pequeno"
                            onClick={() => publicarAcompanhamento(aluno.id)}
                          >
                            Publicar
                          </button>

                          <button
                            type="button"
                            className="admin-botao-secundario"
                            onClick={() => devolverAcompanhamento(aluno.id)}
                          >
                            Devolver
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }


  function Cadastros() {
    return (
      <>
        <CabecalhoPagina
          titulo="Cadastros e vínculos"
          descricao="Cadastre professores, responsáveis e organize seus vínculos."
        />

        <section className="admin-painel">
          <div className="admin-painel-topo">
            <div>
              <span>NOVO CADASTRO</span>
              <h3>{usuarioEditando ? 'Editar usuário' : 'Cadastrar usuário'}</h3>
            </div>
          </div>

          <form className="admin-form-grid" onSubmit={salvarUsuario}>
            <div className="admin-campo">
              <label>Nome</label>

              <input
                value={usuarioForm.nome}
                onChange={(e) =>
                  setUsuarioForm({
                    ...usuarioForm,
                    nome: e.target.value
                  })
                }
                placeholder="Nome completo"
              />
            </div>

            <div className="admin-campo">
              <label>Perfil</label>

              <select
                value={usuarioForm.perfil}
                onChange={(e) =>
                  setUsuarioForm({
                    ...usuarioForm,
                    perfil: e.target.value
                  })
                }
              >
                <option>Professor</option>
                <option>Responsável</option>
                <option>Aluno</option>
              </select>
            </div>

            <div className="admin-campo admin-campo-maior">
              <label>Vínculo</label>

              <input
                value={usuarioForm.vinculo}
                onChange={(e) =>
                  setUsuarioForm({
                    ...usuarioForm,
                    vinculo: e.target.value
                  })
                }
                placeholder="Ex.: Matemática - 7º A"
              />
            </div>

            <button className="admin-botao-principal">
              <Save size={17} />
              {usuarioEditando ? 'Salvar alterações' : 'Cadastrar'}
            </button>
          </form>
        </section>

        <section className="admin-painel admin-painel-separado">
          <div className="admin-painel-topo">
            <div>
              <span>CADASTRADOS</span>
              <h3>Usuários</h3>
            </div>
          </div>

          <div className="admin-tabela-scroll">
            <table className="admin-tabela">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Perfil</th>
                  <th>Vínculo</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {usuarios.map((usuario) => (
                  <tr key={usuario.id}>
                    <td><strong>{usuario.nome}</strong></td>
                    <td>{usuario.perfil}</td>
                    <td>{usuario.vinculo}</td>
                    <td>{usuario.status}</td>

                    <td>
                      <div className="admin-acoes">
                        <button
                          type="button"
                          className="admin-botao-icone"
                          onClick={() => editarUsuario(usuario)}
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          className="admin-botao-secundario"
                          onClick={() => alterarStatusUsuario(usuario.id)}
                        >
                          {usuario.status === 'Ativo' ? 'Inativar' : 'Ativar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </>
    )
  }


  function Tags() {
    return (
      <>
        <CabecalhoPagina
          titulo="Gerenciar tags"
          descricao="Defina as classificações disponíveis para os professores."
        />

        <section className="admin-painel">
          <div className="admin-painel-topo">
            <div>
              <span>CLASSIFICAÇÕES</span>
              <h3>{tagEditando ? 'Editar tag' : 'Nova tag'}</h3>
            </div>
          </div>

          <form className="admin-form-linha" onSubmit={salvarTag}>
            <input
              value={nomeTag}
              onChange={(e) => setNomeTag(e.target.value)}
              placeholder="Ex.: Boa participação"
            />

            <button className="admin-botao-principal">
              <Save size={17} />
              {tagEditando ? 'Salvar' : 'Adicionar'}
            </button>
          </form>

          <div className="admin-lista-itens">
            {tags.map((tag) => (
              <div className="admin-item" key={tag.id}>
                <div>
                  <Tag size={17} />
                  <span>{tag.nome}</span>
                </div>

                <div className="admin-acoes">
                  <button
                    className="admin-botao-icone"
                    onClick={() => {
                      setTagEditando(tag.id)
                      setNomeTag(tag.nome)
                    }}
                  >
                    <Pencil size={15} />
                  </button>

                  <button
                    className="admin-botao-icone perigo"
                    onClick={() =>
                      setTags((lista) =>
                        lista.filter((item) => item.id !== tag.id)
                      )
                    }
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </>
    )
  }


  function Periodos() {
    return (
      <>
        <CabecalhoPagina
          titulo="Períodos letivos"
          descricao="Configure os períodos de registro dos acompanhamentos."
        />

        <section className="admin-periodos">
          {periodos.map((periodo) => (
            <article className="admin-periodo" key={periodo.id}>
              <div className="admin-periodo-topo">
                <div>
                  <CalendarDays size={21} />
                  <h3>{periodo.nome}</h3>
                </div>

                <span className={`admin-badge ${
                  periodo.status === 'Aberto' ? 'publicado' : ''
                }`}>
                  {periodo.status}
                </span>
              </div>

              <div className="admin-campo">
                <label>Início da digitação</label>

                <input
                  type="date"
                  value={periodo.inicio}
                  onChange={(e) =>
                    alterarPeriodo(periodo.id, 'inicio', e.target.value)
                  }
                />
              </div>

              <div className="admin-campo">
                <label>Encerramento</label>

                <input
                  type="date"
                  value={periodo.fim}
                  onChange={(e) =>
                    alterarPeriodo(periodo.id, 'fim', e.target.value)
                  }
                />
              </div>

              <button
                type="button"
                className={
                  periodo.status === 'Aberto'
                    ? 'admin-botao-secundario'
                    : 'admin-botao-principal'
                }
                onClick={() => alternarPeriodo(periodo.id)}
              >
                {periodo.status === 'Aberto'
                  ? 'Encerrar período'
                  : 'Abrir período'}
              </button>
            </article>
          ))}
        </section>
      </>
    )
  }


  function Relatorios() {
    return (
      <>
        <CabecalhoPagina
          titulo="Relatórios"
          descricao="Consulte os acompanhamentos utilizando filtros."
        />

        <section className="admin-painel">
          <div className="admin-painel-topo">
            <div>
              <span>FILTROS</span>
              <h3>Relatório de acompanhamentos</h3>
            </div>

            <Search size={22} />
          </div>

          <div className="admin-filtros">
            <div className="admin-campo">
              <label>Aluno</label>

              <input
                value={filtros.aluno}
                onChange={(e) =>
                  setFiltros({
                    ...filtros,
                    aluno: e.target.value
                  })
                }
                placeholder="Buscar aluno"
              />
            </div>

            <div className="admin-campo">
              <label>Disciplina</label>

              <select
                value={filtros.disciplina}
                onChange={(e) =>
                  setFiltros({
                    ...filtros,
                    disciplina: e.target.value
                  })
                }
              >
                <option value="">Todas</option>

                {disciplinas.map((disciplina) => (
                  <option key={disciplina.id} value={disciplina.nome}>
                    {disciplina.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-campo">
              <label>Status</label>

              <select
                value={filtros.status}
                onChange={(e) =>
                  setFiltros({
                    ...filtros,
                    status: e.target.value
                  })
                }
              >
                <option value="">Todos</option>
                <option>Enviado para revisão</option>
                <option>Em Revisão</option>
                <option>Devolvido</option>
                <option>Publicado</option>
              </select>
            </div>
          </div>

          <TabelaAcompanhamentos lista={alunosFiltrados} />
        </section>
      </>
    )
  }


  function Disciplinas() {
    return (
      <>
        <CabecalhoPagina
          titulo="Áreas e disciplinas"
          descricao="Cadastre e organize as áreas de conhecimento e disciplinas."
        />

        <div className="admin-duas-colunas">
          <section className="admin-painel">
            <div className="admin-painel-topo">
              <div>
                <span>ÁREAS</span>
                <h3>{areaEditando ? 'Editar área' : 'Nova área'}</h3>
              </div>
            </div>

            <form className="admin-form-linha" onSubmit={salvarArea}>
              <input
                value={nomeArea}
                onChange={(e) => setNomeArea(e.target.value)}
                placeholder="Ex.: Linguagens"
              />

              <button className="admin-botao-principal">
                <Plus size={16} />
                Salvar
              </button>
            </form>

            <div className="admin-lista-itens">
              {areas.map((area) => (
                <div className="admin-item" key={area.id}>
                  <span>{area.nome}</span>

                  <div className="admin-acoes">
                    <button
                      className="admin-botao-icone"
                      onClick={() => {
                        setAreaEditando(area.id)
                        setNomeArea(area.nome)
                      }}
                    >
                      <Pencil size={15} />
                    </button>

                    <button
                      className="admin-botao-icone perigo"
                      onClick={() => excluirArea(area.id)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="admin-painel">
            <div className="admin-painel-topo">
              <div>
                <span>DISCIPLINAS</span>
                <h3>
                  {disciplinaEditando
                    ? 'Editar disciplina'
                    : 'Nova disciplina'}
                </h3>
              </div>
            </div>

            <form
              className="admin-form-coluna"
              onSubmit={salvarDisciplina}
            >
              <div className="admin-campo">
                <label>Disciplina</label>

                <input
                  value={disciplinaForm.nome}
                  onChange={(e) =>
                    setDisciplinaForm({
                      ...disciplinaForm,
                      nome: e.target.value
                    })
                  }
                  placeholder="Ex.: História"
                />
              </div>

              <div className="admin-campo">
                <label>Área</label>

                <select
                  value={disciplinaForm.area}
                  onChange={(e) =>
                    setDisciplinaForm({
                      ...disciplinaForm,
                      area: e.target.value
                    })
                  }
                >
                  {areas.map((area) => (
                    <option key={area.id} value={area.nome}>
                      {area.nome}
                    </option>
                  ))}
                </select>
              </div>

              <button className="admin-botao-principal">
                <Save size={16} />
                Salvar disciplina
              </button>
            </form>

            <div className="admin-lista-itens">
              {disciplinas.map((disciplina) => (
                <div className="admin-item" key={disciplina.id}>
                  <div className="admin-item-texto">
                    <strong>{disciplina.nome}</strong>
                    <small>{disciplina.area}</small>
                  </div>

                  <div className="admin-acoes">
                    <button
                      className="admin-botao-icone"
                      onClick={() => {
                        setDisciplinaEditando(disciplina.id)

                        setDisciplinaForm({
                          nome: disciplina.nome,
                          area: disciplina.area
                        })
                      }}
                    >
                      <Pencil size={15} />
                    </button>

                    <button
                      className="admin-botao-icone perigo"
                      onClick={() =>
                        setDisciplinas((lista) =>
                          lista.filter(
                            (item) => item.id !== disciplina.id
                          )
                        )
                      }
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </>
    )
  }


  function conteudoPagina() {
    const paginas = {
      '/administrador/cadastros': <Cadastros />,
      '/administrador/tags': <Tags />,
      '/administrador/periodos': <Periodos />,
      '/administrador/relatorios': <Relatorios />,
      '/administrador/disciplinas': <Disciplinas />
    }

    return paginas[location.pathname] || <Dashboard />
  }


  return (
    <div className="admin">
      <aside className="admin-sidebar">
        <h1 className="admin-logo">
          K<span>F</span>KA
        </h1>

        <nav className="admin-menu">
          <Link
            className={itemAtivo('/administrador')}
            to="/administrador"
          >
            <LayoutDashboard size={19} />
            Dashboard
          </Link>

          <Link
            className={itemAtivo('/administrador/cadastros')}
            to="/administrador/cadastros"
          >
            <Users size={19} />
            Cadastros e vínculos
          </Link>

          <Link
            className={itemAtivo('/administrador/tags')}
            to="/administrador/tags"
          >
            <Tag size={19} />
            Gerenciar tags
          </Link>

          <Link
            className={itemAtivo('/administrador/periodos')}
            to="/administrador/periodos"
          >
            <CalendarDays size={19} />
            Períodos letivos
          </Link>

          <Link
            className={itemAtivo('/administrador/relatorios')}
            to="/administrador/relatorios"
          >
            <ChartNoAxesCombined size={19} />
            Relatórios
          </Link>

          <Link
            className={itemAtivo('/administrador/disciplinas')}
            to="/administrador/disciplinas"
          >
            <BookOpen size={19} />
            Áreas e disciplinas
          </Link>
        </nav>
      </aside>

      <main className="admin-conteudo">
        <Link to="/" className="admin-voltar">
          <ArrowLeft size={18} />
          Voltar ao início
        </Link>

        {conteudoPagina()}
      </main>


      {alunoSelecionado && (
        <div
          className="admin-modal-fundo"
          onClick={() => setAlunoSelecionado(null)}
        >
          <section
            className="admin-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="admin-modal-topo">
              <div>
                <span>ACOMPANHAMENTO ESCOLAR</span>

                <h3>{alunoSelecionado.nome}</h3>

                <p>
                  {alunoSelecionado.disciplina}
                  {' • '}
                  {alunoSelecionado.bimestre}
                  {' Bimestre • '}
                  {alunoSelecionado.turma}
                </p>
              </div>

              <button
                type="button"
                className="admin-modal-fechar"
                onClick={() => setAlunoSelecionado(null)}
              >
                <X size={20} />
              </button>
            </header>

            <div className="admin-modal-resumo">
              <div>
                <span>Status</span>
                <strong>{alunoSelecionado.status}</strong>
              </div>

              <div>
                <span>Média</span>
                <strong>{alunoSelecionado.media}</strong>
              </div>
            </div>

            <div className="admin-detalhe">
              <h4>Descrição geral</h4>
              <p>{alunoSelecionado.descricao}</p>
            </div>

            <div className="admin-detalhe">
              <h4>Tags</h4>

              <div className="admin-tags">
                {alunoSelecionado.tags?.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </div>

            <div className="admin-detalhe">
              <h4>Situação atual</h4>
              <p>{alunoSelecionado.situacao}</p>
            </div>

            <div className="admin-detalhe">
              <h4>Pontos positivos</h4>
              <p>{alunoSelecionado.pontosPositivos}</p>
            </div>

            <div className="admin-detalhe">
              <h4>Dificuldades identificadas</h4>
              <p>{alunoSelecionado.dificuldades}</p>
            </div>

            <div className="admin-detalhe">
              <h4>Evolução no período</h4>
              <p>{alunoSelecionado.evolucao}</p>
            </div>

            <div className="admin-detalhe">
              <h4>Orientação à família</h4>
              <p>{alunoSelecionado.orientacao}</p>
            </div>

            {alunoSelecionado.motivoDevolucao && (
              <div className="admin-detalhe">
                <h4>Motivo da devolução</h4>
                <p>{alunoSelecionado.motivoDevolucao}</p>
              </div>
            )}

            <footer className="admin-modal-rodape">
              {alunoSelecionado.status !== 'Publicado' && (
                <>
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
                </>
              )}
            </footer>
          </section>
        </div>
      )}
    </div>
  )
}

export default Administrador