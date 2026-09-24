import { useState } from 'react'
import { Mail, LockKeyhole, Eye } from 'lucide-react'
import './Login.css'

function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')

  function fazerLogin(evento) {
    evento.preventDefault()

    if (email === '' || senha === '') {
      setErro('Preencha o email e a senha.')
      return
    }

    setErro('')
    alert('Login realizado!')
  }

  return (
    <main className="pagina-login">

      <section className="login-esquerda">
        <div className="conteudo-login-esquerda">
          <h2>KFKA</h2>

          <h1>
            Seu Progresso<br />
            <span>começa aqui.</span>
          </h1>

          <p>
            Acesse sua conta e continue<br />
            aprendendo, criando e<br />
            evoluindo no seu ritmo.
          </p>
        </div>
      </section>

      <section className="login-direita">
        <form className="formulario-login" onSubmit={fazerLogin}>

          <h1>Bem-vindo de volta!</h1>
          <p className="subtitulo-login">Faça Login na sua conta KFKA.</p>

          <label htmlFor="email">Email</label>

          <div className="campo-login">
            <Mail size={17} />

            <input
              id="email"
              type="email"
              value={email}
              onChange={(evento) => setEmail(evento.target.value)}
            />
          </div>

          <label htmlFor="senha">Senha</label>

          <div className="campo-login">
            <LockKeyhole size={17} />

            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(evento) => setSenha(evento.target.value)}
            />

            <Eye size={17} />
          </div>

          <div className="opcoes-login">
            <label className="lembrar-login">
              <input type="checkbox" />
              Lembrar de mim
            </label>

            <a href="#">Esqueci minha senha</a>
          </div>

          {erro && <p className="erro-login">{erro}</p>}

          <button className="botao-login" type="submit">
            Entrar ›
          </button>

          <p className="ou-login">ou</p>

          <button className="botao-cadastro" type="button">
            Cadastre-se
          </button>

        </form>
      </section>

    </main>
  )
}

export default Login