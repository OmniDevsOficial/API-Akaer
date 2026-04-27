import { useState, useRef, type KeyboardEvent } from "react";
import { Pencil, Trash2, Check, X } from "lucide-react";

interface Nota {
  id: number;
  texto: string;
}

interface NotasFieldProps {
  label?: string;
  placeholder?: string;
  value?: Nota[];
  onChange?: (notas: Nota[]) => void;
}

export function NotasField({
  label = "Notas",
  placeholder = "Digite uma nota e pressione Enter para adicionar…",
  value,
  onChange,
}: NotasFieldProps) {
  const [notasInternas, setNotasInternas] = useState<Nota[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [textoEdicao, setTextoEdicao] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const editRef = useRef<HTMLTextAreaElement>(null);

  // Suporte a modo controlado (value + onChange) ou não controlado
  // value: state externo, onChange: função para atualizar o estado externo
  const notas = value ?? notasInternas;
  const setNotas = (updater: Nota[] | ((prev: Nota[]) => Nota[])) => {
    const novasNotas =
      typeof updater === "function" ? updater(notas) : updater;
    if (onChange) {
      onChange(novasNotas);
    } else {
      setNotasInternas(novasNotas);
    }
  };

  // Adicionar nova nota

  const adicionarNota = () => {
    const texto = inputValue.trim();
    if (!texto) return;
    setNotas((prev) => [{ id: Date.now(), texto }, ...prev]);
    setInputValue("");
    inputRef.current?.focus();
  };

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      adicionarNota();
    }
    if (e.key === "Escape") {
      setInputValue("");
      inputRef.current?.blur();
    }
  };

  // Editar nota existente

  const iniciarEdicao = (nota: Nota) => {
    setEditandoId(nota.id);
    setTextoEdicao(nota.texto);
    setTimeout(() => {
      editRef.current?.focus();
      editRef.current?.setSelectionRange(
        editRef.current.value.length,
        editRef.current.value.length
      );
    }, 0);
  };

  const confirmarEdicao = () => {
    const texto = textoEdicao.trim();
    if (!texto) return;
    setNotas((prev) =>
      prev.map((n) => (n.id === editandoId ? { ...n, texto } : n))
    );
    setEditandoId(null);
    setTextoEdicao("");
  };

  const cancelarEdicao = () => {
    setEditandoId(null);
    setTextoEdicao("");
  };

  const handleEditKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      confirmarEdicao();
    }
    if (e.key === "Escape") {
      cancelarEdicao();
    }
  };

  // Remover nota

  const removerNota = (id: number) => {
    setNotas((prev) => prev.filter((n) => n.id !== id));
    if (editandoId === id) cancelarEdicao();
  };

  const hasNotas = notas.length > 0;

  return (
    <div className="flex flex-col text-start gap-1">
      {/* Label */}
      <label className="text-lg text-gray-600 mb-0 leading-none">
        {label}
      </label>

      {hasNotas ? (
        <div className="rounded-md border border-gray-200 bg-white p-3">
          {/* Input de nova nota */}
          <div
            className="flex items-center gap-2 rounded border bg-gray-100/80 h-10 px-2 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all cursor-text"
            onClick={() => inputRef.current?.focus()}
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder={placeholder}
              className="flex-1 bg-transparent text-gray-800 outline-none"
            />
            {inputValue.trim() && (
              <span className="shrink-0 text-xs text-gray-400 select-none">
                Enter ↵
              </span>
            )}
          </div>

          {/* Lista de notas */}
          <ul className="mt-3 flex flex-col gap-1.5">
            {notas.map((nota, index) => (
              <li
                key={nota.id}
                className={`flex items-start gap-2.5 rounded-md border px-3 py-2.5 transition-colors ${
                  editandoId === nota.id
                    ? "border-blue-400 bg-blue-50/50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                {/* Índice */}
                <span className="mt-0.5 shrink-0 rounded bg-gray-200 px-1.5 py-0.5 text-[11px] text-black select-none">
                  {index + 1}
                </span>

                {/* Texto ou textarea de edição */}
                <div className="flex-1 min-w-0">
                  {editandoId === nota.id ? (
                    <textarea
                      ref={editRef}
                      value={textoEdicao}
                      onChange={(e) => setTextoEdicao(e.target.value)}
                      onKeyDown={handleEditKeyDown}
                      rows={3}
                      className="w-full resize-none bg-transparent text-sm text-gray-800 outline-none leading-relaxed"
                    />
                  ) : (
                    <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap break-words">
                      {nota.texto}
                    </p>
                  )}
                </div>

                {/* Ações */}
                <div className="flex shrink-0 items-center gap-0.5 mt-0.5">
                  {editandoId === nota.id ? (
                    <>
                      <button
                        type="button"
                        onClick={confirmarEdicao}
                        title="Confirmar edição"
                        className="rounded p-1 text-green-600 hover:bg-green-50 transition-colors"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={cancelarEdicao}
                        title="Cancelar edição"
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => iniciarEdicao(nota)}
                        title="Editar nota"
                        className="rounded p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removerNota(nota.id)}
                        title="Remover nota"
                        className="rounded p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div
          className="flex items-center gap-2 rounded border bg-gray-100/80 px-2 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all cursor-text"
          onClick={() => inputRef.current?.focus()}
        >
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-gray-800 h-10 outline-none"
          />
          {inputValue.trim() && (
            <span className="shrink-0 text-xs text-gray-400 select-none">
              Enter ↵
            </span>
          )}
        </div>
      )}
    </div>
  );
}