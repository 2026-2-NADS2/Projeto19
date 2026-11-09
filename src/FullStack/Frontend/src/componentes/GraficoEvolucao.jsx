
import { useMemo, useState } from 'react'
import { TrendingUp } from 'lucide-react'

const CORES = [
    '#b77aff',
    '#42c6b5',
    '#ffba69',
    '#74aaff',
    '#ff82b2',
    '#c5d46b'
]

function numeroBimestre(valor) {
    const texto = String(valor || '').toLowerCase()

    const numero = texto.match(/[1-4]/)

    return numero ? Number(numero[0]) : null
}

function formatarMedia(valor) {
    return Number(valor).toLocaleString('pt-BR', {
        maximumFractionDigits: 2
    })
}

export default function GraficoEvolucao({ acompanhamentos = [] }) {
    const [anoSelecionado, setAnoSelecionado] = useState('Todos')

    const anos = useMemo(() => {
        return [...new Set(
            acompanhamentos
                .map(item => String(item.ano || ''))
                .filter(Boolean)
        )].sort((a, b) => b.localeCompare(a))
    }, [acompanhamentos])

    const dados = useMemo(() => {
        const registros = acompanhamentos.filter(item => {
            const media = Number(item.media)

            return (
                item.media !== null &&
                item.media !== undefined &&
                item.media !== '' &&
                Number.isFinite(media) &&
                media >= 0 &&
                media <= 10 &&
                numeroBimestre(item.bimestre) !== null &&
                (
                    anoSelecionado === 'Todos' ||
                    String(item.ano) === anoSelecionado
                )
            )
        })

        const grupos = {}

        for (const item of registros) {
            const ano = String(item.ano || 'Não informado')
            const disciplina = item.disciplina || 'Sem disciplina'
            const chave = `${ano}::${disciplina}`

            if (!grupos[chave]) {
                grupos[chave] = {
                    chave,
                    ano,
                    disciplina,
                    pontos: {}
                }
            }

            const bimestre = numeroBimestre(item.bimestre)

            if (!grupos[chave].pontos[bimestre]) {
                grupos[chave].pontos[bimestre] = []
            }

            grupos[chave].pontos[bimestre].push(Number(item.media))
        }

        return Object.values(grupos).map(grupo => ({
            ...grupo,
            pontos: Object.entries(grupo.pontos)
                .map(([bimestre, medias]) => ({
                    bimestre: Number(bimestre),
                    media: medias.reduce((soma, valor) => soma + valor, 0)
                        / medias.length
                }))
                .sort((a, b) => a.bimestre - b.bimestre)
        }))
    }, [acompanhamentos, anoSelecionado])

    const largura = 760
    const altura = 300
    const esquerda = 55
    const direita = 25
    const topo = 30
    const baixo = 45

    const areaLargura = largura - esquerda - direita
    const areaAltura = altura - topo - baixo

    function posicaoX(bimestre) {
        return esquerda + ((bimestre - 1) / 3) * areaLargura
    }

    function posicaoY(media) {
        return topo + areaAltura - (media / 10) * areaAltura
    }

    const temDados = dados.length > 0

    return (
        <div
            style={{
                padding: '22px',
                border: '1px solid var(--borda)',
                borderRadius: '12px',
                background: 'var(--painel-secundario)'
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    flexWrap: 'wrap',
                    marginBottom: '20px'
                }}
            >
                <div>
                    <strong
                        style={{
                            color: 'var(--texto)',
                            fontSize: '16px'
                        }}
                    >
                        Médias por bimestre
                    </strong>

                    <p
                        style={{
                            color: 'var(--texto-secundario)',
                            fontSize: '12px',
                            marginTop: '6px'
                        }}
                    >
                        Dados dos acompanhamentos publicados
                    </p>
                </div>

                <select
                    aria-label="Filtrar ano letivo do gráfico"
                    value={anoSelecionado}
                    onChange={e => setAnoSelecionado(e.target.value)}
                    style={{
                        padding: '10px 12px',
                        background: 'var(--campo)',
                        border: '1px solid var(--borda)',
                        borderRadius: '8px',
                        color: 'var(--texto)'
                    }}
                >
                    <option value="Todos">Todos os anos</option>

                    {anos.map(ano => (
                        <option key={ano} value={ano}>
                            {ano}
                        </option>
                    ))}
                </select>
            </div>

            {!temDados ? (
                <div
                    style={{
                        padding: '45px 20px',
                        textAlign: 'center',
                        color: 'var(--texto-secundario)'
                    }}
                >
                    <TrendingUp size={30} style={{ marginBottom: '12px' }} />

                    <p>
                        Ainda não existem médias publicadas
                        para gerar o gráfico.
                    </p>
                </div>
            ) : (
                <>
                    <div style={{ width: '100%', overflowX: 'auto' }}>
                        <svg
                            viewBox={`0 0 ${largura} ${altura}`}
                            role="img"
                            aria-label="Gráfico de evolução das médias por bimestre"
                            style={{
                                width: '100%',
                                minWidth: '430px',
                                height: 'auto',
                                display: 'block'
                            }}
                        >
                            {[0, 2, 4, 6, 8, 10].map(valor => {
                                const y = posicaoY(valor)

                                return (
                                    <g key={valor}>
                                        <line
                                            x1={esquerda}
                                            y1={y}
                                            x2={largura - direita}
                                            y2={y}
                                            stroke="currentColor"
                                            strokeOpacity="0.13"
                                            strokeDasharray="4 5"
                                        />

                                        <text
                                            x={esquerda - 15}
                                            y={y + 4}
                                            fill="currentColor"
                                            opacity="0.7"
                                            fontSize="12"
                                            textAnchor="end"
                                        >
                                            {valor}
                                        </text>
                                    </g>
                                )
                            })}

                            {[1, 2, 3, 4].map(bimestre => (
                                <text
                                    key={bimestre}
                                    x={posicaoX(bimestre)}
                                    y={altura - 15}
                                    fill="currentColor"
                                    opacity="0.8"
                                    fontSize="12"
                                    textAnchor="middle"
                                >
                                    {bimestre}º Bimestre
                                </text>
                            ))}

                            {dados.map((grupo, indice) => {
                                const cor = CORES[indice % CORES.length]

                                const caminho = grupo.pontos
                                    .map((ponto, i) => {
                                        const x = posicaoX(ponto.bimestre)
                                        const y = posicaoY(ponto.media)

                                        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
                                    })
                                    .join(' ')

                                return (
                                    <g key={grupo.chave}>
                                        {grupo.pontos.length > 1 && (
                                            <path
                                                d={caminho}
                                                fill="none"
                                                stroke={cor}
                                                strokeWidth="3"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        )}

                                        {grupo.pontos.map(ponto => (
                                            <g key={ponto.bimestre}>
                                                <circle
                                                    cx={posicaoX(ponto.bimestre)}
                                                    cy={posicaoY(ponto.media)}
                                                    r="5"
                                                    fill={cor}
                                                    stroke="#fff"
                                                    strokeWidth="1.5"
                                                >
                                                    <title>
                                                        {grupo.disciplina} - {grupo.ano} -
                                                        {' '}{ponto.bimestre}º bimestre:
                                                        {' '}{formatarMedia(ponto.media)}
                                                    </title>
                                                </circle>

                                                <text
                                                    x={posicaoX(ponto.bimestre)}
                                                    y={posicaoY(ponto.media) - 13}
                                                    fill={cor}
                                                    fontSize="12"
                                                    fontWeight="bold"
                                                    textAnchor="middle"
                                                >
                                                    {formatarMedia(ponto.media)}
                                                </text>
                                            </g>
                                        ))}
                                    </g>
                                )
                            })}
                        </svg>
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '12px 20px',
                            marginTop: '15px'
                        }}
                    >
                        {dados.map((grupo, indice) => (
                            <div
                                key={grupo.chave}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '7px',
                                    color: 'var(--texto)',
                                    fontSize: '12px'
                                }}
                            >
                                <span
                                    style={{
                                        width: '10px',
                                        height: '10px',
                                        borderRadius: '50%',
                                        background: CORES[indice % CORES.length]
                                    }}
                                />

                                {grupo.disciplina} ({grupo.ano})
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
