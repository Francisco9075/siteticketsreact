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

interface Participante {
  id: number;
  nomeComprador: string;
  emailComprador: string;
  tipoBilhete: string;
  quantidadeComprada: number;
  pedidoFatura: boolean;
  dataCompra: string;
  metodoPagamento: string;
  estadoBilhete: "válido" | "usado" | "cancelado";
  checkIn: boolean;
  logCheckIn?: string;
}

const participantesDataInitial: Participante[] = [
  {
    id: 1,
    nomeComprador: "João Silva",
    emailComprador: "joao@example.com",
    tipoBilhete: "VIP",
    quantidadeComprada: 2,
    pedidoFatura: true,
    dataCompra: "2025-06-01 14:00:00",
    metodoPagamento: "MB Way",
    estadoBilhete: "válido",
    checkIn: true,
    logCheckIn: "2025-06-01 14:05:00",
  },
  {
    id: 2,
    nomeComprador: "Maria Oliveira",
    emailComprador: "maria@example.com",
    tipoBilhete: "Normal",
    quantidadeComprada: 1,
    pedidoFatura: false,
    dataCompra: "2025-06-02 10:00:00",
    metodoPagamento: "Cartão",
    estadoBilhete: "usado",
    checkIn: false,
  },
  {
    id: 3,
    nomeComprador: "Pedro Santos",
    emailComprador: "pedro@example.com",
    tipoBilhete: "Premium",
    quantidadeComprada: 3,
    pedidoFatura: true,
    dataCompra: "2025-06-03 16:30:00",
    metodoPagamento: "Transferência",
    estadoBilhete: "válido",
    checkIn: false,
  },
];

export default function GerirClientes() {
  const [participantesData, setParticipantesData] = useState<Participante[]>(participantesDataInitial);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [participanteEditando, setParticipanteEditando] = useState<Participante | null>(null);

  const handleEditar = (participante: Participante) => {
    setParticipanteEditando({ ...participante });
    setIsModalOpen(true);
  };

  const handleSalvar = () => {
    if (participanteEditando) {
      setParticipantesData(prev =>
        prev.map(participante =>
          participante.id === participanteEditando.id ? participanteEditando : participante
        )
      );
      setIsModalOpen(false);
      setParticipanteEditando(null);
    }
  };

  const handleCancelar = () => {
    setIsModalOpen(false);
    setParticipanteEditando(null);
  };

  const handleInputChange = (field: keyof Participante, value: any) => {
    if (participanteEditando) {
      setParticipanteEditando(prev => ({
        ...prev!,
        [field]: value
      }));
    }
  };

  const handleExcluir = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este cliente?")) {
      setParticipantesData(prev => prev.filter(participante => participante.id !== id));
    }
  };

  return (
    <>
      <h3 className="mb-4 font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
        Gestão de Clientes
      </h3>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] mt-6">

        <div className="max-w-full overflow-x-auto">
          <Table>
            {/* Cabeçalho da Tabela */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Nome</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Email</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Tipo Bilhete</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Quantidade</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Pedido de Fatura</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Data da Compra</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Método Pagamento</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Estado Bilhete</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Check-in</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Log Check-in</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Ações</TableCell>
              </TableRow>
            </TableHeader>

            {/* Corpo da Tabela */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {participantesData.map((participante) => (
                <TableRow key={participante.id}>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">{participante.nomeComprador}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">{participante.emailComprador}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">{participante.tipoBilhete}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">{participante.quantidadeComprada}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {participante.pedidoFatura ? "Sim" : "Não"}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">{participante.dataCompra}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">{participante.metodoPagamento}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <Badge
                      size="sm"
                      color={
                        participante.estadoBilhete === "válido"
                          ? "success"
                          : participante.estadoBilhete === "usado"
                            ? "warning"
                            : "error"
                      }
                    >
                      {participante.estadoBilhete}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm">
                    {participante.checkIn ? "✅" : "❌"}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {participante.logCheckIn || "-"}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start">
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1 text-xs font-medium text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors"
                        onClick={() => handleEditar(participante)}
                      >
                        Editar
                      </button>
                      <button
                        className="px-3 py-1 text-xs font-medium text-white bg-red-500 rounded hover:bg-red-600 transition-colors"
                        onClick={() => handleExcluir(participante.id)}
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
      {isModalOpen && participanteEditando && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
          <div className="pointer-events-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Editar Cliente
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
                    Nome do Comprador
                  </label>
                  <input
                    type="text"
                    value={participanteEditando.nomeComprador}
                    onChange={(e) => handleInputChange('nomeComprador', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email do Comprador
                  </label>
                  <input
                    type="email"
                    value={participanteEditando.emailComprador}
                    onChange={(e) => handleInputChange('emailComprador', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tipo de Bilhete
                  </label>
                  <select
                    value={participanteEditando.tipoBilhete}
                    onChange={(e) => handleInputChange('tipoBilhete', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="Normal">Normal</option>
                    <option value="VIP">VIP</option>
                    <option value="Premium">Premium</option>
                    <option value="Estudante">Estudante</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Quantidade Comprada
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={participanteEditando.quantidadeComprada}
                    onChange={(e) => handleInputChange('quantidadeComprada', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Método de Pagamento
                  </label>
                  <select
                    value={participanteEditando.metodoPagamento}
                    onChange={(e) => handleInputChange('metodoPagamento', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="MB Way">MB Way</option>
                    <option value="Cartão">Cartão</option>
                    <option value="Transferência">Transferência</option>
                    <option value="PayPal">PayPal</option>
                    <option value="Dinheiro">Dinheiro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Estado do Bilhete
                  </label>
                  <select
                    value={participanteEditando.estadoBilhete}
                    onChange={(e) => handleInputChange('estadoBilhete', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="válido">Válido</option>
                    <option value="usado">Usado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Data da Compra
                  </label>
                  <input
                    type="datetime-local"
                    value={participanteEditando.dataCompra.slice(0, 16)}
                    onChange={(e) => handleInputChange('dataCompra', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Log Check-in
                  </label>
                  <input
                    type="datetime-local"
                    value={participanteEditando.logCheckIn ? participanteEditando.logCheckIn.slice(0, 16) : ''}
                    onChange={(e) => handleInputChange('logCheckIn', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={participanteEditando.pedidoFatura}
                      onChange={(e) => handleInputChange('pedidoFatura', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Pedido de Fatura
                    </span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={participanteEditando.checkIn}
                      onChange={(e) => handleInputChange('checkIn', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Check-in Realizado
                    </span>
                  </label>
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