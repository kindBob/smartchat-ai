export function getErrorMessage(err: unknown, fallback: string): string {
    const msg = (err instanceof Error && err.message) || (typeof err === "string" && err) || fallback;

    if (err instanceof TypeError) return "Network error. Check your connection and try again.";

    return /[.!?]$/.test(msg) ? msg : `${msg}.`;
}
