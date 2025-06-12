import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import Badge from "../../ui/badge/Badge";
import { X, Pencil, Trash2 } from "lucide-react";

interface Evento {
  ID_Evento: number;
  Nome: string;
  Descricao: string;
  Local: string;
  Data_Inicio: string;
  Data_Fim: string;
  Gratuito: boolean;
  Estado: number; // 1 = Ativo, 0 = Inativo
}

export default function GerirEventos() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [editandoEvento, setEditandoEvento] = useState<Evento | null>(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    buscarEventos();
  }, []);

  function buscarEventos() {
    setCarregando(true);
    fetch("http://localhost/listeventos.php")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setEventos(data.eventos);
        } else {
          console.error("Erro ao buscar eventos");
        }
        setCarregando(false);
      })
      .catch((err) => {
        console.error("Erro na requisição:", err);
        setCarregando(false);
      });
  }

  function handleDelete(id: number) {
    if (!confirm("Deseja realmente excluir este evento?")) return;

    fetch(`http://localhost/apagarevento.php?id=${id}`, { method: "DELETE" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setEventos((prev) => prev.filter((e) => e.ID_Evento !== id));
          alert("Evento excluído com sucesso!");
        } else {
          alert("Erro ao excluir evento");
        }
      })
      .catch((error) => {
        console.error("Erro na exclusão:", error);
        alert("Erro de conexão ao excluir evento");
      });
  }

  function handleEdit(evento: Evento) {
    setEditandoEvento({ ...evento });
  }

  function handleSave() {
    if (!editandoEvento) return;

    setSalvando(true);
    const formData = new FormData();
    formData.append("id", editandoEvento.ID_Evento.toString());
    formData.append("nome", editandoEvento.Nome);
    formData.append("descricao", editandoEvento.Descricao);
    formData.append("local", editandoEvento.Local);
    formData.append("data_inicio", editandoEvento.Data_Inicio);
    formData.append("data_fim", editandoEvento.Data_Fim);
    formData.append("gratuito", editandoEvento.Gratuito ? "1" : "0");

    fetch("http://localhost/editarevento.php", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        setSalvando(false);
        if (data.success) {
          setEventos((prev) =>
            prev.map((e) =>
              e.ID_Evento === editandoEvento.ID_Evento ? editandoEvento : e
            )
          );
          setEditandoEvento(null);
          alert("Evento atualizado com sucesso!");
        } else {
          alert("Erro ao atualizar evento");
        }
      })
      .catch((error) => {
        setSalvando(false);
        console.error("Erro ao salvar:", error);
        alert("Erro de conexão ao salvar evento");
      });
  }

  function handleInputChange(field: keyof Evento, value: any) {
    if (!editandoEvento) return;
    setEditandoEvento({ ...editandoEvento, [field]: value });
  }

  return (
    <>
      <h3 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-white">
        Gestão de Eventos
      </h3>
      <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] overflow-hidden">
        <div className="max-w-full overflow-x-auto p-4">
          {carregando ? (
            <p className="text-gray-500">A carregar eventos...</p>
          ) : eventos.length === 0 ? (
            <p className="text-red-500">Nenhum evento encontrado.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {["Nome", "Descrição", "Local", "Início", "Fim", "Gratuito", "Estado", "Ações"].map((h) => (
                    <TableCell key={h} isHeader>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {eventos.map((e) => (
                  <TableRow key={e.ID_Evento}>
                    <TableCell>{e.Nome}</TableCell>
                    <TableCell>{e.Descricao}</TableCell>
                    <TableCell>{e.Local}</TableCell>
                    <TableCell>{e.Data_Inicio}</TableCell>
                    <TableCell>{e.Data_Fim}</TableCell>
                    <TableCell>
                      <Badge color={e.Gratuito ? "success" : "error"}>
                        {e.Gratuito ? "Sim" : "Não"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge color={e.Estado === 1 ? "success" : "warning"}>
                        {e.Estado === 1 ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(e)} className="text-blue-500 hover:text-blue-600">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(e.ID_Evento)} className="text-red-500 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {editandoEvento && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
            <div className="relative w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800 max-h-[90vh] overflow-y-auto">
              <button onClick={() => setEditandoEvento(null)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
              <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Editar Evento</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Nome" value={editandoEvento.Nome} onChange={(v) => handleInputChange("Nome", v)} />
                <InputField label="Descrição" value={editandoEvento.Descricao} onChange={(v) => handleInputChange("Descricao", v)} />
                <InputField label="Local" value={editandoEvento.Local} onChange={(v) => handleInputChange("Local", v)} />
                <InputField label="Data Início" type="date" value={editandoEvento.Data_Inicio} onChange={(v) => handleInputChange("Data_Inicio", v)} />
                <InputField label="Data Fim" type="date" value={editandoEvento.Data_Fim} onChange={(v) => handleInputChange("Data_Fim", v)} />
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={editandoEvento.Gratuito} onChange={(e) => handleInputChange("Gratuito", e.target.checked)} />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Gratuito</span>
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => setEditandoEvento(null)} className="px-4 py-2 bg-gray-200 text-gray-600 rounded hover:bg-gray-300">Cancelar</button>
                <button onClick={handleSave} disabled={salvando} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50">
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

function InputField({
  label,
  type = "text",
  value,
  onChange,
}: {
  label: string;
  type?: string;
  value: any;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
