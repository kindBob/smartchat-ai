import { useState } from "react";
import { authClient } from "../../auth";
import "./AuthForm.scss";
import { Eye, EyeOff } from "lucide-react";

type AuthFormProps = {
    onAuthSuccess: () => Promise<void>;
};

function AuthForm({ onAuthSuccess }: AuthFormProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [isSignUp, setIsSignUp] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();

        if (loading) return;

        setError(null);

        const normalizedEmail = email.trim();

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

        if (isSignUp && password.length < 8) {
            setError("Your password must contain at least 8 characters.");
            return;
        }

        setLoading(true);

        try {
            isSignUp
                ? await authClient.signUp.email({
                      name: normalizedEmail.split("@")[0] || "User",
                      email: normalizedEmail,
                      password,
                  })
                : await authClient.signIn.email({
                      email: normalizedEmail,
                      password,
                  });

            await onAuthSuccess();
        } catch (err) {
            console.error("Authentication error:", err);

            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    }

    function toggleMode() {
        if (loading) return;

        setIsSignUp((prev) => !prev);
        setError(null);
        setPassword("");
    }

    return (
        <main className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo">S</div>

                    <h1>{isSignUp ? "Create your account" : "Welcome back"}</h1>

                    <p>{isSignUp ? "Start chatting with SmartChat AI." : "Sign in to continue to SmartChat AI."}</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit} noValidate>
                    {error && (
                        <div className="auth-error" role="alert" aria-live="polite">
                            {error}
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
                                setEmail(e.target.value);
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
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setError(null);
                                }}
                                autoComplete={isSignUp ? "new-password" : "current-password"}
                                required
                                minLength={isSignUp ? 8 : undefined}
                                disabled={loading}
                            />

                            <button
                                className="show-password"
                                type="button"
                                onClick={() => setPasswordVisible((prev) => !prev)}
                                aria-label={passwordVisible ? "Hide password" : "Show password"}
                                aria-pressed={passwordVisible}
                                disabled={loading}>
                                {passwordVisible ? <EyeOff /> : <Eye />}
                            </button>
                        </div>
                    </div>

                    <button className="auth-submit" type="submit" disabled={loading}>
                        {loading ? "Please wait..." : isSignUp ? "Create account" : "Sign in"}
                    </button>
                </form>

                <div className="auth-switch">
                    <span>{isSignUp ? "Already have an account?" : "Don't have an account?"}</span>

                    <button type="button" onClick={toggleMode} disabled={loading}>
                        {isSignUp ? "Sign in" : "Create account"}
                    </button>
                </div>
            </div>
        </main>
    );
}

export default AuthForm;
