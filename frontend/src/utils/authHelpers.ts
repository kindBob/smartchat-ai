import { authClient } from "../auth";

const OAUTH_ERROR_PARAMS = ["error", "error_description"];

// Neon Auth sends failed social sign-ins back to the app with an error code in the URL
export function getOAuthErrorCode(): string | null {
    return new URLSearchParams(window.location.search).get("error");
}

export function getOAuthErrorMessage(): string | null {
    const code = getOAuthErrorCode();

    if (!code) return null;

    switch (code) {
        case "access_denied":
            return "Google sign-in was cancelled.";
        case "account_not_linked":
            return 'This email is already registered. Sign in with your password, or use "Forgot password?" if you don\'t have it.';
        default:
            return "Could not sign in with Google. Please try again.";
    }
}

export function clearOAuthErrorFromUrl() {
    const url = new URL(window.location.href);

    if (!OAUTH_ERROR_PARAMS.some((param) => url.searchParams.has(param))) return;

    OAUTH_ERROR_PARAMS.forEach((param) => url.searchParams.delete(param));
    history.replaceState(history.state, "", url.href);
}

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
