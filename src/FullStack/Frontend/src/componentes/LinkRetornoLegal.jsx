import { createElement } from 'react'
import { Link } from 'react-router-dom'

function destinoDoPerfil() {
  if (!sessionStorage.getItem('kfka_token')) return null

  try {
    const usuario = JSON.parse(sessionStorage.getItem('kfka_usuario'))

    // A rota protegida valida a sessão e consulta a ciência na API.
    switch (usuario?.perfil) {
      case 'administrador': return '/administrador'
      case 'professor': return '/professor'
      case 'responsavel': return '/responsavel'
      default: return null
    }
  } catch {
    return null
  }
}

export default function LinkRetornoLegal() {
  const destino = destinoDoPerfil()

  return createElement(
    Link,
    { to: destino ?? '/login' },
    destino ? 'Voltar à plataforma' : 'Voltar ao login'
  )
}
