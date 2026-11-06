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
// Default to the provided Razorpay Test Key ID
const DEFAULT_TEST_KEY = 'rzp_test_TwugtkfTcRGnrn';

export function getRazorpayKeyId(): string {
  const custom = localStorage.getItem(RZP_KEY_STORAGE);
  if (custom && custom.trim()) return custom.trim();
  const envKey = (import.meta as any).env?.VITE_RAZORPAY_KEY_ID;
  if (envKey && envKey.trim()) return envKey.trim();
  return DEFAULT_TEST_KEY;
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
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
    }
    const script = document.createElement('script');
    script.id = 'razorpay-checkout-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      resolve(!!(window as any).Razorpay);
    };
    script.onerror = () => {
      console.warn('Failed to load Razorpay script from CDN.');
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

export async function openRazorpayCheckout(options: PaymentOptions): Promise<void> {
  console.log('Initiating Razorpay checkout for ₹', options.amount);
  
  const isLoaded = await loadRazorpayScript();
  const keyId = getRazorpayKeyId();

  if (!isLoaded || !(window as any).Razorpay) {
    console.error('Razorpay SDK not loaded. window.Razorpay is undefined.');
    options.onFailure({
      code: 'SDK_LOAD_FAILED',
      description: 'Razorpay checkout script could not be loaded. This is often blocked by ad-blockers (like Brave Shields or uBlock). Try disabling ad-blocker or use Test Simulator.',
    });
    return;
  }

  if (!keyId) {
    console.error('No Razorpay Key ID found.');
    options.onFailure({
      code: 'NO_KEY_CONFIGURED',
      description: 'No Razorpay Key ID configured. Please configure your key in Gateway Settings.',
    });
    return;
  }

  console.log('Opening Razorpay with Key ID:', keyId);

  const rzpOptions = {
    key: keyId,
    amount: options.amount * 100, // paise (199 INR = 19900 paise)
    currency: 'INR',
    name: 'SQLEdge OA',
    description: `All-Company Pro Placement Pass (₹${options.amount} Lifetime Access)`,
    prefill: {
      name: options.studentName || 'Student Engineer',
      email: options.studentEmail || 'student@college.edu',
      contact: options.contact || '9999999999', // Standard 10-digit test number for Razorpay
    },
    notes: {
      product: 'sqledge_pro_lifetime_pass',
      tier: 'student_college_pass',
    },
    theme: {
      color: '#10b981', // Emerald 500
    },
    handler: function (response: RazorpayPaymentResponse) {
      console.log('Razorpay payment approved:', response);
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
        console.log('Razorpay checkout window was dismissed.');
        options.onFailure({
          code: 'PAYMENT_CANCELLED',
          description: 'Payment was cancelled or closed.',
        });
      },
    },
  };

  try {
    const rzp = new (window as any).Razorpay(rzpOptions);

    rzp.on('payment.failed', function (response: any) {
      console.error('Razorpay payment failed event:', response.error);
      options.onFailure({
        code: response.error?.code || 'PAYMENT_FAILED',
        description: response.error?.description || response.error?.reason || 'Payment was declined.',
      });
    });

    rzp.open();
  } catch (err: any) {
    console.error('Exception opening Razorpay:', err);
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
