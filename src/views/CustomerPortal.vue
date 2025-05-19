<template>
  <div class="customer-portal-container">
    <!-- Header with Quick Actions -->
    <div class="portal-header">
      <div>
        <h1 class="portal-title">My Internet Account</h1>
        <p class="welcome-message">Welcome back, {{ customer.name }}!</p>
      </div>
      <div class="quick-actions">
        <button class="action-btn" @click="downloadInvoice">
          <i class="icon-download"></i> Invoice
        </button>
        <button class="action-btn" @click="showSupport">
          <i class="icon-support"></i> Help
        </button>
      </div>
    </div>

    <!-- Account Overview Cards -->
    <div class="overview-grid">
      <!-- Service Status Card -->
      <div class="overview-card status-card">
        <div class="card-header">
          <h3>Service Status</h3>
          <span :class="['status-indicator', serviceStatus]">
            {{ serviceStatus === "active" ? "Active" : "Inactive" }}
          </span>
        </div>
        <div class="card-content">
          <p>
            Your internet service is currently
            <strong>{{ serviceStatus }}</strong>
          </p>
          <!-- <div class="usage-meter">
            <div class="meter-labels">
              <span>Data Usage</span>
              <span>75% of 500GB</span>
            </div>
            <div class="meter-bar">
              <div class="meter-fill" style="width: 75%"></div>
            </div>
          </div> -->
        </div>
      </div>

      <!-- Billing Summary Card -->
      <div class="overview-card billing-card">
        <div class="card-header">
          <h3>Billing Summary</h3>
          <span class="due-date">Due {{ formatDate(customer.dueDate) }}</span>
        </div>
        <div class="card-content">
          <div class="amount-due">
            <span class="label">Current Balance</span>
            <span class="value">${{ customer.balance }}</span>
          </div>
          <div class="payment-status">
            <span class="label">Status</span>
            <span :class="['status-badge', customer.status]">
              {{ customer.status === "paid" ? "Paid" : "Payment Due" }}
            </span>
          </div>
          <button
            v-if="customer.status !== 'paid'"
            @click="showPaymentOptions"
            class="pay-now-btn"
          >
            <i class="icon-payment"></i> Pay Now
          </button>
        </div>
      </div>
    </div>

    <!-- Payment History Section -->
    <div class="section">
      <h3 class="section-title">
        <i class="icon-history"></i> Payment History
      </h3>
      <div class="payment-history">
        <div
          v-for="(payment, index) in paymentHistory"
          :key="index"
          class="payment-item"
        >
          <div class="payment-meta">
            <span class="payment-date">{{ payment.date }}</span>
            <span class="payment-method">{{ payment.method }}</span>
          </div>
          <div class="payment-amount">${{ payment.amount }}</div>
          <button class="receipt-btn" @click="viewReceipt(payment.id)">
            <i class="icon-receipt"></i> Receipt
          </button>
        </div>
      </div>
    </div>

    <!-- Payment Options Modal -->
    <transition name="modal">
      <div v-if="showPaymentModal" class="payment-modal-overlay">
        <div class="payment-modal">
          <button class="close-modal" @click="closeModal">&times;</button>

          <div class="modal-header">
            <h3>Make a Payment</h3>
            <div class="payment-tabs">
              <button
                :class="['tab-btn', { active: activeTab === 'single' }]"
                @click="activeTab = 'single'"
              >
                Single Payment
              </button>
              <button
                :class="['tab-btn', { active: activeTab === 'bulk' }]"
                @click="activeTab = 'bulk'"
              >
                Bulk Payment
              </button>
            </div>
          </div>

          <!-- Single Payment Tab -->
          <div v-if="activeTab === 'single'" class="tab-content">
            <div class="payment-summary">
              <div class="summary-item">
                <span class="label">Amount to Pay</span>
                <span class="value">${{ customer.balance }}</span>
              </div>
              <div class="summary-item">
                <span class="label">Due Date</span>
                <span class="value">{{ formatDate(customer.dueDate) }}</span>
              </div>
            </div>

            <div class="payment-methods">
              <h4>Select Payment Method</h4>
              <div class="method-options">
                <div
                  v-for="method in paymentMethods"
                  :key="method.id"
                  :class="[
                    'method-card',
                    { selected: selectedMethod === method.id },
                  ]"
                  @click="selectMethod(method.id)"
                >
                  <div class="method-icon">
                    <i :class="['icon', method.icon]"></i>
                  </div>
                  <div class="method-info">
                    <h5>{{ method.name }}</h5>
                    <p>{{ method.description }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Xendit Virtual Account Flow -->
            <div v-if="selectedMethod === 'xendit-va'" class="xendit-flow">
              <div class="flow-step" :class="{ active: currentStep >= 1 }">
                <div class="step-number">1</div>
                <div class="step-content">
                  <h5>Virtual Account Number</h5>
                  <div class="va-number">{{ virtualAccountNumber }}</div>
                  <p class="step-description">
                    This is your unique virtual account number for bank
                    transfers
                  </p>
                </div>
              </div>

              <div class="flow-step" :class="{ active: currentStep >= 2 }">
                <div class="step-number">2</div>
                <div class="step-content">
                  <h5>Make Bank Transfer</h5>
                  <div class="bank-options">
                    <div
                      v-for="bank in supportedBanks"
                      :key="bank.id"
                      class="bank-card"
                    >
                      <img
                        :src="bank.logo"
                        :alt="bank.name"
                        class="bank-logo"
                      />
                      <span class="bank-name">{{ bank.name }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="flow-step" :class="{ active: currentStep >= 3 }">
                <div class="step-number">3</div>
                <div class="step-content">
                  <h5>Payment Confirmation</h5>
                  <p class="step-description">
                    Your payment will be verified automatically within 15
                    minutes
                  </p>
                </div>
              </div>
            </div>

            <div class="modal-actions">
              <button
                v-if="currentStep > 1"
                class="action-btn secondary"
                @click="prevStep"
              >
                Back
              </button>
              <button
                class="action-btn primary"
                @click="nextStep"
                :disabled="processingPayment"
              >
                <span v-if="processingPayment">
                  <i class="icon-spinner"></i> Processing...
                </span>
                <span v-else>
                  {{ currentStep === 3 ? "Complete Payment" : "Continue" }}
                </span>
              </button>
            </div>
          </div>

          <!-- Bulk Payment Tab -->
          <div v-if="activeTab === 'bulk'" class="tab-content">
            <div class="bulk-payment-form">
              <div class="form-group">
                <label>Number of Months to Pay</label>
                <select v-model="monthsToPay" class="form-select">
                  <option v-for="n in 6" :value="n" :key="n">
                    {{ n }} Month{{ n > 1 ? "s" : "" }}
                  </option>
                </select>
              </div>

              <div class="payment-summary">
                <div class="summary-item">
                  <span class="label">Monthly Fee</span>
                  <span class="value">${{ customer.monthlyFee }}</span>
                </div>
                <div class="summary-item">
                  <span class="label">Total Amount</span>
                  <span class="value"
                    >${{ customer.monthlyFee * monthsToPay }}</span
                  >
                </div>
              </div>

              <button class="action-btn primary" @click="initiateBulkPayment">
                Pay for {{ monthsToPay }} Month{{ monthsToPay > 1 ? "s" : "" }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Payment Processing Overlay -->
    <transition name="fade">
      <div v-if="processingPayment" class="processing-overlay">
        <div class="processing-content">
          <div class="spinner"></div>
          <h4>Processing Your Payment</h4>
          <p>Please wait while we process your transaction...</p>
          <div class="progress-text">{{ progressMessage }}</div>
        </div>
      </div>
    </transition>

    <!-- Payment Success Modal -->
    <transition name="modal">
      <div v-if="paymentSuccess" class="success-modal-overlay">
        <div class="success-modal">
          <div class="success-icon">
            <i class="icon-check"></i>
          </div>
          <h3>Payment Successful!</h3>
          <p>Thank you for your payment of ${{ paidAmount }}.</p>

          <div class="success-details">
            <div class="detail-item">
              <span class="label">Transaction ID</span>
              <span class="value">{{ transactionId }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Payment Method</span>
              <span class="value">{{ selectedMethodLabel }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Date & Time</span>
              <span class="value">{{ new Date().toLocaleString() }}</span>
            </div>
          </div>

          <div class="success-actions">
            <button class="action-btn" @click="downloadReceipt">
              <i class="icon-download"></i> Download Receipt
            </button>
            <button class="action-btn secondary" @click="closeSuccessModal">
              Close
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import bcaLogo from "@/assets/banks/bca.png";
import mandiriLogo from "@/assets/banks/mandiri.png";
import bniLogo from "@/assets/banks/bni.png";
import briLogo from "@/assets/banks/bri.png";
export default {
  data() {
    return {
      customer: {
        id: "CUST12345",
        name: "John Doe",
        package: "Premium Internet",
        speed: 100,
        balance: 49.99,
        monthlyFee: 49.99,
        dueDate: "2023-06-15",
        status: "unpaid",
        dataUsage: 375,
        dataLimit: 500,
      },
      serviceStatus: "active",
      showPaymentModal: false,
      paymentSuccess: false,
      processingPayment: false,
      activeTab: "single",
      selectedMethod: null,
      currentStep: 1,
      monthsToPay: 1,
      paidAmount: 0,
      transactionId:
        "TX" + Math.random().toString(36).substring(2, 10).toUpperCase(),
      progressMessage: "Initializing payment...",
      paymentHistory: [
        {
          id: "RCT001",
          date: "May 15, 2023",
          method: "Virtual Account",
          amount: 49.99,
        },
        {
          id: "RCT002",
          date: "April 14, 2023",
          method: "Credit Card",
          amount: 49.99,
        },
        {
          id: "RCT003",
          date: "March 15, 2023",
          method: "Virtual Account",
          amount: 49.99,
        },
      ],
      paymentMethods: [
        {
          id: "xendit-va",
          name: "Virtual Account",
          icon: "icon-bank",
          description: "Bank transfer via Xendit",
        },
        {
          id: "credit-card",
          name: "Credit Card",
          icon: "icon-credit-card",
          description: "Visa, Mastercard, JCB",
        },
        {
          id: "ewallet",
          name: "E-Wallet",
          icon: "icon-wallet",
          description: "OVO, DANA, LinkAja",
        },
      ],
      supportedBanks: [
        { id: "bca", name: "BCA", logo: bcaLogo },
        { id: "mandiri", name: "Mandiri", logo: mandiriLogo },
        { id: "bni", name: "BNI", logo: bniLogo },
        { id: "bri", name: "BRI", logo: briLogo },
      ],
      virtualAccountNumber:
        "893208" +
        Math.floor(Math.random() * 1000000)
          .toString()
          .padStart(6, "0"),
    };
  },
  computed: {
    selectedMethodLabel() {
      const method = this.paymentMethods.find(
        (m) => m.id === this.selectedMethod
      );
      return method ? method.name : "";
    },
  },
  methods: {
    formatDate(dateString) {
      const options = { year: "numeric", month: "long", day: "numeric" };
      return new Date(dateString).toLocaleDateString(undefined, options);
    },
    showPaymentOptions() {
      this.showPaymentModal = true;
      this.activeTab = "single";
      this.selectedMethod = null;
      this.currentStep = 1;
    },
    closeModal() {
      this.showPaymentModal = false;
    },
    selectMethod(methodId) {
      this.selectedMethod = methodId;
      this.currentStep = 1;
    },
    nextStep() {
      if (this.currentStep < 3) {
        this.currentStep++;
      } else {
        this.processPayment();
      }
    },
    prevStep() {
      if (this.currentStep > 1) {
        this.currentStep--;
      }
    },
    async processPayment() {
      this.processingPayment = true;
      this.progressMessage = "Connecting to payment gateway...";

      // Simulate API call steps
      await this.delay(1000);
      this.progressMessage = "Creating virtual account...";

      await this.delay(1500);
      this.progressMessage = "Processing transaction...";

      await this.delay(2000);
      this.progressMessage = "Finalizing payment...";

      await this.delay(1000);

      this.paidAmount = this.customer.balance;
      this.customer.status = "paid";
      this.customer.balance = 0;

      // Add to payment history
      this.paymentHistory.unshift({
        id: "RCT" + Math.floor(Math.random() * 1000),
        date: new Date().toLocaleDateString(),
        method: "Virtual Account",
        amount: this.paidAmount,
      });

      this.processingPayment = false;
      this.showPaymentModal = false;
      this.paymentSuccess = true;

      // In a real app, you would call Xendit API here
      // Example:
      // const response = await this.$xendit.createVAPayment({
      //   external_id: this.customer.id,
      //   bank_code: 'BCA',
      //   name: this.customer.name,
      //   expected_amount: this.customer.balance
      // });
      // this.virtualAccountNumber = response.account_number;
    },
    initiateBulkPayment() {
      this.paidAmount = this.customer.monthlyFee * this.monthsToPay;
      this.processPayment();
    },
    closeSuccessModal() {
      this.paymentSuccess = false;
    },
    downloadReceipt() {
      const receiptContent = `
        Payment Receipt
        ----------------------------
        Customer: ${this.customer.name}
        Amount: $${this.paidAmount}
        Date: ${new Date().toLocaleString()}
        Payment Method: ${this.selectedMethodLabel}
        Transaction ID: ${this.transactionId}
        Virtual Account: ${this.virtualAccountNumber}
      `;
      const blob = new Blob([receiptContent], { type: "text/plain" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `receipt_${this.transactionId}.txt`;
      link.click();
    },
    viewReceipt(receiptId) {
      alert(`Would normally show receipt ${receiptId}`);
    },
    downloadInvoice() {
      alert("Invoice download would be triggered here");
    },
    showSupport() {
      alert("Support chat would open here");
    },
    delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },
  },
};
</script>

<style scoped>
/* Base Styles */
.customer-portal-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  color: #2c3e50;
}

/* Header Styles */
.portal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.portal-title {
  font-size: 1.8rem;
  margin: 0;
  color: #2c3e50;
}

.welcome-message {
  margin: 0.25rem 0 0;
  color: #666;
  font-size: 1rem;
}

.quick-actions {
  display: flex;
  gap: 0.75rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #f5f7fa;
}

.action-btn i {
  font-size: 1rem;
}

/* Overview Grid */
.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.overview-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.card-header h3 {
  margin: 0;
  font-size: 1.2rem;
}

.status-indicator {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
}

.status-indicator.active {
  background: #e6f7ee;
  color: #52c41a;
}

.status-indicator.inactive {
  background: #fff2f0;
  color: #f5222d;
}

.due-date {
  font-size: 0.9rem;
  color: #666;
}

.usage-meter {
  margin-top: 1rem;
}

.meter-labels {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
  font-size: 0.85rem;
}

.meter-bar {
  height: 8px;
  background: #f5f5f5;
  border-radius: 4px;
  overflow: hidden;
}

.meter-fill {
  height: 100%;
  background: linear-gradient(to right, #1890ff, #096dd9);
  border-radius: 4px;
}

.amount-due,
.payment-status {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.amount-due .value {
  font-size: 1.5rem;
  font-weight: 700;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
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

.pay-now-btn {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 6px;
  background: linear-gradient(to right, #1890ff, #096dd9);
  color: white;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
}

.pay-now-btn:hover {
  background: linear-gradient(to right, #096dd9, #1890ff);
}

/* Payment History */
.section {
  margin-bottom: 2rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

.payment-history {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.payment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #f0f0f0;
}

.payment-item:last-child {
  border-bottom: none;
}

.payment-meta {
  flex: 1;
}

.payment-date {
  display: block;
  font-weight: 500;
}

.payment-method {
  font-size: 0.85rem;
  color: #666;
}

.payment-amount {
  font-weight: 600;
  margin: 0 1rem;
}

.receipt-btn {
  background: none;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0.25rem 0.75rem;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.receipt-btn:hover {
  background: #f5f7fa;
}

/* Modal Styles */
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
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
  position: relative;
}

.close-modal {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #f0f0f0;
}

.modal-header h3 {
  margin: 0 0 1rem;
  text-align: center;
}

.payment-tabs {
  display: flex;
  border-bottom: 1px solid #ddd;
}

.tab-btn {
  flex: 1;
  padding: 0.75rem;
  border: none;
  background: none;
  cursor: pointer;
  font-weight: 500;
  position: relative;
}

.tab-btn.active {
  color: #1890ff;
}

.tab-btn.active::after {
  content: "";
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: #1890ff;
}

.tab-content {
  padding: 1.5rem;
}

.payment-summary {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.summary-item .label {
  color: #666;
}

.summary-item .value {
  font-weight: 600;
}

.payment-methods h4 {
  margin: 0 0 1rem;
  font-size: 1rem;
}

.method-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.method-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.method-card:hover {
  border-color: #1890ff;
}

.method-card.selected {
  border-color: #1890ff;
  background: #f0f7ff;
}

.method-icon {
  width: 40px;
  height: 40px;
  background: #f5f5f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.method-icon i {
  font-size: 1.25rem;
  color: #1890ff;
}

.method-info h5 {
  margin: 0 0 0.25rem;
  font-size: 1rem;
}

.method-info p {
  margin: 0;
  font-size: 0.85rem;
  color: #666;
}

/* Xendit VA Flow */
.xendit-flow {
  margin: 1.5rem 0;
}

.flow-step {
  display: flex;
  margin-bottom: 1.5rem;
  opacity: 0.5;
}

.flow-step.active {
  opacity: 1;
}

.step-number {
  width: 24px;
  height: 24px;
  background: #1890ff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-content h5 {
  margin: 0 0 0.5rem;
  font-size: 1rem;
}

.va-number {
  font-family: monospace;
  font-size: 1.25rem;
  letter-spacing: 1px;
  background: #f5f5f5;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  margin: 0.5rem 0;
}

.step-description {
  margin: 0.5rem 0 0;
  font-size: 0.9rem;
  color: #666;
}

.bank-options {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.bank-card {
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 0.75rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.bank-card:hover {
  border-color: #1890ff;
}

.bank-logo {
  height: 30px;
  margin-bottom: 0.5rem;
  object-fit: contain;
}

.bank-name {
  font-size: 0.75rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.action-btn.primary {
  background: #1890ff;
  color: white;
  border: none;
}

.action-btn.primary:hover {
  background: #096dd9;
}

.action-btn.secondary {
  background: white;
  color: #666;
  border: 1px solid #ddd;
}

.action-btn.secondary:hover {
  background: #f5f5f5;
}

/* Bulk Payment Form */
.bulk-payment-form {
  margin-top: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.form-select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

/* Processing Overlay */
.processing-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
}

.processing-content {
  text-align: center;
  max-width: 400px;
  padding: 2rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #1890ff;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

.processing-content h4 {
  margin: 0 0 0.5rem;
}

.processing-content p {
  margin: 0 0 1rem;
  color: #666;
}

.progress-text {
  font-size: 0.9rem;
  color: #1890ff;
}

/* Success Modal */
.success-modal-overlay {
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

.success-modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  padding: 2rem;
  text-align: center;
}

.success-icon {
  width: 60px;
  height: 60px;
  background: #e6f7ee;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
}

.success-icon i {
  font-size: 2rem;
  color: #52c41a;
}

.success-modal h3 {
  margin: 0 0 0.5rem;
  color: #2c3e50;
}

.success-modal p {
  margin: 0 0 1.5rem;
  color: #666;
}

.success-details {
  text-align: left;
  background: #f5f7fa;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.detail-item .label {
  color: #666;
}

.detail-item .value {
  font-weight: 500;
}

.success-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

/* Animations */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s;
}
.modal-enter,
.modal-leave-to {
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .portal-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .quick-actions {
    width: 100%;
  }

  .method-options {
    grid-template-columns: 1fr;
  }

  .success-actions {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }
}

/* Icons (would normally use icon font or SVG) */
.icon {
  font-style: normal;
}
.icon-download::before {
  content: "↓";
}
.icon-support::before {
  content: "?";
}
.icon-payment::before {
  content: "💳";
}
.icon-history::before {
  content: "🕒";
}
.icon-receipt::before {
  content: "🧾";
}
.icon-bank::before {
  content: "🏦";
}
.icon-credit-card::before {
  content: "💳";
}
.icon-wallet::before {
  content: "💰";
}
.icon-check::before {
  content: "✓";
}
.icon-spinner::before {
  content: "↻";
}
</style>
