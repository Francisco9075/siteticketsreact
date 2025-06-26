import { useState, useEffect } from "react";
import {
  ArrowDown,
  ArrowUp,
  Package,
  Users,
  RefreshCw,
  AlertCircle,
  Calendar,
  CheckCircle
} from "lucide-react";

// Mock Badge component since it's not available
const Badge = ({ color, children }) => {
  const colorClasses = {
    success: 'bg-green-100 text-green-800 border-green-200',
    danger: 'bg-red-100 text-red-800 border-red-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  };
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md border ${colorClasses[color] || colorClasses.warning}`}>
      {children}
    </span>
  );
};

export default function EcommerceMetrics() {
  const [metrics, setMetrics] = useState({
    active_events: {
      count: 0,
      percentage_change: 0,
      trend: 'up',
      loading: true,
      error: null
    },
    total_revenue: {
      amount: '0.00',
      percentage_change: 0,
      trend: 'up',
      loading: true,
      error: null
    },
    tickets_sold: {
      count: 0,
      percentage_change: 0,
      trend: 'up',
      loading: true,
      error: null
    }
  });
  
  const [globalLoading, setGlobalLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  // API endpoints configuration
  const API_BASE = 'http://localhost';
  const endpoints = {
    all: `${API_BASE}/get_all_metrics.php`,
    active_events: `${API_BASE}/active_events.php`,
    total_revenue: `${API_BASE}/total_revenue.php`,
    tickets_sold: `${API_BASE}/tickets_sold.php`
  };

  useEffect(() => {
    fetchAllMetrics();
  }, []);

  const fetchAllMetrics = async () => {
    setGlobalLoading(true);
    try {
      // First, try to get all metrics from the combined endpoint
      const allMetricsSuccess = await fetchFromAllMetricsEndpoint();
      
      if (!allMetricsSuccess) {
        // If combined endpoint fails, fetch from individual endpoints
        await fetchFromIndividualEndpoints();
      }
    } catch (error) {
      console.error('Error in fetchAllMetrics:', error);
      // Fallback to individual endpoints
      await fetchFromIndividualEndpoints();
    } finally {
      setGlobalLoading(false);
      setLastUpdated(new Date());
    }
  };

  const fetchFromAllMetricsEndpoint = async () => {
    try {
      const response = await fetch(endpoints.all, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.successo && data.data) {
        setMetrics({
          active_events: {
            count: extractActiveEventsCount(data.data.active_events),
            percentage_change: data.data.active_events?.percentage_change || 0,
            trend: data.data.active_events?.trend || 'up',
            loading: false,
            error: null
          },
          total_revenue: {
            amount: extractTotalRevenue(data.data.total_revenue),
            percentage_change: data.data.total_revenue?.percentage_change || 0,
            trend: data.data.total_revenue?.trend || 'up',
            loading: false,
            error: null
          },
          tickets_sold: {
            count: extractTicketsSold(data.data.tickets_sold),
            percentage_change: data.data.tickets_sold?.percentage_change || 0,
            trend: data.data.tickets_sold?.trend || 'up',
            loading: false,
            error: null
          }
        });
        return true;
      } else {
        throw new Error(data.message || 'Invalid response format');
      }
    } catch (error) {
      console.error('All metrics endpoint failed:', error);
      return false;
    }
  };

  const fetchFromIndividualEndpoints = async () => {
    // Fetch all endpoints concurrently
    await Promise.all([
      fetchActiveEvents(),
      fetchTotalRevenue(),
      fetchTicketsSold()
    ]);
  };

  // Helper functions to extract values from different possible field names
  const extractActiveEventsCount = (data) => {
    if (!data) return 0;
    return data.count || data.active_events || data.total_active_events || data.eventos_ativos || 0;
  };

  const extractTotalRevenue = (data) => {
    if (!data) return '0.00';
    return data.amount || data.total_revenue || data.receita_total || '0.00';
  };

  const extractTicketsSold = (data) => {
    if (!data) return 0;
    return data.count || data.total_tickets || data.tickets_sold || data.bilhetes_vendidos || 0;
  };

  const fetchActiveEvents = async () => {
    setMetrics(prev => ({
      ...prev,
      active_events: { ...prev.active_events, loading: true, error: null }
    }));

    try {
      console.log('🔄 Fetching active events from:', endpoints.active_events);
      
      const response = await fetch(endpoints.active_events, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Try to read the error response
        let errorBody = '';
        try {
          errorBody = await response.text();
          console.error('❌ Error response body:', errorBody);
        } catch (e) {
          console.error('❌ Cannot read error response body');
        }
        throw new Error(`HTTP ${response.status}: ${errorBody || 'Server Error'}`);
      }

      const responseText = await response.text();
      console.log('📄 Raw response:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('✅ Parsed JSON:', data);
      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError);
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
      }
      
      if (data.successo && data.data) {
        const activeEventsCount = extractActiveEventsCount(data.data);
        console.log('🎯 Active events count found:', activeEventsCount);
        
        // Store debug info
        if (data.data.debug_info) {
          setDebugInfo(prev => ({
            ...prev,
            active_events: data.data.debug_info
          }));
        }
        
        setMetrics(prev => ({
          ...prev,
          active_events: {
            count: activeEventsCount,
            percentage_change: data.data.percentage_change || 0,
            trend: data.data.trend || 'up',
            loading: false,
            error: null
          }
        }));
      } else {
        console.error('❌ API returned error or invalid format:', data);
        throw new Error(data.message || `Invalid response format. Expected successo=true, got: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      console.error('💥 Error fetching active events:', error);
      setMetrics(prev => ({
        ...prev,
        active_events: {
          ...prev.active_events,
          loading: false,
          error: error.message
        }
      }));
    }
  };

  const fetchTotalRevenue = async () => {
    setMetrics(prev => ({
      ...prev,
      total_revenue: { ...prev.total_revenue, loading: true, error: null }
    }));

    try {
      const response = await fetch(endpoints.total_revenue, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      
      if (data.successo && data.data) {
        setMetrics(prev => ({
          ...prev,
          total_revenue: {
            amount: extractTotalRevenue(data.data),
            percentage_change: data.data.percentage_change || 0,
            trend: data.data.trend || 'up',
            loading: false,
            error: null
          }
        }));
      } else {
        throw new Error(data.message || 'Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching total revenue:', error);
      setMetrics(prev => ({
        ...prev,
        total_revenue: {
          ...prev.total_revenue,
          loading: false,
          error: error.message
        }
      }));
    }
  };

  const fetchTicketsSold = async () => {
    setMetrics(prev => ({
      ...prev,
      tickets_sold: { ...prev.tickets_sold, loading: true, error: null }
    }));

    try {
      const response = await fetch(endpoints.tickets_sold, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      
      if (data.successo && data.data) {
        setMetrics(prev => ({
          ...prev,
          tickets_sold: {
            count: extractTicketsSold(data.data),
            percentage_change: data.data.percentage_change || 0,
            trend: data.data.trend || 'up',
            loading: false,
            error: null
          }
        }));
      } else {
        throw new Error(data.message || 'Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching tickets sold:', error);
      setMetrics(prev => ({
        ...prev,
        tickets_sold: {
          ...prev.tickets_sold,
          loading: false,
          error: error.message
        }
      }));
    }
  };

  const retryMetric = (metricType) => {
    switch (metricType) {
      case 'active_events':
        fetchActiveEvents();
        break;
      case 'total_revenue':
        fetchTotalRevenue();
        break;
      case 'tickets_sold':
        fetchTicketsSold();
        break;
      default:
        fetchAllMetrics();
    }
  };

  const formatNumber = (number, loading) => {
    if (loading) return "...";
    return new Intl.NumberFormat('pt-PT').format(number);
  };

  const formatCurrency = (amount, loading) => {
    if (loading) return "...";
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(parseFloat(amount));
  };

  const formatPercentage = (percentage, loading) => {
    if (loading) return "...";
    return `${Math.abs(percentage).toFixed(1)}%`;
  };

  const getBadgeColor = (trend) => {
    return trend === 'up' ? 'success' : 'danger';
  };

  const getTrendIcon = (trend) => {
    return trend === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />;
  };

  const getLoadingStates = () => {
    const loadingCount = Object.values(metrics).filter(metric => metric.loading).length;
    const errorCount = Object.values(metrics).filter(metric => metric.error).length;
    const successCount = Object.values(metrics).filter(metric => !metric.loading && !metric.error).length;
    
    return { loadingCount, errorCount, successCount };
  };

  const { loadingCount, errorCount, successCount } = getLoadingStates();

  const MetricCard = ({ title, value, metric, icon: Icon, retryType }) => (
    <div className="w-full max-w-full rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-white/[0.03] md:p-10 relative">
      {/* Loading overlay */}
      {metric.loading && (
        <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 rounded-2xl flex items-center justify-center z-10">
          <RefreshCw className="w-6 h-6 animate-spin text-gray-600 dark:text-gray-400" />
        </div>
      )}
      
      <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-xl dark:bg-gray-800">
        <Icon className="text-gray-800 w-6 h-6 dark:text-white/90" />
      </div>

      <div className="flex items-end justify-between mt-5">
        <div className="flex-1">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {title}
          </span>
          <h4 className="mt-2 font-bold text-gray-800 text-2xl dark:text-white/90">
            {value}
          </h4>
          {metric.error && (
            <div className="mt-2 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-xs text-red-600 dark:text-red-400 font-medium">
                  Erro ao carregar
                </div>
                <div className="text-xs text-red-500 dark:text-red-300 mt-1 max-w-xs break-words">
                  {metric.error.length > 50 ? `${metric.error.substring(0, 50)}...` : metric.error}
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex flex-col items-end gap-2">
          {!metric.loading && !metric.error && (
            <Badge color={getBadgeColor(metric.trend)}>
              {getTrendIcon(metric.trend)}
              {formatPercentage(metric.percentage_change, metric.loading)}
            </Badge>
          )}
          
          {metric.error && (
            <button 
              onClick={() => retryMetric(retryType)}
              className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 underline"
              disabled={metric.loading}
            >
              Tentar novamente
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          {lastUpdated && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Última atualização: {lastUpdated.toLocaleTimeString('pt-PT')}
            </p>
          )}
        </div>
      </div>

      {/* Status Summary */}
      {(loadingCount > 0 || errorCount > 0) && (
        <div className="flex gap-4 text-sm">
          {loadingCount > 0 && (
            <div className="flex items-center gap-2 text-blue-600">
              <RefreshCw className="w-4 h-4 animate-spin" />
              {loadingCount} carregando...
            </div>
          )}
          {errorCount > 0 && (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              {errorCount} com erro
            </div>
          )}
          {successCount > 0 && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              {successCount} carregado{successCount > 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-6">
        <MetricCard
          title="Eventos Ativos"
          value={formatNumber(metrics.active_events.count, metrics.active_events.loading)}
          metric={metrics.active_events}
          icon={Calendar}
          retryType="active_events"
        />
        
        <MetricCard
          title="Receita Total"
          value={formatCurrency(metrics.total_revenue.amount, metrics.total_revenue.loading)}
          metric={metrics.total_revenue}
          icon={Package}
          retryType="total_revenue"
        />
        
        <MetricCard
          title="Bilhetes Vendidos"
          value={formatNumber(metrics.tickets_sold.count, metrics.tickets_sold.loading)}
          metric={metrics.tickets_sold}
          icon={Users}
          retryType="tickets_sold"
        />
      </div>
    </div>
  );
}