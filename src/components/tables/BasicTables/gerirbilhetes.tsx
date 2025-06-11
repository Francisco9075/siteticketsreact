import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import Badge from "../../ui/badge/Badge";
import { X } from "lucide-react";

interface Bilhete {
  ID_Bilhetes: number;
  NOME: string;
  Tipo: string;
  Quant_Disponivel: number;
  Quant_Vendida: number;
  Preco: number;
  Data: string;
  Gratuito: boolean;
  ID_Evento: number;
  ID_Estado_Bilhete: number;
}

export default function GerirBilhetes() {
  const [bilhetes, setBilhetes] = useState<Bilhete[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [editandoBilhete, setEditandoBilhete] = useState<Bilhete | null>(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    buscarBilhetes();
  }, []);

  function buscarBilhetes() {
    setCarregando(true);
    fetch("http://localhost/gerirbilhete.php")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setBilhetes(data.bilhetes);
        } else {
          console.error("Erro ao buscar bilhetes");
        }
        setCarregando(false);
      })
      .catch((err) => {
        console.error("Erro na requisição:", err);
        setCarregando(false);
      });
  }

  function handleDelete(id: number) {
    if (!id) {
      alert("ID inválido para exclusão");
      return;
    }

    if (!confirm("Deseja realmente excluir este bilhete?")) return;

    fetch(`http://localhost/apagarbilhete.php?id=${id}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setBilhetes((prev) => prev.filter((b) => b.ID_Bilhetes !== id));
          alert("Bilhete excluído com sucesso!");
        } else {
          alert("Erro ao excluir bilhete: " + (data.message || "Erro desconhecido"));
        }
      })
      .catch((error) => {
        console.error("Erro na exclusão:", error);
        alert("Erro de conexão ao excluir bilhete");
      });
  }

  function handleEdit(bilhete: Bilhete) {
    setEditandoBilhete({ ...bilhete });
  }

  function handleSave() {
    if (!editandoBilhete) return;

    setSalvando(true);

    const formData = new FormData();
    formData.append('id', editandoBilhete.ID_Bilhetes.toString());
    formData.append('nome', editandoBilhete.NOME);
    formData.append('tipo', editandoBilhete.Tipo);
    formData.append('quant_disponivel', editandoBilhete.Quant_Disponivel.toString());
    formData.append('quant_vendida', editandoBilhete.Quant_Vendida.toString());
    formData.append('preco', editandoBilhete.Preco.toString());
    formData.append('data', editandoBilhete.Data);
    formData.append('gratuito', editandoBilhete.Gratuito ? '1' : '0');

    fetch("http://localhost/editarbilhete.php", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        setSalvando(false);
        if (data.success) {
          setBilhetes((prev) =>
            prev.map((b) =>
              b.ID_Bilhetes === editandoBilhete.ID_Bilhetes ? editandoBilhete : b
            )
          );
          setEditandoBilhete(null);
          alert("Bilhete atualizado com sucesso!");
        } else {
          alert("Erro ao atualizar bilhete: " + (data.message || "Erro desconhecido"));
        }
      })
      .catch((error) => {
        setSalvando(false);
        console.error("Erro ao salvar:", error);
        alert("Erro de conexão ao salvar bilhete");
      });
  }

  function handleInputChange(field: keyof Bilhete, value: any) {
    if (!editandoBilhete) return;
    setEditandoBilhete({
      ...editandoBilhete,
      [field]: value
    });
  }

  return (
    <>
      <h3 className="mb-4 font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
        Gestão de Bilhetes
      </h3>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] mt-6">
        <div className="max-w-full overflow-x-auto p-4">
          {carregando ? (
            <p className="text-gray-500">A carregar bilhetes...</p>
          ) : bilhetes.length === 0 ? (
            <p className="text-red-500">Nenhum bilhete encontrado.</p>
          ) : (
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Nome</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Tipo</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Quantidade Disponível</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Quantidade Vendida</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Preço</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Data</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Gratuito</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">ID Evento</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Estado</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Ações</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {bilhetes.map((b) => (
                  <TableRow key={b.ID_Bilhetes}>
                    <TableCell className="px-5 py-4 text-start text-gray-800 dark:text-white">{b.NOME}</TableCell>
                    <TableCell className="px-4 py-3 text-start text-gray-800 dark:text-white">{b.Tipo}</TableCell>
                    <TableCell className="px-4 py-3 text-start text-gray-800 dark:text-white">{b.Quant_Disponivel}</TableCell>
                    <TableCell className="px-4 py-3 text-start text-gray-800 dark:text-white">{b.Quant_Vendida}</TableCell>
                    <TableCell className="px-4 py-3 text-start text-gray-800 dark:text-white">
                      {b.Preco !== null && b.Preco !== undefined ? Number(b.Preco).toFixed(2) + "€" : "-"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-gray-800 dark:text-white">{b.Data}</TableCell>
                    <TableCell className="px-4 py-3 text-start text-gray-800 dark:text-white">
                      <Badge color={b.Gratuito ? "success" : "error"}>{b.Gratuito ? "Sim" : "Não"}</Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-gray-800 dark:text-white">{b.ID_Evento}</TableCell>
                    <TableCell className="px-4 py-3 text-start text-gray-800 dark:text-white">{b.ID_Estado_Bilhete}</TableCell>
                    <TableCell className="px-4 py-3 text-start">
                      <div className="flex gap-2">
                        <button
                          className="px-3 py-1 text-xs font-medium text-white bg-blue-500 rounded hover:bg-blue-600"
                          onClick={() => handleEdit(b)}
                        >
                          Editar
                        </button>
                        <button
                          className="px-3 py-1 text-xs font-medium text-white bg-red-500 rounded hover:bg-red-600"
                          onClick={() => handleDelete(b.ID_Bilhetes)}
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

        {/* Modal de Edição */}
        {editandoBilhete && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30">
            <div className="relative pointer-events-auto bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">

              {/* Cruz de fechar */}
              <button
                onClick={() => setEditandoBilhete(null)}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Editar Bilhete</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome</label>
                  <input
                    type="text"
                    value={editandoBilhete.NOME}
                    onChange={(e) => handleInputChange('NOME', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
                  <input
                    type="text"
                    value={editandoBilhete.Tipo}
                    onChange={(e) => handleInputChange('Tipo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantidade Disponível</label>
                  <input
                    type="number"
                    value={editandoBilhete.Quant_Disponivel}
                    onChange={(e) => handleInputChange('Quant_Disponivel', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantidade Vendida</label>
                  <input
                    type="number"
                    value={editandoBilhete.Quant_Vendida}
                    onChange={(e) => handleInputChange('Quant_Vendida', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Preço (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editandoBilhete.Preco}
                    onChange={(e) => handleInputChange('Preco', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data</label>
                  <input
                    type="date"
                    value={editandoBilhete.Data}
                    onChange={(e) => handleInputChange('Data', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editandoBilhete.Gratuito}
                      onChange={(e) => handleInputChange('Gratuito', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Gratuito</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setEditandoBilhete(null)}
                  className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
                  disabled={salvando}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={salvando}
                  className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 disabled:opacity-50"
                >
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
