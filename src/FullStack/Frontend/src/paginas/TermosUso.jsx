import { Link } from 'react-router-dom'
import Cabecalho from '../componentes/Cabecalho.jsx'
import LinkRetornoLegal from '../componentes/LinkRetornoLegal.jsx'
import './PaginasLegais.css'

export default function TermosUso() {
  return (
    <div className="pagina-legal">
      <Cabecalho />
      <main className="pagina-legal-conteudo">
        <h1>Termos de Uso</h1>
        <p className="pagina-legal-minuta">Minuta em revisão</p>
        <p>O KFKA apoia o registro e a consulta de informações de acompanhamento escolar.</p>

        <section>
          <h2>Perfis de acesso</h2>
          <ul>
            <li><strong>Professores</strong> registram e encaminham acompanhamentos para revisão.</li>
            <li><strong>Administradores</strong> revisam e publicam os registros aprovados.</li>
            <li><strong>Responsáveis</strong> consultam os registros publicados dos alunos vinculados.</li>
          </ul>
        </section>

        <section>
          <h2>Uso da conta e dos registros</h2>
          <ul>
            <li>Use somente a conta atribuída a você e mantenha suas credenciais em sigilo.</li>
            <li>Acesse apenas as informações permitidas ao seu perfil e necessárias ao acompanhamento escolar.</li>
            <li>Registre informações pertinentes e corretas, respeitando a privacidade de alunos e famílias.</li>
            <li>Evite copiar ou divulgar registros escolares fora das finalidades autorizadas.</li>
          </ul>
        </section>

        <section>
          <h2>Informações pendentes de revisão</h2>
          <p>
            Definir o responsável pela plataforma, o canal de suporte, as condições de administração
            e encerramento de contas, o processo de atualização destes termos e a data de vigência.
          </p>
        </section>

        <nav className="pagina-legal-links" aria-label="Links dos Termos de Uso">
          <LinkRetornoLegal />
          <Link to="/politica-de-privacidade">Política de Privacidade</Link>
        </nav>
      </main>
    </div>
  )
}
