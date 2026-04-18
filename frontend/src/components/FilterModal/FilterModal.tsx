import React, { useState } from "react";
import "./FilterModal.css";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

type Norma = {
  codigo: string;
  titulo: string;
  orgao: string;
  categoria: string;
  etapa: string;
};

type Filtros = {
  orgao: string[];
  categoria: string[];
  etapa: string[];
};

export const FilterModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;


  // ESTADO DOS FILTROS

  const [filtros, setFiltros] = useState<Filtros>({
    orgao: [],
    categoria: [],
    etapa: [],
  });

  const [aberto, setAberto] = useState<string | null>(null);


  // DADOS MOCK

  const normas: Norma[] = [
    {
      codigo: "9001",
      titulo: "Gestão da Qualidade",
      orgao: "ANAC",
      categoria: "Qualidade",
      etapa: "Projeto",
    },
    {
      codigo: "9100",
      titulo: "Norma Aeronáutica",
      orgao: "EASA",
      categoria: "Segurança",
      etapa: "Teste",
    },
    {
      codigo: "9200",
      titulo: "Processos FAA",
      orgao: "FAA",
      categoria: "Segurança",
      etapa: "Projeto",
    },
  ];

 
  // OPÇÕES DO FILTRO

  const opcoes = {
    orgao: ["ANAC", "EASA", "FAA", "ISO"],
    categoria: ["Qualidade", "Segurança", "Mecânica", "Elétrico", "Certificação", "Estrutural"],
    etapa: ["Projeto", "Teste"],
  };


  // ABRIR/FECHAR MENU

  const toggleMenu = (filtro: string) => {
    setAberto((prev) => (prev === filtro ? null : filtro));
  };

 


  const toggleFiltro = (tipo: keyof Filtros, valor: string) => {
    setFiltros((prev) => {
      const existe = prev[tipo].includes(valor);

      return {
        ...prev,
        [tipo]: existe
          ? prev[tipo].filter((v) => v !== valor)
          : [...prev[tipo], valor],
      };
    });
  };


  
  const limparFiltros = () => {
    setFiltros({
      orgao: [],
      categoria: [],
      etapa: [],
    });
  };


  const normasFiltradas = normas.filter((n) => {
    const orgaoOk =
      filtros.orgao.length === 0 || filtros.orgao.includes(n.orgao);

    const categoriaOk =
      filtros.categoria.length === 0 ||
      filtros.categoria.includes(n.categoria);

    const etapaOk =
      filtros.etapa.length === 0 || filtros.etapa.includes(n.etapa);

    return orgaoOk && categoriaOk && etapaOk;
  });

 
  return (
    <div className="overlay">
      <div className="modal">

        {/* HEADER */}
        <div className="header">
          <h2>Filtros de Normas</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="content">

          {/* SIDEBAR */}
          <div className="sidebar">

            {/* ÓRGÃO */}
            <div className="filter-group" onClick={() => toggleMenu("orgao")}>
              <span>Órgão</span>
            </div>

            {aberto === "orgao" && (
              <div className="sub-options">
                {opcoes.orgao.map((item) => (
                  <label key={item}>
                    <input
                      type="checkbox"
                      checked={filtros.orgao.includes(item)}
                      onChange={() => toggleFiltro("orgao", item)}
                    />
                    {item}
                  </label>
                ))}
              </div>
            )}

            {/* CATEGORIA */}
            <div className="filter-group" onClick={() => toggleMenu("categoria")}>
              <span>Categoria</span>
            </div>

            {aberto === "categoria" && (
              <div className="sub-options">
                {opcoes.categoria.map((item) => (
                  <label key={item}>
                    <input
                      type="checkbox"
                      checked={filtros.categoria.includes(item)}
                      onChange={() => toggleFiltro("categoria", item)}
                    />
                    {item}
                  </label>
                ))}
              </div>
            )}

            {/* ETAPA */}
            <div className="filter-group" onClick={() => toggleMenu("etapa")}>
              <span>Etapa</span>
            </div>

            {aberto === "etapa" && (
              <div className="sub-options">
                {opcoes.etapa.map((item) => (
                  <label key={item}>
                    <input
                      type="checkbox"
                      checked={filtros.etapa.includes(item)}
                      onChange={() => toggleFiltro("etapa", item)}
                    />
                    {item}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* MAIN */}
          <div className="main">

            {/* FILTROS ATIVOS */}
            <div className="active-filters">
              <button onClick={limparFiltros}>Limpar filtros</button>

              <div className="tags">
                {[...filtros.orgao, ...filtros.categoria, ...filtros.etapa].length === 0 ? (
                  <p>Nenhum filtro aplicado</p>
                ) : (
                  [...filtros.orgao, ...filtros.categoria, ...filtros.etapa].map(
                    (f, i) => (
                      <span key={i} className="tag">
                        {f}
                      </span>
                    )
                  )
                )}
              </div>
            </div>

            {/* RESULTADOS */}
            <div className="results">
              <h4>
                Resultados: {normasFiltradas.length}
              </h4>

              {normasFiltradas.map((n) => (
                <div key={n.codigo} className="item">
                  <strong>{n.codigo}</strong>
                  <div>
                    <p>{n.titulo}</p>
                    <small>
                      {n.orgao} • {n.categoria} • {n.etapa}
                    </small>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* FOOTER */}
        <div className="footer">
          <button onClick={onClose}>Cancelar</button>
          <button className="apply">Aplicar filtros</button>
        </div>

      </div>
    </div>
  );
};