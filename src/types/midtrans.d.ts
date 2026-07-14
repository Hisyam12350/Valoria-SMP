/**
 * Midtrans Snap global window type declaration.
 * Loaded via <Script src="snap.js" /> in layout.tsx.
 */

interface SnapCallbackResult {
  order_id: string;
  transaction_status: string;
  fraud_status?: string;
  payment_type?: string;
  gross_amount?: string;
}

interface SnapPaymentOptions {
  onSuccess?: (result: SnapCallbackResult) => void;
  onPending?: (result: SnapCallbackResult) => void;
  onError?: (result: SnapCallbackResult) => void;
  onClose?: () => void;
}

interface Snap {
  pay(token: string, options?: SnapPaymentOptions): void;
  hide(): void;
  show(): void;
}

declare global {
  interface Window {
    snap: Snap;
  }
}

export {};
