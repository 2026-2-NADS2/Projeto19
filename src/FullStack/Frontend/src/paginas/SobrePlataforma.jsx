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
            Tecnologia que
            <span> aproxima escola e família.</span>
          </h1>

          <p className="plataforma-descricao">
            A KFKA é uma plataforma de acompanhamento escolar
            criada para facilitar a comunicação entre professores,
            administradores e responsáveis durante o desenvolvimento
            acadêmico dos alunos.
          </p>

          <div
            className="fluxo-plataforma"
            aria-label="Fluxo do acompanhamento escolar"
          >
            <span>Professor</span>
            <strong>→</strong>
            <span>Administrador</span>
            <strong>→</strong>
            <span>Responsável</span>
          </div>

        </section>


        <section className="lado-direito-plataforma">

          <p className="subtitulo-plataforma">
            COMO FUNCIONA
          </p>

          <h2>
            Uma plataforma,
            <span> três perfis.</span>
          </h2>

          <p className="descricao-plataforma">
            Cada perfil participa de uma etapa do acompanhamento,
            mantendo as informações organizadas até a publicação
            para a família.
          </p>


          <div className="cards-plataforma">

            <article className="card-plataforma">

              <span className="numero-plataforma">
                01
              </span>

              <h3>Professor</h3>

              <p>
                Registra o acompanhamento bimestral do aluno,
                incluindo seu desenvolvimento,
                média e observações.
              </p>

            </article>


            <article className="card-plataforma">

              <span className="numero-plataforma">
                02
              </span>

              <h3>Administrador</h3>

              <p>
                Revisa os acompanhamentos enviados pelos professores
                e publica as informações aprovadas.
              </p>

            </article>


            <article className="card-plataforma">

              <span className="numero-plataforma">
                03
              </span>

              <h3>Responsável</h3>

              <p>
                Consulta os acompanhamentos publicados e acompanha
                a evolução escolar dos alunos vinculados.
              </p>

            </article>

          </div>

        </section>

      </main>
    </div>
  )
}

export default SobrePlataforma