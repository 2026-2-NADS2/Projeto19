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
            Tecnologia com
            <span> clareza e propósito.</span>
          </h1>

          <p className="sobre-descricao">
            A KFKA Technology Consulting foi fundada em 2011 e atua
            no desenvolvimento de soluções tecnológicas, combinando
            conhecimento técnico com uma visão estratégica.
          </p>

          <div className="informacoes-kfka">

            <div>
              <strong>2011</strong>
              <span>Fundação da KFKA</span>
            </div>

            <div>
              <strong>15+</strong>
              <span>Anos de atuação</span>
            </div>

            <div>
              <strong>30+</strong>
              <span>Projetos entregues</span>
            </div>

          </div>

        </section>


        <section className="lado-direito-sobre">

          <p className="subtitulo-metodo">
            NOSSA ESSÊNCIA
          </p>

          <h2>
            Transformar com
            <span> inteligência.</span>
          </h2>

          <p className="descricao-metodo">
            A proposta da KFKA parte da ideia de questionar estruturas
            que deixaram de funcionar e buscar soluções mais claras,
            úteis e orientadas às pessoas.
          </p>


          <div className="cards-metodo">

            <article className="card-metodo">

              <span className="numero-card">
                01
              </span>

              <h3>Clareza</h3>

              <p>
                Simplificar estruturas e processos para criar
                soluções mais fáceis de compreender e utilizar.
              </p>

            </article>


            <article className="card-metodo">

              <span className="numero-card">
                02
              </span>

              <h3>Propósito</h3>

              <p>
                Desenvolver tecnologia pensando no problema real
                que precisa ser resolvido e nas pessoas envolvidas.
              </p>

            </article>


            <article className="card-metodo">

              <span className="numero-card">
                03
              </span>

              <h3>Inteligência</h3>

              <p>
                Combinar conhecimento técnico e estratégia para
                construir soluções capazes de gerar resultados.
              </p>

            </article>

          </div>

        </section>

      </main>
    </div>
  )
}

export default SobreNos