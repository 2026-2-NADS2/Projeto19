
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import './AvisoPrivacidade.css'

function AvisoPrivacidade() {
    const [mostrarAviso, setMostrarAviso] = useState(() =>
        localStorage.getItem('kfka_aviso_privacidade_v1') !== 'fechado'
    )

    // Fecha o aviso
    function fecharAviso() {
        localStorage.setItem(
            'kfka_aviso_privacidade_v1',
            'fechado'
        )

        setMostrarAviso(false)
    }

    if (!mostrarAviso) {
        return null
    }

    return (
        <div className="aviso-privacidade-fundo">
            <section
                className="aviso-privacidade-janela"
                role="dialog"
                aria-modal="true"
                aria-labelledby="titulo-aviso-privacidade"
            >
                <div className="aviso-privacidade-icone">
                    <ShieldCheck size={26} />
                </div>

                <div className="aviso-privacidade-conteudo">
                    <h2 id="titulo-aviso-privacidade">
                        Sua privacidade é importante
                    </h2>

                    <p>
                        O KFKA utiliza informações pessoais para
                        oferecer os serviços de acompanhamento
                        escolar, conectando escolas, professores
                        e responsáveis.
                    </p>

                    <p>
                        Saiba como seus dados são utilizados e
                        protegidos em nossa{' '}
                        <Link to="/politica-de-privacidade">
                            Política de Privacidade
                        </Link>.
                    </p>
                </div>

                <button
                    type="button"
                    className="aviso-privacidade-botao"
                    onClick={fecharAviso}
                >
                    Entendi
                </button>
            </section>
        </div>
    )
}

export default AvisoPrivacidade
