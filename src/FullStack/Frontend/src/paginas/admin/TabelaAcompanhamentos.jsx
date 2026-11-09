
import { Eye } from 'lucide-react'
import { useAdmin } from './AdminContext'

export default function TabelaAcompanhamentos({
  lista = [],
  mostrarAcoes = false
}) {
  const {
    setAlunoSelecionado,
    abrirDevolucao,
    publicarAcompanhamento,
    classeStatus
  } = useAdmin()

  function abrirFormularioDevolucao(item) {
    setAlunoSelecionado(item)
    abrirDevolucao()
  }

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
          {lista.map(item => (
            <tr key={item.id}>
              <td>
                <strong>{item.nome}</strong>
              </td>

              <td>{item.turma}</td>
              <td>{item.disciplina}</td>
              <td>{item.bimestre}</td>

              <td>
                <span
                  className={`admin-badge ${classeStatus(item.status)}`}
                >
                  {item.status}
                </span>
              </td>

              {mostrarAcoes && (
                <td>
                  <div className="admin-acoes">
                    <button
                      type="button"
                      className="admin-botao-secundario"
                      onClick={() => setAlunoSelecionado(item)}
                    >
                      <Eye size={15} /> Ver
                    </button>

                    {item.status === 'Enviado para revisão' && (
                      <>
                        <button
                          type="button"
                          className="admin-botao-principal pequeno"
                          onClick={() =>
                            publicarAcompanhamento(item.id)
                          }
                        >
                          Publicar
                        </button>

                        <button
                          type="button"
                          className="admin-botao-secundario"
                          onClick={() =>
                            abrirFormularioDevolucao(item)
                          }
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

          {!lista.length && (
            <tr>
              <td colSpan={mostrarAcoes ? 6 : 5}>
                Nenhum acompanhamento encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
