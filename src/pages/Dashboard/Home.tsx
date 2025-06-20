import { useState, useRef } from "react";
import { RefreshCw } from "lucide-react";
import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import RecentOrders from "../../components/ecommerce/RecentOrders";
import PageMeta from "../../components/common/PageMeta";

export default function Home() {
  const [globalLoading, setGlobalLoading] = useState(false);
  
  const handleRefreshAll = async () => {
    setGlobalLoading(true);
    
    try {
      
      
      // If components don't have refresh methods, force a page reload
      // This ensures all data is refreshed
      window.location.reload();
    } catch (error) {
      console.error('Error refreshing components:', error);
      // Fallback to page reload if there's an error
      window.location.reload();
    } finally {
      setGlobalLoading(false);
    }
  };

  return (
    <>
      <PageMeta
        title="React.js Ecommerce Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Ecommerce Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      
      {/* Header with refresh button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Visão geral das suas métricas
          </p>
        </div>
        
        <button
          onClick={handleRefreshAll}
          disabled={globalLoading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${globalLoading ? 'animate-spin' : ''}`} />
          Atualizar Tudo
        </button>
      </div>

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12">
          <EcommerceMetrics  />
        </div>

        <div className="col-span-12">
          <StatisticsChart />
        </div>
        
        <div className="col-span-12 xl:col-span-7">
          <RecentOrders />
        </div>
      </div>
    </>
  );
}