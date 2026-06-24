import React, { useState, useEffect } from "react";
import "./FilterAside.css";
import api from "@/services/api";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filtros: FiltrosSelecionados, labels: FiltrosLabels) => void;
  filtrosAtuais?: FiltrosSelecionados;
};

export type FiltrosSelecionados = {
  orgaos?:     string[];
  categorias?: string[];
  etapas?:     string[];
  status?:     string[];
};

export type FiltrosLabels = {
  orgaos?:     { id: number; nome: string }[];
  categorias?: { id: number; nome: string }[];
  etapas?:     { id: number; nome: string }[];
  status?:     { id: number; nome: string }[];
};

type Opcao = {
  id: string;
  nome: string;
};

export const FilterAside: React.FC<Props> = ({ isOpen, onClose, onApplyFilters, filtrosAtuais }) => {

  const [orgaos, setOrgaos] = useState<Opcao[]>([]);
  const [categorias, setCategorias] = useState<Opcao[]>([]);
  const [etapas, setEtapas] = useState<Opcao[]>([]);

  const [orgaosSelecionados, setOrgaosSelecionados] = useState<string[]>([]);
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState<string[]>([]);
  const [etapasSelecionadas, setEtapasSelecionadas] = useState<string[]>([]);
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

    setOrgaosSelecionados(filtrosAtuais?.orgaos ?? []);
    setCategoriasSelecionadas(filtrosAtuais?.categorias ?? []);
    setEtapasSelecionadas(filtrosAtuais?.etapas ?? []);
    setStatusSelecionados(filtrosAtuais?.status ?? []);
  }, [isOpen, filtrosAtuais]);

  const toggleNumerico = (
    setLista: React.Dispatch<React.SetStateAction<string[]>>,
    id: string
  ) => {
    setLista(prev =>
      prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
    );
  };

  const limparFiltros = () => {
    setOrgaosSelecionados([]);
    setCategoriasSelecionadas([]);
    setEtapasSelecionadas([]);
    setStatusSelecionados([]);
  };

  const aplicarFiltros = () => {
    onApplyFilters(
      {
        orgaos: orgaosSelecionados.length > 0 ? orgaosSelecionados : undefined,
        categorias: categoriasSelecionadas.length > 0 ? categoriasSelecionadas : undefined,
        etapas: etapasSelecionadas.length > 0 ? etapasSelecionadas : undefined,
        status: statusSelecionados.length > 0 ? statusSelecionados : undefined,
      },
      {
        orgaos: orgaosSelecionados.map(id => ({ id, nome: orgaos.find(o => o.id === id)?.nome ?? '' })),
        categorias: categoriasSelecionadas.map(id => ({ id, nome: categorias.find(c => c.id === id)?.nome ?? '' })),
        etapas: etapasSelecionadas.map(id => ({ id, nome: etapas.find(e => e.id === id)?.nome ?? '' })),
        status: statusSelecionados.map(s => ({ id: s, nome: s })),
      }
    );
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
                  onChange={() => toggleNumerico(setOrgaosSelecionados, item.id)}
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
                  onChange={() => toggleNumerico(setCategoriasSelecionadas, item.id)}
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
                  onChange={() => toggleNumerico(setEtapasSelecionadas, item.id)}
                />
                <span>{item.nome}</span>
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