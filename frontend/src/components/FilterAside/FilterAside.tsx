import React, { useState } from "react";
import "./FilterAside.css";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

type Filtros = {
  orgao: string[];
  categoria: string[];
  status: string[];
};

export const FilterAside: React.FC<Props> = ({ isOpen, onClose }) => {

  const [filtros, setFiltros] = useState<Filtros>({
    orgao: [],
    categoria: [],
    status: [],
  });

  const opcoes = {
    orgao: ["ANAC", "EASA", "FAA", "MIL-SPEC"],
    categoria: ["Estrutural", "Elétrico", "Sistemas", "Certificação"],
    status: ["Ativa", "Obsoleta"],
  };

  const toggleFiltro = (tipo: keyof Filtros, valor: string) => {
    setFiltros((prev) => {
      const existe = prev[tipo].includes(valor);
      return {
        ...prev,
        [tipo]: existe ? prev[tipo].filter((v) => v !== valor) : [...prev[tipo], valor],
      };
    });
  };

  const limparFiltros = () => {
    setFiltros({ orgao: [], categoria: [], status: [] });
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
            {opcoes.orgao.map((item) => (
              <label key={item} className="option">
                <input
                  type="checkbox"
                  checked={filtros.orgao.includes(item)}
                  onChange={() => toggleFiltro("orgao", item)}
                />
                <span>{item}</span>
              </label>
            ))}
          </div>

          {/* CATEGORIA */}
          <div className="filter-section">
            <span className="section-label">CATEGORIA</span>
            {opcoes.categoria.map((item) => (
              <label key={item} className="option">
                <input
                  type="checkbox"
                  checked={filtros.categoria.includes(item)}
                  onChange={() => toggleFiltro("categoria", item)}
                />
                <span>{item}</span>
              </label>
            ))}
          </div>

          {/* STATUS */}
          <div className="filter-section">
            <span className="section-label">STATUS</span>
            {opcoes.status.map((item) => (
              <label key={item} className="option">
                <input
                  type="checkbox"
                  checked={filtros.status.includes(item)}
                  onChange={() => toggleFiltro("status", item)}
                />
                <span>{item}</span>
              </label>
            ))}
          </div>

        </div>

        {/* BOTÃO LIMPAR */}
        <div className="aside-footer">
          <button className="clear-btn" onClick={limparFiltros}>Limpar filtros</button>
        </div>

      </aside>
    </>
  );
};