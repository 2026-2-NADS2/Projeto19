
import { jsPDF } from 'jspdf'

// Converte valores vazios em texto legível
function texto(valor) {
    if (valor === null || valor === undefined || valor === '') {
        return 'Não informado'
    }

    return String(valor)
}

// Gera o relatório do acompanhamento publicado
export function gerarPdfAcompanhamento(acompanhamento, aluno) {
    if (!acompanhamento || !aluno) {
        throw new Error('Dados insuficientes para gerar o PDF.')
    }

    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    })

    const largura = pdf.internal.pageSize.getWidth()
    const altura = pdf.internal.pageSize.getHeight()
    const margem = 20
    const larguraTexto = largura - margem * 2

    let y = 20
    let pagina = 1

    // Cabeçalho em todas as páginas
    function cabecalho() {
        pdf.setFillColor(36, 0, 61)
        pdf.rect(0, 0, largura, 32, 'F')

        pdf.setTextColor(255, 255, 255)
        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(20)
        pdf.text('KFKA', margem, 20)

        pdf.setFontSize(9)
        pdf.setFont('helvetica', 'normal')
        pdf.text('ACOMPANHAMENTO ESCOLAR', largura - margem, 19, {
            align: 'right'
        })

        y = 44
    }

    // Rodapé em todas as páginas
    function rodape() {
        pdf.setDrawColor(220, 210, 230)
        pdf.line(margem, altura - 18, largura - margem, altura - 18)

        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(8)
        pdf.setTextColor(110, 100, 120)

        pdf.text(
            'KFKA - Plataforma de acompanhamento escolar',
            margem,
            altura - 12
        )

        pdf.text(
            `Página ${pagina}`,
            largura - margem,
            altura - 12,
            { align: 'right' }
        )
    }

    // Adiciona página quando o conteúdo ultrapassa o limite
    function verificarEspaco(necessario = 15) {
        if (y + necessario > altura - 25) {
            rodape()
            pdf.addPage()
            pagina++
            cabecalho()
        }
    }

    // Adiciona título de seção
    function secao(titulo) {
        verificarEspaco(20)

        pdf.setFillColor(245, 239, 250)
        pdf.roundedRect(margem, y, larguraTexto, 10, 2, 2, 'F')

        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(11)
        pdf.setTextColor(80, 35, 130)

        pdf.text(titulo, margem + 4, y + 6.5)

        y += 16
    }

    // Adiciona informações simples
    function informacao(rotulo, valor) {
        const linhas = pdf.splitTextToSize(
            texto(valor),
            larguraTexto
        )

        verificarEspaco(8 + linhas.length * 5)

        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(9)
        pdf.setTextColor(85, 65, 105)
        pdf.text(`${rotulo}:`, margem, y)

        y += 5

        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(10)
        pdf.setTextColor(40, 35, 45)

        for (const linha of linhas) {
            verificarEspaco(6)
            pdf.text(linha, margem, y)
            y += 5
        }

        y += 4
    }

    // Adiciona parágrafos longos, com quebra de página
    function paragrafo(titulo, conteudo) {
        verificarEspaco(16)

        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(10)
        pdf.setTextColor(80, 35, 130)
        pdf.text(titulo, margem, y)

        y += 7

        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(10)
        pdf.setTextColor(50, 45, 55)

        const linhas = pdf.splitTextToSize(
            texto(conteudo),
            larguraTexto
        )

        for (const linha of linhas) {
            verificarEspaco(6)
            pdf.text(linha, margem, y)
            y += 5.5
        }

        y += 9
    }

    // Início do documento
    cabecalho()

    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(16)
    pdf.setTextColor(45, 20, 70)
    pdf.text('Relatório de acompanhamento', margem, y)

    y += 9

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)
    pdf.setTextColor(110, 100, 120)
    pdf.text(
        `Emitido em ${new Date().toLocaleDateString('pt-BR')}`,
        margem,
        y
    )

    y += 12

    secao('DADOS DO ALUNO')

    informacao('Aluno', aluno.nome)
    informacao('Turma', aluno.turma)
    informacao('Ano letivo', acompanhamento.ano || aluno.ano_letivo)

    secao('DADOS DO ACOMPANHAMENTO')

    informacao('Disciplina', acompanhamento.disciplina)
    informacao('Professor', acompanhamento.professor)
    informacao('Período', acompanhamento.bimestre)
    informacao('Média', acompanhamento.media)
    informacao('Situação', acompanhamento.situacao)
    informacao('Data da publicação', acompanhamento.dataPublicacao)

    secao('DESENVOLVIMENTO ESCOLAR')

    paragrafo('Descrição geral', acompanhamento.descricao)
    paragrafo('Pontos positivos', acompanhamento.pontosPositivos)
    paragrafo('Dificuldades identificadas', acompanhamento.dificuldades)
    paragrafo('Evolução no período', acompanhamento.evolucao)
    paragrafo('Orientações à família', acompanhamento.orientacao)

    rodape()

    // Nome seguro para salvar o arquivo
    const nomeAluno = texto(aluno.nome)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9_-]+/g, '_')

    const disciplina = texto(acompanhamento.disciplina)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9_-]+/g, '_')

    pdf.save(`KFKA_${nomeAluno}_${disciplina}.pdf`)
}
