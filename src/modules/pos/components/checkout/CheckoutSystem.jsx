import React, { useState } from 'react';
import { Search, Plus, Minus, Trash2, User, CreditCard, Receipt, ShoppingCart } from 'lucide-react';
import usePOSStore from '../../stores/posStore';
import useCRMStore from '../../../crm-core/stores/crmStore';
import CustomerSelector from './CustomerSelector';
import PaymentModal from './PaymentModal';

export default function CheckoutSystem() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCustomerSelector, setShowCustomerSelector] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const { 
    products, 
    cart, 
    addToCart, 
    removeFromCart, 
    updateCartItemQuantity, 
    clearCart,
    setCartCustomer,
    applyDiscount
  } = usePOSStore();

  const { getFilteredContacts } = useCRMStore();

  const filteredProducts = products.filter(product =>
    product.status === 'active' &&
    product.stock > 0 &&
    (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     product.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      updateCartItemQuantity(itemId, newQuantity);
    }
  };

  const handleCustomerSelect = (customer) => {
    setCartCustomer(customer.id, customer.name);
    setShowCustomerSelector(false);
  };

  const handleRemoveCustomer = () => {
    setCartCustomer(null, '');
  };

  const handleCheckout = () => {
    if (cart.items.length === 0) {
      alert('Cart is empty. Please add items before checkout.');
      return;
    }
    setShowPaymentModal(true);
  };

  const subtotal = cart.items.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side - Product Selection */}
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Products</h2>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products by name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                onClick={() => addToCart(product, 1)}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md cursor-pointer transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-900 text-sm">{product.name}</h3>
                  <span className="text-lg font-bold text-teal-600">${product.price.toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-600 mb-2">SKU: {product.sku}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Stock: {product.stock}</span>
                  <button className="p-1 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition-colors">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && searchTerm && (
            <div className="text-center py-8">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No products found matching "{searchTerm}"</p>
            </div>
          )}
        </div>

        {/* Right Side - Cart and Checkout */}
        <div>
          <div className="bg-white border border-gray-200 rounded-lg">
            {/* Cart Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Cart</h2>
                {cart.items.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Cart Items */}
            <div className="max-h-80 overflow-y-auto">
              {cart.items.length === 0 ? (
                <div className="p-8 text-center">
                  <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Your cart is empty</p>
                  <p className="text-gray-400 text-sm">Add products to get started</p>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {cart.items.map(item => (
                    <div key={item.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">{item.name}</h4>
                        <p className="text-gray-600 text-xs">${item.price.toFixed(2)} each</p>
                      </div>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="p-1 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="p-1 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded-full transition-colors ml-2"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      
                      <div className="ml-4 text-right">
                        <p className="font-semibold text-gray-900">${item.subtotal.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Customer Selection */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-700">Customer:</span>
                {cart.customerName ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-900">{cart.customerName}</span>
                    <button
                      onClick={handleRemoveCustomer}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowCustomerSelector(true)}
                    className="text-teal-600 hover:text-teal-700 text-sm flex items-center gap-1"
                  >
                    <User className="w-4 h-4" />
                    Select Customer
                  </button>
                )}
              </div>
            </div>

            {/* Cart Summary */}
            {cart.items.length > 0 && (
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="text-gray-900">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (8%):</span>
                    <span className="text-gray-900">${cart.tax.toFixed(2)}</span>
                  </div>
                  {cart.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Discount:</span>
                      <span className="text-green-600">-${cart.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-300">
                    <span>Total:</span>
                    <span className="text-teal-600">${cart.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <CreditCard className="w-5 h-5" />
                  Proceed to Payment
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Customer Selection Modal */}
      {showCustomerSelector && (
        <CustomerSelector
          onClose={() => setShowCustomerSelector(false)}
          onSelect={handleCustomerSelect}
        />
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </div>
  );
}