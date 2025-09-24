import React from 'react';
import { X, Edit, Package, DollarSign, BarChart, Tag, Hash, Calendar } from 'lucide-react';
import usePOSStore from '../../stores/posStore';

export default function ProductDetail({ product, onClose, onEdit }) {
  const { categories, addToCart } = usePOSStore();
  
  const category = categories.find(c => c.id === product.category);
  const profitMargin = product.price && product.cost 
    ? (((product.price - product.cost) / product.price) * 100).toFixed(1)
    : 0;
  
  const stockStatus = product.stock === 0 
    ? { text: 'Out of Stock', color: 'text-red-600 bg-red-50' }
    : product.stock <= 10 
      ? { text: 'Low Stock', color: 'text-orange-600 bg-orange-50' }
      : { text: 'In Stock', color: 'text-green-600 bg-green-50' };

  const handleAddToCart = () => {
    addToCart(product, 1);
    // Optional: Show success message
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Product Details</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Product Image and Basic Info */}
            <div>
              {/* Product Image */}
              <div className="mb-6">
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  {product.image ? (
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <Package className="w-20 h-20 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h3>
                  <div className="flex items-center gap-3 mb-4">
                    {category && (
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium text-white ${category.color}`}>
                        {category.name}
                      </span>
                    )}
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${stockStatus.color}`}>
                      {stockStatus.text}
                    </span>
                  </div>
                </div>

                {/* Description */}
                {product.description && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-600">{product.description}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={onEdit}
                    className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors"
                  >
                    Edit Product
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Detailed Information */}
            <div className="space-y-6">
              {/* Pricing Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Pricing Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Sale Price</span>
                    <p className="text-lg font-semibold text-gray-900">${product.price?.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Cost Price</span>
                    <p className="text-lg font-semibold text-gray-900">${product.cost?.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Profit per Unit</span>
                    <p className="text-lg font-semibold text-green-600">
                      ${((product.price || 0) - (product.cost || 0)).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Profit Margin</span>
                    <p className="text-lg font-semibold text-blue-600">{profitMargin}%</p>
                  </div>
                </div>
              </div>

              {/* Inventory Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <BarChart className="w-5 h-5 mr-2" />
                  Inventory Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Current Stock</span>
                    <p className="text-lg font-semibold text-gray-900">{product.stock} units</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Total Sold</span>
                    <p className="text-lg font-semibold text-gray-900">{product.soldCount || 0} units</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Revenue Generated</span>
                    <p className="text-lg font-semibold text-green-600">
                      ${((product.soldCount || 0) * (product.price || 0)).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Status</span>
                    <p className="text-lg font-semibold text-gray-900 capitalize">{product.status}</p>
                  </div>
                </div>
              </div>

              {/* Product Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Tag className="w-5 h-5 mr-2" />
                  Product Details
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">SKU:</span>
                    <span className="text-sm font-medium text-gray-900">{product.sku}</span>
                  </div>
                  {product.barcode && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Barcode:</span>
                      <span className="text-sm font-medium text-gray-900">{product.barcode}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Category:</span>
                    <span className="text-sm font-medium text-gray-900">{category?.name || 'Unknown'}</span>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Timestamps
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Created:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Last Updated:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {product.updatedAt ? new Date(product.updatedAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              {(product.soldCount || 0) > 0 && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Performance Metrics</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Average Daily Sales:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {((product.soldCount || 0) / 30).toFixed(1)} units/day
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Inventory Turnover:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {product.stock > 0 ? ((product.soldCount || 0) / product.stock).toFixed(1) : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}