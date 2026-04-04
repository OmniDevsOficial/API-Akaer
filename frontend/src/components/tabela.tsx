import { TfiPencilAlt, TfiWorld } from "react-icons/tfi";
import { getUserRole } from '../utils/auth';


interface Norma {
    id: number;
    codigo: string;
    titulo: string;
    descricao: string;
    orgao: string;
    categoria: string;
    status: string;
    corStatus: string;
    visibilidade: string;
}

const normasAPI: Norma[] = [
    {
        id: 1,
        codigo: '90001',
        titulo: 'Certificação de Sistemas de Gestão da Qualidade',
        descricao: 'Melhoria na gestão de riscos',
        orgao: 'ISO',
        categoria: 'Mecânica',
        status: 'Ativa',
        corStatus: 'bg-green-500',
        visibilidade: 'Público',
    },
    {
        id: 2,
        codigo: 'RBAC 21',
        titulo: 'Certificação de Produtos e Peças Aeronáuticas',
        descricao: 'Procedimentos de aprovação de projetos',
        orgao: 'ANAC',
        categoria: 'Elétrico',
        status: 'Ativo',
        corStatus: 'bg-green-500',
        visibilidade: 'Público',
    },
    {
        id: 3,
        codigo: '90001',
        titulo: 'Airworthiness Standards — Transport Category',
        descricao: 'Requisitos estruturais e de desempenho',
        orgao: 'FAA',
        categoria: 'Certificação',
        status: 'Obsoleto',
        corStatus: 'bg-gray-400',
        visibilidade: 'Público',
    },
    {
        id: 4,
        codigo: 'RBAC 21',
        titulo: 'Aeronavegabilidade — Aviões Cat. A',
        descricao: 'Requisitos estruturais e de desempenho',
        orgao: 'ANAC',
        categoria: 'Estrutural',
        status: 'Obsoleto',
        corStatus: 'bg-gray-400',
        visibilidade: 'Público',
    },
];

export default function TabelaNormas() {

    const role = getUserRole();
    const isAdmin = role === 'admin';

    return (
        <div className="border border-font-border rounded-lg overflow-hidden">
            <table className="w-full">

                {/* Header da Tabela */}
                <thead>
                    <tr className="border-b border-font-border">
                        <th className="text-left text-xs text-gray-medium font-semibold tracking-widest px-6 py-3">CÓDIGO</th>
                        <th className="text-left text-xs text-gray-medium font-semibold tracking-widest px-6 py-3">NORMA</th>
                        <th className="text-left text-xs text-gray-medium font-semibold tracking-widest px-6 py-3">ÓRGÃO</th>
                        <th className="text-left text-xs text-gray-medium font-semibold tracking-widest px-6 py-3">CATEGORIA</th>
                        <th className="text-left text-xs text-gray-medium font-semibold tracking-widest px-6 py-3">STATUS</th>

                        {isAdmin && (
                        <th className="text-left text-xs text-gray-medium font-semibold tracking-widest px-6 py-3">
                          AÇÕES
                        </th>
                        )}

                        <th className="text-left text-xs text-gray-medium font-semibold tracking-widest px-6 py-3">VISIB.</th>

                    </tr>
                </thead>

                {/* Linhas das normas */}
                    <tbody>
                        {normasAPI.map(norma => (
                        <tr key={norma.id} className="border-b border-font-border last:border-none hover:bg-gray-50 transition-colors">

                            {/* Código — vermelho no design */}
                            <td className="px-6 py-4 text-sm text-red-akaer font-medium whitespace-nowrap">
                                {norma.codigo}
                            </td>

                            {/* Título + descrição empilhados */}
                            <td className="px-6 py-4">
                                <span className="block text-sm font-medium text-gray-900">{norma.titulo}</span>
                                <span className="block text-xs text-gray-medium">{norma.descricao}</span>
                            </td>

                            <td className="px-6 py-4 text-sm text-gray-700">{norma.orgao}</td>
                            <td className="px-6 py-4 text-sm text-gray-700">{norma.categoria}</td>

                            {/* Status com bolinha colorida */}
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-1">
                                    <span className={`w-2 h-2 rounded-full ${norma.corStatus}`}></span>
                                    <span className="text-sm text-gray-700">{norma.status}</span>
                                </div>
                            </td>

                            {/* Botões de ação */}
                            {isAdmin && (
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-1 text-gray-700 hover:text-red-akaer transition-colors cursor-pointer">
                                    <TfiPencilAlt className="p-1  text-2xl" />
                                    <span className="text-sm">Editar</span>
                                </div>
                            </td>
                            )}
                            
                            {/* Visibilidade */}
                            <td className="px-6 py-4 text-sm text-gray-700">
                                <div className="flex items-center gap-1">
                                    <TfiWorld />
                                    <span>{norma.visibilidade}</span>
                                </div>
                            </td>

                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Rodapé */}
            <div className="px-6 py-3 border-t border-font-border">
                <span className="text-xs text-gray-medium">Exibindo {normasAPI.length} de {normasAPI.length} Normas</span>
            </div>
        </div>
    );
}