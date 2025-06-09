import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";

import Badge from "../../ui/badge/Badge";

interface Participante {
  nomeComprador: string;
  emailComprador: string;
  tipoBilhete: string;
  quantidadeComprada: number;
  pedidoFatura: boolean;
  dataCompra: string;
  metodoPagamento: string;
  estadoBilhete: "válido" | "usado" | "cancelado";
  checkIn: boolean;
  logCheckIn?: string; // log de hora extra
}

const participantesData: Participante[] = [
  {
    nomeComprador: "João Silva",
    emailComprador: "joao@example.com",
    tipoBilhete: "VIP",
    quantidadeComprada: 2,
    pedidoFatura: true,
    dataCompra: "2025-06-01 14:00:00",
    metodoPagamento: "MB Way",
    estadoBilhete: "válido",
    checkIn: true,
    logCheckIn: "2025-06-01 14:05:00",
  },
  {
    nomeComprador: "Maria Oliveira",
    emailComprador: "maria@example.com",
    tipoBilhete: "Normal",
    quantidadeComprada: 1,
    pedidoFatura: false,
    dataCompra: "2025-06-02 10:00:00",
    metodoPagamento: "Cartão",
    estadoBilhete: "usado",
    checkIn: false,
  },
  // ... Adicione mais participantes conforme necessário
];

export default function GerirClientes() {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] mt-6">
      <div className="max-w-full overflow-x-auto">
        <Table>
          {/* Cabeçalho da Tabela */}
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Nome</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Email</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Tipo Bilhete</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Quantidade</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Pedido de Fatura</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Data da Compra</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Método Pagamento</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Estado Bilhete</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Check-in</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Log Check-in</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Ações</TableCell>
            </TableRow>
          </TableHeader>

          {/* Corpo da Tabela */}
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {participantesData.map((participante, index) => (
              <TableRow key={index}>
                <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">{participante.nomeComprador}</TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">{participante.emailComprador}</TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">{participante.tipoBilhete}</TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">{participante.quantidadeComprada}</TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {participante.pedidoFatura ? "Sim" : "Não"}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">{participante.dataCompra}</TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">{participante.metodoPagamento}</TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  <Badge
                    size="sm"
                    color={
                      participante.estadoBilhete === "válido"
                        ? "success"
                        : participante.estadoBilhete === "usado"
                        ? "warning"
                        : "error"
                    }
                  >
                    {participante.estadoBilhete}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-3 text-start text-theme-sm">
                  {participante.checkIn ? "✅" : "❌"}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {participante.logCheckIn || "-"}
                </TableCell>
                <TableCell className="px-4 py-3 text-start">
                  <div className="flex gap-2">
                    <button
                      className="px-3 py-1 text-xs font-medium text-white bg-blue-500 rounded hover:bg-blue-600"
                      onClick={() => console.log("Editar", participante.nomeComprador)}
                    >
                      Editar
                    </button>
                    <button
                      className="px-3 py-1 text-xs font-medium text-white bg-red-500 rounded hover:bg-red-600"
                      onClick={() => console.log("Excluir", participante.nomeComprador)}
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
