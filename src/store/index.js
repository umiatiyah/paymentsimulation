import { createStore } from 'vuex'

export default createStore({
  state: {
    customers: [
      { id: 'CUST12345', name: 'John Doe', package: 'Premium', balance: 0, status: 'paid', lastPayment: '2023-06-10' },
      { id: 'CUST12346', name: 'Jane Smith', package: 'Basic', balance: 29.99, status: 'unpaid', lastPayment: '2023-05-15' },
      { id: 'CUST12347', name: 'Bob Johnson', package: 'Standard', balance: 39.99, status: 'unpaid', lastPayment: '2023-05-20' },
      { id: 'CUST12348', name: 'Alice Brown', package: 'Premium', balance: 0, status: 'paid', lastPayment: '2023-06-05' }
    ],
    recentPayment: null
  },
  mutations: {
    UPDATE_CUSTOMER_STATUS(state, payload) {
      const customer = state.customers.find(c => c.id === payload.customerId)
      if (customer) {
        customer.status = payload.status
        customer.balance = 0
        customer.lastPayment = new Date().toISOString().split('T')[0]
      }
    },
    SET_RECENT_PAYMENT(state, payment) {
      state.recentPayment = payment
    },
    CLEAR_RECENT_PAYMENT(state) {
      state.recentPayment = null
    }
  },
  actions: {
    updatePaymentStatus({ commit, state }, payload) {
      commit('UPDATE_CUSTOMER_STATUS', payload)
      
      const customer = state.customers.find(c => c.id === payload.customerId)
      commit('SET_RECENT_PAYMENT', {
        customerName: customer.name,
        amount: '$' + payload.amount || customer.balance
      })
      
      setTimeout(() => {
        commit('CLEAR_RECENT_PAYMENT')
      }, 5000)
    },
    checkForUpdates({ state, commit }) {
      if (Math.random() > 0.8) {
        const unpaidCustomers = state.customers.filter(c => c.status === 'unpaid')
        if (unpaidCustomers.length > 0) {
          const randomCustomer = unpaidCustomers[Math.floor(Math.random() * unpaidCustomers.length)]
          commit('UPDATE_CUSTOMER_STATUS', {
            customerId: randomCustomer.id,
            status: 'paid'
          })
          
          commit('SET_RECENT_PAYMENT', {
            customerName: randomCustomer.name,
            amount: '$' + randomCustomer.balance
          })
          
          setTimeout(() => {
            commit('CLEAR_RECENT_PAYMENT')
          }, 5000)
        }
      }
    }
  },
  getters: {
    paidCount: (state) => state.customers.filter(c => c.status === 'paid').length,
    unpaidCount: (state) => state.customers.filter(c => c.status === 'unpaid').length
  }
})