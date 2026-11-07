
import { api } from './api'

export async function buscarAlunos() {
  try {
    const dados = await api('/alunos', {
      method: 'GET'
    })

    return dados
  } catch (erro) {
    throw new Error(
      erro.message || 'Não foi possível carregar os alunos.'
    )
  }
}
