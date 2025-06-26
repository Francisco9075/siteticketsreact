import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import Badge from "../../ui/badge/Badge";
import { X, RefreshCw, CheckCircle, AlertCircle, XCircle, AlertTriangle } from "lucide-react";

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

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

interface ConfirmModal {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  type: 'danger' | 'warning' | 'info';
}

function ToastContainer({ toasts, removeToast }: { toasts: Toast[], removeToast: (id: string) => void }) {
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[99999] pointer-events-none p-4">
      <div className="space-y-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              flex items-center p-6 rounded-xl shadow-2xl min-w-96 max-w-md pointer-events-auto
              animate-in fade-in slide-in-from-top-4 duration-300
              ${toast.type === 'success' ? 'bg-green-500 text-white' : ''}
              ${toast.type === 'error' ? 'bg-red-500 text-white' : ''}
              ${toast.type === 'warning' ? 'bg-yellow-500 text-white' : ''}
              ${toast.type === 'info' ? 'bg-blue-500 text-white' : ''}
            `}
          >
            <div className="flex-shrink-0 mr-4">
              {toast.type === 'success' && <CheckCircle className="w-6 h-6 text-white" />}
              {toast.type === 'error' && <XCircle className="w-6 h-6 text-white" />}
              {toast.type === 'warning' && <AlertTriangle className="w-6 h-6 text-white" />}
              {toast.type === 'info' && <AlertCircle className="w-6 h-6 text-white" />}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-lg text-white">{toast.title}</h4>
              <p className="text-sm mt-1 text-white/90">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 ml-4 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConfirmationModal({ modal, onConfirm, onCancel }: { 
  modal: ConfirmModal, 
  onConfirm: () => void, 
  onCancel: () => void 
}) {
  if (!modal.isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9998] p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center mb-4">
          <div className={`
            flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-3
            ${modal.type === 'danger' ? 'bg-red-100 text-red-600' : ''}
            ${modal.type === 'warning' ? 'bg-yellow-100 text-yellow-600' : ''}
            ${modal.type === 'info' ? 'bg-blue-100 text-blue-600' : ''}
          `}>
            {modal.type === 'danger' && <XCircle className="w-6 h-6" />}
            {modal.type === 'warning' && <AlertTriangle className="w-6 h-6" />}
            {modal.type === 'info' && <AlertCircle className="w-6 h-6" />}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{modal.title}</h3>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">{modal.message}</p>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`
              px-4 py-2 text-white rounded-lg transition-colors
              ${modal.type === 'danger' ? 'bg-red-600 hover:bg-red-700' : ''}
              ${modal.type === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
              ${modal.type === 'info' ? 'bg-blue-600 hover:bg-blue-700' : ''}
            `}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
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
  const [carregando, setCarregando] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [participanteEditando, setParticipanteEditando] = useState<Participante | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmModal, setConfirmModal] = useState<ConfirmModal>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    onCancel: () => {},
    type: 'info'
  });

  const addToast = (type: Toast['type'], title: string, message: string) => {
    const id = Date.now().toString();
    const newToast: Toast = { id, type, title, message };
    setToasts(prev => [...prev, newToast]);
    
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showConfirmModal = (
    title: string, 
    message: string, 
    onConfirm: () => void, 
    type: ConfirmModal['type'] = 'info'
  ) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm,
      onCancel: () => setConfirmModal(prev => ({ ...prev, isOpen: false })),
      type
    });
  };

  const buscarParticipantes = () => {
    setCarregando(true);
    // Simulação de requisição à API
    setTimeout(() => {
      setParticipantesData(participantesDataInitial);
      setCarregando(false);
      // Removido: addToast('success', 'Sucesso', 'Clientes carregados com sucesso.');
    }, 1000);
  };

  useEffect(() => {
    buscarParticipantes();
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        buscarParticipantes();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const handleEditar = (participante: Participante) => {
    setParticipanteEditando({ ...participante });
    setIsModalOpen(true);
  };

  const handleSalvar = () => {
    if (!participanteEditando) return;

    const participanteOriginal = participantesData.find(p => p.id === participanteEditando.id);
    const houveAlteracoes = participanteOriginal && Object.keys(participanteOriginal).some(
      key => participanteOriginal[key as keyof Participante] !== participanteEditando[key as keyof Participante]
    );

    if (!houveAlteracoes) {
      addToast('warning', 'Sem alterações', 'Nenhuma alteração foi feita no cliente.');
      return;
    }

    setSalvando(true);
    
    setTimeout(() => {
      setParticipantesData(prev =>
        prev.map(participante =>
          participante.id === participanteEditando.id ? participanteEditando : participante
        )
      );
      setIsModalOpen(false);
      setParticipanteEditando(null);
      setSalvando(false);
      addToast('success', 'Sucesso!', 'Cliente atualizado com sucesso.');
    }, 1000);
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
    const participante = participantesData.find(p => p.id === id);
    if (!participante) {
      addToast('error', 'Erro', 'Cliente não encontrado para exclusão.');
      return;
    }

    showConfirmModal(
      'Excluir cliente',
      `Tem certeza que deseja excluir o cliente "${participante.nomeComprador}"? Esta ação não pode ser desfeita.`,
      () => {
        setTimeout(() => {
          setParticipantesData(prev => prev.filter(participante => participante.id !== id));
          addToast('success', 'Sucesso', 'Cliente excluído com sucesso.');
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }, 1000);
      },
      'danger'
    );
  };

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <ConfirmationModal 
        modal={confirmModal}
        onConfirm={confirmModal.onConfirm}
        onCancel={confirmModal.onCancel}
      />

      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
          Gestão de Clientes
        </h3>
        <button
          onClick={buscarParticipantes}
          disabled={carregando}
          className="flex items-center gap-2 px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${carregando ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] mt-6">
        <div className="max-w-full overflow-x-auto">
          {carregando ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-500">A carregar clientes...</span>
            </div>
          ) : participantesData.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum cliente encontrado.</p>
            </div>
          ) : (
            <Table>
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
          )}
        </div>
      </div>

      {isModalOpen && participanteEditando && (
        <div className="fixed inset-0 flex items-center justify-center z-[9997] p-4 bg-black/50">
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
                disabled={salvando}
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvar}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                disabled={salvando}
              >
                {salvando && <RefreshCw className="w-4 h-4 animate-spin" />}
                {salvando ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}