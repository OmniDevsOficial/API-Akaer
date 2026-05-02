import React, { useState, useEffect } from "react";
import "./FilterAside.css";
import api from "@/services/api";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filtros: FiltrosSelecionados) => void;
};

export type FiltrosSelecionados = {
  orgaos?: number[];
  categorias?: number[];
  etapas?: number[];
  status?: string[];
};

type Opcao = {
  id: number;
  nome: string;
};

const STATUS_OPCOES = ["Ativa", "Obsoleta"];

export const FilterAside: React.FC<Props> = ({ isOpen, onClose, onApplyFilters }) => {

  const [orgaos, setOrgaos] = useState<Opcao[]>([]);
  const [categorias, setCategorias] = useState<Opcao[]>([]);
  const [etapas, setEtapas] = useState<Opcao[]>([]);

  const [orgaosSelecionados, setOrgaosSelecionados] = useState<number[]>([]);
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState<number[]>([]);
  const [etapasSelecionadas, setEtapasSelecionadas] = useState<number[]>([]);
  const [statusSelecionados, setStatusSelecionados] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    const carregarOpcoes = async () => {
      try {
        const [resOrgaos, resCategorias, resEtapas] = await Promise.all([
          api.get<Opcao[]>('/orgaos-emissores'),
          api.get<Opcao[]>('/categorias'),
          api.get<Opcao[]>('/etapas-projeto'),
        ]);
        setOrgaos(resOrgaos.data);
        setCategorias(resCategorias.data);
        setEtapas(resEtapas.data);
      } catch (error) {
        console.error('Erro ao carregar opções de filtro:', error);
      }
    };

    carregarOpcoes();
  }, [isOpen]);

  const toggleNumerico = (
    lista: number[],
    setLista: React.Dispatch<React.SetStateAction<number[]>>,
    id: number
  ) => {
    setLista(prev =>
      prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
    );
  };

  const toggleStatus = (valor: string) => {
    setStatusSelecionados(prev =>
      prev.includes(valor) ? prev.filter(v => v !== valor) : [...prev, valor]
    );
  };

  const limparFiltros = () => {
    setOrgaosSelecionados([]);
    setCategoriasSelecionadas([]);
    setEtapasSelecionadas([]);
    setStatusSelecionados([]);
  };

  const aplicarFiltros = () => {
    onApplyFilters({
      orgaos: orgaosSelecionados.length > 0 ? orgaosSelecionados : undefined,
      categorias: categoriasSelecionadas.length > 0 ? categoriasSelecionadas : undefined,
      etapas: etapasSelecionadas.length > 0 ? etapasSelecionadas : undefined,
      status: statusSelecionados.length > 0 ? statusSelecionados : undefined,
    });
    onClose();
  };

  return (
    <>
      {isOpen && <div className="overlay" onClick={onClose} />}

      <aside className={`filter-aside ${isOpen ? "open" : ""}`}>

        {/* HEADER */}
        <div className="header">
          <div>
            <span className="header-label">FILTRAR POR</span>
            <h2>Refinar normas</h2>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* CORPO DOS FILTROS */}
        <div className="filter-body">

          {/* ÓRGÃO EMISSOR */}
          <div className="filter-section">
            <span className="section-label">ÓRGÃO EMISSOR</span>
            {orgaos.map((item) => (
              <label key={item.id} className="option">
                <input
                  type="checkbox"
                  checked={orgaosSelecionados.includes(item.id)}
                  onChange={() => toggleNumerico(orgaosSelecionados, setOrgaosSelecionados, item.id)}
                />
                <span>{item.nome}</span>
              </label>
            ))}
          </div>

          {/* CATEGORIA */}
          <div className="filter-section">
            <span className="section-label">CATEGORIA</span>
            {categorias.map((item) => (
              <label key={item.id} className="option">
                <input
                  type="checkbox"
                  checked={categoriasSelecionadas.includes(item.id)}
                  onChange={() => toggleNumerico(categoriasSelecionadas, setCategoriasSelecionadas, item.id)}
                />
                <span>{item.nome}</span>
              </label>
            ))}
          </div>

          {/* ETAPA DO PROJETO */}
          <div className="filter-section">
            <span className="section-label">ETAPA DO PROJETO</span>
            {etapas.map((item) => (
              <label key={item.id} className="option">
                <input
                  type="checkbox"
                  checked={etapasSelecionadas.includes(item.id)}
                  onChange={() => toggleNumerico(etapasSelecionadas, setEtapasSelecionadas, item.id)}
                />
                <span>{item.nome}</span>
              </label>
            ))}
          </div>

          {/* STATUS */}
          <div className="filter-section">
            <span className="section-label">STATUS</span>
            {STATUS_OPCOES.map((item) => (
              <label key={item} className="option">
                <input
                  type="checkbox"
                  checked={statusSelecionados.includes(item)}
                  onChange={() => toggleStatus(item)}
                />
                <span>{item}</span>
              </label>
            ))}
          </div>

        </div>

        {/* FOOTER */}
        <div className="aside-footer" style={{ display: 'flex', gap: '8px' }}>
          <button className="clear-btn" onClick={limparFiltros}>
            Limpar
          </button>
          <button
            className="clear-btn"
            onClick={aplicarFiltros}
            style={{ background: '#73203A', color: '#fff', borderColor: '#73203A' }}
          >
            Aplicar
          </button>
        </div>

      </aside>
    </>
  );
};