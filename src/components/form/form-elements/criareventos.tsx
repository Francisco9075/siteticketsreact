import { useState } from "react";
import Label from "../Label";
import Input from "../input/InputField";
import Select from "../Select";
import DatePicker from "../date-picker.tsx";
import Button from "../../../components/ui/button/Button";
import Checkbox from "../input/Checkbox";

export default function CriarEventos() {
  const [isChecked, setIsChecked] = useState(false);

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

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="nome">Nome</Label>
        <Input type="text" id="nome" placeholder="Nome do evento" />
      </div>

      <div>
        <Label htmlFor="descricao">Descrição</Label>
        <Input type="text" id="descricao" placeholder="Descrição do evento" />
      </div>

      <div>
        <Label>Data Início</Label>
        <DatePicker
          id="data-inicio"
          placeholder="Selecionar data de início"
          onChange={(dates, currentDateString) => console.log({ dates, currentDateString })}
        />
      </div>

      <div>
        <Label>Data Fim</Label>
        <DatePicker
          id="data-fim"
          placeholder="Selecionar data de fim"
          onChange={(dates, currentDateString) => console.log({ dates, currentDateString })}
        />
      </div>

      <div>
        <Label htmlFor="imagem">URL da Imagem</Label>
        <Input type="text" id="imagem" placeholder="Ex: /uploads/banner.jpg" />
      </div>

      <div>
        <Label>ID Estado Evento</Label>
        <Select
          options={estadoEventoOptions}
          placeholder="Selecione o estado"
          onChange={(value) => console.log("Estado selecionado:", value)}
        />
      </div>

      <div>
        <Label>ID Categoria</Label>
        <Select
          options={categoriaOptions}
          placeholder="Selecione a categoria"
          onChange={(value) => console.log("Categoria selecionada:", value)}
        />
      </div>

      <div>
        <Label htmlFor="cartaz">Cartaz do Evento</Label>
        <Input type="text" id="cartaz" placeholder="URL do cartaz" />
      </div>

      <div>
        <Label htmlFor="localizacao">Localização</Label>
        <Input type="text" id="localizacao" placeholder="Digite a localização" />
      </div>

      <div>
        <Label>Data de Publicação</Label>
        <DatePicker
          id="data-publicacao"
          placeholder="Selecionar data de publicação"
          onChange={(dates, currentDateString) => console.log({ dates, currentDateString })}
        />
      </div>

      <div>
        <Label htmlFor="link-unico">Link Único</Label>
        <Input type="text" id="link-unico" placeholder="ex: evento-incrivel-2025" />
      </div>

      <div className="flex items-center gap-3">
        <Checkbox checked={isChecked} onChange={setIsChecked} />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-400">
          Termos Aceites
        </span>
      </div>

      <div className="pt-4">
        <Button size="md" variant="primary">
          Publicar Evento
        </Button>
      </div>
    </div>
  );
}
