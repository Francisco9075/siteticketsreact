import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";

import Badge from "../../ui/badge/Badge";

interface Evento {
  ID_Evento: number;
  NOME: string;
  Descricao: string;
  Data_Inicio: string;
  Data_Fim: string;
  Imagem: string;
  ID_Estado_Evento: number;
  ID_Categoria: number;
  Cartaz_do_evento: string;
  Localizacao: string;
  ID_Admin: number;
  Data_publicacao: string;
  Link_unico: string;
  Termos_aceites: boolean;
}

const tableData: Evento[] = [
  {
    ID_Evento: 1,
    NOME: "Evento A",
    Descricao: "Descrição do Evento A",
    Data_Inicio: "2025-06-01 14:00:00",
    Data_Fim: "2025-06-01 18:00:00",
    Imagem: "/images/evento-a.jpg",
    ID_Estado_Evento: 1,
    ID_Categoria: 2,
    Cartaz_do_evento: "/images/cartaz-evento-a.jpg",
    Localizacao: "Lisboa",
    ID_Admin: 10,
    Data_publicacao: "2025-05-30 09:00:00",
    Link_unico: "https://evento-a.com",
    Termos_aceites: true,
  },
  {
    ID_Evento: 2,
    NOME: "Evento B",
    Descricao: "Descrição do Evento B",
    Data_Inicio: "2025-06-15 10:00:00",
    Data_Fim: "2025-06-15 16:00:00",
    Imagem: "/images/evento-b.jpg",
    ID_Estado_Evento: 2,
    ID_Categoria: 1,
    Cartaz_do_evento: "/images/cartaz-evento-b.jpg",
    Localizacao: "Porto",
    ID_Admin: 11,
    Data_publicacao: "2025-05-29 15:00:00",
    Link_unico: "https://evento-b.com",
    Termos_aceites: false,
  },
];

export default function GerirEventos() {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] mt-6">
      <div className="max-w-full overflow-x-auto">
        <Table>
        
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Nome</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Descrição</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Data Início</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Data Fim</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Imagem</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Estado</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Categoria</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Localização</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Link Único</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Termos Aceites</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Ações</TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {tableData.map((evento) => (
              <TableRow key={evento.ID_Evento}>
                <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">{evento.NOME}</TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{evento.Descricao}</TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">{evento.Data_Inicio}</TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">{evento.Data_Fim}</TableCell>
                <TableCell className="px-4 py-3 text-start">
                  <img src={evento.Imagem} alt={evento.NOME} className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400" />
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">{evento.ID_Estado_Evento}</TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">{evento.ID_Categoria}</TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">{evento.Localizacao}</TableCell>
                <TableCell className="px-4 py-3 text-blue-600 underline text-theme-sm dark:text-blue-400">
                  <a href={evento.Link_unico} target="_blank" rel="noopener noreferrer">{evento.Link_unico}</a>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  <Badge
                    size="sm"
                    color={evento.Termos_aceites ? "success" : "error"}
                  >
                    {evento.Termos_aceites ? "Aceites" : "Não Aceites"}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-3 text-start">
                  <div className="flex gap-2">
                    <button
                      className="px-3 py-1 text-xs font-medium text-white bg-blue-500 rounded hover:bg-blue-600"
                      onClick={() => console.log("Editar", evento.ID_Evento)}
                    >
                      Editar
                    </button>
                    <button
                      className="px-3 py-1 text-xs font-medium text-white bg-red-500 rounded hover:bg-red-600"
                      onClick={() => console.log("Excluir", evento.ID_Evento)}
                    >
                      Excluir
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}