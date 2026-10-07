import { useState } from "react";
import { authClient } from "../../auth";

type AuthFormProps = {
    onAuthSuccess: () => Promise<void>;
};

function AuthForm({ onAuthSuccess }: AuthFormProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSignUp, setIsSignUp] = useState(true);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();

        setLoading(true);

        const result = isSignUp
            ? await authClient.signUp.email({
                  name: email.split("@")[0] || "User",
                  email,
                  password,
              })
            : await authClient.signIn.email({
                  email,
                  password,
              });

        setLoading(false);

        if (result.error) {
            alert(result.error.message);
            return;
        }

        onAuthSuccess();
    };

    return (
        <form onSubmit={handleSubmit}>
            <h1>{isSignUp ? "Sign Up" : "Sign In"}</h1>

            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />

            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />

            <button type="submit" disabled={loading}>
                {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
            </button>

            <p>
                {isSignUp ? (
                    <>
                        Already have an account?{" "}
                        <button type="button" onClick={() => setIsSignUp(false)}>
                            Sign in
                        </button>
                    </>
                ) : (
                    <>
                        Don't have an account?{" "}
                        <button type="button" onClick={() => setIsSignUp(true)}>
                            Sign up
                        </button>
                    </>
                )}
            </p>
        </form>
    );
}

export default AuthForm;
