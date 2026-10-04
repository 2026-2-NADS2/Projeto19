import {
  BookOpen,
  ClipboardCheck,
  Tags,
  TrendingUp,
  Users,
  FileText
} from 'lucide-react'

import Cabecalho from '../componentes/Cabecalho.jsx'
import './Recursos.css'

function Recursos() {
  const recursos = [
    {
      id: '01',
      icone: <BookOpen size={20} />,
      titulo: 'Acompanhamento bimestral',
      descricao:
        'Registre e consulte informações sobre o desenvolvimento escolar dos alunos ao longo dos bimestres.'
    },
    {
      id: '02',
      icone: <ClipboardCheck size={20} />,
      titulo: 'Revisão e publicação',
      descricao:
        'Os acompanhamentos enviados pelos professores passam pela revisão do administrador antes da publicação.'
    },
    {
      id: '03',
      icone: <Tags size={20} />,
      titulo: 'Tags de acompanhamento',
      descricao:
        'Classifique os registros com tags que ajudam a identificar participação, evolução, autonomia e pontos de atenção.'
    },
    {
      id: '04',
      icone: <TrendingUp size={20} />,
      titulo: 'Evolução do aluno',
      descricao:
        'Acompanhe o desenvolvimento do estudante entre os períodos e mantenha um histórico de sua trajetória escolar.'
    },
    {
      id: '05',
      icone: <Users size={20} />,
      titulo: 'Acesso por perfil',
      descricao:
        'Professor, administrador e responsável possuem áreas específicas de acordo com suas funções na plataforma.'
    },
    {
      id: '06',
      icone: <FileText size={20} />,
      titulo: 'Relatórios e PDF',
      descricao:
        'Consulte os acompanhamentos publicados e gere documentos para facilitar o acesso às informações escolares.'
    }
  ]

  return (
    <div className="recursos">
      <Cabecalho />

      <main className="conteudo-recursos">

        <section className="recursos-apresentacao">

          <p className="recursos-etiqueta">
            RECURSOS
          </p>

          <h1>
            Acompanhamento escolar
            <span> em um só lugar.</span>
          </h1>

          <p className="recursos-descricao">
            A KFKA reúne ferramentas para organizar o acompanhamento
            dos alunos e facilitar a comunicação entre professores,
            administradores e responsáveis.
          </p>

          <div className="recursos-fluxo">

            <div>
              <strong>Professor</strong>
              <span>Registra</span>
            </div>

            <span className="recursos-seta">→</span>

            <div>
              <strong>Administrador</strong>
              <span>Revisa e publica</span>
            </div>

            <span className="recursos-seta">→</span>

            <div>
              <strong>Responsável</strong>
              <span>Acompanha</span>
            </div>

          </div>

        </section>


        <section className="recursos-listagem">

          <p className="recursos-listagem-etiqueta">
            FUNCIONALIDADES
          </p>

          <h2>
            Recursos para cada
            <span> etapa.</span>
          </h2>

          <p className="recursos-listagem-descricao">
            Funcionalidades pensadas para manter o acompanhamento
            escolar organizado, claro e acessível.
          </p>

          <div className="recursos-grid">

            {recursos.map((recurso) => (
              <article
                className="recurso-card"
                key={recurso.id}
              >

                <div className="recurso-card-topo">

                  <div className="recurso-icone">
                    {recurso.icone}
                  </div>

                  <span className="recurso-numero">
                    {recurso.id}
                  </span>

                </div>

                <h3>{recurso.titulo}</h3>

                <p>{recurso.descricao}</p>

              </article>
            ))}

          </div>

        </section>

      </main>
    </div>
  )
}

export default Recursos