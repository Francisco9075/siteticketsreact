import { useState } from "react";
import Label from "../Label";
import Input from "../input/InputField";
import Select from "../Select";
import DatePicker from "../date-picker.tsx";
import Button from "../../../components/ui/button/Button";
import Checkbox from "../input/Checkbox";

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

  const handleSubmit = async () => {
    // Validação básica
    if (!form.nome || !form.descricao || !form.data_inicio || !form.localizacao || !form.termos_aceites) {
      alert("Por favor, preencha todos os campos obrigatórios (Nome, Descrição, Data de Início, Localização e Termos Aceites).");
      return;
    }

    try {
      const res = await fetch("http://localhost/criareventos.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const result = await res.json();
      if (res.ok) {
        alert(result.message || "Evento criado com sucesso!");
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
        alert(result.erro || "Erro ao criar evento");
      }
    } catch (error) {
      console.error("Erro ao enviar:", error);
      alert("Erro de conexão com o servidor.");
    }
  };

  return (
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
        <Label>ID Estado Evento</Label>
        <Select
          options={estadoEventoOptions}
          placeholder="Selecione o estado"
          onChange={(value) => setForm((f) => ({ ...f, id_estado_evento: value }))}
        />
      </div>

      <div>
        <Label>ID Categoria</Label>
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
        <Button onClick={handleSubmit} size="md" variant="primary">
          Publicar Evento
        </Button>
      </div>
    </div>
  );
}
