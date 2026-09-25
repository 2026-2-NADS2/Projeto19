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

  return (
    <main className="pagina-login">

      <section className="login-esquerda">

        <h2 className="login-logo">
          K<span>F</span>KA
        </h2>

        <div className="conteudo-login-esquerda">

          <h1>
            Acompanhar de perto
            <span>faz a diferença.</span>
          </h1>

          <p>
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

          <h1>Bem-vindo de volta!</h1>

          <p className="subtitulo-login">
            Faça Login na sua conta KFKA.
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

            <a href="#">
              Esqueci minha senha
            </a>

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
            Entrar ›
          </button>

          <div className="login-demonstracao">

            <span>
              Acessos para demonstração
            </span>

            <p>
              <strong>Professor:</strong>{' '}
              professor@kfka.com
            </p>

            <p>
              <strong>Administrador:</strong>{' '}
              admin@kfka.com
            </p>

            <p>
              <strong>Responsável:</strong>{' '}
              responsavel@kfka.com
            </p>

            <small>
              Senha para todos:{' '}
              <strong>kfka1234</strong>
            </small>

          </div>

          <p className="ou-login">
            ou
          </p>

          <button
            className="botao-cadastro"
            type="button"
          >
            Cadastre-se
          </button>

        </form>

      </section>

    </main>
  )
}

export default Login