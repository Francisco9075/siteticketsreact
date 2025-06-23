import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Smartphone, 
  Receipt, 
  Upload, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Eye,
  ExternalLink
} from 'lucide-react';

interface Transaction {
  ID_Vendas: number;
  Data: string;
  Valor_Total: number;
  Taxas: number;
  Valor_Liquido: number;
  ID_Estado_Vendas: number;
  ID_Metodo_Pagamento: number;
  Clientes: string;
  Fatura: number;
}

const PaymentProcessingPage = () => {
  const [iban, setIban] = useState('');
  const [ibanFile, setIbanFile] = useState(null);
  const [selectedTab, setSelectedTab] = useState('config');
  const [paymentMethods, setPaymentMethods] = useState({
    creditCard: false,
    mbway: false,
    referenceMB: false
  });

  const paymentStatus = {
    configured: true,
    ibanValidation: 'Validado',
    lastChange: '2025-06-05 14:30',
    previousState: 'Pendente',
    currentState: 'Validado'
  };

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = () => {
    setLoading(true);
    fetch("http://localhost/transacoes.php", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.successo) {
          setTransactions(data.vendas.map((t: any) => ({
            ID_Vendas: t.ID_Vendas,
            Data: t.Data,
            Valor_Total: parseFloat(t.Valor_Total),
            Taxas: parseFloat(t.Taxas),
            Valor_Liquido: parseFloat(t.Valor_Liquido),
            ID_Estado_Vendas: parseInt(t.ID_Estado_Vendas),
            ID_Metodo_Pagamento: parseInt(t.ID_Metodo_Pagamento),
            Clientes: t.Clientes,
            Fatura: parseInt(t.Fatura),
          })));
        } else {
          console.error("Erro do servidor:", data.message);
          alert("Erro ao carregar transações: " + data.message);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro na requisição:", err);
        alert("Erro de conexão ao carregar transações");
        setLoading(false);
      });
  };

  const mapEstado = (estadoId: number) => {
    const estados: { [key: number]: string } = {
      1: 'Pago',
      2: 'Pendente',
      3: 'Falhado'
    };
    return estados[estadoId] || 'Desconhecido';
  };

  const mapMetodo = (metodoId: number) => {
    const metodos: { [key: number]: string } = {
      1: 'Cartão de Crédito',
      2: 'MBWay',
      3: 'Referência MB'
    };
    return metodos[metodoId] || 'Outro';
  };

  const paymentHistory = [
    {
      date: '2025-06-01',
      amount: 1250.75,
      status: 'Transferido'
    },
    {
      date: '2025-05-15',
      amount: 875.25,
      status: 'Transferido'
    }
  ];

  const handleFileUpload = (event: any) => {
    const file = event.target.files[0];
    setIbanFile(file);
  };

  const exportTransactions = () => {
    alert('Exportação de transações iniciada');
  };

  const handlePaymentMethodChange = (method: string) => {
    setPaymentMethods(prev => ({
      ...prev,
      [method]: !prev[method]
    }));
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      'Pago': { color: 'success', icon: CheckCircle },
      'Pendente': { color: 'warning', icon: Clock },
      'Falhado': { color: 'error', icon: AlertCircle },
      'Validado': { color: 'success', icon: CheckCircle },
      'Rejeitado': { color: 'error', icon: AlertCircle },
      'Transferido': { color: 'success', icon: CheckCircle }
    };
    
    const config = statusConfig[status] || { color: 'default', icon: Clock };
    const Icon = config.icon;
    
    return (
      <span className={`status-badge status-${config.color}`}>
        <Icon size={14} />
        {status}
      </span>
    );
  };

  return (
    <div className="payment-page">
      <div className="page-header">
        <h1 className="page-title">Processamento de Pagamentos e Transações</h1>
        <p className="page-subtitle">
          Configure métodos de pagamento, gerir IBAN e acompanhe transações
        </p>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${selectedTab === 'config' ? 'active' : ''}`}
          onClick={() => setSelectedTab('config')}
        >
          Configuração
        </button>
        <button 
          className={`tab ${selectedTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setSelectedTab('transactions')}
        >
          Transações
        </button>
        <button 
          className={`tab ${selectedTab === 'payments' ? 'active' : ''}`}
          onClick={() => setSelectedTab('payments')}
        >
          Pagamentos
        </button>
      </div>

      {selectedTab === 'config' && (
        <>
          {/* Secção 1 - Configuração de Pagamentos */}
          <div className="section">
            <h2 className="section-title">
              <CreditCard size={24} />
              Configuração de Pagamentos
            </h2>
            
            <div className="status-card">
              <div className="status-message">
                <CheckCircle size={20} />
                {paymentStatus.configured ? 
                  'Conta pronta para receber pagamentos' : 
                  'Falta configurar IBAN para receber receitas'
                }
              </div>
              <div className="status-details">
                Estado do IBAN: {getStatusBadge(paymentStatus.ibanValidation)}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">IBAN do Produtor</label>
              <input
                type="text"
                className="form-input"
                value={iban}
                onChange={(e) => setIban(e.target.value)}
                placeholder="PT50 0000 0000 0000 0000 0000 0"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Comprovativo de IBAN</label>
              <div className="file-upload">
                <input
                  type="file"
                  className="file-upload-input"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                />
                <div className="file-upload-btn">
                  <Upload size={16} />
                  {ibanFile ? ibanFile.name : 'Seleccionar ficheiro (PDF ou Imagem)'}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Histórico de Alterações</label>
              <div style={{ fontSize: '14px', color: '#64748b' }}>
                <p>Última alteração: {paymentStatus.lastChange}</p>
                <p>Estado anterior: {getStatusBadge(paymentStatus.previousState)} → 
                  Estado atual: {getStatusBadge(paymentStatus.currentState)}</p>
              </div>
            </div>
          </div>

          {/* Secção 2 - Métodos de Pagamento */}
          <div className="section">
            <h2 className="section-title">
              <Receipt size={24} />
              Métodos de Pagamento Ativados
            </h2>
            
            <div className="payment-methods">
              <div 
                className={`payment-method ${paymentMethods.creditCard ? 'active' : ''}`}
                onClick={() => handlePaymentMethodChange('creditCard')}
              >
                <div className="payment-method-icon">
                  <CreditCard size={20} />
                </div>
                <div>
                  <div className="font-medium text-black dark:text-white">Cartão de Crédito</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Visa, Mastercard</div>
                </div>
              </div>

              <div 
                className={`payment-method ${paymentMethods.mbway ? 'active' : ''}`}
                onClick={() => handlePaymentMethodChange('mbway')}
              >
                <div className="payment-method-icon">
                  <Smartphone size={20} />
                </div>
                <div>
                  <div className="font-medium text-black dark:text-white">MBWay</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Pagamento móvel</div>
                </div>
              </div>

              <div 
                className={`payment-method ${paymentMethods.referenceMB ? 'active' : ''}`}
                onClick={() => handlePaymentMethodChange('referenceMB')}
              >
                <div className="payment-method-icon">
                  <Receipt size={20} />
                </div>
                <div>
                  <div className="font-medium text-black dark:text-white">Referência MB</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Multibanco</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {selectedTab === 'transactions' && (
        <div className="section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 className="section-title">
              <Receipt size={24} />
              Transações
            </h2>
            <button className="btn btn-secondary" onClick={exportTransactions}>
              <Download size={16} />
              Exportar
            </button>
          </div>

          <div className="table-container">
            {loading ? (
              <p className="text-gray-500 p-4">A carregar transações...</p>
            ) : transactions.length === 0 ? (
              <p className="text-red-500 p-4">Nenhuma transação encontrada.</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Transação</th>
                    <th>Data</th>
                    <th>Valor Total</th>
                    <th>Taxas</th>
                    <th>Valor Líquido</th>
                    <th>Estado</th>
                    <th>Método</th>
                    <th>Comprador</th>
                    <th>Fatura</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.ID_Vendas}>
                      <td style={{ fontFamily: 'monospace', fontWeight: '500' }}>TXN
                        {transaction.ID_Vendas}
                      </td>
                      <td>{transaction.Data}</td>
                      <td style={{ fontWeight: '500' }}>€{transaction.Valor_Total.toFixed(2)}</td>
                      <td>€{transaction.Taxas.toFixed(2)}</td>
                      <td style={{ fontWeight: '600', color: '#059669' }}>
                        €{transaction.Valor_Liquido.toFixed(2)}
                      </td>
                      <td>{getStatusBadge(mapEstado(transaction.ID_Estado_Vendas))}</td>
                      <td>{mapMetodo(transaction.ID_Metodo_Pagamento)}</td>
                      <td>{transaction.Clientes}</td>
                      <td>{transaction.Fatura ? 'Emitida' : 'Não Emitida'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {selectedTab === 'payments' && (
        <>
          {/* Secção 4 - Emissão de Pagamentos */}
          <div className="section">
            <h2 className="section-title">Resumo de Receitas</h2>
            
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">€2.847,50</div>
                <div className="stat-label">Receita Total por Evento</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-value">€12.450,75</div>
                <div className="stat-label">Receita Total Acumulada</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-value">€622,54</div>
                <div className="stat-label">Taxas Cobradas</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-value">€1.825,96</div>
                <div className="stat-label">Disponível para Transferência</div>
              </div>
            </div>

            <div style={{ background: '#d1dae6', padding: '16px', borderRadius: '8px', marginBottom: '24px' }} className='payment-teste'>
              <div style={{ fontWeight: '500', marginBottom: '4px' }}>Próxima Data de Pagamento</div>
              <div style={{ color: '#3b82f6', fontSize: '18px', fontWeight: '600' }}>15 de Junho, 2025</div>
            </div>

            <h3 className="mb-4 text-gray-900 dark:text-gray-300">Histórico de Pagamentos</h3>
            <div>
              {paymentHistory.map((payment, index) => (
                <div key={index} className="history-item">
                  <div>
                    <div className="history-date">{payment.date}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                      {getStatusBadge(payment.status)}
                    </div>
                  </div>
                  <div className="history-amount">€{payment.amount.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="legal-notice">
            <h4>Notas Legais e Fiscais</h4>
            <p>
              As taxas aplicadas incluem processamento de pagamento (2,9% + €0,30) e IVA à taxa legal em vigor. 
              A faturação é emitida automaticamente no final de cada mês.
            </p>
            <p>
              <a href="#" className="legal-link">
                <ExternalLink size={14} style={{ marginRight: '4px' }} />
                Ver Termos e Condições de Pagamento
              </a>
            </p>
          </div>
        </>
      )}

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
          font-size: 16px;
          color: #64748b;
          margin: 0;
        }

        .tabs {
          display: flex;
          gap: 4px;
          margin-bottom: 32px;
          border-bottom: 1px solid #e2e8f0;
        }

        .tab {
          padding: 12px 24px;
          background: none;
          border: none;
          font-size: 14px;
          font-weight: 500;
          color: #64748b;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.2s;
        }

        .tab.active {
          color: #3b82f6;
          border-bottom-color: #3b82f6;
        }

        .tab:hover {
          color: #3b82f6;
        }

        .section {
          background: white;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 20px;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 24px 0;
        }

        .status-card {
          background: #f0f9ff;
          border: 1px solid #0ea5e9;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 24px;
        }

        .status-message {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
          color: #0c4a6e;
          margin-bottom: 8px;
        }

        .status-details {
          font-size: 14px;
          color: #0c4a6e;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 8px;
        }

        .form-input {
          width: 100%;
          padding: 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }

        .form-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .file-upload {
          position: relative;
        }

        .file-upload-input {
          position: absolute;
          opacity: 0;
          width: 100%;
          height: 100%;
          cursor: pointer;
        }

        .file-upload-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          border: 2px dashed #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s;
        }

        .file-upload:hover .file-upload-btn {
          border-color: #3b82f6;
          color: #3b82f6;
        }

        .payment-methods {
          display: grid;
          gap: 16px;
        }

        .payment-method {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .payment-method:hover {
          border-color: #3b82f6;
        }

        .payment-method.active {
          border-color: #3b82f6;
          background: #f0f9ff;
        }

        .payment-method-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: #f3f4f6;
          border-radius: 8px;
          color: #6b7280;
        }

        .payment-method.active .payment-method-icon {
          background: #3b82f6;
          color: white;
        }

        .table-container {
          overflow-x: auto;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .table {
          width: 100%;
          border-collapse: collapse;
        }

        .table th {
          background: #f9fafb;
          padding: 12px;
          text-align: left;
          font-weight: 600;
          color: #374151;
          border-bottom: 1px solid #e5e7eb;
        }

        .table td {
          padding: 12px;
          border-bottom: 1px solid #f3f4f6;
        }

        .table tr:hover {
          background: #f9fafb;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          border-radius: 4px;
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
          background: #fee2e2;
          color: #991b1b;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: #f8fafc;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
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

        .history-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 0;
          border-bottom: 1px solid #f1f5f9;
        }

        .history-item:last-child {
          border-bottom: none;
        }

        .history-date {
          font-weight: 500;
          color: #1e293b;
        }

        .history-amount {
          font-size: 16px;
          font-weight: 600;
          color: #059669;
        }

        .legal-notice {
          background: #fafafa;
          padding: 20px;
          border-radius: 8px;
          margin-top: 24px;
          border: 1px solid #e5e7eb;
        }

        .legal-notice h4 {
          margin: 0 0 12px 0;
          color: #374151;
          font-size: 16px;
        }

        .legal-notice p {
          margin: 8px 0;
          color: #6b7280;
          font-size: 14px;
          line-height: 1.5;
        }

        .legal-link {
          display: inline-flex;
          align-items: center;
          color: #3b82f6;
          text-decoration: none;
        }

        .legal-link:hover {
          text-decoration: underline;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .btn-secondary {
          background: #f3f4f6;
          color: #374151;
        }

        .btn-secondary:hover {
          background: #e5e7eb;
        }

        @media (max-width: 768px) {
          .payment-page {
            padding: 16px;
          }
          
          .stats-grid {
            grid-template-columns: 1fr;
          }
          
          .table-container {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default PaymentProcessingPage;