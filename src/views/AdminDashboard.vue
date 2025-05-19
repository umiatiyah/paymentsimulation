<template>
  <div class="admin-dashboard">
    <!-- Dashboard Header -->
    <div class="dashboard-header">
      <div class="header-left">
        <h1>Payment Dashboard</h1>
        <p class="last-updated">Last updated: {{ currentTime }}</p>
      </div>
      <div class="header-actions">
        <button class="refresh-btn" @click="refreshData">
          <svg class="refresh-icon" viewBox="0 0 24 24">
            <path
              d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z"
            />
          </svg>
          Refresh Data
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div
        class="stat-card"
        v-for="stat in stats"
        :key="stat.title"
        :style="{ '--card-color': stat.color }"
      >
        <div class="stat-icon">
          <span>{{ stat.icon }}</span>
        </div>
        <div class="stat-content">
          <h3>{{ stat.title }}</h3>
          <p>{{ stat.value }}</p>
          <div class="stat-trend" v-if="stat.trend">
            <span :class="['trend-icon', stat.trend.direction]">
              {{ stat.trend.direction === "up" ? "↑" : "↓" }}
            </span>
            <span>{{ stat.trend.value }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="content-grid">
      <!-- Payment Activity Chart -->
      <div class="chart-card">
        <div class="card-header">
          <h3>Payment Activity</h3>
          <select v-model="chartRange" class="time-select">
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last Quarter</option>
          </select>
        </div>
        <div class="chart-container">
          <div class="bar-chart">
            <div
              v-for="(item, index) in paymentData"
              :key="index"
              class="bar-item"
            >
              <div class="bar-label">{{ item.label }}</div>
              <div class="bar-track">
                <div
                  class="bar-fill"
                  :style="{
                    height: `${item.value}%`,
                    background:
                      item.value > 70
                        ? '#52c41a'
                        : item.value > 30
                        ? '#faad14'
                        : '#f5222d',
                  }"
                ></div>
              </div>
              <div class="bar-value">${{ item.amount }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Transactions -->
      <div class="transactions-card">
        <div class="card-header">
          <h3>Recent Transactions</h3>
          <router-link to="/transactions" class="view-all"
            >View All</router-link
          >
        </div>
        <div class="transactions-list">
          <div
            v-for="(txn, index) in recentTransactions"
            :key="index"
            class="transaction-item"
          >
            <div class="txn-avatar" :style="{ background: txn.avatarColor }">
              {{ txn.customer.charAt(0) }}
            </div>
            <div class="txn-details">
              <div class="txn-meta">
                <span class="txn-customer">{{ txn.customer }}</span>
                <span class="txn-time">{{ txn.time }}</span>
              </div>
              <div
                class="txn-amount"
                :class="{
                  'text-success': txn.status === 'completed',
                  'text-warning': txn.status === 'pending',
                }"
              >
                ${{ txn.amount }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Customer Status Table -->
    <div class="table-card">
      <div class="card-header">
        <h3>Customer Payment Status</h3>
        <div class="table-actions">
          <input
            type="text"
            placeholder="Search customers..."
            class="search-input"
          />
          <button class="export-btn">Export CSV</button>
        </div>
      </div>
      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Customer ID</th>
              <th>Name</th>
              <th>Plan</th>
              <th>Amount Due</th>
              <th>Status</th>
              <th>Last Payment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cust in customers" :key="cust.id">
              <td>{{ cust.id }}</td>
              <td>{{ cust.name }}</td>
              <td>{{ cust.package }}</td>
              <td>${{ cust.balance }}</td>
              <td>
                <span :class="['status-badge', cust.status]">
                  {{ cust.status === "paid" ? "Paid" : "Pending" }}
                </span>
              </td>
              <td>{{ cust.lastPayment || "N/A" }}</td>
              <td>
                <button class="action-btn view-btn">View</button>
                <button
                  class="action-btn remind-btn"
                  v-if="cust.status !== 'paid'"
                >
                  Remind
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Real-time Notification -->
    <transition name="slide-fade">
      <div v-if="recentPayment" class="notification-bubble">
        <div class="notification-icon">
          <svg viewBox="0 0 24 24" class="check-icon">
            <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
          </svg>
        </div>
        <div class="notification-content">
          <h4>New Payment Received!</h4>
          <p>
            {{ recentPayment.customerName }} paid ${{ recentPayment.amount }}
          </p>
          <span class="notification-time">{{ notificationTime }}</span>
        </div>
        <button @click="recentPayment = null" class="notification-close">
          &times;
        </button>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  data() {
    return {
      recentPayment: null,
      notificationTime: "Just now",
      notificationTimer: null,
      currentTime: new Date().toLocaleString(),
      chartRange: "7d",
      stats: [
        {
          title: "Total Revenue",
          value: "$8,420",
          icon: "💰",
          color: "#722ed1",
          trend: { direction: "up", value: "12%" },
        },
        {
          title: "Active Customers",
          value: "243",
          icon: "👥",
          color: "#1890ff",
          trend: { direction: "up", value: "5%" },
        },
        {
          title: "Pending Payments",
          value: "18",
          icon: "⏳",
          color: "#faad14",
          trend: { direction: "down", value: "3%" },
        },
        {
          title: "Payment Success",
          value: "94%",
          icon: "✅",
          color: "#52c41a",
          trend: { direction: "up", value: "2%" },
        },
      ],
      paymentData: [
        { label: "Mon", value: 65, amount: 1250 },
        { label: "Tue", value: 85, amount: 1820 },
        { label: "Wed", value: 45, amount: 920 },
        { label: "Thu", value: 75, amount: 1560 },
        { label: "Fri", value: 95, amount: 2100 },
        { label: "Sat", value: 35, amount: 750 },
        { label: "Sun", value: 25, amount: 520 },
      ],
      recentTransactions: [
        {
          customer: "John Smith",
          amount: 49.99,
          time: "2 min ago",
          status: "completed",
          avatarColor: "#1890ff",
        },
        {
          customer: "Alice Johnson",
          amount: 29.99,
          time: "15 min ago",
          status: "completed",
          avatarColor: "#52c41a",
        },
        {
          customer: "Robert Chen",
          amount: 39.99,
          time: "1 hour ago",
          status: "pending",
          avatarColor: "#722ed1",
        },
        {
          customer: "Maria Garcia",
          amount: 49.99,
          time: "3 hours ago",
          status: "completed",
          avatarColor: "#faad14",
        },
      ],
      customers: [
        {
          id: "CUST1001",
          name: "John Smith",
          package: "Premium",
          balance: 0,
          status: "paid",
          lastPayment: "2023-06-15",
        },
        {
          id: "CUST1002",
          name: "Alice Johnson",
          package: "Standard",
          balance: 29.99,
          status: "unpaid",
          lastPayment: "2023-05-28",
        },
        {
          id: "CUST1003",
          name: "Robert Chen",
          package: "Basic",
          balance: 19.99,
          status: "unpaid",
          lastPayment: "2023-06-02",
        },
        {
          id: "CUST1004",
          name: "Maria Garcia",
          package: "Premium",
          balance: 0,
          status: "paid",
          lastPayment: "2023-06-14",
        },
      ],
    };
  },
  methods: {
    showNewPayment(customerName, amount) {
      this.recentPayment = { customerName, amount };
      this.notificationTime = "Just now";

      // Update time text every minute
      if (this.notificationTimer) clearInterval(this.notificationTimer);

      let minutesPassed = 0;
      this.notificationTimer = setInterval(() => {
        minutesPassed++;
        this.notificationTime = `${minutesPassed} minute${
          minutesPassed !== 1 ? "s" : ""
        } ago`;
      }, 60000);

      // Auto-dismiss after 8 seconds
      setTimeout(() => {
        this.recentPayment = null;
        clearInterval(this.notificationTimer);
      }, 8000);
    },
    refreshData() {
      this.currentTime = new Date().toLocaleString();
      // Simulate a new payment notification (remove in production)
      if (Math.random() > 0.5) {
        const customers = [
          "John Smith",
          "Alice Johnson",
          "Robert Chen",
          "Maria Garcia",
        ];
        const randomCustomer =
          customers[Math.floor(Math.random() * customers.length)];
        const randomAmount = (Math.random() * 50 + 10).toFixed(2);
        this.showNewPayment(randomCustomer, randomAmount);
      }
    },
  },
};
</script>

<style scoped>
.admin-dashboard {
  padding: 2rem;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header-left h1 {
  font-size: 1.8rem;
  color: #2c3e50;
  margin: 0;
}

.last-updated {
  font-size: 0.85rem;
  color: #666;
  margin-top: 0.25rem;
}

.refresh-btn {
  background: white;
  border: 1px solid #ddd;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.refresh-btn:hover {
  background: #f0f2f5;
  border-color: #ccc;
}

.refresh-icon {
  width: 18px;
  height: 18px;
  fill: #666;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 1.25rem;
  border-top: 3px solid var(--card-color);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(var(--card-color), 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: var(--card-color);
}

.stat-content h3 {
  margin: 0 0 0.25rem 0;
  font-size: 0.95rem;
  color: #666;
  font-weight: 500;
}

.stat-content p {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
}

.stat-trend {
  font-size: 0.85rem;
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.trend-icon {
  font-size: 0.9rem;
}

.trend-icon.up {
  color: #52c41a;
}

.trend-icon.down {
  color: #f5222d;
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.chart-card,
.transactions-card {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.card-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #2c3e50;
}

.time-select {
  padding: 0.35rem 0.75rem;
  border-radius: 4px;
  border: 1px solid #ddd;
  background: white;
  font-size: 0.85rem;
}

.view-all {
  font-size: 0.85rem;
  color: #1890ff;
  text-decoration: none;
}

.bar-chart {
  display: flex;
  height: 200px;
  align-items: flex-end;
  gap: 1rem;
}

.bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bar-label {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.bar-track {
  width: 100%;
  height: 150px;
  background: #f5f5f5;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.bar-fill {
  width: 100%;
  position: absolute;
  bottom: 0;
  border-radius: 4px 4px 0 0;
  transition: height 0.5s ease;
}

.bar-value {
  font-size: 0.8rem;
  margin-top: 0.5rem;
  font-weight: 500;
}

.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.transaction-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.transaction-item:last-child {
  border-bottom: none;
}

.txn-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
}

.txn-details {
  flex: 1;
}

.txn-meta {
  display: flex;
  justify-content: space-between;
}

.txn-customer {
  font-weight: 500;
}

.txn-time {
  font-size: 0.8rem;
  color: #999;
}

.txn-amount {
  font-weight: 600;
  text-align: right;
}

.text-success {
  color: #52c41a;
}

.text-warning {
  color: #faad14;
}

.table-card {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.table-actions {
  display: flex;
  gap: 1rem;
}

.search-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.85rem;
  min-width: 200px;
}

.export-btn {
  background: white;
  border: 1px solid #ddd;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
}

.table-responsive {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

th,
td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

th {
  font-weight: 500;
  color: #666;
  font-size: 0.85rem;
  text-transform: uppercase;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.paid {
  background: #e6f7ee;
  color: #52c41a;
}

.status-badge.unpaid {
  background: #fff2f0;
  color: #f5222d;
}

.action-btn {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  border: none;
}

.view-btn {
  background: #f0f7ff;
  color: #1890ff;
}

.remind-btn {
  background: #fff2e8;
  color: #fa8c16;
  margin-left: 0.5rem;
}

/* Notification Styles */
.notification-bubble {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  padding: 1rem;
  max-width: 320px;
  z-index: 1000;
  border-left: 4px solid #52c41a;
  animation: pulse 2s infinite;
}

.notification-icon {
  width: 36px;
  height: 36px;
  background: #e6f7ee;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  flex-shrink: 0;
}

.check-icon {
  width: 20px;
  height: 20px;
  fill: #52c41a;
}

.notification-content h4 {
  margin: 0 0 0.25rem 0;
  color: #2c3e50;
}

.notification-content p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.notification-time {
  display: block;
  font-size: 0.75rem;
  color: #999;
  margin-top: 0.25rem;
}

.notification-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #999;
  cursor: pointer;
  margin-left: 0.5rem;
  padding: 0 0.5rem;
}

/* Animation */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}
.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}

@keyframes pulse {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
  100% {
    transform: translateY(0);
  }
}

@media (max-width: 1200px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .table-actions {
    flex-direction: column;
  }
}
</style>
