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

interface Evento {
  ID_Evento: number;
  NOME: string;
  Descricao: string;
  Data_Inicio: string;
  Data_Fim: string;
  Imagem: string;
  ID_Estado_Evento: number;
  ID_Categoria: number;
  Cartaz_do_evento: string;
  Localizacao: string;
  Data_publicacao: string;
  Link_unico: string;
  Termos_aceites: number;
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

export default function GerirEventos() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [editandoEvento, setEditandoEvento] = useState<Evento | null>(null);
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
    buscarEventos();
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        buscarEventos();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  function buscarEventos() {
    setCarregando(true);
    fetch("http://localhost/api.php?action=gerir_eventos")
      .then((res) => res.json())
      .then((data) => {
        if (data.sucesso) {
          setEventos(data.eventos);
          if (data.eventos.length === 0) {
            addToast('info', 'Sem eventos', 'Nenhum evento foi encontrado no sistema.');
          }
        } else {
          addToast('error', 'Erro ao carregar', 'Não foi possível carregar os eventos. Tente novamente.');
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
      addToast('error', 'Erro', 'ID inválido para exclusão do evento.');
      return;
    }

    showConfirmModal(
      'Excluir evento',
      'Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita.',
      () => {
        fetch("http://localhost/api.php?action=apagar_evento", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id_evento: id }),
        })
          .then((res) => {
            if (!res.ok) {
              throw new Error('Erro na resposta do servidor');
            }
            return res.json();
          })
          .then((data) => {
            if (data.sucesso) {
              setEventos((prev) => prev.filter((e) => e.ID_Evento !== id));
              addToast('success', 'Sucesso!', 'Evento excluído com sucesso.');
            } else {
              addToast('error', 'Erro ao excluir', data.erro || 'Ocorreu um erro inesperado.');
            }
          })
          .catch((error) => {
            console.error("Erro na exclusão:", error);
            addToast('error', 'Erro de conexão', 'Falha ao comunicar com o servidor para excluir o evento.');
          })
          .finally(() => {
            setConfirmModal(prev => ({ ...prev, isOpen: false }));
          });
      },
      'danger'
    );
  }

  function handleEdit(evento: Evento) {
    setEditandoEvento({ ...evento });
  }

  function handleSave() {
    if (!editandoEvento) return;

    // Verificar se houve alterações
    const eventoOriginal = eventos.find(e => e.ID_Evento === editandoEvento.ID_Evento);
    const houveAlteracoes = eventoOriginal && Object.keys(eventoOriginal).some(
      key => eventoOriginal[key as keyof Evento] !== editandoEvento[key as keyof Evento]
    );

    if (!houveAlteracoes) {
      addToast('warning', 'Sem alterações', 'Nenhuma alteração foi feita no evento.');
      return;
    }

    setSalvando(true);

    const payload = {
      id_evento: editandoEvento.ID_Evento,
      nome: editandoEvento.NOME,
      descricao: editandoEvento.Descricao,
      data_inicio: editandoEvento.Data_Inicio,
      data_fim: editandoEvento.Data_Fim,
      localizacao: editandoEvento.Localizacao,
      data_publicacao: editandoEvento.Data_publicacao,
      link_unico: editandoEvento.Link_unico,
      termos_aceites: editandoEvento.Termos_aceites,
      id_estado_evento: editandoEvento.ID_Estado_Evento,
      id_categoria: editandoEvento.ID_Categoria,
      imagem: editandoEvento.Imagem,
      cartaz_do_evento: editandoEvento.Cartaz_do_evento,
    };

    fetch("http://localhost/api.php?action=editar_evento", {
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
          setEventos((prev) =>
            prev.map((e) =>
              e.ID_Evento === editandoEvento.ID_Evento ? editandoEvento : e
            )
          );
          setEditandoEvento(null);
          addToast('success', 'Sucesso!', 'Evento atualizado com sucesso.');
        } else {
          addToast('error', 'Erro ao salvar', data.erro || 'Ocorreu um erro ao atualizar o evento.');
        }
      })
      .catch((error) => {
        setSalvando(false);
        console.error("Erro ao salvar:", error);
        addToast('error', 'Erro de conexão', 'Falha ao comunicar com o servidor para salvar as alterações.');
      });
  }

  function handleInputChange(field: keyof Evento, value: any) {
    if (!editandoEvento) return;
    setEditandoEvento({
      ...editandoEvento,
      [field]: field === "ID_Estado_Evento" || field === "ID_Categoria" || field === "Termos_aceites" ? parseInt(value) : value,
    });
  }

  const getEstadoText = (id: number) => {
    const estados = {
      1: "Ativo",
      2: "Cancelado",
      3: "Concluído",
    };
    return estados[id as keyof typeof estados] || "Desconhecido";
  };

  const getCategoriaText = (id: number) => {
    const categorias = {
      1: "Música",
      2: "Negócios",
      3: "Tecnologia",
    };
    return categorias[id as keyof typeof categorias] || "Desconhecida";
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
          Gestão de Eventos
        </h3>
        <button
          onClick={buscarEventos}
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
              <span className="ml-3 text-gray-500">A carregar eventos...</span>
            </div>
          ) : eventos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum evento encontrado.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
                  >
                    Nome
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
                  >
                    Descrição
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
                  >
                    Data Início
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
                  >
                    Data Fim
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
                  >
                    Estado
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
                  >
                    Categoria
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
                  >
                    Localização
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
                  >
                    Publicação
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
                  >
                    Link
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
                  >
                    Ações
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {eventos.map((evento) => (
                  <TableRow key={evento.ID_Evento}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start font-medium text-sm text-gray-800 dark:text-white/90">
                      {evento.NOME}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-sm text-gray-500 dark:text-gray-400">
                      {evento.Descricao}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-sm text-gray-500 dark:text-gray-400">
                      {evento.Data_Inicio}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-sm text-gray-500 dark:text-gray-400">
                      {evento.Data_Fim}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-sm">
                      <Badge
                        size="sm"
                        color={
                          getEstadoText(evento.ID_Estado_Evento) === "Ativo"
                            ? "success"
                            : getEstadoText(evento.ID_Estado_Evento) === "Cancelado"
                            ? "error"
                            : "warning"
                        }
                      >
                        {getEstadoText(evento.ID_Estado_Evento)}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-sm text-gray-500 dark:text-gray-400">
                      {getCategoriaText(evento.ID_Categoria)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-sm text-gray-500 dark:text-gray-400">
                      {evento.Localizacao}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-sm text-gray-500 dark:text-gray-400">
                      {evento.Data_publicacao}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-sm text-blue-600 dark:text-blue-400 underline">
                      {evento.Link_unico}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start">
                      <div className="flex gap-2">
                        <button
                          className="px-3 py-1 text-xs font-medium text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors"
                          onClick={() => handleEdit(evento)}
                        >
                          Editar
                        </button>
                        <button
                          className="px-3 py-1 text-xs font-medium text-white bg-red-500 rounded hover:bg-red-600 transition-colors"
                          onClick={() => handleDelete(evento.ID_Evento)}
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

      {editandoEvento && (
        <div className="fixed inset-0 flex items-center justify-center z-[9997] p-4 bg-black/30">
          <div className="pointer-events-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Editar Evento
              </h2>
              <button
                onClick={() => setEditandoEvento(null)}
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
                    value={editandoEvento.NOME}
                    onChange={(e) => handleInputChange("NOME", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Categoria
                  </label>
                  <select
                    value={editandoEvento.ID_Categoria}
                    onChange={(e) =>
                      handleInputChange("ID_Categoria", parseInt(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value={1}>Música</option>
                    <option value={2}>Negócios</option>
                    <option value={3}>Tecnologia</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descrição
                </label>
                <textarea
                  value={editandoEvento.Descricao}
                  onChange={(e) => handleInputChange("Descricao", e.target.value)}
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
                    value={editandoEvento.Data_Inicio}
                    onChange={(e) => handleInputChange("Data_Inicio", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Data de Fim
                  </label>
                  <input
                    type="date"
                    value={editandoEvento.Data_Fim}
                    onChange={(e) => handleInputChange("Data_Fim", e.target.value)}
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
                    value={editandoEvento.Localizacao}
                    onChange={(e) => handleInputChange("Localizacao", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Estado
                  </label>
                  <select
                    value={editandoEvento.ID_Estado_Evento}
                    onChange={(e) =>
                      handleInputChange("ID_Estado_Evento", parseInt(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value={1}>Ativo</option>
                    <option value={2}>Cancelado</option>
                    <option value={3}>Concluído</option>
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
                    value={editandoEvento.Data_publicacao}
                    onChange={(e) =>
                      handleInputChange("Data_publicacao", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Link Único
                  </label>
                  <input
                    type="text"
                    value={editandoEvento.Link_unico}
                    onChange={(e) => handleInputChange("Link_unico", e.target.value)}
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
                    value={editandoEvento.Imagem}
                    onChange={(e) => handleInputChange("Imagem", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    URL do Cartaz
                  </label>
                  <input
                    type="text"
                    value={editandoEvento.Cartaz_do_evento}
                    onChange={(e) =>
                      handleInputChange("Cartaz_do_evento", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editandoEvento.Termos_aceites === 1}
                    onChange={(e) => handleInputChange("Termos_aceites", e.target.checked ? 1 : 0)}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Termos Aceites
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setEditandoEvento(null)}
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