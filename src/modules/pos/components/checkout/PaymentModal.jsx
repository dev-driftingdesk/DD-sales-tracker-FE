import React, { useState } from 'react';
import { X, CreditCard, DollarSign, Smartphone, Receipt, CheckCircle } from 'lucide-react';
import usePOSStore from '../../stores/posStore';

export default function PaymentModal({ onClose }) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cash');
  const [amountReceived, setAmountReceived] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionComplete, setTransactionComplete] = useState(false);
  const [completedTransaction, setCompletedTransaction] = useState(null);

  const { 
    cart, 
    paymentMethods, 
    processTransaction, 
    setPaymentMethod 
  } = usePOSStore();

  const selectedMethod = paymentMethods.find(m => m.id === selectedPaymentMethod);
  const processingFee = cart.total * (selectedMethod?.fee || 0);
  const finalTotal = cart.total + processingFee;
  const changeAmount = selectedPaymentMethod === 'cash' && amountReceived
    ? Math.max(0, parseFloat(amountReceived) - finalTotal)
    : 0;

  const getPaymentIcon = (methodId) => {
    switch (methodId) {
      case 'cash': return DollarSign;
      case 'card': return CreditCard;
      case 'digital': return Smartphone;
      default: return CreditCard;
    }
  };

  const handlePaymentMethodChange = (methodId) => {
    setSelectedPaymentMethod(methodId);
    setPaymentMethod(methodId);
    setAmountReceived('');
  };

  const handleProcessPayment = async () => {
    // Validate cash payment
    if (selectedPaymentMethod === 'cash') {
      const received = parseFloat(amountReceived);
      if (!received || received < finalTotal) {
        alert('Please enter a valid amount that covers the total.');
        return;
      }
    }

    setIsProcessing(true);

    // Simulate payment processing delay
    setTimeout(() => {
      const transaction = processTransaction();
      if (transaction) {
        setCompletedTransaction(transaction);
        setTransactionComplete(true);
      }
      setIsProcessing(false);
    }, 2000);
  };

  const handlePrintReceipt = () => {
    // In a real implementation, this would trigger a print job
    alert('Receipt sent to printer!');
  };

  const handleEmailReceipt = () => {
    // In a real implementation, this would send an email
    alert('Receipt emailed to customer!');
  };

  const handleNewTransaction = () => {
    setTransactionComplete(false);
    setCompletedTransaction(null);
    onClose();
  };

  if (transactionComplete && completedTransaction) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full">
          {/* Success Header */}
          <div className="p-6 text-center border-b border-gray-200">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600">Transaction completed successfully</p>
          </div>

          {/* Transaction Details */}
          <div className="p-6">
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600">Receipt Number</p>
                <p className="text-lg font-mono font-semibold text-gray-900">
                  {completedTransaction.receiptNumber}
                </p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="text-gray-900">${completedTransaction.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax:</span>
                  <span className="text-gray-900">${completedTransaction.tax.toFixed(2)}</span>
                </div>
                {completedTransaction.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount:</span>
                    <span className="text-green-600">-${completedTransaction.discount.toFixed(2)}</span>
                  </div>
                )}
                {processingFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Processing Fee:</span>
                    <span className="text-gray-900">${processingFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-gray-300 font-semibold">
                  <span>Total Paid:</span>
                  <span className="text-green-600">${finalTotal.toFixed(2)}</span>
                </div>
                
                {selectedPaymentMethod === 'cash' && changeAmount > 0 && (
                  <div className="flex justify-between text-lg font-semibold text-blue-600 pt-2 border-t border-gray-300">
                    <span>Change:</span>
                    <span>${changeAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-300">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="text-gray-900 capitalize">{selectedMethod?.name}</span>
                </div>
                {completedTransaction.customerName && (
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600">Customer:</span>
                    <span className="text-gray-900">{completedTransaction.customerName}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">Date:</span>
                  <span className="text-gray-900">
                    {new Date(completedTransaction.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handlePrintReceipt}
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Receipt className="w-5 h-5" />
                Print Receipt
              </button>
              
              {completedTransaction.customerName && completedTransaction.customerName !== 'Walk-in Customer' && (
                <button
                  onClick={handleEmailReceipt}
                  className="w-full px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  Email Receipt
                </button>
              )}

              <button
                onClick={handleNewTransaction}
                className="w-full px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
              >
                New Transaction
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Payment</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isProcessing}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="text-gray-900">${(cart.total - cart.tax + cart.discount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax:</span>
                <span className="text-gray-900">${cart.tax.toFixed(2)}</span>
              </div>
              {cart.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount:</span>
                  <span className="text-green-600">-${cart.discount.toFixed(2)}</span>
                </div>
              )}
              {processingFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Processing Fee ({(selectedMethod.fee * 100).toFixed(1)}%):</span>
                  <span className="text-gray-900">${processingFee.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-gray-300 font-semibold">
                <span>Total:</span>
                <span className="text-teal-600">${finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-3">Payment Method</h3>
            <div className="space-y-2">
              {paymentMethods.map(method => {
                const Icon = getPaymentIcon(method.id);
                return (
                  <button
                    key={method.id}
                    onClick={() => handlePaymentMethodChange(method.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-colors ${
                      selectedPaymentMethod === method.id
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    disabled={isProcessing}
                  >
                    <Icon className="w-5 h-5 text-gray-600" />
                    <div className="flex-1 text-left">
                      <p className="font-medium text-gray-900">{method.name}</p>
                      {method.fee > 0 && (
                        <p className="text-sm text-gray-600">
                          +{(method.fee * 100).toFixed(1)}% processing fee
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cash Payment Input */}
          {selectedPaymentMethod === 'cash' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount Received
              </label>
              <input
                type="number"
                step="0.01"
                min={finalTotal}
                value={amountReceived}
                onChange={(e) => setAmountReceived(e.target.value)}
                placeholder={`$${finalTotal.toFixed(2)} or more`}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                disabled={isProcessing}
              />
              {changeAmount > 0 && (
                <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                  <div className="flex justify-between text-lg font-semibold text-blue-700">
                    <span>Change:</span>
                    <span>${changeAmount.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Process Payment Button */}
          <button
            onClick={handleProcessPayment}
            disabled={isProcessing || (selectedPaymentMethod === 'cash' && (!amountReceived || parseFloat(amountReceived) < finalTotal))}
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing Payment...
              </div>
            ) : (
              `Process Payment - $${finalTotal.toFixed(2)}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}