import { ArrowLeft, X } from "lucide-react";
import { useState } from "react";
import { getErrorMessage, sendVerificationCode } from "../../utils/authHelpers";
import { authClient } from "../../auth";
import AuthMessages from "./AuthMessages";

type VerifyEmailFormProps = {
    email: string;
    password: string;
    onAuthSuccess: () => Promise<void>;
    onBackToAuth: () => void;
    onBack: () => void;
};

function VerifyEmailForm({ email, password, onAuthSuccess, onBackToAuth, onBack }: VerifyEmailFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [otp, setOtp] = useState<string>("");

    async function handleVerifyEmail(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();

        if (loading) return;

        setError(null);
        setSuccess(null);

        const normalizedEmail = email.trim().toLowerCase();
        const normalizedOtp = otp.trim();

        if (!/^\d{6}$/.test(normalizedOtp)) {
            setError("Please enter the complete 6-digit verification code.");
            return;
        }

        setLoading(true);

        try {
            const result = await authClient.emailOtp.verifyEmail({
                email: normalizedEmail,
                otp: normalizedOtp,
            });

            if (result.error) {
                setError(result.error.message || "Invalid or expired verification code.");
                return;
            }

            if (!result.data?.status) {
                setError("Email verification was unsuccessful. Please try again.");
                return;
            }

            setSuccess("Your email has been verified. Signing you in...");

            const signInResult = await authClient.signIn.email({
                email: normalizedEmail,
                password,
            });

            if (signInResult.error) {
                setSuccess(null);
                setError("Your email is verified, but automatic sign-in failed. Please sign in manually.");
                return;
            }

            await onAuthSuccess();
        } catch (err) {
            console.error("Email verification error:", err);

            setError(getErrorMessage(err, "Verification failed. Please try again."));
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
            await sendVerificationCode(email);

            setOtp("");
            setSuccess("A new verification code has been sent to your email.");
        } catch (err) {
            console.error("Resend verification code error:", err);

            setError(getErrorMessage(err, "Could not resend a code. Please try again."));
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <button type="button" onClick={onBack} className="close" disabled={loading}>
                        <X size={24} />
                    </button>

                    <div className="auth-logo">S</div>

                    <h1>Verify your email</h1>

                    <p>
                        Enter the 6-digit code we sent to <strong>{email}</strong>
                    </p>
                </div>

                <form className="auth-form" onSubmit={handleVerifyEmail} noValidate>
                    <AuthMessages error={error} success={success} />

                    <div className="form-field">
                        <label htmlFor="otp">Verification code</label>

                        <input
                            id="otp"
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
                            pattern="[0-9]{6}"
                            required
                            disabled={loading}
                            autoFocus
                        />
                    </div>

                    <button className="auth-submit" type="submit" disabled={loading || otp.length !== 6}>
                        {loading ? "Please wait..." : "Verify email"}
                    </button>
                </form>

                <div className="auth-switch">
                    <span>Didn't receive the code?</span>

                    <button type="button" onClick={handleResendCode} disabled={loading}>
                        Resend code
                    </button>
                </div>

                <div className="auth-switch --vertical">
                    <span>Already have an account?</span>

                    <button type="button" onClick={onBackToAuth} disabled={loading}>
                        <ArrowLeft size={16} /> Back to sign in
                    </button>
                </div>
            </div>
        </main>
    );
}

export default VerifyEmailForm;
