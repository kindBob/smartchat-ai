import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { authClient } from "../../auth";
import { getErrorMessage } from "../../utils/getErrorMessage";
import AuthMessages from "./AuthMessages";

type ForgotPasswordFormProps = {
    email: string;
    onEmailChange: (email: string) => void;
    onAuthSuccess: () => Promise<void>;
    onBack: () => void;
};

function ForgotPasswordForm({ email, onEmailChange, onAuthSuccess, onBack }: ForgotPasswordFormProps) {
    const [step, setStep] = useState<"request" | "reset">("request");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [otp, setOtp] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordVisible, setPasswordVisible] = useState(false);

    async function sendResetCode(normalizedEmail: string) {
        const result = await authClient.forgetPassword.emailOtp({ email: normalizedEmail });

        if (result.error) {
            throw new Error(result.error.message || "Could not send a reset code.");
        }
    }

    async function handleRequestCode(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();

        if (loading) return;

        setError(null);
        setSuccess(null);

        const normalizedEmail = email.trim().toLowerCase();

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            setError("Please enter a valid email address.");
            return;
        }

        setLoading(true);

        try {
            await sendResetCode(normalizedEmail);

            onEmailChange(normalizedEmail);
            setStep("reset");
        } catch (err) {
            console.error("Password reset request error:", err);

            setError(getErrorMessage(err, "Could not send a reset code. Please try again."));
        } finally {
            setLoading(false);
        }
    }

    async function handleResendCode() {
        if (loading) return;

        setError(null);
        setSuccess(null);
        setLoading(true);

        try {
            await sendResetCode(email);

            setOtp("");
            setSuccess("If an account exists for this email, a new code has been sent.");
        } catch (err) {
            console.error("Resend reset code error:", err);

            setError(getErrorMessage(err, "Could not resend a code. Please try again."));
        } finally {
            setLoading(false);
        }
    }

    async function handleResetPassword(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();

        if (loading) return;

        setError(null);
        setSuccess(null);

        if (!/^\d{6}$/.test(otp)) {
            setError("Please enter the complete 6-digit code.");
            return;
        }

        if (password.length < 8) {
            setError("Your password must contain at least 8 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords don't match.");
            return;
        }

        setLoading(true);

        try {
            const result = await authClient.emailOtp.resetPassword({ email, otp, password });

            if (result.error) {
                setError("Invalid or expired code. Please check it or request a new one.");
                return;
            }
        } catch (err) {
            console.error("Password reset error:", err);

            const invalidCode = err instanceof Error && /otp|code/i.test(err.message);

            setError(
                invalidCode
                    ? "Invalid or expired code. Please check it or request a new one."
                    : getErrorMessage(err, "Could not reset your password. Please try again.")
            );
            setLoading(false);
            return;
        }

        setSuccess("Your password has been reset. Signing you in...");

        // The password is already changed at this point, so a failed sign-in needs its own message
        try {
            const signInResult = await authClient.signIn.email({ email, password });

            if (signInResult.error) throw signInResult.error;

            await onAuthSuccess();
        } catch (err) {
            console.error("Automatic sign-in error:", err);

            setSuccess(null);
            setError("Your password has been reset, but automatic sign-in failed. Please go back and sign in.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo">S</div>

                    <h1>Reset your password</h1>

                    {step === "request" ? (
                        <p>Enter your email and we'll send you a 6-digit code.</p>
                    ) : (
                        <p>
                            If an account exists for <strong>{email}</strong>, we've sent it a 6-digit code.
                        </p>
                    )}
                </div>

                {step === "request" ? (
                    <form className="auth-form" onSubmit={handleRequestCode} noValidate>
                        <AuthMessages error={error} success={success} />

                        <div className="form-field">
                            <label htmlFor="reset-email">Email</label>

                            <input
                                id="reset-email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => {
                                    onEmailChange(e.target.value);
                                    setError(null);
                                }}
                                autoComplete="email"
                                autoCapitalize="none"
                                spellCheck={false}
                                required
                                disabled={loading}
                                autoFocus
                            />
                        </div>

                        <button className="auth-submit" type="submit" disabled={loading}>
                            {loading ? "Please wait..." : "Send code"}
                        </button>
                    </form>
                ) : (
                    <form className="auth-form" onSubmit={handleResetPassword} noValidate>
                        <AuthMessages error={error} success={success} />

                        <div className="form-field">
                            <label htmlFor="reset-otp">Code</label>

                            <input
                                id="reset-otp"
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                placeholder="123456"
                                value={otp}
                                onChange={(e) => {
                                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                                    setError(null);
                                }}
                                maxLength={6}
                                required
                                disabled={loading}
                                autoFocus
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="new-password">New password</label>

                            <div className="password-input-wrapper">
                                <input
                                    id="new-password"
                                    type={passwordVisible ? "text" : "password"}
                                    placeholder="********"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setError(null);
                                    }}
                                    autoComplete="new-password"
                                    required
                                    minLength={8}
                                    disabled={loading}
                                />

                                <button
                                    className="show-password"
                                    type="button"
                                    onClick={() => setPasswordVisible((prev) => !prev)}
                                    aria-label={passwordVisible ? "Hide passwords" : "Show passwords"}
                                    aria-pressed={passwordVisible}
                                    disabled={loading}>
                                    {passwordVisible ? <Eye /> : <EyeOff />}
                                </button>
                            </div>
                        </div>

                        <div className="form-field">
                            <label htmlFor="confirm-new-password">Confirm new password</label>

                            <input
                                id="confirm-new-password"
                                type={passwordVisible ? "text" : "password"}
                                placeholder="********"
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                    setError(null);
                                }}
                                autoComplete="new-password"
                                required
                                minLength={8}
                                disabled={loading}
                            />
                        </div>

                        <button className="auth-submit" type="submit" disabled={loading}>
                            {loading ? "Please wait..." : "Reset password"}
                        </button>
                    </form>
                )}

                {step === "reset" && (
                    <div className="auth-switch">
                        <span>Didn't receive the code?</span>

                        <button type="button" onClick={handleResendCode} disabled={loading}>
                            Resend code
                        </button>
                    </div>
                )}

                <div className="auth-switch">
                    <button type="button" onClick={onBack} disabled={loading}>
                        <ArrowLeft size={16} /> Back to sign in
                    </button>
                </div>
            </div>
        </main>
    );
}

export default ForgotPasswordForm;
