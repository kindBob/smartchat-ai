import { authClient } from "../auth";

export async function sendVerificationCode(email: string) {
    const result = await authClient.emailOtp.sendVerificationOtp({
        email: email.trim().toLowerCase(),
        type: "email-verification",
    });

    if (result.error) {
        throw new Error(result.error.message || "Could not send the verification code.");
    }

    if (!result.data?.success) {
        throw new Error("Could not send the verification code.");
    }
}

export function getErrorMessage(err: unknown, fallback: string): string {
    const msg = (err instanceof Error && err.message) || (typeof err === "string" && err) || fallback;

    return msg.endsWith(".") ? msg : `${msg}.`;
}
