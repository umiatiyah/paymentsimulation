<template>
  <div class="customer-portal">
    <h1>Internet Payment Portal</h1>
    
    <div v-if="customer">
      <div class="account-info">
        <h3>Account Information</h3>
        <p>Customer ID: {{ customer.id }}</p>
        <p>Name: {{ customer.name }}</p>
        <p>Package: {{ customer.package }} ({{ customer.speed }} Mbps)</p>
      </div>
      
      <div class="billing-info">
        <h3>Current Bill</h3>
        <p>Amount Due: ${{ customer.balance }}</p>
        <p>Due Date: {{ customer.dueDate }}</p>
        <p>Status: <span :class="customer.status">{{ customer.status }}</span></p>
        
        <button 
          v-if="customer.status !== 'paid'"
          @click="initiatePayment"
          class="pay-button"
        >
          Pay Now with Virtual Account
        </button>
      </div>
      
      <div v-if="showPaymentModal" class="payment-modal">
        <div class="modal-content">
          <h3>Virtual Account Payment</h3>
          <p>Virtual Account Number: {{ virtualAccountNumber }}</p>
          <p>Amount: ${{ customer.balance }}</p>
          
          <div class="payment-actions">
            <button @click="simulatePayment">Confirm Payment</button>
            <button @click="cancelPayment">Cancel</button>
          </div>
        </div>
      </div>
      
      <div v-if="paymentSuccess" class="success-message">
        <p>Payment successful! Your account has been updated.</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      customer: {
        id: 'CUST12345',
        name: 'John Doe',
        package: 'Premium Internet',
        speed: 100,
        balance: 49.99,
        dueDate: '2023-06-15',
        status: 'unpaid'
      },
      showPaymentModal: false,
      paymentSuccess: false,
      virtualAccountNumber: '8932081234567890'
    }
  },
  methods: {
    initiatePayment() {
      this.showPaymentModal = true;
    },
    cancelPayment() {
      this.showPaymentModal = false;
    },
    simulatePayment() {
      // In a real app, this would call your payment API
      setTimeout(() => {
        this.customer.status = 'paid';
        this.customer.balance = 0;
        this.showPaymentModal = false;
        this.paymentSuccess = true;
        
        // In a real app, you'd notify the admin dashboard via websockets
        this.$store.dispatch('updatePaymentStatus', {
          customerId: this.customer.id,
          status: 'paid'
        });
      }, 1500);
    }
  }
}
</script>

<style scoped>
.paid { color: green; }
.unpaid { color: red; }
.payment-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-content {
  background: white;
  padding: 20px;
  border-radius: 5px;
}
.pay-button {
  background: #42b983;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
}
</style>