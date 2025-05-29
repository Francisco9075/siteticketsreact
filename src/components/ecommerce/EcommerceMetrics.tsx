import {
  ArrowDownIcon,
  ArrowUpIcon,
  BoxIconLine,
  GroupIcon,
} from "../../icons";
import Badge from "../ui/badge/Badge";

export default function EcommerceMetrics() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-6">
      {/* <!-- Metric Item Start --> */}
        <div className="w-full max-w-full rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-white/[0.03] md:p-10">
          <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-xl dark:bg-gray-800">
            <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
          </div>

          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Eventos Ativos
              </span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                3,782
              </h4>
          </div>
          <Badge color="success">
            <ArrowUpIcon />
            11.01%
            </Badge>
          </div>
        </div>
      {/* <!-- Metric Item End --> */}

         {/* <!-- Metric Item Start --> */}
  <div className="w-full max-w-full rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-white/[0.03] md:p-10">
        <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Receita Total
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              3,782
            </h4>
          </div>
          <Badge color="success">
            <ArrowUpIcon />
            11.01%
          </Badge>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
  <div className="w-full max-w-full rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-white/[0.03] md:p-10">
        <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Bilhetes Vendidos
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              3,782
            </h4>
          </div>
          <Badge color="success">
            <ArrowUpIcon />
            11.01%
          </Badge>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}
    </div>
  );
}
