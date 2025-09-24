import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const usePOSStore = create(
  persist(
    (set, get) => ({
      // Products state
      products: [],
      categories: [
        { id: 'beverages', name: 'Beverages', color: 'bg-blue-500' },
        { id: 'food', name: 'Food', color: 'bg-green-500' },
        { id: 'accessories', name: 'Accessories', color: 'bg-purple-500' },
        { id: 'retail', name: 'Retail Items', color: 'bg-orange-500' }
      ],
      selectedProduct: null,
      productFilters: {
        search: '',
        category: 'all',
        status: 'all'
      },

      // Cart state
      cart: {
        items: [],
        total: 0,
        tax: 0,
        discount: 0,
        customerId: null,
        customerName: '',
        paymentMethod: 'cash'
      },

      // Transactions state
      transactions: [],
      selectedTransaction: null,
      transactionFilters: {
        search: '',
        dateRange: 'today',
        paymentMethod: 'all',
        status: 'all'
      },

      // Inventory state
      inventoryAlerts: [],
      lowStockThreshold: 10,

      // Payment methods
      paymentMethods: [
        { id: 'cash', name: 'Cash', fee: 0 },
        { id: 'card', name: 'Credit/Debit Card', fee: 0.03 },
        { id: 'digital', name: 'Digital Wallet', fee: 0.025 }
      ],

      // Product actions
      addProduct: (product) => set((state) => ({
        products: [...state.products, {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'active',
          stock: 0,
          ...product
        }]
      })),

      updateProduct: (id, updates) => set((state) => ({
        products: state.products.map(product =>
          String(product.id) === String(id) 
            ? { ...product, ...updates, updatedAt: new Date().toISOString() } 
            : product
        ),
        selectedProduct: state.selectedProduct?.id === id 
          ? { ...state.selectedProduct, ...updates } 
          : state.selectedProduct
      })),

      deleteProduct: (id) => set((state) => ({
        products: state.products.filter(product => product.id !== id),
        selectedProduct: state.selectedProduct?.id === id ? null : state.selectedProduct
      })),

      setSelectedProduct: (product) => set({ selectedProduct: product }),

      setProductFilters: (filters) => set((state) => ({
        productFilters: { ...state.productFilters, ...filters }
      })),

      // Cart actions
      addToCart: (product, quantity = 1) => set((state) => {
        const existingItemIndex = state.cart.items.findIndex(item => item.productId === product.id);
        let newItems;
        
        if (existingItemIndex >= 0) {
          newItems = state.cart.items.map((item, index) =>
            index === existingItemIndex
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          newItems = [...state.cart.items, {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity,
            subtotal: product.price * quantity
          }];
        }

        const total = newItems.reduce((sum, item) => sum + item.subtotal, 0);
        const tax = total * 0.08; // 8% tax rate

        return {
          cart: {
            ...state.cart,
            items: newItems,
            total: total + tax - state.cart.discount,
            tax
          }
        };
      }),

      removeFromCart: (itemId) => set((state) => {
        const newItems = state.cart.items.filter(item => item.id !== itemId);
        const total = newItems.reduce((sum, item) => sum + item.subtotal, 0);
        const tax = total * 0.08;

        return {
          cart: {
            ...state.cart,
            items: newItems,
            total: total + tax - state.cart.discount,
            tax
          }
        };
      }),

      updateCartItemQuantity: (itemId, quantity) => set((state) => {
        if (quantity <= 0) {
          return get().removeFromCart(itemId);
        }

        const newItems = state.cart.items.map(item =>
          item.id === itemId
            ? { ...item, quantity, subtotal: item.price * quantity }
            : item
        );

        const total = newItems.reduce((sum, item) => sum + item.subtotal, 0);
        const tax = total * 0.08;

        return {
          cart: {
            ...state.cart,
            items: newItems,
            total: total + tax - state.cart.discount,
            tax
          }
        };
      }),

      applyDiscount: (discount) => set((state) => {
        const subtotal = state.cart.items.reduce((sum, item) => sum + item.subtotal, 0);
        const total = subtotal + state.cart.tax - discount;

        return {
          cart: {
            ...state.cart,
            discount,
            total: Math.max(0, total)
          }
        };
      }),

      setCartCustomer: (customerId, customerName) => set((state) => ({
        cart: {
          ...state.cart,
          customerId,
          customerName
        }
      })),

      setPaymentMethod: (method) => set((state) => ({
        cart: {
          ...state.cart,
          paymentMethod: method
        }
      })),

      clearCart: () => set((state) => ({
        cart: {
          items: [],
          total: 0,
          tax: 0,
          discount: 0,
          customerId: null,
          customerName: '',
          paymentMethod: 'cash'
        }
      })),

      // Transaction actions
      processTransaction: () => {
        const state = get();
        if (state.cart.items.length === 0) return false;

        const transaction = {
          id: Date.now().toString(),
          items: [...state.cart.items],
          subtotal: state.cart.items.reduce((sum, item) => sum + item.subtotal, 0),
          tax: state.cart.tax,
          discount: state.cart.discount,
          total: state.cart.total,
          paymentMethod: state.cart.paymentMethod,
          customerId: state.cart.customerId,
          customerName: state.cart.customerName,
          status: 'completed',
          createdAt: new Date().toISOString(),
          receiptNumber: `RCP-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
        };

        // Update product stock
        const updatedProducts = state.products.map(product => {
          const cartItem = state.cart.items.find(item => item.productId === product.id);
          if (cartItem) {
            return {
              ...product,
              stock: Math.max(0, product.stock - cartItem.quantity),
              soldCount: (product.soldCount || 0) + cartItem.quantity
            };
          }
          return product;
        });

        set((state) => ({
          transactions: [transaction, ...state.transactions],
          products: updatedProducts,
          cart: {
            items: [],
            total: 0,
            tax: 0,
            discount: 0,
            customerId: null,
            customerName: '',
            paymentMethod: 'cash'
          }
        }));

        // Check for low stock alerts
        get().checkLowStockAlerts();
        
        return transaction;
      },

      refundTransaction: (transactionId) => set((state) => ({
        transactions: state.transactions.map(transaction =>
          transaction.id === transactionId
            ? { ...transaction, status: 'refunded', refundedAt: new Date().toISOString() }
            : transaction
        )
      })),

      setTransactionFilters: (filters) => set((state) => ({
        transactionFilters: { ...state.transactionFilters, ...filters }
      })),

      // Inventory actions
      updateStock: (productId, quantity, type = 'set') => set((state) => ({
        products: state.products.map(product =>
          product.id === productId
            ? {
                ...product,
                stock: type === 'add' 
                  ? product.stock + quantity 
                  : type === 'subtract' 
                    ? Math.max(0, product.stock - quantity)
                    : quantity,
                updatedAt: new Date().toISOString()
              }
            : product
        )
      })),

      checkLowStockAlerts: () => {
        const state = get();
        const lowStockProducts = state.products.filter(
          product => product.stock <= state.lowStockThreshold && product.status === 'active'
        );

        set({
          inventoryAlerts: lowStockProducts.map(product => ({
            id: `alert-${product.id}`,
            type: 'low-stock',
            productId: product.id,
            productName: product.name,
            currentStock: product.stock,
            threshold: state.lowStockThreshold,
            createdAt: new Date().toISOString()
          }))
        });
      },

      setLowStockThreshold: (threshold) => set({ lowStockThreshold: threshold }),

      // Computed getters
      getFilteredProducts: () => {
        const state = get();
        return state.products.filter(product => {
          if (state.productFilters.search && 
              !product.name.toLowerCase().includes(state.productFilters.search.toLowerCase()) &&
              !product.sku?.toLowerCase().includes(state.productFilters.search.toLowerCase())) {
            return false;
          }
          if (state.productFilters.category !== 'all' && 
              product.category !== state.productFilters.category) {
            return false;
          }
          if (state.productFilters.status !== 'all' && 
              product.status !== state.productFilters.status) {
            return false;
          }
          return true;
        });
      },

      getFilteredTransactions: () => {
        const state = get();
        return state.transactions.filter(transaction => {
          if (state.transactionFilters.search && 
              !transaction.id.toLowerCase().includes(state.transactionFilters.search.toLowerCase()) &&
              !transaction.customerName?.toLowerCase().includes(state.transactionFilters.search.toLowerCase()) &&
              !transaction.receiptNumber?.toLowerCase().includes(state.transactionFilters.search.toLowerCase())) {
            return false;
          }
          if (state.transactionFilters.paymentMethod !== 'all' && 
              transaction.paymentMethod !== state.transactionFilters.paymentMethod) {
            return false;
          }
          if (state.transactionFilters.status !== 'all' && 
              transaction.status !== state.transactionFilters.status) {
            return false;
          }
          // Add date range filtering logic here
          return true;
        });
      },

      getLowStockProducts: () => {
        const state = get();
        return state.products.filter(
          product => product.stock <= state.lowStockThreshold && product.status === 'active'
        );
      },

      getStatistics: () => {
        const state = get();
        const today = new Date().toDateString();
        const todayTransactions = state.transactions.filter(
          t => new Date(t.createdAt).toDateString() === today && t.status === 'completed'
        );

        return {
          totalProducts: state.products.length,
          activeProducts: state.products.filter(p => p.status === 'active').length,
          totalTransactions: state.transactions.length,
          todayTransactions: todayTransactions.length,
          todaySales: todayTransactions.reduce((sum, t) => sum + t.total, 0),
          totalRevenue: state.transactions
            .filter(t => t.status === 'completed')
            .reduce((sum, t) => sum + t.total, 0),
          averageTransactionValue: state.transactions.length > 0
            ? state.transactions
                .filter(t => t.status === 'completed')
                .reduce((sum, t) => sum + t.total, 0) / state.transactions.filter(t => t.status === 'completed').length
            : 0
        };
      },

      // Demo data initialization
      initializeDemoData: () => {
        const state = get();
        if (state.products.length === 0) {
          const demoProducts = [
            {
              id: '1',
              name: 'Premium Earl Grey Tea',
              sku: 'TEA-001',
              price: 24.99,
              cost: 12.50,
              category: 'beverages',
              description: 'Premium blend of Earl Grey tea with bergamot',
              stock: 45,
              status: 'active',
              image: null,
              barcode: '123456789001',
              soldCount: 15
            },
            {
              id: '2',
              name: 'Organic Green Tea',
              sku: 'TEA-002',
              price: 19.99,
              cost: 10.00,
              category: 'beverages',
              description: 'Organic green tea leaves from premium gardens',
              stock: 8,
              status: 'active',
              image: null,
              barcode: '123456789002',
              soldCount: 25
            },
            {
              id: '3',
              name: 'Tea Infuser Set',
              sku: 'ACC-001',
              price: 15.99,
              cost: 7.50,
              category: 'accessories',
              description: 'Stainless steel tea infuser with lid',
              stock: 22,
              status: 'active',
              image: null,
              barcode: '123456789003',
              soldCount: 8
            },
            {
              id: '4',
              name: 'Chamomile Tea',
              sku: 'TEA-003',
              price: 16.99,
              cost: 8.00,
              category: 'beverages',
              description: 'Soothing chamomile flowers for relaxation',
              stock: 3,
              status: 'active',
              image: null,
              barcode: '123456789004',
              soldCount: 12
            }
          ];

          set({ products: demoProducts });
          get().checkLowStockAlerts();
        }
      }
    }),
    {
      name: 'pos-storage',
      partialize: (state) => ({
        products: state.products,
        transactions: state.transactions,
        categories: state.categories,
        lowStockThreshold: state.lowStockThreshold,
        paymentMethods: state.paymentMethods
      })
    }
  )
);

export default usePOSStore;