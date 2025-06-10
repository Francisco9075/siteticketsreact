import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import Badge from "../../ui/badge/Badge";
import { X } from "lucide-react";

interface Evento {
  id: number;
  nome: string;
  descricao: string;
  dataInicio: string;
  dataFim: string;
  imagem: string;
  estado: string;
  categoria: string;
  cartaz: string;
  localizacao: string;
  dataPublicacao: string;
  linkUnico: string;
}

const eventoDataInitial: Evento[] = [
  {
    id: 1,
    nome: "Festival de Música",
    descricao: "Evento com bandas locais e food trucks",
    dataInicio: "2025-07-01",
    dataFim: "2025-07-02",
    imagem: "/images/eventos/festival-musica.jpg",
    estado: "Ativo",
    categoria: "Música",
    cartaz: "/images/eventos/cartaz1.jpg",
    localizacao: "Parque da Cidade",
    dataPublicacao: "2025-06-01",
    linkUnico: "festival-musica-2025",
  },
  {
    id: 2,
    nome: "Conferência Tech",
    descricao: "Palestras sobre IA, Web3 e Startups",
    dataInicio: "2025-09-15",
    dataFim: "2025-09-17",
    imagem: "/images/eventos/tech.jpg",
    estado: "Concluído",
    categoria: "Tecnologia",
    cartaz: "/images/eventos/cartaz2.jpg",
    localizacao: "Centro de Congressos",
    dataPublicacao: "2025-05-20",
    linkUnico: "tech-conferencia-2025",
  },
];

export default function GerirEventos() {
  const [eventoData, setEventoData] = useState<Evento[]>(eventoDataInitial);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventoEditando, setEventoEditando] = useState<Evento | null>(null);

  const handleEditar = (evento: Evento) => {
    setEventoEditando({ ...evento });
    setIsModalOpen(true);
  };

  const handleSalvar = () => {
    if (eventoEditando) {
      setEventoData(prev => 
        prev.map(evento => 
          evento.id === eventoEditando.id ? eventoEditando : evento
        )
      );
      setIsModalOpen(false);
      setEventoEditando(null);
    }
  };

  const handleCancelar = () => {
    setIsModalOpen(false);
    setEventoEditando(null);
  };

  const handleInputChange = (field: keyof Evento, value: string) => {
    if (eventoEditando) {
      setEventoEditando(prev => ({
        ...prev!,
        [field]: value
      }));
    }
  };

  const handleExcluir = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este evento?")) {
      setEventoData(prev => prev.filter(evento => evento.id !== id));
    }
  };

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] mt-6">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Nome</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Descrição</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Data Início</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Data Fim</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Estado</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Categoria</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Localização</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Publicação</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Link</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Ações</TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {eventoData.map((evento) => (
                <TableRow key={evento.id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start font-medium text-sm text-gray-800 dark:text-white/90">
                    {evento.nome}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-sm text-gray-500 dark:text-gray-400">
                    {evento.descricao}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-sm text-gray-500 dark:text-gray-400">
                    {evento.dataInicio}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-sm text-gray-500 dark:text-gray-400">
                    {evento.dataFim}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-sm">
                    <Badge
                      size="sm"
                      color={
                        evento.estado === "Ativo"
                          ? "success"
                          : evento.estado === "Cancelado"
                          ? "error"
                          : "warning"
                      }
                    >
                      {evento.estado}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-sm text-gray-500 dark:text-gray-400">
                    {evento.categoria}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-sm text-gray-500 dark:text-gray-400">
                    {evento.localizacao}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-sm text-gray-500 dark:text-gray-400">
                    {evento.dataPublicacao}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-sm text-blue-600 dark:text-blue-400 underline">
                    {evento.linkUnico}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start">
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1 text-xs font-medium text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors"
                        onClick={() => handleEditar(evento)}
                      >
                        Editar
                      </button>
                      <button
                        className="px-3 py-1 text-xs font-medium text-white bg-red-500 rounded hover:bg-red-600 transition-colors"
                        onClick={() => handleExcluir(evento.id)}
                      >
                        Excluir
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modal de Edição */}
      {isModalOpen && eventoEditando && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
          <div className="pointer-events-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Editar Evento
              </h2>
              <button
                onClick={handleCancelar}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nome do Evento
                  </label>
                  <input
                    type="text"
                    value={eventoEditando.nome}
                    onChange={(e) => handleInputChange('nome', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Categoria
                  </label>
                  <select
                    value={eventoEditando.categoria}
                    onChange={(e) => handleInputChange('categoria', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="Música">Música</option>
                    <option value="Tecnologia">Tecnologia</option>
                    <option value="Esporte">Esporte</option>
                    <option value="Arte">Arte</option>
                    <option value="Educação">Educação</option>
                    <option value="Negócios">Negócios</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descrição
                </label>
                <textarea
                  value={eventoEditando.descricao}
                  onChange={(e) => handleInputChange('descricao', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Data de Início
                  </label>
                  <input
                    type="date"
                    value={eventoEditando.dataInicio}
                    onChange={(e) => handleInputChange('dataInicio', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Data de Fim
                  </label>
                  <input
                    type="date"
                    value={eventoEditando.dataFim}
                    onChange={(e) => handleInputChange('dataFim', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Localização
                  </label>
                  <input
                    type="text"
                    value={eventoEditando.localizacao}
                    onChange={(e) => handleInputChange('localizacao', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Estado
                  </label>
                  <select
                    value={eventoEditando.estado}
                    onChange={(e) => handleInputChange('estado', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Concluído">Concluído</option>
                    <option value="Cancelado">Cancelado</option>
                    <option value="Adiado">Adiado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Data de Publicação
                  </label>
                  <input
                    type="date"
                    value={eventoEditando.dataPublicacao}
                    onChange={(e) => handleInputChange('dataPublicacao', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Link Único
                  </label>
                  <input
                    type="text"
                    value={eventoEditando.linkUnico}
                    onChange={(e) => handleInputChange('linkUnico', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    URL da Imagem
                  </label>
                  <input
                    type="text"
                    value={eventoEditando.imagem}
                    onChange={(e) => handleInputChange('imagem', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    URL do Cartaz
                  </label>
                  <input
                    type="text"
                    value={eventoEditando.cartaz}
                    onChange={(e) => handleInputChange('cartaz', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleCancelar}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvar}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}