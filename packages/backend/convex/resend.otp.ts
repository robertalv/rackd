import { Resend as ResendAPI } from "resend";
import { generateRandomString } from "@oslojs/crypto/random";
import type { RandomReader } from "@oslojs/crypto/random";
import { site } from "./lib/utils";

const alphabet = "123456789";
const random: RandomReader = {
  read(bytes: Uint8Array): void {
    crypto.getRandomValues(bytes);
  },
};

export const ResendOTP = {
  async sendVerificationRequest({ email, token }: { email: string, token: string }) {
    const resend = new ResendAPI(process.env.AUTH_RESEND_KEY);
    const { error } = await resend.emails.send({
      from: `"${site.name}" <${site.emailFrom}>`,
      to: [email],
      subject: `Sign in to ${site.name}`,
      text: `Your code is ${token}`,
    });

    if (error) {
      throw new Error(JSON.stringify(error));
    }
  },
};
