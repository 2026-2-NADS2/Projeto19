import Cabecalho from '../componentes/Cabecalho.jsx'
import './SobreNos.css'

function SobreNos() {
  return (
    <div className="sobre-nos">
      <Cabecalho />

      <main className="conteudo-sobre">

        <section className="lado-esquerdo-sobre">
          <p className="sobre-etiqueta">
            SOBRE NÓS
          </p>

          <h1>
            Ideias que<br />
            <span>conectam</span><br />
            educação e<br />
            tecnologia.
          </h1>

          <p className="sobre-descricao">
            A KFKA nasceu como um projeto acadêmico com o propósito
            de explorar como a tecnologia pode contribuir para uma
            relação mais próxima entre escola e família.
          </p>
        </section>

        <section className="lado-direito-sobre">

          <p className="subtitulo-metodo">
            • NOSSO PROPÓSITO •
          </p>

          <h2>
            Tecnologia com <span>propósito</span>
          </h2>

          <p className="descricao-metodo">
            Desenvolvemos a KFKA pensando em uma experiência simples,
            organizada e acessível para o ambiente escolar.
          </p>

          <div className="cards-metodo">

            <article className="card-metodo">
              <span className="numero-card">01</span>

              <h3>Conexão</h3>

              <p>
                Aproximar escola e família por meio de uma
                comunicação mais clara e organizada.
              </p>
            </article>

            <article className="card-metodo">
              <span className="numero-card">02</span>

              <h3>Simplicidade</h3>

              <p>
                Criar uma experiência intuitiva para os diferentes
                usuários da plataforma.
              </p>
            </article>

            <article className="card-metodo">
              <span className="numero-card">03</span>

              <h3>Organização</h3>

              <p>
                Centralizar informações importantes do acompanhamento
                escolar em um único ambiente.
              </p>
            </article>

          </div>

        </section>

      </main>
    </div>
  )
}

export default SobreNos