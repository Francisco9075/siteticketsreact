// PaymentProcessor.tsx
import React, { useState, FormEvent } from 'react';
import axios from 'axios';

interface CustomerData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface BillingData {
  name?: string;
  taxId?: string;
  address?: string;
}

interface TicketData {
  type: 'Alfama' | 'Miradouro' | 'DUO';
  quantity: number;
  price: number;
}

interface PaymentResult {
  success: boolean;
  transactionId: string;
  authorizationCode: string;
}

interface OrderData {
  orderId: string;
  customer: CustomerData;
  billing: BillingData | null;
  ticket: TicketData;
  payment: {
    method: 'mbway' | 'card';
    amount: number;
  } & PaymentResult;
  date: string;
}

const PaymentProcessor: React.FC = () => {
  const [formData, setFormData] = useState({
    ticket: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    paymentMethod: 'mbway',
    mbwayPhone: '',
    billingName: '',
    billingTaxId: '',
    billingAddress: '',
    includeBilling: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderData | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const getTicketType = (price: number): 'Alfama' | 'Miradouro' | 'DUO' => {
    switch(price) {
      case 10: return 'Alfama';
      case 12: return 'Miradouro';
      case 15: return 'DUO';
      default: throw new Error('Invalid ticket price');
    }
  };

  const processMbwayPayment = async (phone: string, amount: number): Promise<PaymentResult> => {
    // In a real app, this would call your backend API
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          success: true,
          transactionId: `MBW-${Date.now()}`,
          authorizationCode: Math.random().toString(36).substring(2, 10).toUpperCase()
        });
      }, 1500);
    });
  };

  const processPayment = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate form
      if (!formData.ticket || !formData.firstName || !formData.lastName || 
          !formData.email || !formData.phone) {
        throw new Error('Please fill in all required fields');
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      if (formData.paymentMethod === 'mbway' && !formData.mbwayPhone) {
        throw new Error('MB Way phone number is required');
      }

      const amount = parseInt(formData.ticket);
      const paymentResult = await processMbwayPayment(formData.mbwayPhone, amount);

      if (!paymentResult.success) {
        throw new Error('Payment processing failed');
      }

      // Create order
      const newOrder: OrderData = {
        orderId: `SOLLEC-${Date.now()}`,
        customer: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone
        },
        billing: formData.includeBilling ? {
          name: formData.billingName,
          taxId: formData.billingTaxId,
          address: formData.billingAddress
        } : null,
        ticket: {
          type: getTicketType(amount),
          quantity: amount === 15 ? 2 : 1,
          price: amount
        },
        payment: {
          method: formData.paymentMethod as 'mbway' | 'card',
          ...paymentResult,
          amount
        },
        date: new Date().toISOString()
      };

      // In a real app, you would send this to your backend
      console.log('Order created:', newOrder);
      setOrder(newOrder);

      // Send confirmation email (mock)
      sendConfirmationEmail(newOrder);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const sendConfirmationEmail = (order: OrderData) => {
    // In a real app, implement email sending logic
    console.log(`Sending confirmation to ${order.customer.email}`);
  };

  if (order) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-green-600">Payment Successful!</h2>
        <div className="space-y-4">
          <p>Thank you for your purchase, {order.customer.firstName}!</p>
          <p>Your order ID: <strong>{order.orderId}</strong></p>
          <p>Ticket: {order.ticket.type} (x{order.ticket.quantity})</p>
          <p>Total: €{order.ticket.price.toFixed(2)}</p>
          <p>A confirmation has been sent to {order.customer.email}</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={processPayment} className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Complete Your Purchase</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Ticket Selection */}
        <div>
          <label className="block mb-2 font-medium">Select Ticket</label>
          <div className="space-y-2">
            {[
              { value: '10', label: 'Alfama - €10', description: 'Com Welcomedrink • Bilhete base • Limitado • 1px' },
              { value: '12', label: 'Miradouro - €12', description: 'Sem Welcomedrink • Bilhete com prioridade • 1px' },
              { value: '15', label: 'DUO - €15', description: 'Sem 2 welcomedrinks • Bilhete com prioridade • 2px' }
            ].map(ticket => (
              <label key={ticket.value} className="flex items-start p-3 border rounded hover:border-black">
                <input
                  type="radio"
                  name="ticket"
                  value={ticket.value}
                  checked={formData.ticket === ticket.value}
                  onChange={handleInputChange}
                  className="mt-1"
                  required
                />
                <div className="ml-3">
                  <div className="font-medium">{ticket.label}</div>
                  <div className="text-sm text-gray-600">{ticket.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="font-medium">Personal Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block mb-1 text-sm">First Name*</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block mb-1 text-sm">Last Name*</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="email" className="block mb-1 text-sm">Email*</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label htmlFor="phone" className="block mb-1 text-sm">Phone*</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
        </div>

        {/* Payment Method */}
        <div className="space-y-4">
          <h3 className="font-medium">Payment Method</h3>
          <div className="space-y-2">
            <label className="flex items-center p-3 border rounded hover:border-black">
              <input
                type="radio"
                name="paymentMethod"
                value="mbway"
                checked={formData.paymentMethod === 'mbway'}
                onChange={handleInputChange}
                className="mr-3"
              />
              <div className="flex items-center">
                <img 
                  src="/public/images/logo/mbway_logo.svg" 
                  alt="MB Way" 
                  className="h-6 mr-2"
                />
                <span>MB Way</span>
              </div>
            </label>
            {formData.paymentMethod === 'mbway' && (
              <div className="ml-8">
                <label htmlFor="mbwayPhone" className="block mb-1 text-sm">MB Way Phone*</label>
                <input
                  type="tel"
                  id="mbwayPhone"
                  name="mbwayPhone"
                  value={formData.mbwayPhone}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required={formData.paymentMethod === 'mbway'}
                />
              </div>
            )}
            <label className="flex items-center p-3 border rounded hover:border-black">
              <input
                type="radio"
                name="paymentMethod"
                value="card"
                checked={formData.paymentMethod === 'card'}
                onChange={handleInputChange}
                className="mr-3"
              />
              <span>Credit/Debit Card</span>
            </label>
          </div>
        </div>

        {/* Billing Information */}
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="includeBilling"
              checked={formData.includeBilling}
              onChange={handleInputChange}
              className="mr-2"
            />
            <span>Add billing information</span>
          </label>
          {formData.includeBilling && (
            <div className="ml-6 space-y-4">
              <div>
                <label htmlFor="billingName" className="block mb-1 text-sm">Billing Name</label>
                <input
                  type="text"
                  id="billingName"
                  name="billingName"
                  value={formData.billingName}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label htmlFor="billingTaxId" className="block mb-1 text-sm">Tax ID (NIF)</label>
                <input
                  type="text"
                  id="billingTaxId"
                  name="billingTaxId"
                  value={formData.billingTaxId}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label htmlFor="billingAddress" className="block mb-1 text-sm">Billing Address</label>
                <input
                  type="text"
                  id="billingAddress"
                  name="billingAddress"
                  value={formData.billingAddress}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-4 bg-black text-white rounded hover:bg-gray-800 transition ${loading ? 'opacity-70' : ''}`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : 'Complete Purchase'}
        </button>
      </div>
    </form>
  );
};

export default PaymentProcessor;