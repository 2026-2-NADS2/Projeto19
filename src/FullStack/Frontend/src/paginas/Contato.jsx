import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Headphones,
  Building2
} from 'lucide-react'

import Cabecalho from '../componentes/Cabecalho.jsx'
import './Contato.css'

function Contato() {
  return (
    <div className="contato">
      <Cabecalho />

      <main className="conteudo-contato">

        <section className="contato-apresentacao">

          <p className="contato-etiqueta">
            CONTATO
          </p>

          <h1>
            Fale com a
            <span> KFKA.</span>
          </h1>

          <p className="contato-descricao">
            Entre em contato com nossa equipe para tirar dúvidas
            sobre a plataforma, solicitar suporte ou obter mais
            informações sobre nossas soluções.
          </p>

          <div className="contato-destaque">
            <Headphones size={22} />

            <div>
              <strong>Precisa de suporte?</strong>

              <p>
                Nossa equipe está disponível para auxiliar
                professores, responsáveis e administradores.
              </p>
            </div>
          </div>

        </section>


        <section className="contato-canais">

          <p className="contato-canais-etiqueta">
            NOSSOS CANAIS
          </p>

          <h2>
            Entre em
            <span> contato.</span>
          </h2>

          <p className="contato-canais-descricao">
            Escolha o canal mais adequado para falar com nossa equipe.
          </p>


          <div className="contato-lista">

            <article className="contato-item">

              <div className="contato-icone">
                <Mail size={20} />
              </div>

              <div>
                <span>E-MAIL</span>

                <strong>
                  contato@kfka.com
                </strong>

                <p>
                  Dúvidas gerais e informações.
                </p>
              </div>

            </article>


            <article className="contato-item">

              <div className="contato-icone">
                <Phone size={20} />
              </div>

              <div>
                <span>TELEFONE</span>

                <strong>
                  (11) 4000-2026
                </strong>

                <p>
                  Atendimento e suporte.
                </p>
              </div>

            </article>


            <article className="contato-item">

              <div className="contato-icone">
                <Clock size={20} />
              </div>

              <div>
                <span>HORÁRIO</span>

                <strong>
                  Segunda a sexta
                </strong>

                <p>
                  Das 8h às 18h.
                </p>
              </div>

            </article>


            <article className="contato-item">

              <div className="contato-icone">
                <MapPin size={20} />
              </div>

              <div>
                <span>LOCALIZAÇÃO</span>

                <strong>
                  São Paulo - SP
                </strong>

                <p>
                  Atendimento digital.
                </p>
              </div>

            </article>

          </div>


          <div className="contato-empresa">

            <Building2 size={18} />

            <p>
              <strong>KFKA Technology Consulting</strong>
              <span>
                Tecnologia aplicada a soluções mais simples,
                claras e eficientes.
              </span>
            </p>

          </div>

        </section>

      </main>
    </div>
  )
}

export default Contato