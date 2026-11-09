import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { authClient } from "../../auth";
import { clearOAuthErrorFromUrl, getOAuthErrorMessage, sendVerificationCode } from "../../utils/authHelpers";
import { getErrorMessage } from "../../utils/getErrorMessage";
import AuthMessages from "./AuthMessages";
import GoogleSignInButton from "./GoogleSignInButton";

type CredentialsFormProps = {
    view: "sign-in" | "sign-up";
    email: string;
    password: string;
    onEmailChange: (email: string) => void;
    onPasswordChange: (password: string) => void;
    onForgotPassword: () => void;
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
    onForgotPassword,
    onToggleView,
    onStartVerification,
    onAuthSuccess,
}: CredentialsFormProps) {
    const [loading, setLoading] = useState(false);
    const [redirecting, setRedirecting] = useState(false);
    const [error, setError] = useState<string | null>(getOAuthErrorMessage);
    const [success, setSuccess] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState("");

    const busy = loading || redirecting;

    useEffect(() => {
        clearOAuthErrorFromUrl();

        // Going back from Google can restore this page from the browser's cache with the form still disabled
        function handlePageShow(e: PageTransitionEvent) {
            if (e.persisted) setRedirecting(false);
        }

        window.addEventListener("pageshow", handlePageShow);

        return () => window.removeEventListener("pageshow", handlePageShow);
    }, []);

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();

        if (busy) return;

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

    async function handleGoogleSignIn() {
        if (busy) return;

        setError(null);
        setSuccess(null);
        setRedirecting(true);

        try {
            const result = await authClient.signIn.social({
                provider: "google",
                callbackURL: window.location.origin,
                errorCallbackURL: window.location.origin,
            });

            if (result.error) {
                setError(result.error.message || "Could not sign in with Google.");
                setRedirecting(false);
            }

            // On success the browser is leaving the page, so the button stays in its redirecting state
        } catch (err) {
            console.error("Google sign-in error:", err);

            setError(getErrorMessage(err, "Could not sign in with Google."));
            setRedirecting(false);
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

                <GoogleSignInButton onClick={handleGoogleSignIn} disabled={busy} redirecting={redirecting} />

                <div className="auth-divider">or</div>

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
                                disabled={busy}
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
                            disabled={busy}
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
                                disabled={busy}
                            />

                            <button
                                className="show-password"
                                type="button"
                                onClick={() => setPasswordVisible((prev) => !prev)}
                                aria-label={passwordVisible ? "Hide password" : "Show password"}
                                aria-pressed={passwordVisible}
                                disabled={busy}>
                                {passwordVisible ? <Eye /> : <EyeOff />}
                            </button>
                        </div>

                        {view === "sign-in" && (
                            <button className="auth-forgot" type="button" onClick={onForgotPassword} disabled={busy}>
                                Forgot password?
                            </button>
                        )}
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
                                    disabled={busy}
                                />

                                <button
                                    className="show-password"
                                    type="button"
                                    onClick={() => setConfirmPasswordVisible((prev) => !prev)}
                                    aria-label={confirmPasswordVisible ? "Hide password" : "Show password"}
                                    aria-pressed={confirmPasswordVisible}
                                    disabled={busy}>
                                    {confirmPasswordVisible ? <Eye /> : <EyeOff />}
                                </button>
                            </div>
                        </div>
                    )}

                    <button className="auth-submit" type="submit" disabled={busy}>
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
                        disabled={busy}>
                        {view === "sign-up" ? "Sign in" : "Create account"}
                    </button>
                </div>
            </div>
        </main>
    );
}

export default CredentialsForm;
