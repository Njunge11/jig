/** The app's email client. The fixture has no mail provider; a deployed app sends through one here. */
export type EmailMessage = { to: string; template: string; data: Record<string, unknown> };

export type EmailClient = { send(message: EmailMessage): Promise<void> };

export const email: EmailClient = {
  async send(message) {
    console.info("email", message);
  },
};
