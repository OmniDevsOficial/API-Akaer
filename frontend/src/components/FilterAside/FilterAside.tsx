import React, { useState, useEffect } from "react";
import "./FilterAside.css";
import api from "@/services/api";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filtros: FiltrosSelecionados) => void;
};

export type FiltrosSelecionados = {
  orgao?: number;
  categoria?: number;
  etapa?: number;
};

type Opcao = {
  id: number;
  nome: string;
};

export const FilterAside: React.FC<Props> = ({ isOpen, onClose, onApplyFilters }) => {

  const [orgaos, setOrgaos] = useState<Opcao[]>([]);
  const [categorias, setCategorias] = useState<Opcao[]>([]);
  const [etapas, setEtapas] = useState<Opcao[]>([]);

  const [orgaoSelecionado, setOrgaoSelecionado] = useState<number | undefined>();
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<number | undefined>();
  const [etapaSelecionada, setEtapaSelecionada] = useState<number | undefined>();

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

  const limparFiltros = () => {
    setOrgaoSelecionado(undefined);
    setCategoriaSelecionada(undefined);
    setEtapaSelecionada(undefined);
    onApplyFilters({});
  };

  const aplicarFiltros = () => {
    onApplyFilters({
      orgao: orgaoSelecionado,
      categoria: categoriaSelecionada,
      etapa: etapaSelecionada,
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
                  checked={orgaoSelecionado === item.id}
                  onChange={() => setOrgaoSelecionado(
                    orgaoSelecionado === item.id ? undefined : item.id
                  )}
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
                  checked={categoriaSelecionada === item.id}
                  onChange={() => setCategoriaSelecionada(
                    categoriaSelecionada === item.id ? undefined : item.id
                  )}
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
                  checked={etapaSelecionada === item.id}
                  onChange={() => setEtapaSelecionada(
                    etapaSelecionada === item.id ? undefined : item.id
                  )}
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
            style={{ background: '#8B0000', color: '#fff', borderColor: '#8B0000' }}
          >
            Aplicar
          </button>
        </div>

      </aside>
    </>
  );
};