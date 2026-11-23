import { useEffect, useId, useState } from 'react'
import { api } from '../../servicos/api'
import { useAdmin } from './AdminContext'

export default function VinculosCadastro({ cadastro, fechar }) {
  const {
    alunos, turmas, disciplinas, alunosTurmas, vinculosProfessores,
    vinculosResponsaveis, carregarCadastros
  } = useAdmin()
  const prefixo = useId()
  const [form, setForm] = useState({})
  const [editando, setEditando] = useState(null)
  const [erro, setErro] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const { id, tipo, perfil, nome } = cadastro
  const professor = perfil === 'professor'
  const aluno = tipo === 'aluno'
  const rota = professor ? '/professores-turmas' : '/responsaveis-alunos'
  const turmaRota = turmaId => '/turmas/' + turmaId + '/alunos'
  const porId = (lista, valor) => lista.find(item => Number(item.id) === Number(valor))
  const vinculos = aluno
    ? Object.entries(alunosTurmas)
      .filter(([, lista]) => porId(lista, id))
      .map(([turmaId]) => ({ id: turmaId, turma_id: turmaId }))
    : (professor ? vinculosProfessores : vinculosResponsaveis)
      .filter(v => Number(professor ? v.professor_id : v.responsavel_id) === Number(id))

  useEffect(() => {
    function tecla(evento) {
      if (evento.key === 'Escape' && !ocupado) fechar()
    }
    document.addEventListener('keydown', tecla)
    return () => document.removeEventListener('keydown', tecla)
  }, [fechar, ocupado])

  function limpar() {
    setEditando(null)
    setForm({})
    setErro('')
  }

  async function executar(caminho, method, dados) {
    setErro('')
    setOcupado(true)
    try {
      await api(caminho, { method, ...(dados && { body: JSON.stringify(dados) }) })
      limpar()
      await carregarCadastros()
    } catch (falha) {
      setErro(falha.message)
    } finally {
      setOcupado(false)
    }
  }

  function enviar(evento) {
    evento.preventDefault()
    if (aluno) return executar(turmaRota(form.turma_id), 'POST', { aluno_id: id })
    const dados = professor
      ? { professor_id: id, turma_id: form.turma_id, disciplina_id: form.disciplina_id }
      : { responsavel_id: id, aluno_id: form.aluno_id, parentesco: form.parentesco?.trim() || null }
    return executar(editando == null ? rota : rota + '/' + editando, editando == null ? 'POST' : 'PUT', dados)
  }

  function remover(vinculo) {
    if (!window.confirm('Remover este vínculo?')) return
    void executar(aluno ? turmaRota(vinculo.turma_id) + '/' + id : rota + '/' + vinculo.id, 'DELETE')
  }

  function alterar(chave, valor) {
    setForm(anterior => ({ ...anterior, [chave]: valor }))
  }

  function campo(chave, rotulo, registros) {
    return (
      <div className="admin-campo">
        <label htmlFor={prefixo + chave}>{rotulo}</label>
        <select id={prefixo + chave} required value={form[chave] ?? ''} disabled={ocupado}
          onChange={e => alterar(chave, e.target.value)}>
          <option value="" disabled>Selecione</option>
          {registros.filter(item => Number(item.ativo) === 1).map(item => (
            <option key={item.id} value={item.id}>{item.nome}{item.ano_letivo ? ' — ' + item.ano_letivo : ''}</option>
          ))}
        </select>
      </div>
    )
  }

  return (
    <div className="admin-modal-fundo">
      <section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby={prefixo + 'titulo'}>
        <header className="admin-modal-topo">
          <h3 id={prefixo + 'titulo'}>Vínculos de {nome}</h3>
          <button className="admin-botao-secundario" type="button" disabled={ocupado} onClick={fechar}>Fechar</button>
        </header>
        <div className="admin-disciplinas-lista">
          {vinculos.length === 0 && <p>Nenhum vínculo cadastrado.</p>}
          {vinculos.map(v => (
            <div className="admin-disciplinas-item" key={v.id}>
              <span>{aluno ? porId(turmas, v.turma_id)?.nome ?? 'Turma ' + v.turma_id
                : professor ? v.turma + ' · ' + v.disciplina
                  : v.aluno + (v.parentesco ? ' · ' + v.parentesco : '')}</span>
              <div className="admin-disciplinas-item-acoes">
                {!aluno && (
                  <button type="button" className="admin-disciplinas-acao" disabled={ocupado}
                    onClick={() => { setEditando(v.id); setForm(v); setErro('') }}>Editar vínculo</button>
                )}
                <button type="button" className="admin-disciplinas-acao excluir" disabled={ocupado}
                  onClick={() => remover(v)}>Remover vínculo</button>
              </div>
            </div>
          ))}
        </div>
        <form className="admin-disciplinas-formulario" onSubmit={enviar}>
          {(professor || aluno) && campo('turma_id', 'Turma', turmas)}
          {professor && campo('disciplina_id', 'Disciplina', disciplinas)}
          {!professor && !aluno && campo('aluno_id', 'Aluno', alunos)}
          {!professor && !aluno && (
            <div className="admin-campo">
              <label htmlFor={prefixo + 'parentesco'}>Parentesco</label>
              <input id={prefixo + 'parentesco'} value={form.parentesco ?? ''} maxLength={50} disabled={ocupado}
                onChange={e => alterar('parentesco', e.target.value)} />
            </div>
          )}
          <div className="admin-disciplinas-form-acoes">
            <button type="submit" disabled={ocupado} className="admin-botao-principal">
              {editando == null ? 'Adicionar vínculo' : 'Salvar vínculo'}
            </button>
            {editando != null && (
              <button type="button" disabled={ocupado} className="admin-botao-secundario" onClick={limpar}>
                Cancelar edição
              </button>
            )}
          </div>
        </form>
        {erro && <p className="admin-erro" role="alert">{erro}</p>}
      </section>
    </div>
  )
}
