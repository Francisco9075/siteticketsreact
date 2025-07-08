import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import Badge from "../../ui/badge/Badge";
import { X, RefreshCw, CheckCircle, AlertCircle, XCircle, AlertTriangle } from "lucide-react";

interface Cliente {
  ID_Clientes: number;
  Nome: string;
  Email: string | null;
  Contacto: string | null;
  NIF: string | null;
  Morada: string | null;
  Pedido_Fatura: number;
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

export default function GerirClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [editandoCliente, setEditandoCliente] = useState<Cliente | null>(null);
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

  useEffect(() => {
    buscarClientes();
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        buscarClientes();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  function buscarClientes() {
    setCarregando(true);
    fetch("http://localhost/api.php?action=gerir_clientes")
      .then((res) => res.json())
      .then((data) => {
        if (data.sucesso) {
          setClientes(data.clientes);
          if (data.clientes.length === 0) {
            addToast('info', 'Sem clientes', 'Nenhum cliente foi encontrado no sistema.');
          }
        } else {
          addToast('error', 'Erro ao carregar', 'Não foi possível carregar os clientes. Tente novamente.');
        }
        setCarregando(false);
      })
      .catch((err) => {
        console.error("Erro na requisição:", err);
        addToast('error', 'Erro de conexão', 'Falha na comunicação com o servidor. Verifique sua conexão.');
        setCarregando(false);
      });
  }

  function handleDelete(id: number) {
    if (!id) {
      addToast('error', 'Erro', 'ID inválido para exclusão do cliente.');
      return;
    }

    showConfirmModal(
      'Excluir cliente',
      'Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.',
      () => {
        fetch("http://localhost/api.php?action=apagar_cliente", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id_cliente: id }),
        })
          .then((res) => {
            if (!res.ok) {
              throw new Error('Erro na resposta do servidor');
            }
            return res.json();
          })
          .then((data) => {
            if (data.sucesso) {
              setClientes((prev) => prev.filter((c) => c.ID_Clientes !== id));
              addToast('success', 'Sucesso!', 'Cliente excluído com sucesso.');
            } else {
              addToast('error', 'Erro ao excluir', data.erro || 'Ocorreu um erro inesperado.');
            }
          })
          .catch((error) => {
            console.error("Erro na exclusão:", error);
            addToast('error', 'Erro de conexão', 'Falha ao comunicar com o servidor para excluir o cliente.');
          })
          .finally(() => {
            setConfirmModal(prev => ({ ...prev, isOpen: false }));
          });
      },
      'danger'
    );
  }

  function handleEdit(cliente: Cliente) {
    setEditandoCliente({ ...cliente });
  }

  function handleSave() {
    if (!editandoCliente) return;

    // Verificar se houve alterações
    const clienteOriginal = clientes.find(c => c.ID_Clientes === editandoCliente.ID_Clientes);
    const houveAlteracoes = clienteOriginal && Object.keys(clienteOriginal).some(
      key => clienteOriginal[key as keyof Cliente] !== editandoCliente[key as keyof Cliente]
    );

    if (!houveAlteracoes) {
      addToast('warning', 'Sem alterações', 'Nenhuma alteração foi feita no cliente.');
      return;
    }

    setSalvando(true);

    const payload = {
      id_cliente: editandoCliente.ID_Clientes,
      nome: editandoCliente.Nome,
      email: editandoCliente.Email,
      contacto: editandoCliente.Contacto,
      nif: editandoCliente.NIF,
      morada: editandoCliente.Morada,
      pedido_fatura: editandoCliente.Pedido_Fatura
    };

    fetch("http://localhost/api.php?action=editar_cliente", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        setSalvando(false);
        if (data.sucesso) {
          setClientes((prev) =>
            prev.map((c) =>
              c.ID_Clientes === editandoCliente.ID_Clientes ? editandoCliente : c
            )
          );
          setEditandoCliente(null);
          addToast('success', 'Sucesso!', 'Cliente atualizado com sucesso.');
        } else {
          addToast('error', 'Erro ao salvar', data.erro || 'Ocorreu um erro ao atualizar o cliente.');
        }
      })
      .catch((error) => {
        setSalvando(false);
        console.error("Erro ao salvar:", error);
        addToast('error', 'Erro de conexão', 'Falha ao comunicar com o servidor para salvar as alterações.');
      });
  }

  function handleInputChange(field: keyof Cliente, value: any) {
    if (!editandoCliente) return;
    setEditandoCliente({
      ...editandoCliente,
      [field]: field === "Pedido_Fatura" ? (value ? 1 : 0) : value,
    });
  }

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
          onClick={buscarClientes}
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
          ) : clientes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum cliente encontrado.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                    ID
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                    Nome
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                    Email
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                    Contacto
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                    NIF
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                    Morada
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                    Pedido Fatura
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                    Ações
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {clientes.map((cliente) => (
                  <TableRow key={cliente.ID_Clientes}>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {cliente.ID_Clientes}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {cliente.Nome}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {cliente.Email || "-"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {cliente.Contacto || "-"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {cliente.NIF || "-"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {cliente.Morada || "-"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-theme-sm">
                      <Badge
                        size="sm"
                        color={cliente.Pedido_Fatura ? "success" : "warning"}
                      >
                        {cliente.Pedido_Fatura ? "Sim" : "Não"}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start">
                      <div className="flex gap-2">
                        <button
                          className="px-3 py-1 text-xs font-medium text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors"
                          onClick={() => handleEdit(cliente)}
                        >
                          Editar
                        </button>
                        <button
                          className="px-3 py-1 text-xs font-medium text-white bg-red-500 rounded hover:bg-red-600 transition-colors"
                          onClick={() => handleDelete(cliente.ID_Clientes)}
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

      {editandoCliente && (
        <div className="fixed inset-0 flex items-center justify-center z-[9997] p-4 bg-black/30">
          <div className="pointer-events-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Editar Cliente
              </h2>
              <button
                onClick={() => setEditandoCliente(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={editandoCliente.Nome}
                    onChange={(e) => handleInputChange("Nome", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editandoCliente.Email || ''}
                    onChange={(e) => handleInputChange("Email", e.target.value || null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Contacto
                  </label>
                  <input
                    type="text"
                    value={editandoCliente.Contacto || ''}
                    onChange={(e) => handleInputChange("Contacto", e.target.value || null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    NIF
                  </label>
                  <input
                    type="text"
                    value={editandoCliente.NIF || ''}
                    onChange={(e) => handleInputChange("NIF", e.target.value || null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Morada
                </label>
                <textarea
                  value={editandoCliente.Morada || ''}
                  onChange={(e) => handleInputChange("Morada", e.target.value || null)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  rows={3}
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editandoCliente.Pedido_Fatura === 1}
                    onChange={(e) => handleInputChange("Pedido_Fatura", e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Pedido de Fatura
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setEditandoCliente(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                disabled={salvando}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
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