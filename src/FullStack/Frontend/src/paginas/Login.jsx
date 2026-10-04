import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowLeft
} from 'lucide-react'

import './Login.css'

function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)

  const navigate = useNavigate()

  const usuarios = {
    'professor@kfka.com': {
      senha: 'kfka1234',
      rota: '/professor'
    },

    'admin@kfka.com': {
      senha: 'kfka1234',
      rota: '/administrador'
    },

    'responsavel@kfka.com': {
      senha: 'kfka1234',
      rota: '/responsavel'
    }
  }

  function fazerLogin(evento) {
    evento.preventDefault()

    if (email.trim() === '' || senha.trim() === '') {
      setErro('Preencha o email e a senha.')
      return
    }

    const usuario = usuarios[email.toLowerCase().trim()]

    if (!usuario || usuario.senha !== senha) {
      setErro('Email ou senha inválidos.')
      return
    }

    setErro('')
    navigate(usuario.rota)
  }

  function preencherAcesso(emailDemonstracao) {
    setEmail(emailDemonstracao)
    setSenha('kfka1234')
    setErro('')
  }

  return (
    <main className="pagina-login">

      <section className="login-esquerda">

        <Link to="/" className="login-logo">
          K<span>F</span>KA
        </Link>

        <div className="conteudo-login-esquerda">

          <p className="login-etiqueta">
            ACOMPANHAMENTO ESCOLAR
          </p>

          <h1>
            Acompanhar de perto
            <span>faz a diferença.</span>
          </h1>

          <p className="login-descricao">
            Conectando escola e família para um
            acompanhamento escolar mais próximo,
            claro e organizado.
          </p>

        </div>

      </section>


      <section className="login-direita">

        <form
          className="formulario-login"
          onSubmit={fazerLogin}
        >

          <Link to="/" className="login-voltar">
            <ArrowLeft size={18} />
            Voltar ao início
          </Link>

          <p className="login-form-etiqueta">
            ACESSO À PLATAFORMA
          </p>

          <h1>Bem-vindo!</h1>

          <p className="subtitulo-login">
            Entre com sua conta para acessar seu perfil.
          </p>


          <label htmlFor="email">
            Email
          </label>

          <div className="campo-login">

            <Mail size={17} />

            <input
              id="email"
              type="email"
              value={email}
              onChange={(evento) =>
                setEmail(evento.target.value)
              }
              placeholder="Digite seu email"
              autoComplete="email"
            />

          </div>


          <label htmlFor="senha">
            Senha
          </label>

          <div className="campo-login">

            <LockKeyhole size={17} />

            <input
              id="senha"
              type={mostrarSenha ? 'text' : 'password'}
              value={senha}
              onChange={(evento) =>
                setSenha(evento.target.value)
              }
              placeholder="Digite sua senha"
              autoComplete="current-password"
            />

            <button
              type="button"
              className="mostrar-senha"
              onClick={() =>
                setMostrarSenha(!mostrarSenha)
              }
              aria-label={
                mostrarSenha
                  ? 'Ocultar senha'
                  : 'Mostrar senha'
              }
            >
              {mostrarSenha ? (
                <EyeOff size={17} />
              ) : (
                <Eye size={17} />
              )}
            </button>

          </div>


          <div className="opcoes-login">

            <label className="lembrar-login">
              <input type="checkbox" />
              Lembrar de mim
            </label>

            <span>
              Acesso demonstrativo
            </span>

          </div>


          {erro && (
            <p className="erro-login">
              {erro}
            </p>
          )}


          <button
            className="botao-login"
            type="submit"
          >
            Entrar
          </button>


          <div className="login-demonstracao">

            <span>
              Acessos para demonstração
            </span>

            <button
              type="button"
              onClick={() =>
                preencherAcesso('professor@kfka.com')
              }
            >
              <strong>Professor</strong>
              <small>professor@kfka.com</small>
            </button>

            <button
              type="button"
              onClick={() =>
                preencherAcesso('admin@kfka.com')
              }
            >
              <strong>Administrador</strong>
              <small>admin@kfka.com</small>
            </button>

            <button
              type="button"
              onClick={() =>
                preencherAcesso('responsavel@kfka.com')
              }
            >
              <strong>Responsável</strong>
              <small>responsavel@kfka.com</small>
            </button>

            <p className="senha-demonstracao">
              Senha para todos:
              <strong> kfka1234</strong>
            </p>

          </div>

        </form>

      </section>

    </main>
  )
}

export default Login