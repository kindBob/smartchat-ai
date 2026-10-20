import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { authClient } from "../../auth";
import { sendVerificationCode } from "../../utils/authHelpers";
import { getErrorMessage } from "../../utils/getErrorMessage";
import AuthMessages from "./AuthMessages";

type CredentialsFormProps = {
    view: "sign-in" | "sign-up";
    email: string;
    password: string;
    onEmailChange: (email: string) => void;
    onPasswordChange: (password: string) => void;
    onToggleView: () => void;
    onStartVerification: (normalizedEmail: string) => void;
    onAuthSuccess: () => Promise<void>;
};

function CredentialsForm({
    view,
    email,
    password,
    onEmailChange,
    onPasswordChange,
    onToggleView,
    onStartVerification,
    onAuthSuccess,
}: CredentialsFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState("");

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();

        if (loading) return;

        setError(null);
        setSuccess(null);

        const normalizedEmail = email.trim().toLowerCase();

        if (!normalizedEmail) {
            setError("Please enter your email address.");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            setError("Please enter a valid email address.");
            return;
        }

        if (!password) {
            setError("Please enter your password.");
            return;
        }

        if (view === "sign-up") {
            if (password.length < 8) {
                setError("Your password must contain at least 8 characters.");
                return;
            }

            if (password !== confirmPassword) {
                setError("Passwords don't match.");
                return;
            }
        }

        setLoading(true);

        try {
            if (view === "sign-up") {
                const result = await authClient.signUp.email({
                    name,
                    email: normalizedEmail,
                    password,
                });

                if (result.error) {
                    setError(result.error.message || "Could not create your account.");
                    return;
                }

                onStartVerification(normalizedEmail);

                return;
            }

            const result = await authClient.signIn.email({
                email: normalizedEmail,
                password,
            });

            if (result.error) {
                setError(result.error.message || "Authentication failed.");
                return;
            }

            await onAuthSuccess();
        } catch (err) {
            console.error("Authentication error:", err);

            const message = getErrorMessage(err, "Something went wrong.");

            const emailVerificationRequired = message.toLowerCase().includes("email verification required");

            if (emailVerificationRequired) {
                try {
                    await sendVerificationCode(normalizedEmail);

                    onStartVerification(normalizedEmail);

                    return;
                } catch (otpError) {
                    console.error("Could not send verification code:", otpError);

                    setError(getErrorMessage(otpError, "Could not send verification code."));

                    return;
                }
            }

            setError(message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo">S</div>

                    <h1>{view === "sign-up" ? "Create your account" : "Welcome back"}</h1>

                    <p>
                        {view === "sign-up"
                            ? "Start chatting with SmartChat AI."
                            : "Sign in to continue with SmartChat AI."}
                    </p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit} noValidate>
                    <AuthMessages error={error} success={success} />
                    {view === "sign-up" && (
                        <div className="form-field">
                            <label htmlFor="name">Name</label>

                            <input
                                id="name"
                                type="text"
                                placeholder="John"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    setError(null);
                                }}
                                autoComplete="name"
                                autoCapitalize="words"
                                spellCheck={false}
                                required
                                disabled={loading}
                            />
                        </div>
                    )}

                    <div className="form-field">
                        <label htmlFor="email">Email</label>

                        <input
                            id="email"
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
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="password">Password</label>

                        <div className="password-input-wrapper">
                            <input
                                id="password"
                                type={passwordVisible ? "text" : "password"}
                                placeholder="********"
                                value={password}
                                onChange={(e) => {
                                    onPasswordChange(e.target.value);
                                    setError(null);
                                }}
                                autoComplete={view === "sign-up" ? "new-password" : "current-password"}
                                required
                                minLength={view === "sign-up" ? 8 : undefined}
                                disabled={loading}
                            />

                            <button
                                className="show-password"
                                type="button"
                                onClick={() => setPasswordVisible((prev) => !prev)}
                                aria-label={passwordVisible ? "Hide password" : "Show password"}
                                aria-pressed={passwordVisible}
                                disabled={loading}>
                                {passwordVisible ? <Eye /> : <EyeOff />}
                            </button>
                        </div>
                    </div>

                    {view === "sign-up" && (
                        <div className="form-field">
                            <label htmlFor="confirm-password">Confirm Password</label>

                            <div className="password-input-wrapper">
                                <input
                                    id="confirm-password"
                                    type={confirmPasswordVisible ? "text" : "password"}
                                    placeholder="********"
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value);
                                        setError(null);
                                    }}
                                    autoComplete={"new-password"}
                                    required
                                    minLength={8}
                                    disabled={loading}
                                />

                                <button
                                    className="show-password"
                                    type="button"
                                    onClick={() => setConfirmPasswordVisible((prev) => !prev)}
                                    aria-label={confirmPasswordVisible ? "Hide password" : "Show password"}
                                    aria-pressed={confirmPasswordVisible}
                                    disabled={loading}>
                                    {confirmPasswordVisible ? <Eye /> : <EyeOff />}
                                </button>
                            </div>
                        </div>
                    )}

                    <button className="auth-submit" type="submit" disabled={loading}>
                        {loading ? "Please wait..." : view === "sign-up" ? "Create account" : "Sign in"}
                    </button>
                </form>

                <div className="auth-switch">
                    <span>{view === "sign-up" ? "Already have an account?" : "Don't have an account?"}</span>

                    <button
                        type="button"
                        onClick={() => {
                            setError(null);
                            onToggleView();
                        }}
                        disabled={loading}>
                        {view === "sign-up" ? "Sign in" : "Create account"}
                    </button>
                </div>
            </div>
        </main>
    );
}

export default CredentialsForm;
