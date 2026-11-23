import { useEffect, useId, useState } from 'react'

function normalizar(valor) {
  return valor.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim()
}

export default function BuscaAluno({ alunos, selecionado, aoSelecionar }) {
  const id = useId()
  const [busca, setBusca] = useState('')
  const [aberto, setAberto] = useState(false)
  const [ativo, setAtivo] = useState(-1)
  const resultados = alunos.filter(aluno => normalizar(aluno.nome).includes(normalizar(busca)))
  const opcaoAtiva = aberto && resultados[ativo] ? `${id}-opcao-${ativo}` : undefined

  useEffect(() => {
    if (opcaoAtiva) document.getElementById(opcaoAtiva)?.scrollIntoView({ block: 'nearest' })
  }, [opcaoAtiva])

  function fechar() {
    setAberto(false)
    setBusca('')
    setAtivo(-1)
  }

  function escolher(aluno) {
    aoSelecionar(aluno)
    fechar()
  }

  function navegar(evento) {
    if (evento.key === 'Escape' && aberto) {
      evento.preventDefault()
      fechar()
    } else if (evento.key === 'Enter' && aberto) {
      evento.preventDefault()
      if (resultados[ativo]) escolher(resultados[ativo])
    } else if (evento.key === 'ArrowDown' || evento.key === 'ArrowUp') {
      evento.preventDefault()
      setAberto(true)
      if (!resultados.length) return
      const direcao = evento.key === 'ArrowDown' ? 1 : -1
      const inicio = ativo < 0 && direcao < 0 ? 0 : ativo
      setAtivo((inicio + direcao + resultados.length) % resultados.length)
    }
  }

  return (
    <div className="professor-campo professor-busca-aluno">
      <label htmlFor={id}>Aluno *</label>
      <input
        id={id}
        role="combobox"
        type="text"
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={aberto}
        aria-controls={`${id}-lista`}
        aria-activedescendant={opcaoAtiva}
        aria-required="true"
        placeholder="Digite o nome do aluno"
        value={aberto ? busca : selecionado?.nome ?? ''}
        onFocus={() => setAberto(true)}
        onClick={() => setAberto(true)}
        onBlur={fechar}
        onChange={evento => {
          setBusca(evento.target.value)
          setAtivo(-1)
          setAberto(true)
        }}
        onKeyDown={navegar}
      />
      {aberto && selecionado && (
        <small className="professor-busca-atual">Selecionado: {selecionado.nome} · {selecionado.turma}</small>
      )}
      <div className="professor-busca-resultados" hidden={!aberto}>
        <ul id={`${id}-lista`} role="listbox" aria-label="Alunos disponíveis">
          {resultados.map((aluno, indice) => (
            <li
              key={`${aluno.id}-${aluno.turmaId}`}
              id={`${id}-opcao-${indice}`}
              role="option"
              aria-selected={aluno.id === selecionado?.id && aluno.turmaId === selecionado?.turmaId}
              data-ativo={indice === ativo}
              onMouseDown={evento => evento.preventDefault()}
              onClick={() => escolher(aluno)}
            >
              <strong>{aluno.nome}</strong>
              <small>{aluno.turma} · {aluno.ano}</small>
            </li>
          ))}
        </ul>
        {!resultados.length && <p role="status">Nenhum aluno encontrado para este filtro.</p>}
      </div>
    </div>
  )
}
