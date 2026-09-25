import Cabecalho from '../componentes/Cabecalho.jsx'
import './SobreNos.css'

function SobreNos() {
  return (
    <div className="sobre-nos">
      <Cabecalho />

      <main className="conteudo-sobre">

        <section className="lado-esquerdo-sobre">
          <h1>
            Tecnologia<br />
            que <span>aproxima</span><br />
            escola e<br />
            família.
          </h1>

          <p>
            A KFKA oferece uma plataforma voltada ao acompanhamento escolar,
            facilitando a comunicação entre professores, responsáveis e
            administradores e tornando as avaliações dos alunos mais
            acessíveis e organizadas.
          </p>
        </section>

        <section className="lado-direito-sobre">
          <p className="subtitulo-metodo">
            • NOSSA PLATAFORMA •
          </p>

          <h2>
            Uma plataforma, <span>3 perfis</span>
          </h2>

          <p className="descricao-metodo">
            Cada perfil possui recursos pensados para sua função no ambiente escolar.
          </p>

          <div className="cards-metodo">

            <div className="card-metodo">
              <span className="numero-card">01</span>
              <h3>Responsável</h3>
              <p>
                Acompanha avaliações, desempenho e informações do aluno.
              </p>
            </div>

            <div className="card-metodo">
              <span className="numero-card">02</span>
              <h3>Professor</h3>
              <p>
                Registra avaliações e acompanha o desenvolvimento dos alunos.
              </p>
            </div>

            <div className="card-metodo">
              <span className="numero-card">03</span>
              <h3>Administrador</h3>
              <p>
                Gerencia usuários, turmas e informações da plataforma.
              </p>
            </div>

          </div>
        </section>

      </main>
    </div>
  )
}

export default SobreNos