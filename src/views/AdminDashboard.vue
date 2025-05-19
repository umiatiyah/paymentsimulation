<template>
  <div class="admin-dashboard">
    <h1>Admin Dashboard</h1>
    
    <div class="stats">
      <div class="stat-card">
        <h3>Total Customers</h3>
        <p>{{ customers.length }}</p>
      </div>
      <div class="stat-card">
        <h3>Paid This Month</h3>
        <p>{{ paidCount }}</p>
      </div>
      <div class="stat-card">
        <h3>Unpaid</h3>
        <p>{{ unpaidCount }}</p>
      </div>
    </div>
    
    <div class="customer-list">
      <h2>Customer Payment Status</h2>
      <table>
        <thead>
          <tr>
            <th>Customer ID</th>
            <th>Name</th>
            <th>Package</th>
            <th>Amount Due</th>
            <th>Status</th>
            <th>Last Payment</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cust in customers" :key="cust.id">
            <td>{{ cust.id }}</td>
            <td>{{ cust.name }}</td>
            <td>{{ cust.package }}</td>
            <td>${{ cust.balance }}</td>
            <td :class="cust.status">{{ cust.status }}</td>
            <td>{{ cust.lastPayment || 'N/A' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div v-if="recentPayment" class="notification">
      <p>New payment received from {{ recentPayment.customerName }} ({{ recentPayment.amount }})</p>
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    customers() {
      return this.$store.state.customers;
    },
    paidCount() {
      return this.customers.filter(c => c.status === 'paid').length;
    },
    unpaidCount() {
      return this.customers.filter(c => c.status === 'unpaid').length;
    },
    recentPayment() {
      return this.$store.state.recentPayment;
    }
  },
  created() {
    // In a real app, you'd set up websocket connection for real-time updates
    // This is just simulating the real-time update
    setInterval(() => {
      this.$store.dispatch('checkForUpdates');
    }, 3000);
  }
}
</script>

<style scoped>
.stats {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}
.stat-card {
  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 5px;
  flex: 1;
  text-align: center;
}
.customer-list {
  margin-top: 30px;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  padding: 10px;
  border: 1px solid #ddd;
  text-align: left;
}
.paid { color: green; }
.unpaid { color: red; }
.notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #42b983;
  color: white;
  padding: 15px;
  border-radius: 5px;
  animation: slideIn 0.5s forwards;
}
@keyframes slideIn {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
</style>