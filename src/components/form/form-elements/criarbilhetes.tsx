import { useState } from "react";
import ComponentCard from "../../common/ComponentCard";
import Label from "../Label";
import Input from "../input/InputField";
import Select from "../Select";
import { TimeIcon } from "../../../icons";
import DatePicker from "../date-picker.tsx";
import Button from "../../../components/ui/button/Button";
import Checkbox from "../input/Checkbox";


export default function Criarbilhetes() {
  const options = [
    { value: "marketing", label: "Marketing" },
    { value: "template", label: "Template" },
    { value: "development", label: "Development" },
  ];


  const [form, setForm] = useState({
    tipo: "",
    preco: "",
    quantidade: "",
    data: "",
    hora: "",
    gratuito: false,
  });


  const handleSelectChange = (value: string) => {
    setForm((prev) => ({ ...prev, tipo: value }));
  };


  const handleSubmit = async () => {
    try {
      const res = await fetch("http://localhost/criarbilhete.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });


      const result = await res.json();
      if (res.ok) {
        alert(result.message || "Bilhete criado com sucesso!");
      } else {
        alert(result.error || "Erro ao criar bilhete");
      }
    } catch (error) {
      console.error("Erro ao enviar:", error);
      alert("Erro de conexão com o servidor.");
    }
  };


  return (
    <div>
      <div className="space-y-6">
<div>
          <Label>Evento</Label>
          <Select
            options={options}
            placeholder="Selecione uma opção"
            onChange={handleSelectChange}
            className="dark:bg-dark-900"
          />
        </div>

        <div>
          <Label>Tipo de Bilhetes</Label>
          <Select
            options={options}
            placeholder="Selecione uma opção"
            onChange={handleSelectChange}
            className="dark:bg-dark-900"
          />
        </div>


        <div>
          <Label htmlFor="preco">Preço Líquido</Label>
          <Input
            type="text"
            id="preco"
            value={form.preco}
            onChange={(e) => setForm((f) => ({ ...f, preco: e.target.value }))}
          />
        </div>


        <div>
          <Label htmlFor="quantidade">Quantidade</Label>
          <Input
            type="text"
            id="quantidade"
            value={form.quantidade}
            onChange={(e) => setForm((f) => ({ ...f, quantidade: e.target.value }))}
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
            onChange={(val) => setForm((f) => ({ ...f, gratuito: val }))}
          />
          <span className="block text-sm font-medium text-gray-700 dark:text-gray-400">
            Gratuito
          </span>
        </div>


        <div className="flex gap-5 butaobilhete">
          <Button onClick={handleSubmit} className="butaobilhete" size="md" variant="primary">
            Publicar
          </Button>
        </div>
      </div>
    </div>
  );
}
