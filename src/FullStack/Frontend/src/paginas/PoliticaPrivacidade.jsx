import { Link } from 'react-router-dom'
import Cabecalho from '../componentes/Cabecalho.jsx'
import LinkRetornoLegal from '../componentes/LinkRetornoLegal.jsx'
import './PaginasLegais.css'

export default function PoliticaPrivacidade() {
  return (
    <div className="pagina-legal">
      <Cabecalho />
      <main className="pagina-legal-conteudo">
        <h1>Política de Privacidade</h1>
        <p className="pagina-legal-minuta">Minuta em revisão</p>
        <p>O KFKA é uma plataforma de acompanhamento escolar para professores, administradores e responsáveis.</p>

        <section>
          <h2>Dados e finalidades</h2>
          <p>
            A plataforma utiliza dados de cadastro, como nome, e-mail e perfil, para administrar contas e identificar
            os usuários. Os registros dos alunos podem incluir nome, matrícula, data de nascimento, médias e
            observações, usados no acompanhamento escolar.
          </p>
          <p>
            Professores registram acompanhamentos, administradores revisam e publicam os registros aprovados
            e responsáveis consultam os acompanhamentos publicados dos alunos vinculados a eles.
          </p>
          <p>
            O navegador guarda informações da sessão, preferências de acessibilidade e o registro de
            que o aviso de privacidade foi fechado.
          </p>
        </section>

        <section>
          <h2>Crianças e adolescentes</h2>
          <p>
            O tratamento de dados de alunos menores de idade deve respeitar seu melhor interesse,
            conforme o art. 14 da LGPD. As bases legais aplicáveis a cada finalidade estão pendentes de revisão.
          </p>
        </section>

        <section>
          <h2>Direitos e contato</h2>
          <p>
            O art. 18 da LGPD prevê, entre outros direitos, a confirmação do tratamento, o acesso e a correção
            de dados, além de pedidos de eliminação nas hipóteses aplicáveis.
          </p>
          <p><strong>Controlador, canal de privacidade e procedimento de atendimento:</strong> a definir.</p>
        </section>

        <section>
          <h2>Informações pendentes de revisão</h2>
          <p>
            Confirmar as hipóteses de compartilhamento com terceiros, os prazos de retenção,
            os critérios de descarte, as medidas de segurança e a data de vigência.
          </p>
        </section>

        <nav className="pagina-legal-links" aria-label="Links da Política de Privacidade">
          <LinkRetornoLegal />
          <Link to="/termos-de-uso">Termos de Uso</Link>
        </nav>
      </main>
    </div>
  )
}
