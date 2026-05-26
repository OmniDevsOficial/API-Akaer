import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import api from '@/services/api';
import type { Solicitacao } from './tabela-solicitar';

export type TipoSolicitacaoRaw = 'NOVA_NORMA' | 'NOVA_NOTA' | 'REPORTE_ERRO';

interface DadosNorma {
    codigo?: string;
    titulo?: string;
    orgao_emissor_id?: string;
    categoria_id?: string;
    etapa_projeto_id?: string;
    revisao?: string;
    status?: string;
    data_publicacao?: string;
    escopo?: string;
    palavras_chave?: string[];
}

interface DadosSolicitacao {
    solicitante?: string;
    norma_id?: string;
    descricao?: string;
    referencia?: string;
    utilidade?: string;
    dados_norma?: DadosNorma;
}

interface SolicitacaoDetalhes {
    id: number;
    tipo_solicitacao: TipoSolicitacaoRaw;
    status: string;
    dados_propostos: DadosSolicitacao;
    norma_id: string | null;
    data_criacao: string;
    usuario: { nome: string; role: string };
}

interface ModalAvaliacaoCheckerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    solicitacao: Solicitacao | null;
    onSuccess: (id: number) => void;
    modo?: "avaliacao" | "detalhes";
}

type EtapaModal = 'visualizando' | 'rejeitando' | 'concluido';
type ResultadoAcao = 'aprovada' | 'reprovada';

function CampoLeitura({ label, valor }: { label: string; valor?: string | null }) {
    if (!valor) return null;
    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase">
                {label}
            </span>
            <span className="text-sm text-gray-800 break-words">{valor}</span>
        </div>
    );
}

function Spinner({ className = 'h-4 w-4' }: { className?: string }) {
    return (
        <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
    );
}

function DadosNovaNotaOuErro({ dados, criacao, status, tipo }: { dados: DadosSolicitacao; criacao: string; status: string, tipo: string }) {
    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-lg border border-font-border">
                <CampoLeitura label="Solicitante" valor={dados.solicitante} />
                <CampoLeitura label="Tipo" valor={tipo} />
                <CampoLeitura label="Data de criação" valor={new Date(criacao).toLocaleDateString('pt-BR')} />
                <CampoLeitura label="Status atual" valor={status} />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <CampoLeitura label="Norma relacionada" valor={dados.norma_id} />
            </div>
            <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase">
                    {tipo === 'Nova Nota' ? 'Nota sugerida' : 'Detalhes do erro'}
                </span>
                <p className="text-sm text-gray-800 bg-gray-50 border border-font-border rounded p-3 whitespace-pre-wrap min-h-[80px]">
                    {dados.descricao || '—'}
                </p>
            </div>
        </div>
    );
}

function DadosNovaNorma({ dados, criacao, status }: { dados: DadosSolicitacao; criacao: string; status: string }) {
    const dn = dados.dados_norma ?? {};
    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-lg border border-font-border">
                <CampoLeitura label="Solicitante" valor={dados.solicitante} />
                <CampoLeitura label="Tipo" valor="Nova Norma" />
                <CampoLeitura label="Data de criação" valor={new Date(criacao).toLocaleDateString('pt-BR')} />
                <CampoLeitura label="Status atual" valor={status} />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <CampoLeitura label="Referência externa" valor={dados.referencia} />
                <CampoLeitura label="Utilidade" valor={dados.utilidade} />
            </div>
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase">Dados da Norma</span>
                    <div className="flex-1 h-px bg-font-border" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <CampoLeitura label="Código" valor={dn.codigo} />
                    <CampoLeitura label="Título" valor={dn.titulo} />
                    <CampoLeitura label="Status" valor={dn.status} />
                    <CampoLeitura label="Revisão" valor={dn.revisao} />
                    <CampoLeitura label="Data de publicação" valor={dn.data_publicacao} />
                </div>
                {dn.escopo && (
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase">Escopo</span>
                        <p className="text-sm text-gray-800 bg-gray-50 border border-font-border rounded p-3 whitespace-pre-wrap">{dn.escopo}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ModalAvaliacaoChecker({
    open,
    onOpenChange,
    solicitacao,
    onSuccess,
    modo = "avaliacao",
}: ModalAvaliacaoCheckerProps) {
    const [detalhes, setDetalhes] = useState<SolicitacaoDetalhes | null>(null);
    const [carregando, setCarregando] = useState(false);
    const [erroCarregamento, setErroCarregamento] = useState<string | null>(null);
    const [etapa, setEtapa] = useState<EtapaModal>('visualizando');
    const [resultado, setResultado] = useState<ResultadoAcao | null>(null);
    const [motivoRejeicao, setMotivoRejeicao] = useState('');
    const [erroMotivo, setErroMotivo] = useState<string | null>(null);
    const [enviando, setEnviando] = useState(false);

    useEffect(() => {
        if (!open || !solicitacao) return;

        let ativo = true;
        setCarregando(true);
        setErroCarregamento(null);
        setDetalhes(null);

        api.get<SolicitacaoDetalhes>(`/solicitacoes/${solicitacao.id}`)
            .then((res) => { if (ativo) setDetalhes(res.data); })
            .catch(() => { if (ativo) setErroCarregamento('Não foi possível carregar os detalhes da solicitação.'); })
            .finally(() => { if (ativo) setCarregando(false); });

        return () => { ativo = false; };
    }, [open, solicitacao?.id]);

    const resetModal = () => {
        setDetalhes(null);
        setEtapa('visualizando');
        setMotivoRejeicao('');
        setErroMotivo(null);
    };

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) resetModal();
        onOpenChange(nextOpen);
    };

    const handleAprovar = async () => {
        if (!solicitacao) return;
        setEnviando(true);
        try {
            await api.patch(`/solicitacoes/${solicitacao.id}/status`, { status: 'Aprovada' });
            setResultado('aprovada');
            setEtapa('concluido');
            onSuccess(solicitacao.id);
        } catch (err: any) {
            alert(err?.response?.data?.error ?? 'Erro ao aprovar a solicitação.');
        } finally {
            setEnviando(false);
        }
    };

    const handleConfirmarRejeicao = async () => {
        if (!solicitacao) return;
        if (!motivoRejeicao.trim()) {
            setErroMotivo('O preenchimento do motivo é obrigatório para rejeitar.');
            return;
        }

        setEnviando(true);
        try {
            await api.patch(`/solicitacoes/${solicitacao.id}/status`, {
                status: 'Reprovada',
                motivo_rejeicao: motivoRejeicao.trim(),
            });
            setResultado('reprovada');
            setEtapa('concluido');
            onSuccess(solicitacao.id);
        } catch (err: any) {
            alert(err?.response?.data?.error ?? 'Erro ao rejeitar a solicitação.');
        } finally {
            setEnviando(false);
        }
    };

    const renderDados = () => {
        if (carregando) return <div className="flex items-center justify-center py-12 text-gray-400 gap-2"><Spinner /> Carregando...</div>;
        if (erroCarregamento) return <p className="text-sm text-red-akaer py-8 text-center">{erroCarregamento}</p>;
        if (!detalhes) return null;

        const { dados_propostos, tipo_solicitacao, data_criacao, status } = detalhes;

        if (tipo_solicitacao === 'NOVA_NOTA') return <DadosNovaNotaOuErro dados={dados_propostos} criacao={data_criacao} status={status} tipo="Nova Nota" />;
        if (tipo_solicitacao === 'REPORTE_ERRO') return <DadosNovaNotaOuErro dados={dados_propostos} criacao={data_criacao} status={status} tipo="Reporte de Erro" />;
        if (tipo_solicitacao === 'NOVA_NORMA') return <DadosNovaNorma dados={dados_propostos} criacao={data_criacao} status={status} />;
        return null;
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="!p-0 flex flex-col gap-0 sm:!max-w-[600px] bg-[#fbfbfb]">
                <div className="flex items-start mx-7 mt-5 mb-4">
                    <div>
                        <p className="text-xs font-semibold tracking-widest text-red-akaer uppercase">
                            {modo === "detalhes" ? "Detalhes · Admin" : "Avaliação · Checker"}
                        </p>
                        <h2 className="text-lg font-medium text-dark-title leading-tight">{solicitacao?.tipo || 'Solicitação'}</h2>
                    </div>
                </div>
                <hr className="border-font-border" />

                {etapa === 'concluido' ? (
                    <>
                        <div className="flex flex-col items-center justify-center py-16 gap-4">
                            <div className={`w-12 h-12 rounded-full border flex items-center justify-center ${resultado === 'aprovada' ? 'border-green-700/40' : 'border-red-400/40'}`}>
                                {resultado === 'aprovada' ? <Check className="text-green-700 w-7 h-7" /> : <X className="text-red-akaer w-7 h-7" />}
                            </div>
                            <h3 className="text-base text-[#3f3f3f] font-semibold">
                                {resultado === 'aprovada' ? 'Solicitação aprovada com sucesso!' : 'Solicitação reprovada.'}
                            </h3>
                        </div>
                        <hr className="border-font-border" />
                        <div className="flex justify-end mx-7 my-4">
                            <Button size="lg" className="hover:bg-black/80" onClick={() => handleOpenChange(false)}>Fechar</Button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="mx-7 my-5 flex flex-col gap-5 max-h-[60vh] overflow-y-auto pr-1">
                            {renderDados()}
                            {etapa === 'rejeitando' && (
                                <div className="flex flex-col gap-2 pt-1 border-t border-font-border">
                                    <label className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase mt-3">
                                        Motivo da rejeição <span className="text-red-akaer">*</span>
                                    </label>
                                    <textarea
                                        value={motivoRejeicao}
                                        onChange={(e) => { setMotivoRejeicao(e.target.value); if (erroMotivo) setErroMotivo(null); }}
                                        rows={4} disabled={enviando}
                                        placeholder="Descreva tecnicamente o motivo da rejeição..."
                                        className={`bg-gray-100/80 border rounded p-3 text-sm outline-none focus:ring-1 focus:ring-gray-400 resize-none ${erroMotivo ? 'border-red-400' : 'border-font-border'}`}
                                    />
                                    {erroMotivo && <span className="text-xs text-red-akaer">{erroMotivo}</span>}
                                </div>
                            )}
                        </div>
                        <hr className="border-font-border" />
                        <div className="flex justify-between items-center mx-7 my-4 gap-2">
                            {modo === "detalhes" ? (
                                // Modo leitura quando for admin
                                <div className="flex justify-end w-full">
                                    <Button size="lg" variant="outline" onClick={() => handleOpenChange(false)} className="border-gray-200 text-gray-600">
                                        Fechar
                                    </Button>
                                </div>
                            ) : (
                                // Modo avaliação, tanto checker, quanto admin
                                <>
                                    <Button type="button" size="lg" variant="outline" onClick={() => handleOpenChange(false)} disabled={enviando} className="border-gray-200 text-gray-600 hover:text-dark-title">Cancelar</Button>
                                    <div className="flex gap-2">
                                        <Button type="button" size="lg" variant="outline" onClick={() => setEtapa('rejeitando')} disabled={enviando || carregando} className="border-red-300 text-red-akaer hover:bg-red-50 hover:text-red-akaer">
                                            <X className="w-4 h-4 mr-1" /> Rejeitar
                                        </Button>
                                        <Button type="button" size="lg" onClick={handleAprovar} disabled={enviando || carregando} className="bg-green-700 hover:bg-green-800 text-white">
                                            {enviando ? <Spinner className="mr-2" /> : <Check className="w-4 h-4 mr-1" />} Aprovar
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}