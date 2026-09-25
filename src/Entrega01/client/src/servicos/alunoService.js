const BASE_DADOS = "/dados/";

export async function buscarAlunos() {
  const resposta = await fetch(BASE_DADOS + "alunos.json");

  if (!resposta.ok) {
    throw new Error(
      "Não foi possível carregar os alunos (HTTP " + resposta.status + ")"
    );
  }

  return resposta.json();
}