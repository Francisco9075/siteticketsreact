import { useState, useEffect } from "react";
import ComponentCard from "../../common/ComponentCard";
import Label from "../Label";
import Input from "../input/InputField";
import Select from "../Select";
import { TimeIcon } from "../../../icons";
import DatePicker from "../date-picker.tsx";
import Button from "../../../components/ui/button/Button";
import Checkbox from "../input/Checkbox";

interface Event {
  id: number;
  nome: string;
}

interface TicketType {
  value: string;
  label: string;
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
    data: "",
    hora: "",
    gratuito: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdTicket, setCreatedTicket] = useState<any>(null);

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
          console.error("Erro ao buscar eventos");
        }
      } catch (error) {
        console.error("Erro de conexão:", error);
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
      alert("Por favor, selecione o evento");
      return;
    }
    if (!form.nome.trim()) {
      alert("Por favor, insira o nome do bilhete");
      return;
    }
    if (!form.tipo) {
      alert("Por favor, selecione o tipo de bilhete");
      return;
    }
    if (!form.gratuito && (!form.preco || parseFloat(form.preco) <= 0)) {
      alert("Por favor, insira um preço válido");
      return;
    }
    if (!form.quantidade || parseInt(form.quantidade) <= 0) {
      alert("Por favor, insira uma quantidade válida");
      return;
    }
    if (!form.data) {
      alert("Por favor, selecione a data do evento");
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
        alert(result.message || "Bilhete criado com sucesso!");
        
        setForm(prev => ({
          ...prev,
          nome: "",
          tipo: "",
          preco: "",
          quantidade: "",
          data: "",
          hora: "",
          gratuito: false,
        }));
      } else {
        alert(result.erro || result.message || "Erro ao criar bilhete");
      }
    } catch (error) {
      console.error("Erro ao enviar:", error);
      alert("Erro de conexão com o servidor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert("Link copiado para a área de transferência!");
    }).catch(() => {
      alert("Erro ao copiar o link");
    });
  };

  return (
    <div>
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
            placeholder="Número de bilhetes disponíveis"
          />
        </div>

        <div>
          <DatePicker
            id="date-picker"
            label="Data do Evento"
            placeholder="Selecione a data"
            onChange={(dates, currentDateString) => {
              setForm((f) => ({ ...f, data: currentDateString }));
            }}
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