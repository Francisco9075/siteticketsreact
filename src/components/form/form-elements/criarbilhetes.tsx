import { useState, useEffect } from "react";
import Label from "../Label";
import Input from "../input/InputField";
import Select from "../Select";
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
    nome: "",
    tipo: "",
    preco: "",
    quantidade: "",
    data: "",
    hora: "",
    gratuito: false,
  });

  const [valorFinal, setValorFinal] = useState("0.00");

  useEffect(() => {
    if (form.gratuito) {
      setForm((prev) => ({ ...prev, preco: "0" }));
    }
  }, [form.gratuito]);

  useEffect(() => {
    const precoBase = parseFloat(form.preco.replace(",", ".")) || 0;
    const iva = precoBase * 0.06;
    const taxaPlataforma = 1.23;
    const total = precoBase + iva + taxaPlataforma;
    setValorFinal(total.toFixed(2));
  }, [form.preco]);

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
        {/* Nome */}
        <div>
          <Label htmlFor="nome">Nome</Label>
          <Input
            type="text"
            id="nome"
            value={form.nome}
            onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
          />
        </div>

        {/* Tipo de Bilhetes */}
        <div>
          <Label>Tipo de Bilhetes</Label>
          <Select
            options={options}
            placeholder="Selecione uma opção"
            onChange={handleSelectChange}
            className="dark:bg-dark-900"
          />
        </div>

        {/* Preço */}
        <div>
          <Label htmlFor="preco">Preço Líquido</Label>
          <Input
            type="text"
            id="preco"
            value={form.preco}
            disabled={form.gratuito}
            onChange={(e) =>
              setForm((f) => ({ ...f, preco: e.target.value }))
            }
          />
        </div>

        {/* Valor Final */}
        <div>
          <Label>Valor Final (IVA 6% + 1.23€)</Label>
          <Input type="text" value={`${valorFinal} €`} readOnly />
        </div>

        {/* Quantidade */}
        <div>
          <Label htmlFor="quantidade">Quantidade</Label>
          <Input
            type="text"
            id="quantidade"
            value={form.quantidade}
            onChange={(e) =>
              setForm((f) => ({ ...f, quantidade: e.target.value }))
            }
          />
        </div>

        {/* Data do Evento */}
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

        {/* Gratuito */}
        <div className="flex items-center gap-3">
          <Checkbox
            checked={form.gratuito}
            onChange={(val) => setForm((f) => ({ ...f, gratuito: val }))}
          />
          <span className="block text-sm font-medium text-gray-700 dark:text-gray-400">
            Gratuito
          </span>
        </div>

        {/* Botão */}
        <div className="flex gap-5 butaobilhete">
          <Button
            onClick={handleSubmit}
            className="butaobilhete"
            size="md"
            variant="primary"
          >
            Publicar
          </Button>
        </div>
      </div>
    </div>
  );
}
