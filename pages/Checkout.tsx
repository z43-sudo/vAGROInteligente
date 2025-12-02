import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';

const paymentMethods = [
  { id: 'pix', name: 'Pix', icon: 'https://logodownload.org/wp-content/uploads/2020/10/pix-icone-256.png' },
  { id: 'stripe', name: 'Cartão de Crédito (Stripe)', icon: 'https://seeklogo.com/images/S/stripe-logo-7B3B7D0B4B-seeklogo.com.png' },
  { id: 'mp', name: 'Mercado Pago', icon: 'https://logodownload.org/wp-content/uploads/2019/09/mercado-pago-logo-1.png' },
];

export default function Checkout() {
  const { cart, products } = useApp();
  const [selectedMethod, setSelectedMethod] = useState('pix');
  const [step, setStep] = useState(1);
  const [shipping, setShipping] = useState({
    nome: '',
    email: '',
    telefone: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    complemento: ''
  });

  const cartItems = cart || [];
  const total = cartItems.reduce((sum, item) => {
    const prod = products.find(p => p.id === item.productId);
    return sum + (prod ? prod.price * item.quantity : 0);
  }, 0);

  return (
    <div className="max-w-3xl mx-auto p-0 md:p-8 bg-white rounded-2xl shadow-lg mt-8">
      {/* Banner */}
      <div className="relative w-full h-40 md:h-56 rounded-t-2xl overflow-hidden mb-8">
        <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80" alt="Banner Checkout" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/70 via-green-700/40 to-transparent flex flex-col justify-center px-8">
          <h1 className="text-2xl md:text-4xl font-extrabold text-white drop-shadow mb-2">Finalizar Compra</h1>
          <p className="text-lg md:text-xl text-white/80 font-medium drop-shadow">Complete seu pedido e escolha o método de pagamento</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Produtos no Carrinho */}
        <div>
          <h3 className="font-semibold text-lg mb-2 text-green-800">Produtos no Carrinho</h3>
          {cartItems.length === 0 ? (
            <p className="text-gray-500">Seu carrinho está vazio.</p>
          ) : (
            <ul className="divide-y">
              {cartItems.map((item, idx) => {
                const prod = products.find(p => p.id === item.productId);
                if (!prod) return null;
                return (
                  <li key={idx} className="py-2 flex items-center gap-4">
                    <img src={prod.image} alt={prod.name} className="w-12 h-12 rounded-lg object-cover" />
                    <div className="flex-1">
                      <span className="font-bold text-green-900">{prod.name}</span>
                      <span className="block text-xs text-gray-500">{prod.description}</span>
                    </div>
                    <span className="font-bold text-green-700">x{item.quantity}</span>
                    <span className="font-bold text-green-700">R$ {(prod.price * item.quantity).toFixed(2)}</span>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="mt-6">
            <h3 className="font-semibold text-lg mb-2 text-green-800">Resumo</h3>
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-green-900">Total:</span>
              <span className="text-xl font-bold text-green-700">R$ {total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Área de Envio */}
        <div>
          <h3 className="font-semibold text-lg mb-2 text-green-800">Dados para Envio</h3>
          <form className="space-y-3">
            <input type="text" placeholder="Nome completo" className="w-full p-2 border rounded" value={shipping.nome} onChange={e => setShipping(s => ({ ...s, nome: e.target.value }))} />
            <input type="email" placeholder="E-mail" className="w-full p-2 border rounded" value={shipping.email} onChange={e => setShipping(s => ({ ...s, email: e.target.value }))} />
            <input type="tel" placeholder="Telefone" className="w-full p-2 border rounded" value={shipping.telefone} onChange={e => setShipping(s => ({ ...s, telefone: e.target.value }))} />
            <input type="text" placeholder="Endereço" className="w-full p-2 border rounded" value={shipping.endereco} onChange={e => setShipping(s => ({ ...s, endereco: e.target.value }))} />
            <input type="text" placeholder="Cidade" className="w-full p-2 border rounded" value={shipping.cidade} onChange={e => setShipping(s => ({ ...s, cidade: e.target.value }))} />
            <input type="text" placeholder="Estado" className="w-full p-2 border rounded" value={shipping.estado} onChange={e => setShipping(s => ({ ...s, estado: e.target.value }))} />
            <input type="text" placeholder="CEP" className="w-full p-2 border rounded" value={shipping.cep} onChange={e => setShipping(s => ({ ...s, cep: e.target.value }))} />
            <input type="text" placeholder="Complemento" className="w-full p-2 border rounded" value={shipping.complemento} onChange={e => setShipping(s => ({ ...s, complemento: e.target.value }))} />
          </form>
        </div>
      </div>

      {/* Métodos de Pagamento */}
      <div className="mt-10">
        <h3 className="font-semibold text-lg mb-2 text-green-800">Método de Pagamento</h3>
        <div className="flex gap-6 justify-center md:justify-start">
          {paymentMethods.map(method => (
            <button
              key={method.id}
              className={`flex flex-col items-center p-4 rounded-xl border-2 transition-colors ${selectedMethod === method.id ? 'border-green-700 bg-green-50' : 'border-gray-200 bg-white'}`}
              onClick={() => setSelectedMethod(method.id)}
            >
              <img src={method.icon} alt={method.name} className="w-12 h-12 mb-2" />
              <span className="font-bold text-green-900">{method.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Pagamento */}
      <div className="mt-10">
        <button
          className="w-full py-3 bg-green-700 text-white font-bold rounded-xl hover:bg-green-800 transition-colors text-lg"
          onClick={() => setStep(2)}
          disabled={cartItems.length === 0}
        >
          Pagar com {paymentMethods.find(m => m.id === selectedMethod)?.name}
        </button>
        {step === 2 && (
          <div className="mt-8">
            <h3 className="text-xl font-bold text-green-800 mb-2">Pagamento</h3>
            {selectedMethod === 'pix' && (
              <div className="bg-green-50 p-4 rounded-xl text-center">
                <p className="mb-2">Escaneie o QR Code abaixo para pagar com Pix:</p>
                <img src="https://logodownload.org/wp-content/uploads/2020/10/pix-icone-256.png" alt="Logo Pix" className="mx-auto mb-2 w-16 h-16" />
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=pagamento-pix-demo" alt="QR Pix" className="mx-auto" />
                <p className="mt-2 text-xs text-gray-500">(QR Code fictício para demonstração)</p>
              </div>
            )}
            {selectedMethod === 'stripe' && (
              <div className="bg-blue-50 p-4 rounded-xl text-center">
                <img src="https://seeklogo.com/images/S/stripe-logo-7B3B7D0B4B-seeklogo.com.png" alt="Logo Stripe" className="mx-auto mb-2 w-16 h-16" />
                <p className="mb-2">Pagamento via cartão de crédito (Stripe):</p>
                <input type="text" placeholder="Número do Cartão" className="w-full mb-2 p-2 border rounded" />
                <input type="text" placeholder="Validade" className="w-full mb-2 p-2 border rounded" />
                <input type="text" placeholder="CVV" className="w-full mb-2 p-2 border rounded" />
                <button className="w-full py-2 bg-green-700 text-white rounded">Pagar</button>
                <p className="mt-2 text-xs text-gray-500">(Integração Stripe fictícia para demonstração)</p>
              </div>
            )}
            {selectedMethod === 'mp' && (
              <div className="bg-yellow-50 p-4 rounded-xl text-center">
                <img src="https://logodownload.org/wp-content/uploads/2019/09/mercado-pago-logo-1.png" alt="Logo Mercado Pago" className="mx-auto mb-2 w-16 h-16" />
                <p className="mb-2">Pagamento via Mercado Pago:</p>
                <button className="w-full py-2 bg-blue-700 text-white rounded">Ir para Mercado Pago</button>
                <p className="mt-2 text-xs text-gray-500">(Integração Mercado Pago fictícia para demonstração)</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
