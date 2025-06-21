import React, { useState, useEffect } from 'react';
import { Euro, TrendingUp, Users, Eye, Download, CreditCard, Calendar, Clock, CheckCircle, AlertCircle, XCircle, X } from 'lucide-react';

const FinancialDashboard = ({ isDark = false }) => {
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    const fetchTotalRevenue = async () => {
      try {
        const response = await fetch('http://localhost/total_revenue.php', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        if (data.successo) {
          setTotalRevenue(parseFloat(data.data.total_revenue));
        }
      } catch (error) {
        console.error('Erro ao buscar receita total:', error);
      }
    };

    fetchTotalRevenue();
  }, []);

  // Dados mockados para demonstração
  const dashboardData = {
    receitaTotal: totalRevenue,
    bilhetesVendidos: 523,
    eventosAtivos: 8,
    saldoDisponivel: 41175.72,
    ultimaAtualizacao: '2 minutos'
  };

  const ultimasTransacoes = [
    {
      id: 1,
      nome: 'Maria Silva',
      evento: 'Festival de Verão 2025',
      valor: 125.00,
      estado: 'confirmado',
      metodoPagamento: 'Cartão de Crédito',
      data: '11/06/2025 14:32',
      email: 'maria.silva@email.com',
      telefone: '+351 912 345 678',
      numeroTransacao: 'TXN-2025-001234',
      taxaProcessamento: 3.75,
      valorLiquido: 121.25
    },
    {
      id: 2,
      nome: 'João Santos',
      evento: 'Concerto Jazz Club',
      valor: 85.50,
      estado: 'pendente',
      metodoPagamento: 'MB Way',
      data: '11/06/2025 14:15',
      email: 'joao.santos@email.com',
      telefone: '+351 963 789 012',
      numeroTransacao: 'TXN-2025-001235',
      taxaProcessamento: 2.57,
      valorLiquido: 82.93
    }
  ];

  const todasTransacoes = [
    {
      id: 1,
      nome: 'Maria Silva',
      evento: 'Festival de Verão 2025',
      valor: 125.00,
      estado: 'confirmado',
      metodoPagamento: 'Cartão de Crédito',
      data: '11/06/2025 14:32'
    },
    {
      id: 2,
      nome: 'João Santos',
      evento: 'Concerto Jazz Club',
      valor: 85.50,
      estado: 'pendente',
      metodoPagamento: 'MB Way',
      data: '11/06/2025 14:15'
    }
  ];

  const receitaPorEvento = [
    {
      id: 1,
      nome: 'Festival de Verão 2025',
      receitaBruta: 18750.00,
      receitaLiquida: 16875.00,
      bilhetesVendidos: 150,
      bilhetesDisponiveis: 200,
      percentualLotacao: 75
    },
    {
      id: 2,
      nome: 'Concerto Jazz Club',
      receitaBruta: 12580.50,
      receitaLiquida: 11322.45,
      bilhetesVendidos: 147,
      bilhetesDisponiveis: 180,
      percentualLotacao: 82
    }
  ];

  const getStatusIcon = (estado) => {
    switch (estado) {
      case 'confirmado':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'pendente':
        return <AlertCircle size={16} className="text-yellow-500" />;
      case 'falhado':
        return <XCircle size={16} className="text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (estado) => {
    const baseClasses = "status-badge";
    switch (estado) {
      case 'confirmado':
        return `${baseClasses} status-success`;
      case 'pendente':
        return `${baseClasses} status-warning`;
      case 'falhado':
        return `${baseClasses} status-error`;
      default:
        return baseClasses;
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  const handleShowDetails = (transacao) => {
    setSelectedTransaction(transacao);
    setShowDetailsModal(true);
  };

  const handleShowTransactions = () => {
    setShowTransactionModal(true);
  };

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="payment-page">
        {/* Cabeçalho da página */}
        <div className="page-header">
          <h1 className="page-title">Dashboard Financeiro</h1>
          <p className="page-subtitle">
            Acompanhe o desempenho financeiro dos seus eventos em tempo real
          </p>
        </div>

        {/* Secção 1 - Visão Geral */}
        <div className="section">
          <div className="section-title">
            <TrendingUp size={24} />
            Visão Geral
          </div>
          
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{formatCurrency(dashboardData.receitaTotal)}</div>
              <div className="stat-label">Receita Total Gerada</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
                <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />
                Atualizado há {dashboardData.ultimaAtualizacao}
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-value">{dashboardData.bilhetesVendidos}</div>
              <div className="stat-label">Bilhetes Vendidos</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
                {dashboardData.eventosAtivos} eventos ativos com vendas
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-value">{formatCurrency(dashboardData.saldoDisponivel)}</div>
              <div className="stat-label">Saldo Disponível</div>
              <button 
                className="btn btn-secondary" 
                style={{ marginTop: '12px', fontSize: '12px', padding: '8px 12px' }}
                onClick={handleShowTransactions}
              >
                <Eye size={14} />
                Ver Transações
              </button>
            </div>
          </div>
        </div>

        {/* Secção 2 - Últimas Transações */}
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">
              <CreditCard size={24} />
              Últimas Transações
            </h2>
            <button className="export-btn">
              <Download size={16} />
              Exportar
            </button>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Evento</th>
                  <th>Valor</th>
                  <th>Estado</th>
                  <th>Método</th>
                  <th>Data</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {ultimasTransacoes.map((transacao) => (
                  <tr key={transacao.id}>
                    <td style={{ fontWeight: '500' }}>{transacao.nome}</td>
                    <td>{transacao.evento}</td>
                    <td style={{ fontWeight: '600' }}>{formatCurrency(transacao.valor)}</td>
                    <td>
                      <span className={getStatusBadge(transacao.estado)}>
                        {getStatusIcon(transacao.estado)}
                        {transacao.estado.charAt(0).toUpperCase() + transacao.estado.slice(1)}
                      </span>
                    </td>
                    <td>{transacao.metodoPagamento}</td>
                    <td className="history-date">{transacao.data}</td>
                    <td>
                      <button 
                        className="btn btn-secondary" 
                        style={{ fontSize: '12px', padding: '6px 12px' }}
                        onClick={() => handleShowDetails(transacao)}
                      >
                        <Eye size={14} />
                        Detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Secção 3 - Receita por Evento */}
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">
              <Calendar size={24} />
              Receita por Evento
            </h2>
            <button className="export-btn">
              <Download size={16} />
              Relatório Detalhado
            </button>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Nome do Evento</th>
                  <th>Receita Bruta</th>
                  <th>Receita Líquida</th>
                  <th>Bilhetes</th>
                  <th>Lotação</th>
                  <th>Performance</th>
                </tr>
              </thead>
              <tbody>
                {receitaPorEvento.map((evento) => (
                  <tr key={evento.id}>
                    <td style={{ fontWeight: '500' }}>{evento.nome}</td>
                    <td style={{ fontWeight: '600' }}>{formatCurrency(evento.receitaBruta)}</td>
                    <td style={{ fontWeight: '600', color: '#059669' }}>{formatCurrency(evento.receitaLiquida)}</td>
                    <td>
                      <div>{evento.bilhetesVendidos} / {evento.bilhetesDisponiveis}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '60px',
                          height: '6px',
                          backgroundColor: '#e5e7eb',
                          borderRadius: '3px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${evento.percentualLotacao}%`,
                            height: '100%',
                            backgroundColor: evento.percentualLotacao > 80 ? '#059669' : 
                                           evento.percentualLotacao > 50 ? '#d97706' : '#dc2626',
                            borderRadius: '3px'
                          }}></div>
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: '500' }}>
                          {evento.percentualLotacao}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${
                        evento.percentualLotacao > 80 ? 'status-success' : 
                        evento.percentualLotacao > 50 ? 'status-warning' : 'status-error'
                      }`}>
                        {evento.percentualLotacao > 80 ? 'Excelente' : 
                         evento.percentualLotacao > 50 ? 'Bom' : 'Baixo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de Detalhes da Transação */}
        {showDetailsModal && selectedTransaction && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h3>Detalhes da Transação</h3>
                <button 
                  className="modal-close"
                  onClick={() => setShowDetailsModal(false)}
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="modal-content">
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Nome do Cliente:</span>
                    <span className="detail-value">{selectedTransaction.nome}</span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{selectedTransaction.email}</span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">Telefone:</span>
                    <span className="detail-value">{selectedTransaction.telefone}</span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">Evento:</span>
                    <span className="detail-value">{selectedTransaction.evento}</span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">Número da Transação:</span>
                    <span className="detail-value">{selectedTransaction.numeroTransacao}</span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">Valor Bruto:</span>
                    <span className="detail-value">{formatCurrency(selectedTransaction.valor)}</span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">Taxa de Processamento:</span>
                    <span className="detail-value">{formatCurrency(selectedTransaction.taxaProcessamento)}</span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">Valor Líquido:</span>
                    <span className="detail-value" style={{ fontWeight: '600', color: '#059669' }}>
                      {formatCurrency(selectedTransaction.valorLiquido)}
                    </span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">Método de Pagamento:</span>
                    <span className="detail-value">{selectedTransaction.metodoPagamento}</span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">Data da Transação:</span>
                    <span className="detail-value">{selectedTransaction.data}</span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">Estado:</span>
                    <span className={getStatusBadge(selectedTransaction.estado)}>
                      {getStatusIcon(selectedTransaction.estado)}
                      {selectedTransaction.estado.charAt(0).toUpperCase() + selectedTransaction.estado.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Todas as Transações */}
        {showTransactionModal && (
          <div className="modal-overlay">
            <div className="modal modal-large">
              <div className="modal-header">
                <h3>Todas as Transações</h3>
                <button 
                  className="modal-close"
                  onClick={() => setShowTransactionModal(false)}
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="modal-content">
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Nome</th>
                        <th>Evento</th>
                        <th>Valor</th>
                        <th>Estado</th>
                        <th>Método</th>
                        <th>Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todasTransacoes.map((transacao) => (
                        <tr key={transacao.id}>
                          <td style={{ fontWeight: '500' }}>{transacao.nome}</td>
                          <td>{transacao.evento}</td>
                          <td style={{ fontWeight: '600' }}>{formatCurrency(transacao.valor)}</td>
                          <td>
                            <span className={getStatusBadge(transacao.estado)}>
                              {getStatusIcon(transacao.estado)}
                              {transacao.estado.charAt(0).toUpperCase() + transacao.estado.slice(1)}
                            </span>
                          </td>
                          <td>{transacao.metodoPagamento}</td>
                          <td className="history-date">{transacao.data}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Aviso Legal */}
        <div className="legal-notice">
          <h4>Informação Importante</h4>
          <p>
            Os valores apresentados são atualizados em tempo real. As receitas líquidas consideram as taxas de processamento 
            e comissões aplicáveis. Para informações detalhadas sobre taxas e prazos de transferência, 
            <a href="#"> consulte os nossos termos de serviço</a>.
          </p>
          <p>
            <strong>Próxima transferência programada:</strong> 15 de Junho de 2025
          </p>
        </div>
      </div>

      <style>{`
        .payment-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #f8fafc;
          min-height: 100vh;
        }

        .page-header {
          margin-bottom: 32px;
          
        }

        .page-title {
          font-size: 28px;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 8px 0;
        }

        .page-subtitle {
          color: #64748b;
          font-size: 16px;
          margin: 0;
        }

        .section {
          background: white;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .section-title {
          font-size: 20px;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 20px 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .section-header h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .export-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 0.75rem 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .export-btn:hover {
          background: #2563eb;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }

        .status-success {
          background: #dcfce7;
          color: #166534;
        }

        .status-warning {
          background: #fef3c7;
          color: #92400e;
        }

        .status-error {
          background: #fecaca;
          color: #991b1b;
        }

        .table-container {
          overflow-x: auto;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
        }

        .table {
          width: 100%;
          border-collapse: collapse;
        }

        .table th,
        .table td {
          padding: 12px 16px;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }

        .table th {
          background: #f9fafb;
          font-weight: 600;
          color: #374151;
          font-size: 14px;
        }

        .table td {
          font-size: 14px;
          color: #6b7280;
        }

        .table tr:last-child td {
          border-bottom: none;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
        }

        .btn-primary {
          background: #3b82f6;
          color: white;
        }

        .btn-primary:hover {
          background: #2563eb;
        }

        .btn-secondary {
          background: #f8fafc;
          color: #64748b;
          border: 1px solid #cbd5e1;
        }

        .btn-secondary:hover {
          background: #f1f5f9;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: #f8fafc;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #3b82f6;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 14px;
          color: #64748b;
        }

        .legal-notice {
          background: #fffbeb;
          border: 1px solid #fbbf24;
          border-radius: 8px;
          padding: 16px;
          margin-top: 24px;
        }

        .legal-notice h4 {
          margin: 0 0 12px 0;
          color: #92400e;
          font-size: 16px;
        }

        .legal-notice p {
          margin: 0 0 12px 0;
          color: #78350f;
          font-size: 14px;
          line-height: 1.5;
        }

        .legal-notice a {
          color: #3b82f6;
          text-decoration: none;
          font-weight: 500;
        }

        .legal-notice a:hover {
          text-decoration: underline;
        }

        .history-date {
          font-size: 14px;
          color: #64748b;
        }

        /* Modal Styles */
          .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal {
          background: white;
          border-radius: 12px;
          max-width: 600px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          z-index: 1000
        }

        .modal-large {
          max-width: 900px;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
        }

        .modal-close {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          color: #6b7280;
        }

        .modal-close:hover {
          background: #f3f4f6;
        }

        .modal-content {
          padding: 24px;
        }

        .detail-grid {
          display: grid;
          gap: 16px;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .detail-item:last-child {
          border-bottom: none;
        }

        .detail-label {
          font-weight: 500;
          color: #374151;
        }

        .detail-value {
          color: #6b7280;
        }

        /* Dark Mode Modal Styles */
        .dark .modal-overlay {
          background: rgba(0, 0, 0, 0.7);
        }

        .dark .modal {
          background: #1e293b;
          border: 1px solid #334155;
        }

        .dark .modal-header {
          border-bottom: 1px solid #334155;
        }

        .dark .modal-header h3 {
          color: #f1f5f9;
        }

        .dark .modal-close {
          color: #94a3b8;
        }

        .dark .modal-close:hover {
          background: #334155;
          color: #f1f5f9;
        }

        .dark .detail-item {
          border-bottom: 1px solid #334155;
        }

        .dark .detail-label {
          color: #f1f5f9;
        }

        .dark .detail-value {
          color: #cbd5e1;
        }

        /* Dark mode para tabelas dentro dos modais */
        .dark .modal .table {
          border-color: #334155;
        }

        .dark .modal .table th {
          background: #334155;
          color: #f1f5f9;
          border-bottom: 1px solid #475569;
        }

        .dark .modal .table td {
          color: #cbd5e1;
          border-bottom: 1px solid #334155;
        }

        .dark .modal .table-container {
          border-color: #334155;
        }
      `}</style>
    </div>
  );
};

export default FinancialDashboard;
