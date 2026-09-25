import Cabecalho from '../componentes/Cabecalho.jsx'
import './SobrePlataforma.css'

function SobrePlataforma() {
  return (
    <div className="sobre-plataforma">
      <Cabecalho />

      <main className="conteudo-plataforma">

        <section className="lado-esquerdo-plataforma">

          <p className="plataforma-etiqueta">
            NOSSA PLATAFORMA
          </p>

          <h1>
            Tecnologia<br />
            que <span>aproxima</span><br />
            escola e<br />
            família.
          </h1>

          <p className="plataforma-descricao">
            A KFKA é uma plataforma voltada ao acompanhamento
            escolar, criada para tornar a comunicação entre
            professores, responsáveis e administradores mais
            simples, próxima e organizada.
          </p>

          <div className="fluxo-plataforma">
            <span>Professor</span>
            <strong>→</strong>
            <span>Administrador</span>
            <strong>→</strong>
            <span>Responsável</span>
          </div>

        </section>

        <section className="lado-direito-plataforma">

          <p className="subtitulo-plataforma">
            • COMO FUNCIONA •
          </p>

          <h2>
            Uma plataforma, <span>3 perfis</span>
          </h2>

          <p className="descricao-plataforma">
            Cada perfil possui uma função específica no processo
            de acompanhamento escolar.
          </p>

          <div className="cards-plataforma">

            <article className="card-plataforma">
              <span className="numero-plataforma">
                01
              </span>

              <h3>Professor</h3>

              <p>
                Registra o acompanhamento dos alunos e envia
                as informações para revisão.
              </p>
            </article>

            <article className="card-plataforma">
              <span className="numero-plataforma">
                02
              </span>

              <h3>Administrador</h3>

              <p>
                Revisa os acompanhamentos recebidos e publica
                as informações para as famílias.
              </p>
            </article>

            <article className="card-plataforma">
              <span className="numero-plataforma">
                03
              </span>

              <h3>Responsável</h3>

              <p>
                Acompanha as informações publicadas e participa
                do acompanhamento escolar do aluno.
              </p>
            </article>

          </div>

        </section>

      </main>
    </div>
  )
}

export default SobrePlataforma