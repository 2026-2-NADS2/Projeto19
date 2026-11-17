import { useEffect, useState } from 'react'
import {
  Accessibility,
  Check,
  Contrast,
  EyeOff,
  Link as LinkIcon,
  Minus,
  Moon,
  Palette,
  Plus,
  RotateCcw,
  Sun,
  Type,
  X
} from 'lucide-react'

import './WidgetAcessibilidade.css'

const configuracaoInicial = {
  temaClaro: false,
  tamanhoFonte: 100,
  altoContraste: false,
  escalaCinza: false,
  sublinharLinks: false,
  reduzirMovimento: false
}

function WidgetAcessibilidade() {
  const [aberto, setAberto] = useState(false)
  const [configuracao, setConfiguracao] = useState(() => {
    try {
      const configuracaoSalva = localStorage.getItem(
        'kfka_acessibilidade'
      )

      if (!configuracaoSalva) {
        return configuracaoInicial
      }

      const configuracaoConvertida = JSON.parse(configuracaoSalva)

      return {
        ...configuracaoInicial,
        ...configuracaoConvertida,
        tamanhoFonte:
          typeof configuracaoConvertida.tamanhoFonte === 'number'
            ? configuracaoConvertida.tamanhoFonte
            : configuracaoInicial.fonteGrande
              ? 115
              : 100
      }
    } catch {
      return configuracaoInicial
    }
      })

  useEffect(() => {
    const elementoRaiz = document.documentElement

    const classes = [
      'tema-claro',
      'acessibilidade-alto-contraste',
      'acessibilidade-escala-cinza',
      'acessibilidade-sublinhar-links',
      'acessibilidade-reduzir-movimento'
    ]

    classes.forEach((classe) => {
      elementoRaiz.classList.remove(classe)
    })

    if (configuracao.temaClaro) {
      elementoRaiz.classList.add('tema-claro')
    }

elementoRaiz.style.setProperty(
  '--escala-fonte',
  configuracao.tamanhoFonte / 100
)


    if (configuracao.altoContraste) {
      elementoRaiz.classList.add('acessibilidade-alto-contraste')
    }

    if (configuracao.escalaCinza) {
      elementoRaiz.classList.add('acessibilidade-escala-cinza')
    }

    if (configuracao.sublinharLinks) {
      elementoRaiz.classList.add('acessibilidade-sublinhar-links')
    }

    if (configuracao.reduzirMovimento) {
      elementoRaiz.classList.add('acessibilidade-reduzir-movimento')
    }

    localStorage.setItem(
      'kfka_acessibilidade',
      JSON.stringify(configuracao)
    )
  }, [configuracao])

  function alternarOpcao(opcao) {
    setConfiguracao((estadoAtual) => ({
      ...estadoAtual,
      [opcao]: !estadoAtual[opcao]
    }))
  }

  function aumentarFonte() {
    setConfiguracao((estadoAtual) => ({
      ...estadoAtual,
      tamanhoFonte: Math.min(
        estadoAtual.tamanhoFonte + 10,
        130
      )
    }))
  }

  function diminuirFonte() {
    setConfiguracao((estadoAtual) => ({
      ...estadoAtual,
      tamanhoFonte: Math.max(
        estadoAtual.tamanhoFonte - 10,
        90
      )
    }))
  }

  function restaurarConfiguracao() {
    setConfiguracao(configuracaoInicial)
  }

  return (
    <div className="widget-acessibilidade">
      {aberto && (
        <section
          className="painel-acessibilidade"
          role="dialog"
          aria-modal="false"
          aria-labelledby="titulo-acessibilidade"
        >
          <div className="cabecalho-acessibilidade">
            <div>
              <span className="icone-titulo-acessibilidade">
                <Accessibility size={22} aria-hidden="true" />
              </span>

              <h2 id="titulo-acessibilidade">
                Acessibilidade
              </h2>
            </div>

            <button
              type="button"
              className="fechar-acessibilidade"
              onClick={() => setAberto(false)}
              aria-label="Fechar opções de acessibilidade"
            >
              <X size={21} aria-hidden="true" />
            </button>
          </div>

          <div className="opcoes-acessibilidade">
            <button
              type="button"
              className="opcao-acessibilidade"
              onClick={() => alternarOpcao('temaClaro')}
              aria-pressed={configuracao.temaClaro}
            >
              <span className="icone-opcao">
                {configuracao.temaClaro ? (
                  <Sun size={20} aria-hidden="true" />
                ) : (
                  <Moon size={20} aria-hidden="true" />
                )}
              </span>

              <span>
                {configuracao.temaClaro
                  ? 'Usar tema escuro'
                  : 'Usar tema claro'}
              </span>

              {configuracao.temaClaro && (
                <Check size={18} aria-hidden="true" />
              )}
            </button>

            <div className="opcao-tamanho-fonte">
              <span className="icone-opcao">
                <Type size={20} aria-hidden="true" />
              </span>

              <span className="texto-tamanho-fonte">
                Tamanho da fonte
              </span>

              <div
               className="controles-fonte"
               aria-label="Controles de tamanho da fonte"
              >
                <button
                  type="button"
                  onClick={diminuirFonte}
                  disabled={configuracao.tamanhoFonte <= 90}
                  aria-label="Diminuir tamanho da fonte"
                  title="Diminuir fonte"
                >
                  <Minus size={17} aria-hidden="true" />
                </button>

                <span
                  className="indicador-tamanho-fonte"
                  aria-live="polite"
                >
                  {configuracao.tamanhoFonte}%
                </span>

                <button
                  type="button"
                  onClick={aumentarFonte}
                  disabled={configuracao.tamanhoFonte >= 130}
                  aria-label="Aumentar tamanho da fonte"
                  title="Aumentar fonte"
                >
                  <Plus size={17} aria-hidden="true" />
                </button>
              </div>
            </div>

            <button
              type="button"
              className="opcao-acessibilidade"
              onClick={() =>
                alternarOpcao('altoContraste')
              }
              aria-pressed={configuracao.altoContraste}
            >
              <span className="icone-opcao">
                <Contrast size={20} aria-hidden="true" />
              </span>

              <span>Alto contraste</span>

              {configuracao.altoContraste && (
                <Check size={18} aria-hidden="true" />
              )}
            </button>

            <button
              type="button"
              className="opcao-acessibilidade"
              onClick={() =>
                alternarOpcao('escalaCinza')
              }
              aria-pressed={configuracao.escalaCinza}
            >
              <span className="icone-opcao">
                <EyeOff size={20} aria-hidden="true" />
              </span>

              <span>Escala de cinza</span>

              {configuracao.escalaCinza && (
                <Check size={18} aria-hidden="true" />
              )}
            </button>

            <button
              type="button"
              className="opcao-acessibilidade"
              onClick={() =>
                alternarOpcao('sublinharLinks')
              }
              aria-pressed={configuracao.sublinharLinks}
            >
              <span className="icone-opcao">
                <LinkIcon size={20} aria-hidden="true" />
              </span>

              <span>Sublinhar links</span>

              {configuracao.sublinharLinks && (
                <Check size={18} aria-hidden="true" />
              )}
            </button>

            <button
              type="button"
              className="opcao-acessibilidade"
              onClick={() =>
                alternarOpcao('reduzirMovimento')
              }
              aria-pressed={configuracao.reduzirMovimento}
            >
              <span className="icone-opcao">
                <Palette size={20} aria-hidden="true" />
              </span>

              <span>Reduzir animações</span>

              {configuracao.reduzirMovimento && (
                <Check size={18} aria-hidden="true" />
              )}
            </button>
          </div>

          <button
            type="button"
            className="botao-restaurar-acessibilidade"
            onClick={restaurarConfiguracao}
          >
            <RotateCcw size={17} aria-hidden="true" />
            Restaurar configurações
          </button>
        </section>
      )}

      <button
        type="button"
        className="botao-acessibilidade"
        onClick={() => setAberto((estadoAtual) => !estadoAtual)}
        aria-label={
          aberto
            ? 'Fechar menu de acessibilidade'
            : 'Abrir menu de acessibilidade'
        }
        aria-expanded={aberto}
      >
        {aberto ? (
          <X size={27} aria-hidden="true" />
        ) : (
          <Accessibility size={29} aria-hidden="true" />
        )}
      </button>
    </div>
  )
}

export default WidgetAcessibilidade
