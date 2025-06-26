import { useState } from "react";
import Label from "../Label";
import Input from "../input/InputField";
import Select from "../Select";
import DatePicker from "../date-picker.tsx";
import Button from "../../../components/ui/button/Button";
import Checkbox from "../input/Checkbox";
import { CheckCircle, AlertCircle, XCircle, AlertTriangle, X } from "lucide-react";

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

export default function CriarEventos() {
  const [form, setForm] = useState({
    nome: "",
    descricao: "",
    data_inicio: "",
    data_fim: "",
    imagem: "",
    id_estado_evento: "",
    id_categoria: "",
    cartaz_do_evento: "",
    localizacao: "",
    data_publicacao: "",
    link_unico: "",
    termos_aceites: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmModal, setConfirmModal] = useState<ConfirmModal>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    onCancel: () => {},
    type: 'info'
  });

  const estadoEventoOptions = [
    { value: "1", label: "Ativo" },
    { value: "2", label: "Cancelado" },
    { value: "3", label: "Concluído" },
  ];

  const categoriaOptions = [
    { value: "1", label: "Música" },
    { value: "2", label: "Negócios" },
    { value: "3", label: "Tecnologia" },
  ];

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

  const handleSubmit = async () => {
    // Validação básica
    if (!form.nome) {
      addToast('warning', 'Campo obrigatório', 'Por favor, insira o nome do evento');
      return;
    }
    if (!form.descricao) {
      addToast('warning', 'Campo obrigatório', 'Por favor, insira a descrição do evento');
      return;
    }
    if (!form.data_inicio) {
      addToast('warning', 'Campo obrigatório', 'Por favor, selecione a data de início');
      return;
    }
    if (!form.localizacao) {
      addToast('warning', 'Campo obrigatório', 'Por favor, insira a localização do evento');
      return;
    }
    if (!form.termos_aceites) {
      addToast('warning', 'Termos não aceites', 'Por favor, aceite os termos para continuar');
      return;
    }

    showConfirmModal(
      'Criar Evento',
      'Tem certeza que deseja criar este evento? Esta ação não pode ser desfeita.',
      async () => {
        setIsSubmitting(true);
        try {
          const res = await fetch("http://localhost/api.php?action=criar_evento", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(form),
          });

          const result = await res.json();
          if (res.ok) {
            addToast('success', 'Sucesso!', result.message || 'Evento criado com sucesso!');
            // Limpar formulário após sucesso
            setForm({
              nome: "",
              descricao: "",
              data_inicio: "",
              data_fim: "",
              imagem: "",
              id_estado_evento: "",
              id_categoria: "",
              cartaz_do_evento: "",
              localizacao: "",
              data_publicacao: "",
              link_unico: "",
              termos_aceites: false,
            });
          } else {
            addToast('error', 'Erro ao criar', result.erro || 'Erro ao criar evento');
          }
        } catch (error) {
          console.error("Erro ao enviar:", error);
          addToast('error', 'Erro de conexão', 'Falha na comunicação com o servidor.');
        } finally {
          setIsSubmitting(false);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      },
      'info'
    );
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
          <Label htmlFor="nome">Nome</Label>
          <Input
            type="text"
            id="nome"
            placeholder="Nome do evento"
            value={form.nome}
            onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
          />
        </div>

        <div>
          <Label htmlFor="descricao">Descrição</Label>
          <Input
            type="text"
            id="descricao"
            placeholder="Descrição do evento"
            value={form.descricao}
            onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
          />
        </div>

        <div>
          <Label>Data Início</Label>
          <DatePicker
            id="data-inicio"
            placeholder="Selecionar data de início"
            onChange={(dates, currentDateString) =>
              setForm((f) => ({ ...f, data_inicio: currentDateString }))
            }
          />
        </div>

        <div>
          <Label>Data Fim</Label>
          <DatePicker
            id="data-fim"
            placeholder="Selecionar data de fim"
            onChange={(dates, currentDateString) =>
              setForm((f) => ({ ...f, data_fim: currentDateString }))
            }
          />
        </div>

        <div>
          <Label htmlFor="imagem">URL da Imagem</Label>
          <Input
            type="text"
            id="imagem"
            placeholder="Ex: /uploads/banner.jpg"
            value={form.imagem}
            onChange={(e) => setForm((f) => ({ ...f, imagem: e.target.value }))}
          />
        </div>

        <div>
          <Label>Estado Evento</Label>
          <Select
            options={estadoEventoOptions}
            placeholder="Selecione o estado"
            onChange={(value) => setForm((f) => ({ ...f, id_estado_evento: value }))}
          />
        </div>

        <div>
          <Label>Categoria</Label>
          <Select
            options={categoriaOptions}
            placeholder="Selecione a categoria"
            onChange={(value) => setForm((f) => ({ ...f, id_categoria: value }))}
          />
        </div>

        <div>
          <Label htmlFor="cartaz">Cartaz do Evento</Label>
          <Input
            type="text"
            id="cartaz"
            placeholder="URL do cartaz"
            value={form.cartaz_do_evento}
            onChange={(e) => setForm((f) => ({ ...f, cartaz_do_evento: e.target.value }))}
          />
        </div>

        <div>
          <Label htmlFor="localizacao">Localização</Label>
          <Input
            type="text"
            id="localizacao"
            placeholder="Digite a localização"
            value={form.localizacao}
            onChange={(e) => setForm((f) => ({ ...f, localizacao: e.target.value }))}
          />
        </div>

        <div>
          <Label>Data de Publicação</Label>
          <DatePicker
            id="data-publicacao"
            placeholder="Selecionar data de publicação"
            onChange={(dates, currentDateString) =>
              setForm((f) => ({ ...f, data_publicacao: currentDateString }))
            }
          />
        </div>

        <div>
          <Label htmlFor="link-unico">Link Único</Label>
          <Input
            type="text"
            id="link-unico"
            placeholder="ex: evento-incrivel-2025"
            value={form.link_unico}
            onChange={(e) => setForm((f) => ({ ...f, link_unico: e.target.value }))}
          />
        </div>

        <div className="flex items-center gap-3">
          <Checkbox
            checked={form.termos_aceites}
            onChange={(val) => setForm((f) => ({ ...f, termos_aceites: val }))}
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-400">
            Termos Aceites
          </span>
        </div>

        <div className="pt-4">
          <Button 
            onClick={handleSubmit} 
            size="md" 
            variant="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Publicando..." : "Publicar Evento"}
          </Button>
        </div>
      </div>
    </div>
  );
}