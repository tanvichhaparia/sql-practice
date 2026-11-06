import { recordPaymentSuccess } from './storage';

export interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

export interface PaymentOptions {
  amount: number; // in INR (e.g. 199)
  studentName?: string;
  studentEmail?: string;
  contact?: string;
  onSuccess: (res: RazorpayPaymentResponse) => void;
  onFailure: (err: { code?: string; description?: string }) => void;
}

const RZP_KEY_STORAGE = 'sqledge_custom_rzp_key';

export function getRazorpayKeyId(): string {
  const custom = localStorage.getItem(RZP_KEY_STORAGE);
  if (custom && custom.trim()) return custom.trim();
  const envKey = (import.meta as any).env?.VITE_RAZORPAY_KEY_ID;
  if (envKey && envKey.trim()) return envKey.trim();
  return '';
}

export function setRazorpayKeyId(key: string): void {
  if (key && key.trim()) {
    localStorage.setItem(RZP_KEY_STORAGE, key.trim());
  } else {
    localStorage.removeItem(RZP_KEY_STORAGE);
  }
}

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const existing = document.getElementById('razorpay-checkout-script');
    if (existing) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.id = 'razorpay-checkout-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export async function openRazorpayCheckout(options: PaymentOptions): Promise<void> {
  const isLoaded = await loadRazorpayScript();
  const keyId = getRazorpayKeyId();

  if (!isLoaded || !keyId) {
    // If Razorpay SDK could not load or no API key is set yet,
    // trigger failure callback with clear diagnostic so UI can offer instant simulation or key configuration
    options.onFailure({
      code: !keyId ? 'NO_KEY_CONFIGURED' : 'SDK_LOAD_FAILED',
      description: !keyId
        ? 'No Razorpay Key ID configured. You can configure your key or use the Test Simulator.'
        : 'Failed to load Razorpay checkout script from Razorpay CDN.',
    });
    return;
  }

  const rzpOptions = {
    key: keyId,
    amount: options.amount * 100, // Amount in paise (199 INR = 19900 paise)
    currency: 'INR',
    name: 'SQLEdge OA',
    description: `All-Company Pro Placement Pass (₹${options.amount} Lifetime Access)`,
    image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="%2310b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg>',
    prefill: {
      name: options.studentName || 'Student Engineer',
      email: options.studentEmail || 'student@college.edu',
      contact: options.contact || '',
    },
    notes: {
      product: 'sqledge_pro_lifetime_pass',
      tier: 'student_college_pass',
    },
    theme: {
      color: '#10b981', // Emerald 500
    },
    handler: function (response: RazorpayPaymentResponse) {
      recordPaymentSuccess(
        response.razorpay_payment_id,
        options.amount,
        response.razorpay_order_id,
        'Razorpay UPI/Cards'
      );
      options.onSuccess(response);
    },
    modal: {
      ondismiss: function () {
        options.onFailure({
          code: 'PAYMENT_CANCELLED',
          description: 'Payment window was closed by user.',
        });
      },
    },
  };

  try {
    const rzp = new (window as any).Razorpay(rzpOptions);
    rzp.open();
  } catch (err: any) {
    options.onFailure({
      code: 'CHECKOUT_OPEN_ERROR',
      description: err.message || 'Error opening Razorpay checkout window.',
    });
  }
}

export function simulateTestPayment(
  amount: number,
  studentName?: string,
  studentEmail?: string
): RazorpayPaymentResponse {
  const paymentId = 'pay_test_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
  recordPaymentSuccess(paymentId, amount, 'order_simulated_' + Date.now(), 'Simulated UPI');
  return {
    razorpay_payment_id: paymentId,
    razorpay_order_id: 'order_simulated_' + Date.now(),
  };
}
