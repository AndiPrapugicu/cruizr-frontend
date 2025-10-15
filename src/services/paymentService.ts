import api from "./api";

export interface PaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
}

export interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  isDefault: boolean;
}

export interface PaymentResult {
  success: boolean;
  paymentIntentId?: string;
  error?: string;
}

export interface PurchaseItem {
  itemId: string;
  quantity: number;
  paymentMethodId?: string;
}

class PaymentService {
  // Create payment intent for store purchase
  async createPaymentIntent(
    itemId: string,
    quantity: number = 1
  ): Promise<PaymentIntent> {
    try {
      const response = await api.post("/payments/create-intent", {
        itemId,
        quantity,
      });
      return response.data;
    } catch (error) {
      console.error("Error creating payment intent:", error);
      throw error;
    }
  }

  // Confirm payment and process purchase
  async confirmPayment(
    paymentIntentId: string,
    paymentMethodId: string
  ): Promise<PaymentResult> {
    try {
      const response = await api.post("/payments/confirm", {
        paymentIntentId,
        paymentMethodId,
      });
      return response.data;
    } catch (error) {
      console.error("Error confirming payment:", error);
      throw error;
    }
  }

  // Get user's saved payment methods
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const response = await api.get("/payments/methods");
      return response.data;
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      return [];
    }
  }

  // Add new payment method
  async addPaymentMethod(paymentMethodId: string): Promise<PaymentMethod> {
    try {
      const response = await api.post("/payments/methods", {
        paymentMethodId,
      });
      return response.data;
    } catch (error) {
      console.error("Error adding payment method:", error);
      throw error;
    }
  }

  // Remove payment method
  async removePaymentMethod(paymentMethodId: string): Promise<void> {
    try {
      await api.delete(`/payments/methods/${paymentMethodId}`);
    } catch (error) {
      console.error("Error removing payment method:", error);
      throw error;
    }
  }

  // Set default payment method
  async setDefaultPaymentMethod(paymentMethodId: string): Promise<void> {
    try {
      await api.put(`/payments/methods/${paymentMethodId}/default`);
    } catch (error) {
      console.error("Error setting default payment method:", error);
      throw error;
    }
  }

  // Get payment history
  async getPaymentHistory(page: number = 1, limit: number = 10) {
    try {
      const response = await api.get("/payments/history", {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching payment history:", error);
      throw error;
    }
  }

  // Process purchase with stored payment method
  async purchaseWithStoredMethod(
    itemId: string,
    quantity: number,
    paymentMethodId: string
  ): Promise<PaymentResult> {
    try {
      const response = await api.post("/store/purchase-direct", {
        itemId,
        quantity,
        paymentMethodId,
      });
      return response.data;
    } catch (error) {
      console.error("Error processing purchase:", error);
      throw error;
    }
  }

  // Purchase with new payment method
  async purchaseWithNewMethod(
    itemId: string,
    quantity: number,
    paymentMethodId: string,
    saveMethod: boolean = false
  ): Promise<PaymentResult> {
    try {
      const response = await api.post("/store/purchase-new", {
        itemId,
        quantity,
        paymentMethodId,
        saveMethod,
      });
      return response.data;
    } catch (error) {
      console.error("Error processing purchase:", error);
      throw error;
    }
  }
}

export const paymentService = new PaymentService();
