import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowLeft
} from 'lucide-react'

import './Login.css'

function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [mostrarRecuperacao, setMostrarRecuperacao] = useState(false)

  // Verifica se o usuário foi redirecionado por sessão expirada
  useEffect(() => {
    const sessaoExpirada = sessionStorage.getItem(
      'kfka_sessao_expirada'
    )

    if (sessaoExpirada === 'true') {
      setErro('Sua sessão expirou. Faça login novamente.')

      sessionStorage.removeItem('kfka_sessao_expirada')
    }
  }, [])

  async function fazerLogin(evento) {
    evento.preventDefault()
    setErro('')

    if (!email.trim() || !senha) {
      setErro('Preencha o e-mail e a senha.')
      return
    }

    setCarregando(true)

    try {
      const resposta = await fetch('http://localhost:3333/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email.trim(),
          senha
        })
      })

      const dados = await resposta.json()

      if (!resposta.ok) {
        throw new Error(
          dados.mensagem || 'Erro ao realizar login.'
        )
      }

      const destinos = {
        administrador: '/administrador',
        professor: '/professor',
        responsavel: '/responsavel'
      }

      const destino = destinos[dados.usuario?.perfil]

      if (!dados.token || !destino) {
        throw new Error('Resposta de autenticação inválida.')
      }

      // Salva o token e os dados do usuário
      sessionStorage.setItem('kfka_token', dados.token)

      sessionStorage.setItem(
        'kfka_usuario',
        JSON.stringify(dados.usuario)
      )

      // Limpa qualquer aviso antigo de sessão expirada
      sessionStorage.removeItem('kfka_sessao_expirada')

      navigate(destino, { replace: true })
    } catch (erro) {
      setErro(
        erro instanceof TypeError
          ? 'Não foi possível conectar ao servidor. Verifique se o backend está ligado.'
          : erro.message
      )
    } finally {
      setCarregando(false)
    }
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
        <form className="formulario-login" onSubmit={fazerLogin}>
          <Link to="/" className="login-voltar">
            <ArrowLeft size={18} />
            Voltar ao início
          </Link>

          <p className="login-form-etiqueta">
            ACESSO À PLATAFORMA
          </p>

          <h1>Bem-vindo!</h1>

          <p className="subtitulo-login">
            Entre com a conta fornecida pela escola.
          </p>

          <label htmlFor="email">E-mail</label>

          <div className="campo-login">
            <Mail size={17} aria-hidden="true" />

            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(evento) => {
                setEmail(evento.target.value)
                setErro('')
              }}
              placeholder="Digite seu e-mail"
              autoComplete="username"
              required
            />
          </div>

          <label htmlFor="senha">Senha</label>

          <div className="campo-login">
            <LockKeyhole size={17} aria-hidden="true" />

            <input
              id="senha"
              name="senha"
              type={mostrarSenha ? 'text' : 'password'}
              value={senha}
              onChange={(evento) => {
                setSenha(evento.target.value)
                setErro('')
              }}
              placeholder="Digite sua senha"
              autoComplete="current-password"
              required
            />

            <button
              type="button"
              className="mostrar-senha"
              onClick={() => setMostrarSenha(!mostrarSenha)}
              aria-label={
                mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'
              }
              aria-pressed={mostrarSenha}
            >
              {mostrarSenha ? (
                <EyeOff size={17} />
              ) : (
                <Eye size={17} />
              )}
            </button>
          </div>

          <div className="opcoes-login">
            <button
              type="button"
              onClick={() =>
                setMostrarRecuperacao(!mostrarRecuperacao)
              }
              aria-expanded={mostrarRecuperacao}
              aria-controls="orientacao-recuperacao"
              style={{
                background: 'transparent',
                border: 0,
                padding: '4px 0',
                color: 'var(--destaque-claro)',
                font: 'inherit',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Esqueceu sua senha?
            </button>
          </div>

          {mostrarRecuperacao && (
            <div
              id="orientacao-recuperacao"
              role="status"
              style={{
                marginBottom: 16,
                padding: 14,
                border: '1px solid var(--borda)',
                borderRadius: 8,
                background: 'var(--campo)',
                color: 'var(--texto)',
                fontSize: 13,
                lineHeight: 1.6
              }}
            >
              <strong>Como recuperar seu acesso</strong>

              <p style={{ marginTop: 8 }}>
                Procure a administração da sua escola e
                informe o e-mail cadastrado. Após confirmar
                sua identidade, o administrador poderá
                redefinir sua senha.
              </p>
            </div>
          )}

          {erro && (
            <p className="erro-login" role="alert">
              {erro}
            </p>
          )}

          <button
            className="botao-login"
            type="submit"
            disabled={carregando}
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>

          <p
            style={{
              marginTop: 20,
              color: 'var(--texto-secundario)',
              fontSize: 12,
              lineHeight: 1.6,
              textAlign: 'center'
            }}
          >
            Ainda não tem uma conta? Solicite seu cadastro
            à administração da escola.
          </p>
        </form>
      </section>
    </main>
  )
}

export default Login