import { useState, useEffect } from "react";
import ComponentCard from "../../common/ComponentCard";
import Label from "../Label";
import Input from "../input/InputField";
import Select from "../Select";
import { TimeIcon } from "../../../icons";
import DatePicker from "../date-picker.tsx";
import Button from "../../../components/ui/button/Button";
import Checkbox from "../input/Checkbox";
import { CheckCircle, AlertCircle, XCircle, AlertTriangle, X } from "lucide-react";

interface Event {
  id: number;
  nome: string;
}

interface TicketType {
  value: string;
  label: string;
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

export default function Criarbilhetes() {
  const ticketTypes: TicketType[] = [
    { value: "standard", label: "Standard" },
    { value: "vip", label: "VIP" },
    { value: "premium", label: "Premium" },
    { value: "early_bird", label: "Early Bird" },
  ];

  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [form, setForm] = useState({
    evento_id: "",
    nome: "",
    tipo: "",
    preco: "",
    quantidade: "",
    hora: "",
    gratuito: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdTicket, setCreatedTicket] = useState<any>(null);
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
    const fetchEvents = async () => {
      try {
        const res = await fetch("http://localhost/criarbilhete.php", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        if (res.ok) {
          const data = await res.json();
          setEvents(data);
        } else {
          addToast('error', 'Erro ao buscar eventos', 'Não foi possível carregar a lista de eventos.');
        }
      } catch (error) {
        addToast('error', 'Erro de conexão', 'Falha na comunicação com o servidor. Verifique sua conexão.');
      } finally {
        setLoadingEvents(false);
      }
    };
    
    fetchEvents();
  }, []);

  const handleEventChange = (value: string) => {
    setForm((prev) => ({ ...prev, evento_id: value }));
  };

  const handleTicketTypeChange = (value: string) => {
    setForm((prev) => ({ ...prev, tipo: value }));
  };

  const handleSubmit = async () => {
    if (!form.evento_id) {
      addToast('warning', 'Campo obrigatório', 'Por favor, selecione o evento');
      return;
    }
    if (!form.nome.trim()) {
      addToast('warning', 'Campo obrigatório', 'Por favor, insira o nome do bilhete');
      return;
    }
    if (!form.tipo) {
      addToast('warning', 'Campo obrigatório', 'Por favor, selecione o tipo de bilhete');
      return;
    }
    if (!form.gratuito && (!form.preco || parseFloat(form.preco) <= 0)) {
      addToast('warning', 'Valor inválido', 'Por favor, insira um preço válido');
      return;
    }
    if (!form.quantidade || parseInt(form.quantidade) <= 0) {
      addToast('warning', 'Quantidade inválida', 'Por favor, insira uma quantidade válida');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const res = await fetch("http://localhost/criarbilhete.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const result = await res.json();
      
      if (res.ok && result.sucesso) {
        setCreatedTicket(result);
        addToast('success', 'Sucesso!', result.message || 'Bilhete criado com sucesso!');
        
        setForm(prev => ({
          ...prev,
          nome: "",
          tipo: "",
          preco: "",
          quantidade: "",
          hora: "",
          gratuito: false,
        }));
      } else {
        addToast('error', 'Erro ao criar', result.erro || result.message || 'Erro ao criar bilhete');
      }
    } catch (error) {
      addToast('error', 'Erro de conexão', 'Falha na comunicação com o servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      addToast('success', 'Link copiado!', 'O link foi copiado para a área de transferência.');
    }).catch(() => {
      addToast('error', 'Erro ao copiar', 'Não foi possível copiar o link.');
    });
  };

  return (
    <div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <ConfirmationModal 
        modal={confirmModal}
        onConfirm={confirmModal.onConfirm}
        onCancel={confirmModal.onCancel}
      />

      <div className="space-y-6">
        <div>
          <Label>Evento</Label>
          <Select
            options={events.map(event => ({
              value: event.id.toString(),
              label: event.nome
            }))}
            placeholder={loadingEvents ? "Carregando eventos..." : "Selecione um evento"}
            onChange={handleEventChange}
            value={form.evento_id}
            disabled={loadingEvents}
            className="dark:bg-dark-900"
          />
        </div>

        <div>
          <Label htmlFor="nome">Nome do Bilhete</Label>
          <Input
            type="text"
            id="nome"
            value={form.nome}
            onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
            placeholder="Ex: Bilhete VIP - Concerto XYZ"
          />
        </div>

        <div>
          <Label>Tipo de Bilhete</Label>
          <Select
            options={ticketTypes}
            placeholder="Selecione um tipo"
            onChange={handleTicketTypeChange}
            value={form.tipo}
            className="dark:bg-dark-900"
          />
        </div>

        <div>
          <Label htmlFor="preco">Preço Líquido</Label>
          <Input
            type="number"
            step="0.01"
            id="preco"
            value={form.preco}
            onChange={(e) => setForm((f) => ({ ...f, preco: e.target.value }))}
            disabled={form.gratuito}
            placeholder="0.00"
          />
          {form.gratuito && (
            <p className="text-sm text-gray-500 mt-1">
              Bilhete marcado como gratuito
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="quantidade">Quantidade</Label>
          <Input
            type="number"
            id="quantidade"
            value={form.quantidade}
            onChange={(e) => setForm((f) => ({ ...f, quantidade: e.target.value }))}
            placeholder="Número de bilhetes totais"
          />
        </div>


        <div className="flex items-center gap-3">
          <Checkbox
            checked={form.gratuito}
            onChange={(val) => {
              setForm((f) => ({ 
                ...f, 
                gratuito: val,
                preco: val ? "0" : f.preco 
              }));
            }}
          />
          <span className="block text-sm font-medium text-gray-700 dark:text-gray-400">
            Gratuito
          </span>
        </div>

        <div className="flex gap-5 butaobilhete">
          <Button 
            onClick={handleSubmit} 
            className="butaobilhete" 
            size="md" 
            variant="primary"
            disabled={isSubmitting || loadingEvents}
          >
            {isSubmitting ? "Criando..." : "Publicar"}
          </Button>
        </div>

        {createdTicket && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              ✅ Bilhete Criado com Sucesso!
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-green-700">
                  <strong>ID do Bilhete:</strong> {createdTicket.ticket_id}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-green-700 mb-2">
                  <strong>Página de Pagamento:</strong>
                </p>
                <div className="flex items-center gap-2 p-2 bg-white border rounded">
                  <input
                    type="text"
                    value={createdTicket.full_url}
                    readOnly
                    className="flex-1 text-sm border-none outline-none bg-transparent"
                  />
                  <button
                    onClick={() => copyToClipboard(createdTicket.full_url)}
                    className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    Copiar
                  </button>
                  <a
                    href={createdTicket.full_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Abrir
                  </a>
                </div>
              </div>
              
              <div className="text-xs text-green-600">
                <p>💡 <strong>Dica:</strong> Guarde este link para partilhar com os seus clientes!</p>
                <p>📧 Pode enviar este link por email, WhatsApp, redes sociais, etc.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
