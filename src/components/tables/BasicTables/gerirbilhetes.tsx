import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import Badge from "../../ui/badge/Badge";
import { X, ShoppingCart, ExternalLink, RefreshCw, CheckCircle, AlertCircle, XCircle, AlertTriangle } from "lucide-react";

interface Bilhete {
  ID_Bilhetes: number;
  NOME: string;
  Tipo: string;
  Quant_Total: number;
  Quant_Vendida: number;
  percentualLotacao: any;
  Preco: number;
  Gratuito: boolean;
  payment_page_url: string;
  Evento_Nome: string;
  Estado_Nome: string;
  ID_Estado_Bilhete: number;
  Desconto: number
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

export default function GerirBilhetes() {
  const [bilhetes, setBilhetes] = useState<Bilhete[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [editandoBilhete, setEditandoBilhete] = useState<Bilhete | null>(null);
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
    buscarBilhetes();
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        buscarBilhetes();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const estadosBilhete = [
  { id: 1, nome: "Ativo" },
  { id: 2, nome: "Desativado" },
  { id: 3, nome: "Esgotado" }
  ];

  const quantDesconto = [
  { id: 0, nome: "0%" },
  { id: 10, nome: "10%" },
  { id: 20, nome: "20%" },
  { id: 30, nome: "30%" },
  { id: 40, nome: "40%" },
  { id: 50, nome: "50%" },
  { id: 60, nome: "60%" },
  { id: 70, nome: "70%" },
  { id: 80, nome: "80%" },
  { id: 90, nome: "90%" }
  ];

  function buscarBilhetes() {
    setCarregando(true);
    fetch("http://localhost/api.php?action=gerir_bilhetes")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          // Calculate percentage for each ticket
          const bilhetesComPercentual = data.bilhetes.map((bilhete: Bilhete) => ({
            ...bilhete,
            percentualLotacao: bilhete.Quant_Total > 0 
              ? Math.min(Math.round((bilhete.Quant_Vendida / bilhete.Quant_Total) * 100), 100)
              : 0
          }));
          setBilhetes(bilhetesComPercentual);
          if (data.bilhetes.length === 0) {
            addToast('info', 'Sem bilhetes', 'Nenhum bilhete foi encontrado no sistema.');
          }
        } else {
          addToast('error', 'Erro ao carregar', 'Não foi possível carregar os bilhetes. Tente novamente.');
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
    const bilhete = bilhetes.find(b => b.ID_Bilhetes === id);
    if (!id) {
      addToast('error', 'Erro', 'ID inválido para exclusão do bilhete.');
      return;
    }

    if (bilhete.Quant_Vendida > 0) {
      addToast(
        'error',
        'Exclusão não permitida',
        'Este bilhete já possui vendas registradas e não pode ser excluído.'
      );
      return;
    }

    showConfirmModal(
      'Excluir bilhete',
      'Tem certeza que deseja excluir este bilhete? Esta ação não pode ser desfeita.',
      () => {
        fetch(`http://localhost/api.php?action=apagar_bilhete&id=${id}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              setBilhetes((prev) => prev.filter((b) => b.ID_Bilhetes !== id));
              addToast('success', 'Sucesso!', 'Bilhete excluído com sucesso.');
            } else {
              addToast('error', 'Erro ao excluir', data.message || 'Ocorreu um erro inesperado.');
            }
          })
          .catch((error) => {
            console.error("Erro na exclusão:", error);
            addToast('error', 'Erro de conexão', 'Falha ao comunicar com o servidor para excluir o bilhete.');
          })
          .finally(() => {
            setConfirmModal(prev => ({ ...prev, isOpen: false }));
          });
      },
      'danger'
    );
  }

  function handleEdit(bilhete: Bilhete) {
    setEditandoBilhete({ ...bilhete });
  }

  function handleSave() {
    if (!editandoBilhete) return;

    // Verificar se houve alterações
    const bilheteOriginal = bilhetes.find(b => b.ID_Bilhetes === editandoBilhete.ID_Bilhetes);
    const houveAlteracoes = (
      bilheteOriginal &&
      (
        bilheteOriginal.NOME !== editandoBilhete.NOME ||
        bilheteOriginal.Quant_Total !== editandoBilhete.Quant_Total ||
        bilheteOriginal.Quant_Vendida !== editandoBilhete.Quant_Vendida ||
        bilheteOriginal.ID_Estado_Bilhete !== editandoBilhete.ID_Estado_Bilhete ||
        bilheteOriginal.Desconto !== editandoBilhete.Desconto
      )
    );

    if (!houveAlteracoes) {
      addToast('warning', 'Sem alterações', 'Nenhuma alteração foi feita no bilhete.');
      setEditandoBilhete(null); // Fecha o modal de edição
      return;
    }

    // Validar que os campos obrigatórios estão preenchidos
    if (!editandoBilhete.ID_Estado_Bilhete || editandoBilhete.Desconto === undefined || editandoBilhete.Desconto === null) {
      addToast('error', 'Dados inválidos', 'Por favor, selecione um estado e um desconto válidos.');
      return;
    }

    setSalvando(true);

    const formData = new FormData();
    formData.append('id', editandoBilhete.ID_Bilhetes.toString());
    formData.append('nome', editandoBilhete.NOME);
    formData.append('quant_total', editandoBilhete.Quant_Total.toString());
    formData.append('quant_vendida', editandoBilhete.Quant_Vendida.toString());
    formData.append('estado_id', editandoBilhete.ID_Estado_Bilhete.toString());
    formData.append('desconto', editandoBilhete.Desconto.toString());

    fetch("http://localhost/api.php?action=editar_bilhete", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        setSalvando(false);
        if (data.success) {
          setBilhetes((prev) =>
            prev.map((b) => {
              if (b.ID_Bilhetes === editandoBilhete.ID_Bilhetes) {
                return {
                  ...editandoBilhete,
                  percentualLotacao: editandoBilhete.Quant_Total > 0 
                    ? Math.min(Math.round((editandoBilhete.Quant_Vendida / editandoBilhete.Quant_Total) * 100), 100)
                    : 0
                };
              }
              return b;
            })
          );
          setEditandoBilhete(null);
          addToast('success', 'Sucesso!', 'Bilhete atualizado com sucesso.');
        } else {
          addToast('error', 'Erro ao salvar', data.message || 'Ocorreu um erro ao atualizar o bilhete.');
        }
      })
      .catch((error) => {
        setSalvando(false);
        console.error("Erro ao salvar:", error);
        addToast('error', 'Erro de conexão', 'Falha ao comunicar com o servidor para salvar as alterações.');
      });
  }

  function handleInputChange(field: keyof Bilhete, value: any) {
    if (!editandoBilhete) return;
    setEditandoBilhete({
      ...editandoBilhete,
      [field]: field === 'Desconto' || field === 'ID_Estado_Bilhete' ? parseInt(value) || 0 : value,
    });
  }

  function handleBuyTicket(bilhete: Bilhete) {
    if (!bilhete.payment_page_url) {
      addToast('warning', 'Link indisponível', 'O link de pagamento não está disponível para este bilhete.');
      return;
    }
  
    const fullUrl = `http://localhost/pages/${bilhete.payment_page_url}`;
    window.open(fullUrl, '_blank');
    addToast('info', 'Página aberta', 'A página de compra foi aberta numa nova aba.');
  }

  function copyPaymentLink(bilhete: Bilhete) {
    if (!bilhete.payment_page_url) {
      addToast('warning', 'Link indisponível', 'O link de pagamento não está disponível para este bilhete.');
      return;
    }
  
    const fullUrl = `http://localhost/pages/${bilhete.payment_page_url}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      addToast('success', 'Link copiado!', 'O link foi copiado para a área de transferência.');
    }).catch(() => {
      addToast('error', 'Erro ao copiar', 'Não foi possível copiar o link. Tente novamente.');
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
          Gestão de Bilhetes
        </h3>
        <button
          onClick={buscarBilhetes}
          disabled={carregando}
          className="flex items-center gap-2 px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${carregando ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>
      
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] mt-6">
        <div className="max-w-full overflow-x-auto p-4">
          {carregando ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-500">A carregar bilhetes...</span>
            </div>
          ) : bilhetes.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <ShoppingCart className="w-12 h-12 mx-auto" />
              </div>
              <p className="text-gray-500">Nenhum bilhete encontrado.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Nome</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Tipo</TableCell>
                  <TableCell isHeader className="px-5 py-3 font medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Quantidade Total</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Quantidade Vendida</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Preço</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Gratuito</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Evento</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Estado</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Ações</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {bilhetes.map((b) => (
                  <TableRow key={b.ID_Bilhetes}>
                    <TableCell className="px-5 py-4 text-start text-gray-800 dark:text-white">{b.NOME}</TableCell>
                    <TableCell className="px-4 py-3 text-start text-gray-800 dark:text-gray-400">{b.Tipo}</TableCell>
                    <TableCell className="px-4 py-3 text-start text-gray-800 dark:text-gray-400">{b.Quant_Total}</TableCell>
                    <TableCell className="px-4 py-3 text-start text-gray-800 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <div className="w-[60px] h-[6px] bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${b.percentualLotacao}%`,
                              backgroundColor: b.percentualLotacao > 80 ? '#059669' : 
                                             b.percentualLotacao > 50 ? '#d97706' : '#dc2626',
                            }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium text-gray-800 dark:text-gray-400">
                          {b.percentualLotacao}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-gray-800 dark:text-gray-400">
                      {b.Preco !== null && b.Preco !== undefined ? Number(b.Preco).toFixed(2) + "€" : "-"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-gray-800 dark:text-gray-400">
                      <Badge color={b.Gratuito ? "success" : "error"}>{b.Gratuito ? "Sim" : "Não"}</Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-gray-800 dark:text-gray-400">{b.Evento_Nome}</TableCell>
                    <TableCell className="px-4 py-3 text-start">
                      <Badge
                        color={
                          b.Estado_Nome === "Ativo"
                            ? "success"
                            : b.Estado_Nome === "Desativado"
                            ? "warning"
                            : b.Estado_Nome === "Esgotado"
                            ? "error"
                            : undefined
                        }
                      >
                        {b.Estado_Nome}
                      </Badge>
                    </TableCell>


                    <TableCell className="px-4 py-3 text-start">
                      <div className="flex gap-2 flex-wrap">
                        <button
                          className="px-3 py-1 text-xs font-medium text-white bg-green-500 rounded hover:bg-green-600 flex items-center gap-1"
                          onClick={() => handleBuyTicket(b)}
                          title="Abrir página de compra"
                        >
                          <ShoppingCart className="w-3 h-3" />
                          Comprar
                        </button>
                      
                        <button
                          className="px-3 py-1 text-xs font-medium text-white bg-purple-500 rounded hover:bg-purple-600 flex items-center gap-1"
                          onClick={() => copyPaymentLink(b)}
                          title="Copiar link de pagamento"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Link
                        </button>
                      
                        <button
                          className="px-3 py-1 text-xs font-medium text-white bg-blue-500 rounded hover:bg-blue-600"
                          onClick={() => handleEdit(b)}
                        >
                          Editar
                        </button>
                        <button
                          className="px-3 py-1 text-xs font-medium text-white bg-red-500 rounded hover:bg-red-600"
                          onClick={() => handleDelete(b.ID_Bilhetes)}
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

        {editandoBilhete && (
          <div className="fixed inset-0 flex items-center justify-center z-[9997] p-4 bg-black/30">
            <div className="relative pointer-events-auto bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
              <button
                onClick={() => setEditandoBilhete(null)}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Editar Bilhete</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome</label>
                  <input
                    type="text"
                    value={editandoBilhete.NOME || ""}
                    onChange={(e) => handleInputChange('NOME', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantidade Total</label>
                  <input
                    type="number"
                    value={editandoBilhete.Quant_Total || 0}
                    onChange={(e) => handleInputChange('Quant_Total', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantidade Vendida</label>
                  <input
                    type="number"
                    value={editandoBilhete.Quant_Vendida || 0}
                    onChange={(e) => handleInputChange('Quant_Vendida', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
                  <select
                    value={editandoBilhete.ID_Estado_Bilhete ?? 1}
                    onChange={(e) => handleInputChange('ID_Estado_Bilhete', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  >
                    {estadosBilhete.map((estado) => (
                      <option
                        className="dark:bg-black"
                        key={estado.id}
                        value={estado.id}
                        disabled={estado.id === 2 && editandoBilhete.Quant_Vendida > 0}
                      >
                        {estado.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Desconto</label>
                  <select
                    value={editandoBilhete.Desconto ?? 0}
                    onChange={(e) => handleInputChange('Desconto', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  >
                    {quantDesconto.map((desconto) => (
                      <option className="dark:bg-black" key={desconto.id} value={desconto.id}>
                        {desconto.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setEditandoBilhete(null)}
                  className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
                  disabled={salvando}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={salvando}
                  className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
                >
                  {salvando && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                  {salvando ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
