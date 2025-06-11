  import React, { useState } from 'react';
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

  const PaymentProcessingPage = () => {
    const [iban, setIban] = useState('');
    const [ibanFile, setIbanFile] = useState(null);
    const [selectedTab, setSelectedTab] = useState('config');
    const [paymentMethods, setPaymentMethods] = useState({
      creditCard: false,
      mbway: false,
      referenceMB: false
    });

    // Mock data
    const paymentStatus = {
      configured: true,
      ibanValidation: 'Validado',
      lastChange: '2025-06-05 14:30',
      previousState: 'Pendente',
      currentState: 'Validado'
    };

    const transactions = [
      {
        id: 'TXN001',
        date: '2025-06-05',
        total: 150.00,
        fees: 7.50,
        net: 142.50,
        status: 'Pago',
        method: 'Cartão de Crédito',
        buyer: 'João Silva'
      },
      {
        id: 'TXN002', 
        date: '2025-06-04',
        total: 75.00,
        fees: 3.75,
        net: 71.25,
        status: 'Pendente',
        method: 'MBWay',
        buyer: 'Maria Santos'
      },
      {
        id: 'TXN003',
        date: '2025-06-03',
        total: 200.00,
        fees: 10.00,
        net: 190.00,
        status: 'Falhado',
        method: 'Referência MB',
        buyer: 'Pedro Costa'
      }
    ];

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

    const handleFileUpload = (event) => {
      const file = event.target.files[0];
      setIbanFile(file);
    };

    const exportTransactions = () => {
      alert('Exportação de transações iniciada');
    };

    const handlePaymentMethodChange = (method) => {
      setPaymentMethods(prev => ({
        ...prev,
        [method]: !prev[method]
      }));
    };

    const getStatusBadge = (status) => {
      const statusConfig = {
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
      <div className="payment-page ">
        

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
                  <input
                    type="checkbox"
                    className="payment-method-checkbox"
                    checked={paymentMethods.creditCard}
                    onChange={() => handlePaymentMethodChange('creditCard')}
                  />
                  <div className="payment-method-icon">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: '500' }}>Cartão de Crédito</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Visa, Mastercard</div>
                  </div>
                </div>

                <div 
                  className={`payment-method ${paymentMethods.mbway ? 'active' : ''}`}
                  onClick={() => handlePaymentMethodChange('mbway')}
                >
                  <input
                    type="checkbox"
                    className="payment-method-checkbox"
                    checked={paymentMethods.mbway}
                    onChange={() => handlePaymentMethodChange('mbway')}
                  />
                  <div className="payment-method-icon">
                    <Smartphone size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: '500' }}>MBWay</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Pagamento móvel</div>
                  </div>
                </div>

                <div 
                  className={`payment-method ${paymentMethods.referenceMB ? 'active' : ''}`}
                  onClick={() => handlePaymentMethodChange('referenceMB')}
                >
                  <input
                    type="checkbox"
                    className="payment-method-checkbox"
                    checked={paymentMethods.referenceMB}
                    onChange={() => handlePaymentMethodChange('referenceMB')}
                  />
                  <div className="payment-method-icon">
                    <Receipt size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: '500' }}>Referência MB</div>
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
              <table className="table">
                <thead>
                  <tr>
                    <th>ID Transação</th>
                    <th>Data</th>
                    <th>Valor Total</th>
                    <th>Taxas</th>
                    <th>Valor Líquido</th>
                    <th>Estado</th>
                    <th>Método</th>
                    <th>Comprador</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: '500' }}>
                        {transaction.id}
                      </td>
                      <td>{transaction.date}</td>
                      <td style={{ fontWeight: '500' }}>€{transaction.total.toFixed(2)}</td>
                      <td>€{transaction.fees.toFixed(2)}</td>
                      <td style={{ fontWeight: '600', color: '#059669' }}>
                        €{transaction.net.toFixed(2)}
                      </td>
                      <td>{getStatusBadge(transaction.status)}</td>
                      <td>{transaction.method}</td>
                      <td>{transaction.buyer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

              <div style={{ background: '#d1dae6', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}className='payment-teste'>
                <div style={{ fontWeight: '500', marginBottom: '4px' }}>Próxima Data de Pagamento</div>
                <div style={{ color: '#3b82f6', fontSize: '18px', fontWeight: '600' }}>15 de Junho, 2025</div>
              </div>

              <h3 style={{ marginBottom: '16px', color: '#1e293b' }}>Histórico de Pagamentos</h3>
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
      </div>
    );
  };

  export default PaymentProcessingPage;