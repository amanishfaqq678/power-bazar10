import type { Inquiry } from "@/lib/types";

/**
 * Automation boundary (n8n / WhatsApp Business API).
 *
 * Nothing is faked here. Today these functions are no-ops that simply record
 * intent. When an n8n webhook URL is configured (server-side environment
 * variable, consumed from a server function), the same call sites keep working:
 *
 *   new inquiry     -> n8n -> owner WhatsApp + email notification
 *   low stock       -> n8n -> owner notification
 *   status change   -> n8n -> customer follow-up
 */

export interface AutomationConfig {
  /** Set server-side later, e.g. process.env.N8N_INQUIRY_WEBHOOK_URL */
  inquiryWebhookConfigured: boolean;
  /** Set once the official WhatsApp Business number is verified. */
  whatsappConfigured: boolean;
}

export const automationConfig: AutomationConfig = {
  inquiryWebhookConfigured: false,
  whatsappConfigured: false,
};

export async function notifyNewInquiry(inquiry: Inquiry): Promise<void> {
  if (!automationConfig.inquiryWebhookConfigured) {
    // Intentional no-op until the automation webhook is connected.
    return;
  }
  // Future: call a server function that forwards the payload to n8n.
  void inquiry;
}

export async function notifyLowStock(productId: string, quantity: number): Promise<void> {
  if (!automationConfig.inquiryWebhookConfigured) return;
  void productId;
  void quantity;
}

export async function notifyInquiryStatusChange(inquiry: Inquiry): Promise<void> {
  if (!automationConfig.inquiryWebhookConfigured) return;
  void inquiry;
}

/** Returns a WhatsApp link only when a verified business number exists. */
export function whatsappLink(message?: string): string | null {
  if (!automationConfig.whatsappConfigured) return null;
  void message;
  return null;
}
