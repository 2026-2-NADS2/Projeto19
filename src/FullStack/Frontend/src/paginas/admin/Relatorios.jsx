
import { useState } from 'react'
import { Download } from 'lucide-react'
import { useAdmin } from './AdminContext'
import CabecalhoPagina from './CabecalhoPagina'
import TabelaAcompanhamentos from './TabelaAcompanhamentos'

function nomeDe(valor) {
  if (typeof valor === 'string') return valor
  return valor?.nome || ''
}

function textoSeguro(valor) {
  if (valor === null || valor === undefined) return ''

  const texto = String(valor)

  // Evita interpretação de fórmulas pelo Excel.
  if (/^[\s]*[=+\-@]/.test(texto)) {
    return `'${texto}`
  }

  return texto
}

function celulaCsv(valor) {
  const texto = textoSeguro(valor)
    .replace(/\r?\n/g, ' ')
    .replace(/"/g, '""')

  return `"${texto}"`
}

function extrairDescricao(valor) {
  if (!valor) return ''

  if (typeof valor !== 'string') {
    return valor?.descricao || ''
  }

  try {
    const dados = JSON.parse(valor)

    if (dados && typeof dados === 'object') {
      return dados.descricao || ''
    }
  } catch {
    return valor
  }

  return ''
}

function formatarData(valor) {
  if (!valor) return ''

  const data = new Date(valor)

  return Number.isNaN(data.getTime())
    ? ''
    : data.toLocaleDateString('pt-BR')
}

function exportarCsv(registros) {
  const colunas = [
    'ID',
    'Aluno',
    'Turma',
    'Disciplina',
    'Professor',
    'Bimestre',
    'Média',
    'Status',
    'Descrição',
    'Data de criação',
    'Data de publicação'
  ]

  const linhas = registros.map(item => [
    item.id,
    item.nome || nomeDe(item.aluno),
    item.turma || nomeDe(item.turma),
    item.disciplina || nomeDe(item.disciplina),
    item.professor_nome || nomeDe(item.professor),
    item.bimestre || nomeDe(item.periodo),
    item.media === null || item.media === undefined
      ? ''
      : Number(item.media).toLocaleString('pt-BR', {
        maximumFractionDigits: 2
      }),
    item.status || '',
    extrairDescricao(item.descricao),
    formatarData(item.criado_em),
    formatarData(item.publicado_em || item.data_publicacao)
  ])

  const conteudo = [
    colunas.map(celulaCsv).join(';'),
    ...linhas.map(linha => linha.map(celulaCsv).join(';'))
  ].join('\r\n')

  // BOM UTF-8 permite abrir acentos corretamente no Excel.
  const arquivo = new Blob(
    ['\uFEFF', conteudo],
    { type: 'text/csv;charset=utf-8;' }
  )

  const url = URL.createObjectURL(arquivo)
  const link = document.createElement('a')

  link.href = url
  link.download = `KFKA_Relatorios_${new Date()
    .toISOString()
    .slice(0, 10)}.csv`

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export default function Relatorios() {
  const {
    filtros,
    setFiltros,
    alunosFiltrados,
    disciplinas
  } = useAdmin()

  const [mensagem, setMensagem] = useState('')

  const alterar = (campo, valor) => {
    setMensagem('')
    setFiltros(anterior => ({
      ...anterior,
      [campo]: valor
    }))
  }

  function baixarRelatorio() {
    if (alunosFiltrados.length === 0) {
      setMensagem('Não existem registros para exportar.')
      return
    }

    try {
      exportarCsv(alunosFiltrados)
      setMensagem(
        `${alunosFiltrados.length} registro(s) preparado(s) para exportação.`
      )
    } catch {
      setMensagem('Não foi possível gerar o arquivo CSV.')
    }
  }

  return (
    <>
      <CabecalhoPagina
        titulo="Relatórios"
        descricao="Consulte acompanhamentos, filtre os resultados e exporte para Excel."
      />

      <section className="admin-painel">
        <div className="admin-painel-topo">
          <div>
            <span>CONSULTA</span>
            <h3>Relatório de acompanhamentos</h3>
          </div>

          <button
            type="button"
            className="admin-botao-principal"
            onClick={baixarRelatorio}
            disabled={alunosFiltrados.length === 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Download size={17} />
            Exportar para Excel
          </button>
        </div>

        <div className="admin-filtros">
          <div className="admin-campo">
            <label>Aluno</label>
            <input
              value={filtros.aluno}
              onChange={e => alterar('aluno', e.target.value)}
              placeholder="Pesquisar aluno"
            />
          </div>

          <div className="admin-campo">
            <label>Disciplina</label>
            <select
              value={filtros.disciplina}
              onChange={e => alterar('disciplina', e.target.value)}
            >
              <option value="">Todas</option>
              {disciplinas.map(d => (
                <option key={d.id} value={d.nome}>
                  {d.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-campo">
            <label>Bimestre</label>
            <select
              value={filtros.bimestre}
              onChange={e => alterar('bimestre', e.target.value)}
            >
              <option value="">Todos</option>
              {[1, 2, 3, 4].map(n => (
                <option key={n} value={`${n}º Bimestre`}>
                  {n}º Bimestre
                </option>
              ))}
            </select>
          </div>

          <div className="admin-campo">
            <label>Status</label>
            <select
              value={filtros.status}
              onChange={e => alterar('status', e.target.value)}
            >
              <option value="">Todos</option>
              <option value="Rascunho">Rascunho</option>
              <option value="Enviado para revisão">
                Enviado para revisão
              </option>
              <option value="Devolvido">Devolvido</option>
              <option value="Publicado">Publicado</option>
            </select>
          </div>
        </div>

        {mensagem && (
          <p
            role="status"
            style={{
              margin: '12px 0',
              color: '#c4a3e7',
              fontSize: '13px'
            }}
          >
            {mensagem}
          </p>
        )}

        <TabelaAcompanhamentos lista={alunosFiltrados} />
      </section>
    </>
  )
}
