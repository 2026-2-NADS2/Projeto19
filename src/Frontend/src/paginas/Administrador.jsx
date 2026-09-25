import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import {
  LayoutDashboard,
  Tag,
  CalendarDays,
  ChartNoAxesCombined,
  Users,
  BookOpen,
  UserRound,
  ChevronDown,
  ArrowLeft
} from 'lucide-react'

import { buscarAlunos } from '../servicos/alunoService'
import './Administrador.css'

function Administrador() {
  const [alunos, setAlunos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    async function carregarAlunos() {
      try {
        const dados = await buscarAlunos()
        setAlunos(dados)
      } catch {
        setErro('Não foi possível carregar os alunos.')
      } finally {
        setCarregando(false)
      }
    }

    carregarAlunos()
  }, [])

  const enviados = alunos.filter(
    (aluno) => aluno.status === 'Enviado'
  ).length

  const emRevisao = alunos.filter(
    (aluno) => aluno.status === 'Em Revisão'
  ).length

  const devolvidos = alunos.filter(
    (aluno) => aluno.status === 'Devolvido'
  ).length

  const publicados = alunos.filter(
    (aluno) => aluno.status === 'Publicado'
  ).length

  return (
    <div className="admin">

      <aside className="admin-sidebar">

        <h1 className="admin-logo">
          K<span>F</span>KA
        </h1>

        <nav className="admin-menu">

          <a className="admin-menu-ativo" href="#">
            <LayoutDashboard size={20} />
            Dashboard
          </a>

          <a href="#">
            <Tag size={20} />
            Gerenciar tags
          </a>

          <a href="#">
            <CalendarDays size={20} />
            Períodos letivos
          </a>

          <a href="#">
            <ChartNoAxesCombined size={20} />
            Relatórios
          </a>

          <a href="#">
            <Users size={20} />
            Gestão de usuários
          </a>

          <a href="#">
            <BookOpen size={20} />
            Áreas e disciplinas
          </a>

        </nav>

      </aside>

      <main className="admin-conteudo">

        <Link to="/" className="admin-voltar">
          <ArrowLeft size={18} />
          Voltar
        </Link>

        <header className="admin-topo">

          <h2>Dashboard</h2>

          <div className="admin-usuario">

            <UserRound size={25} />

            <div>
              <strong>Administrador</strong>
              <span>Administrador</span>
            </div>

            <ChevronDown size={18} />

          </div>

        </header>

        <section className="admin-cards">

          <div className="admin-card">
            <span>Total de alunos</span>
            <strong>{alunos.length}</strong>
          </div>

          <div className="admin-card">
            <span>Total de professores</span>
            <strong>24</strong>
          </div>

          <div className="admin-card">
            <span>Total de turmas</span>
            <strong>18</strong>
          </div>

        </section>

        <section className="admin-status">

          <div>
            <span>Aguardando revisão</span>
            <strong>{enviados}</strong>
          </div>

          <div>
            <span>Em revisão</span>
            <strong>{emRevisao}</strong>
          </div>

          <div>
            <span>Devolvidos</span>
            <strong>{devolvidos}</strong>
          </div>

          <div>
            <span>Publicados</span>
            <strong>{publicados}</strong>
          </div>

        </section>

        <section className="admin-tabela-container">

          <h3>Acompanhamentos para revisão</h3>

          {carregando && (
            <p>Carregando...</p>
          )}

          {erro && (
            <p className="admin-erro">
              {erro}
            </p>
          )}

          {!carregando && !erro && (

            <table className="admin-tabela">

              <thead>
                <tr>
                  <th>Aluno</th>
                  <th>Turma</th>
                  <th>Disciplina</th>
                  <th>Bimestre</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>

                {alunos.map((aluno) => (

                  <tr key={aluno.id}>

                    <td>{aluno.nome}</td>

                    <td>{aluno.turma}</td>

                    <td>{aluno.disciplina}</td>

                    <td>{aluno.bimestre}</td>

                    <td>
                      <span className="admin-badge">
                        {aluno.status}
                      </span>
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          )}

        </section>

      </main>

    </div>
  )
}

export default Administrador