import { useState } from "react";
import Label from "../Label";
import Input from "../input/InputField";
import DatePicker from "../date-picker";
import Select from "../Select";
import Button from "../../ui/button/Button";

export default function CriarEvento() {
  const [form, setForm] = useState({
    nome: "",
    descricao: "",
    dataInicio: "",
    dataFim: "",
    imagem: "",
    idEstadoEvento: "",
    idCategoria: "",
    cartazEvento: "",
    localizacao: "",
    idAdmin: "",
    dataPublicacao: "",
    termosAceites: false,
  });

  const estados = [
    { value: "1", label: "Ativo" },
    { value: "2", label: "Pendente" },
  ];

  const categorias = [
    { value: "1", label: "Concerto" },
    { value: "2", label: "Feira" },
  ];

  const admins = [
    { value: "1", label: "Admin 1" },
    { value: "2", label: "Admin 2" },
  ];

  const handleSubmit = async () => {
    if (!form.nome || !form.descricao || !form.dataInicio) {
      alert("Preencha os campos obrigatórios.");
      return;
    }

    try {
      const res = await fetch("http://localhost/criarevento.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const result = await res.json();
      if (res.ok) {
        alert(result.message || "Evento criado com sucesso!");
      } else {
        alert(result.error || "Erro ao criar evento");
      }
    } catch (err) {
      console.error(err);
      alert("Erro na conexão.");
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <Label>Nome</Label>
        <Input
          value={form.nome}
          onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
        />
      </div>

      <div>
        <Label>Descrição</Label>
        <Input
          value={form.descricao}
          onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
        />
      </div>

      <div>
        <DatePicker
          id="dataInicio"
          label="Data Início"
          onChange={(_, dateStr) => setForm((f) => ({ ...f, dataInicio: dateStr }))}
        />
      </div>

      <div>
        <DatePicker
          id="dataFim"
          label="Data Fim"
          onChange={(_, dateStr) => setForm((f) => ({ ...f, dataFim: dateStr }))}
        />
      </div>

      <div>
        <Label>Imagem (URL)</Label>
        <Input
          value={form.imagem}
          onChange={(e) => setForm((f) => ({ ...f, imagem: e.target.value }))}
        />
      </div>

      <div>
        <Label>Cartaz do Evento</Label>
        <Input
          value={form.cartazEvento}
          onChange={(e) => setForm((f) => ({ ...f, cartazEvento: e.target.value }))}
        />
      </div>

      <div>
        <Label>Localização</Label>
        <Input
          value={form.localizacao}
          onChange={(e) => setForm((f) => ({ ...f, localizacao: e.target.value }))}
        />
      </div>

      <div>
        <DatePicker
          id="dataPublicacao"
          label="Data Publicação"
          onChange={(_, dateStr) => setForm((f) => ({ ...f, dataPublicacao: dateStr }))}
        />
      </div>

      <div className="flex gap-3 items-center">
        <input
          type="checkbox"
          checked={form.termosAceites}
          onChange={(e) =>
            setForm((f) => ({ ...f, termosAceites: e.target.checked }))
          }
        />
        <span>Aceito os termos</span>
      </div>

      <Button onClick={handleSubmit}>Criar Evento</Button>
    </div>
  );
}
