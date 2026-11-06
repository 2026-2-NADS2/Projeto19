
const API_URL = 'http://localhost:3333'

export async function buscarAlunos() {
  const token = sessionStorage.getItem('kfka_token')

  if (!token) {
    throw new Error('Usuário não autenticado.')
  }

  const resposta = await fetch(`${API_URL}/alunos`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  const dados = await resposta.json()

  if (!resposta.ok) {
    throw new Error(
      dados.mensagem || 'Não foi possível carregar os alunos.'
    )
  }

  return dados
}
