import { createElement, useEffect, useRef, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { ArrowUpRight, FileText, Shield, ShieldCheck } from 'lucide-react'
import { api } from '../servicos/api.js'
import '../paginas/PaginasLegais.css'
import './CienciaDocumentos.css'

const caminho = '/ciencia-documentos'
const versoesExibidas = {
  versaoTermos: 'termos-minuta-v1',
  versaoPrivacidade: 'privacidade-minuta-v1'
}

export default function CienciaDocumentos({ perfil, children }) {
  const [situacao, setSituacao] = useState(null)
  const [erroConsulta, setErroConsulta] = useState('')
  const [erroEnvio, setErroEnvio] = useState('')
  const [ciente, setCiente] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const titulo = useRef(null)
  const pendente = situacao?.perfil === perfil && situacao.ativo && !situacao.confirmado
  const versoesDivergentes = pendente && Object.entries(versoesExibidas)
    .some(([documento, versao]) => situacao[documento] !== versao)
  const mostrarFormulario = pendente && !versoesDivergentes

  useEffect(() => {
    const controle = new AbortController()

    api(caminho, { signal: controle.signal })
      .then(dados => {
        if (!controle.signal.aborted) setSituacao(dados)
      })
      .catch(erro => {
        if (!controle.signal.aborted) setErroConsulta(erro.message)
      })

    return () => controle.abort()
  }, [])

  useEffect(() => {
    if (mostrarFormulario) titulo.current?.focus()
  }, [mostrarFormulario])

  async function confirmar(evento) {
    evento.preventDefault()
    if (!mostrarFormulario || !ciente || enviando) return

    setErroEnvio('')
    setEnviando(true)

    try {
      const dados = await api(caminho, {
        method: 'POST',
        body: JSON.stringify({ ciente, ...versoesExibidas })
      })
      setSituacao(dados)
    } catch (erro) {
      setErroEnvio(erro.message)
    } finally {
      setEnviando(false)
    }
  }

  function sair() {
    sessionStorage.removeItem('kfka_token')
    sessionStorage.removeItem('kfka_usuario')
    window.location.replace('/login')
  }

  const mensagemConsulta = versoesDivergentes
    ? 'As versões da API não correspondem às minutas desta página. Atualize a verificação.'
    : erroConsulta

  if (situacao && situacao.perfil !== perfil) return createElement(Navigate, { to: '/login', replace: true })
  if (situacao && (situacao.ativo === false || situacao.confirmado === true)) return children

  return (
    <div className="pagina-legal ciencia-documentos-pagina">
      <main className="pagina-legal-conteudo ciencia-documentos" aria-labelledby="ciencia-documentos-titulo">
        <div className="ciencia-documentos-escudo">
          <Shield size={28} aria-hidden="true" />
        </div>
        {mostrarFormulario ? (
          <>
            <h1 id="ciencia-documentos-titulo" ref={titulo} tabIndex={-1}>Antes de continuar...</h1>
            <p className="pagina-legal-minuta">Minutas em revisão · Ambiente de teste</p>
            <p>Leia os documentos abaixo e confirme que está ciente do conteúdo para acessar a plataforma.</p>
            <ul className="ciencia-documentos-lista">
              <li>
                <a href="/termos-de-uso" target="_blank" rel="opener">
                  <FileText className="ciencia-documentos-icone" size={20} aria-hidden="true" />
                  <span>
                    <strong>Termos de Uso</strong>
                    <small>Ler em nova aba</small>
                  </span>
                  <ArrowUpRight size={17} aria-hidden="true" />
                </a>
              </li>
              <li>
                <a href="/politica-de-privacidade" target="_blank" rel="opener">
                  <ShieldCheck className="ciencia-documentos-icone" size={20} aria-hidden="true" />
                  <span>
                    <strong>Política de Privacidade</strong>
                    <small>Ler em nova aba</small>
                  </span>
                  <ArrowUpRight size={17} aria-hidden="true" />
                </a>
              </li>
            </ul>
            <form onSubmit={confirmar} aria-busy={enviando}>
              <label className="ciencia-documentos-declaracao">
                <input
                  type="checkbox"
                  checked={ciente}
                  onChange={evento => setCiente(evento.target.checked)}
                  disabled={enviando}
                  required
                />
                Estou ciente do conteúdo das duas minutas para fins de teste.
              </label>
              <button className="ciencia-documentos-confirmar" type="submit" disabled={!ciente || enviando}>
                {enviando ? 'Registrando…' : 'Confirmar e continuar'}
              </button>
            </form>
            {erroEnvio && <p role="alert">{erroEnvio}</p>}
          </>
        ) : (
          <>
            <h1 id="ciencia-documentos-titulo">Verificação de acesso</h1>
            {mensagemConsulta
              ? <p role="alert">{mensagemConsulta}</p>
              : <p role="status">Verificando a situação dos documentos…</p>}
          </>
        )}
        <div className="ciencia-documentos-acoes">
          {(mensagemConsulta || erroEnvio) && (
            <button type="button" onClick={() => window.location.reload()}>Atualizar verificação</button>
          )}
          <button type="button" onClick={sair}>Sair da conta</button>
        </div>
      </main>
    </div>
  )
}
