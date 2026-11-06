import { Plus, Save, Pencil, Trash2 } from 'lucide-react'
import { useAdmin } from './AdminContext'
import CabecalhoPagina from './CabecalhoPagina'

export default function Disciplinas() {
    const {
        areas, nomeArea, setNomeArea,
        areaEditando, setAreaEditando,
        disciplinas, setDisciplinas,
        disciplinaForm, setDisciplinaForm,
        disciplinaEditando, setDisciplinaEditando,
        salvarArea, excluirArea, salvarDisciplina
    } = useAdmin()

    return (
        <>
            <CabecalhoPagina
                titulo="Áreas e disciplinas"
                descricao="Cadastre e organize as áreas de conhecimento e disciplinas."
            />

            <div className="admin-duas-colunas">
                <section className="admin-painel">
                    <div className="admin-painel-topo">
                        <div>
                            <span>ÁREAS</span>
                            <h3>{areaEditando ? 'Editar área' : 'Nova área'}</h3>
                        </div>
                    </div>

                    <form className="admin-form-linha" onSubmit={salvarArea}>
                        <input
                            value={nomeArea}
                            onChange={e => setNomeArea(e.target.value)}
                            placeholder="Ex.: Linguagens"
                        />
                        <button className="admin-botao-principal">
                            <Plus size={16} /> Salvar
                        </button>
                    </form>

                    <div className="admin-lista-itens">
                        {areas.map(area => (
                            <div className="admin-item" key={area.id}>
                                <span>{area.nome}</span>

                                <div className="admin-acoes">
                                    <button
                                        type="button"
                                        className="admin-botao-icone"
                                        onClick={() => {
                                            setAreaEditando(area.id)
                                            setNomeArea(area.nome)
                                        }}
                                    >
                                        <Pencil size={15} />
                                    </button>

                                    <button
                                        type="button"
                                        className="admin-botao-icone perigo"
                                        onClick={() => excluirArea(area.id)}
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="admin-painel">
                    <div className="admin-painel-topo">
                        <div>
                            <span>DISCIPLINAS</span>
                            <h3>
                                {disciplinaEditando ? 'Editar disciplina' : 'Nova disciplina'}
                            </h3>
                        </div>
                    </div>

                    <form className="admin-form-coluna" onSubmit={salvarDisciplina}>
                        <div className="admin-campo">
                            <label>Disciplina</label>
                            <input
                                value={disciplinaForm.nome}
                                onChange={e => setDisciplinaForm({
                                    ...disciplinaForm,
                                    nome: e.target.value
                                })}
                                placeholder="Ex.: História"
                            />
                        </div>

                        <div className="admin-campo">
                            <label>Área</label>
                            <select
                                value={disciplinaForm.area}
                                onChange={e => setDisciplinaForm({
                                    ...disciplinaForm,
                                    area: e.target.value
                                })}
                            >
                                {areas.map(area => (
                                    <option key={area.id} value={area.nome}>
                                        {area.nome}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button className="admin-botao-principal">
                            <Save size={16} /> Salvar disciplina
                        </button>
                    </form>

                    <div className="admin-lista-itens">
                        {disciplinas.map(d => (
                            <div className="admin-item" key={d.id}>
                                <div className="admin-item-texto">
                                    <strong>{d.nome}</strong>
                                    <small>{d.area}</small>
                                </div>

                                <div className="admin-acoes">
                                    <button
                                        type="button"
                                        className="admin-botao-icone"
                                        onClick={() => {
                                            setDisciplinaEditando(d.id)
                                            setDisciplinaForm({
                                                nome: d.nome,
                                                area: d.area || 'Matemática'
                                            })
                                        }}
                                    >
                                        <Pencil size={15} />
                                    </button>

                                    <button
                                        type="button"
                                        className="admin-botao-icone perigo"
                                        onClick={() => {
                                            window.alert(
                                                'A exclusão de disciplinas ainda precisa ser implementada no backend.'
                                            )
                                        }}
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </>
    )
}