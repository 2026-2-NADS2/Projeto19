import {
  Mail,
  Phone,
  MapPin,
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

          <h1>
            Fale com a
            <span> KFKA.</span>
          </h1>

          <p className="contato-descricao">
            Consulte os canais institucionais publicados pela KFKA Technology Consulting.
          </p>

          <div className="contato-destaque">
            <Headphones size={22} />

            <div>
              <strong>Precisa de suporte?</strong>

              <p>
                Para dúvidas sobre o acesso à plataforma de avaliação, procure a escola que forneceu sua conta.
              </p>
            </div>
          </div>

        </section>


        <section className="contato-canais">

          <h2>
            Entre em
            <span> contato.</span>
          </h2>

          <p className="contato-canais-descricao">
            Use os canais abaixo para assuntos institucionais.
          </p>


          <div className="contato-lista">

            <article className="contato-item">

              <div className="contato-icone">
                <Mail size={20} />
              </div>

              <div>
                <span>SITE OFICIAL</span>

                <strong>
                  <a href="https://kfkatech.com/">kfkatech.com</a>
                </strong>

                <p>
                  Consulte o formulário de contato por e-mail no site oficial.
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
                  <a href="tel:+5511992191115">+55 (11) 99219-1115</a>
                </strong>

                <p>
                  Telefone institucional.
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
                  Jardim Fernandes, São Paulo – SP
                </strong>

                <p>
                  Rua Henrique Schurig, 495 · CEP 03580-060.
                </p>
              </div>

            </article>

          </div>


          <div className="contato-empresa">

            <Building2 size={18} />

            <p>
              <strong>KFKA Technology Consulting</strong>
              <span>
                Consultoria em arquitetura de sistemas, segurança e inteligência artificial.
              </span>
            </p>

          </div>

        </section>

      </main>
    </div>
  )
}

export default Contato