<template>
  <div class="customer-portal-container">
    <div class="portal-header">
      <h1 class="portal-title">My Internet Account</h1>
      <div class="user-profile">
        <span class="user-icon">👤</span>
        <span class="user-name">{{ customer.name }}</span>
      </div>
    </div>

    <div class="account-summary-card">
      <div class="account-info">
        <h3 class="section-title">Account Details</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Customer ID</span>
            <span class="info-value">{{ customer.id }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Package</span>
            <span class="info-value">{{ customer.package }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Speed</span>
            <span class="info-value">{{ customer.speed }} Mbps</span>
          </div>
        </div>
      </div>
    </div>

    <div class="billing-card">
      <h3 class="section-title">Billing Information</h3>
      <div class="billing-details">
        <div class="amount-due">
          <span class="amount-label">Amount Due</span>
          <span class="amount-value">${{ customer.balance }}</span>
        </div>
        <div class="due-date">
          <span class="due-label">Due Date</span>
          <span class="due-value">{{ formatDate(customer.dueDate) }}</span>
        </div>
        <div class="payment-status">
          <span class="status-label">Status</span>
          <span :class="['status-badge', customer.status]">
            {{ customer.status === "paid" ? "Paid" : "Payment Due" }}
          </span>
        </div>
      </div>

      <button
        v-if="customer.status !== 'paid'"
        @click="initiatePayment"
        class="payment-button"
        :disabled="isProcessing"
      >
        <span v-if="!isProcessing" class="button-icon">💳</span>
        <span v-else class="button-icon">⏳</span>
        {{
          isProcessing ? "Processing Payment..." : "Pay with Virtual Account"
        }}
      </button>

      <div v-if="paymentSuccess" class="payment-success-message">
        <span class="success-icon">✅</span>
        Payment successful! Thank you.
      </div>
    </div>

    <!-- Payment Modal -->
    <transition name="fade">
      <div v-if="showPaymentModal" class="payment-modal-overlay">
        <div class="payment-modal">
          <h3 class="modal-title">Virtual Account Payment</h3>
          <div class="modal-content">
            <div class="payment-detail">
              <span class="detail-label">Account Number</span>
              <span class="detail-value">{{ virtualAccountNumber }}</span>
            </div>
            <div class="payment-detail">
              <span class="detail-label">Amount</span>
              <span class="detail-value">${{ customer.balance }}</span>
            </div>
            <div class="payment-instructions">
              <p>
                Please complete the payment through your banking app using the
                virtual account number above.
              </p>
            </div>
          </div>
          <div class="modal-actions">
            <button @click="simulatePayment" class="confirm-button">
              Confirm Payment
            </button>
            <button @click="cancelPayment" class="cancel-button">Cancel</button>
          </div>
        </div>
        <div v-if="isProcessing" class="processing-overlay">
          <div class="processing-content">
            <div class="processing-spinner"></div>
          </div>
        </div>
      </div>
    </transition>

    <div v-if="paymentSuccess" class="payment-success-message">
      <button @click="downloadReceipt" class="receipt-button">
        📄 Download Receipt
      </button>
    </div>
  </div>
</template>

<script>
import confetti from "canvas-confetti";
export default {
  data() {
    return {
      customer: {
        id: "CUST12345",
        name: "John Doe",
        package: "Premium Internet",
        speed: 100,
        balance: 49.99,
        dueDate: "2023-06-15",
        status: "unpaid",
      },
      isProcessing: false,
      paymentSuccess: false,
      countdown: 5,
      showPaymentModal: false,
      paymentSuccess: false,
      virtualAccountNumber: "8932081234567890",
    };
  },
  methods: {
    downloadReceipt() {
      const receiptContent = `
      Payment Receipt
      ----------------------------
      Customer: ${this.customer.name}
      Amount: $${this.customer.balance}
      Date: ${new Date().toLocaleString()}
      Payment Method: Virtual Account
      Transaction ID: ${Math.random()
        .toString(36)
        .substring(2, 10)
        .toUpperCase()}
    `;
      const blob = new Blob([receiptContent], { type: "text/plain" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `receipt_${this.customer.id}.txt`;
      link.click();
    },
    initiatePayment() {
      this.showPaymentModal = true;
    },
    cancelPayment() {
      this.showPaymentModal = false;
    },
    async simulatePayment() {
      this.isProcessing = true;
      this.paymentSuccess = false;
      this.countdown = 5;

      // Start countdown timer
      const countdownInterval = setInterval(() => {
        this.countdown--;
      }, 1000);

      try {
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Simulate API call

        this.customer.status = "paid";
        this.customer.balance = 0;
        this.showPaymentModal = false;
        this.paymentSuccess = true;

        // Update store
        await this.$store.dispatch("updatePaymentStatus", {
          customerId: this.customer.id,
          status: "paid",
          amount: this.customer.balance,
          timestamp: new Date().toISOString(),
        });

        // Optional: Trigger success effects
        this.triggerSuccessEffects();
      } catch (error) {
        console.error("Payment failed:", error);
        this.$emit("payment-error", error);
      } finally {
        clearInterval(countdownInterval);
        this.isProcessing = false;
      }
    },
    triggerSuccessEffects() {
      // Add any visual/audio effects here
      if (typeof confetti !== "undefined") {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    },
    formatDate(dateString) {
      const options = { year: "numeric", month: "long", day: "numeric" };
      return new Date(dateString).toLocaleDateString(undefined, options);
    },
  },
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

/* For button hover effects */
.payment-button {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* For chart animations */
.bar-fill {
  transition: height 0.7s ease-out;
}

.receipt-button {
  background: #fff;
  border: 1px solid #1890ff;
  color: #1890ff;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  margin-top: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.receipt-button:hover {
  background: #f0f7ff;
}

.customer-portal-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
}

.portal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.portal-title {
  font-size: 1.8rem;
  color: #2c3e50;
  margin: 0;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-icon {
  font-size: 1.2rem;
}

.user-name {
  font-weight: 600;
}

.account-summary-card,
.billing-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.2rem;
  color: #2c3e50;
  margin-top: 0;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-label {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.info-value {
  font-weight: 600;
}

.billing-details {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.amount-due,
.due-date,
.payment-status {
  display: flex;
  flex-direction: column;
}

.amount-label,
.due-label,
.status-label {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.amount-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
}

.due-value {
  font-weight: 600;
}

.status-badge {
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  width: fit-content;
}

.status-badge.paid {
  background-color: #e6f7ee;
  color: #00a854;
}

.status-badge.unpaid {
  background-color: #fff2f0;
  color: #f5222d;
}

.payment-button {
  background: linear-gradient(135deg, #1890ff, #096dd9);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  transition: all 0.2s ease;
  width: 100%;
  justify-content: center;
}

.payment-button:hover {
  background: linear-gradient(135deg, #096dd9, #1890ff);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(24, 144, 255, 0.3);
}

.button-icon {
  font-size: 1.2rem;
}

.payment-success-message {
  background: #e6f7ee;
  color: #00a854;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

.success-icon {
  font-size: 1.2rem;
}

/* Payment Modal Styles */
.payment-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.payment-modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  padding: 1.5rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.modal-title {
  font-size: 1.3rem;
  color: #2c3e50;
  margin-top: 0;
  margin-bottom: 1.5rem;
  text-align: center;
}

.payment-detail {
  margin-bottom: 1rem;
}

.detail-label {
  display: block;
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.detail-value {
  display: block;
  font-size: 1.1rem;
  font-weight: 600;
  padding: 0.5rem;
  background: #f7f7f7;
  border-radius: 6px;
}

.payment-instructions {
  background: #f0f7ff;
  padding: 1rem;
  border-radius: 6px;
  margin: 1.5rem 0;
  font-size: 0.9rem;
  color: #2c3e50;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.confirm-button {
  flex: 1;
  background: linear-gradient(135deg, #52c41a, #389e0d);
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.confirm-button:hover {
  background: linear-gradient(135deg, #389e0d, #52c41a);
  transform: translateY(-1px);
}

.cancel-button {
  flex: 1;
  background: white;
  color: #666;
  border: 1px solid #ddd;
  padding: 0.75rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-button:hover {
  background: #f7f7f7;
  border-color: #ccc;
}

@media (max-width: 600px) {
  .info-grid,
  .billing-details {
    grid-template-columns: 1fr;
  }

  .modal-actions {
    flex-direction: column;
  }
}

/* Loading spinner styles */
.processing-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.processing-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Disabled button state */
.payment-button:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}
</style>
