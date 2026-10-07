import { useState } from "react";
import { authClient } from "../../auth";
import "./AuthForm.scss";

type AuthFormProps = { onAuthSuccess: () => Promise<void> };

function AuthForm({ onAuthSuccess }: AuthFormProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSignUp, setIsSignUp] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const result = isSignUp
                ? await authClient.signUp.email({ name: email.split("@")[0] || "User", email, password })
                : await authClient.signIn.email({ email, password });

            if (result.error) {
                setError(result.error.message);
                return;
            }

            await onAuthSuccess();
        } catch (error) {
            console.error("Authentication error:", error);
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };
    function toggleMode() {
        setIsSignUp((prev) => !prev);
        setError(null);
    }
    return (
        <main className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo">S</div> <h1>{isSignUp ? "Create your account" : "Welcome back"}</h1>
                    <p>{isSignUp ? "Start chatting with SmartChat AI." : "Sign in to continue to SmartChat AI."}</p>
                </div>
                <form className="auth-form" onSubmit={handleSubmit}>
                    {error && (
                        <div className="auth-error" role="alert">
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
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            required
                        />
                    </div>
                    <div className="form-field">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete={isSignUp ? "new-password" : "current-password"}
                            required
                        />
                    </div>
                    <button className="auth-submit" type="submit" disabled={loading}>
                        {loading ? "Please wait..." : isSignUp ? "Create account" : "Sign in"}
                    </button>
                </form>
                <div className="auth-switch">
                    <span> {isSignUp ? "Already have an account?" : "Don't have an account?"} </span>
                    <button type="button" onClick={toggleMode}>
                        {isSignUp ? "Sign in" : "Create account"}
                    </button>
                </div>
            </div>
        </main>
    );
}
export default AuthForm;
