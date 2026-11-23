
export const API_URL = (
    import.meta.env.VITE_API_URL || 'http://localhost:3333'
).replace(/\/+$/, '')

let encerrandoSessao = false

export function encerrarSessao(expirada = true) {
    if (encerrandoSessao) return

    encerrandoSessao = true

    sessionStorage.removeItem('kfka_token')
    sessionStorage.removeItem('kfka_usuario')

    if (expirada) sessionStorage.setItem('kfka_sessao_expirada', 'true')
    else sessionStorage.removeItem('kfka_sessao_expirada')

    window.location.replace('/login')
}

export function sairDaConta(evento) {
    evento.preventDefault()
    encerrarSessao(false)
}

export function verificarSessao() {
    const token = sessionStorage.getItem('kfka_token')

    if (!token) {
        encerrarSessao()
        return false
    }

    try {
        const partes = token.split('.')

        if (partes.length !== 3) {
            encerrarSessao()
            return false
        }

        const payload = JSON.parse(atob(
            partes[1]
                .replace(/-/g, '+')
                .replace(/_/g, '/')
        ))

        if (
            typeof payload.exp === 'number' &&
            Date.now() >= payload.exp * 1000
        ) {
            encerrarSessao()
            return false
        }

        return true
    } catch {
        encerrarSessao()
        return false
    }
}

export async function api(caminho, opcoes = {}) {
    if (!verificarSessao()) {
        throw new Error('Sua sessão expirou. Faça login novamente.')
    }

    const token = sessionStorage.getItem('kfka_token')

    const resposta = await fetch(`${API_URL}${caminho}`, {
        ...opcoes,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            ...opcoes.headers
        }
    })

    const dados = await resposta.json().catch(() => ({}))

    if (resposta.status === 401) {
        encerrarSessao()
        throw new Error('Sua sessão expirou. Faça login novamente.')
    }

    if (resposta.status === 403 && dados.codigo === 'CIENCIA_DOCUMENTOS_PENDENTE') {
        window.location.reload()
    }

    if (!resposta.ok) {
        throw new Error(
            dados.mensagem ||
            dados.erro ||
            `Erro HTTP ${resposta.status}`
        )
    }

    return dados
}
