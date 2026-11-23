import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { API_URL } from '../servicos/api'
import './Login.css'

export default function RecuperacaoSenha({ redefinir = false }) {
  const { hash } = useLocation()
  const token = new URLSearchParams(hash.slice(1)).get('token')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  const linkValido = !redefinir || /^[a-f0-9]{64}$/.test(token ?? '')

  async function enviar(evento) {
    evento.preventDefault()
    setErro('')

    if (redefinir && senha !== confirmacao) {
      setErro('As senhas devem ser iguais.')
      return
    }
    if (redefinir && new TextEncoder().encode(senha).length > 72) {
      setErro('O limite da senha é de 72 bytes.')
      return
    }

    setEnviando(true)
    try {
      const rota = redefinir ? 'redefinir-senha' : 'recuperar-senha'
      const resposta = await fetch(`${API_URL}/${rota}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(redefinir ? { token, senha } : { email })
      })
      const dados = await resposta.json()
      if (!resposta.ok) {
        setErro(dados.mensagem || 'Não foi possível concluir a recuperação.')
        return
      }
      setMensagem(dados.mensagem)
      setSenha('')
      setConfirmacao('')
    } catch {
      setErro('Não foi possível acessar o serviço. Tente novamente.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <main className="pagina-login pagina-recuperacao-senha">
      <section className="login-direita">
        <form className="formulario-login" onSubmit={enviar}>
          <Link to="/login" className="login-voltar">Voltar ao login</Link>
          <h1>{redefinir ? 'Redefinir senha' : 'Recuperar senha'}</h1>

          {!linkValido && (
            <p role="alert">Link inválido. <Link to="/recuperar-senha">Solicitar outro link</Link></p>
          )}

          {linkValido && !mensagem && (
            <>
              {redefinir ? (
                <>
                  <label htmlFor="nova-senha">Nova senha</label>
                  <div className="campo-login">
                    <input id="nova-senha" type="password" autoComplete="new-password"
                      required minLength={8} value={senha} onChange={e => setSenha(e.target.value)} />
                  </div>
                  <label htmlFor="confirmar-senha">Confirme a nova senha</label>
                  <div className="campo-login">
                    <input id="confirmar-senha" type="password" autoComplete="new-password"
                      required minLength={8} value={confirmacao} onChange={e => setConfirmacao(e.target.value)} />
                  </div>
                </>
              ) : (
                <>
                  <p>Em produção, procure a administração da sua escola para recuperar o acesso.</p>
                  <label htmlFor="email-recuperacao">E-mail cadastrado</label>
                  <div className="campo-login">
                    <input id="email-recuperacao" type="email" autoComplete="email"
                      required maxLength={150} value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                </>
              )}

              {erro && <p className="erro-login" role="alert">{erro}</p>}
              <button className="botao-login" type="submit" disabled={enviando}>
                {redefinir ? 'Salvar nova senha' : 'Solicitar recuperação'}
              </button>
              {erro && redefinir && <Link to="/recuperar-senha">Solicitar outro link</Link>}
            </>
          )}

          {mensagem && <p role="status">{mensagem}</p>}
        </form>
      </section>
    </main>
  )
}
