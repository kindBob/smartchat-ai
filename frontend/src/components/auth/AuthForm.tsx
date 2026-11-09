import { useState } from "react";
import { getOAuthErrorCode } from "../../utils/authHelpers";
import VerifyEmailForm from "./VerifyEmailForm";
import "./AuthForm.scss";
import CredentialsForm from "./CredentialsForm";
import ForgotPasswordForm from "./ForgotPasswordForm";

type AuthFormProps = {
    onAuthSuccess: () => Promise<void>;
};

type CredentialsView = "sign-in" | "sign-up";
type View = CredentialsView | "verify" | "forgot-password";

// A Google sign-in rejected for an existing email should land where "Forgot password?" is available
function getInitialView(): CredentialsView {
    return getOAuthErrorCode() === "account_not_linked" ? "sign-in" : "sign-up";
}

function AuthForm({ onAuthSuccess }: AuthFormProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [view, setView] = useState<View>(getInitialView);
    const [lastCredentialsView, setLastCredentialsView] = useState<CredentialsView>(getInitialView);

    if (view === "forgot-password") {
        return (
            <ForgotPasswordForm
                email={email}
                onEmailChange={setEmail}
                onAuthSuccess={onAuthSuccess}
                onBack={() => {
                    setView("sign-in");
                    setLastCredentialsView("sign-in");
                }}
            />
        );
    }

    if (view === "verify") {
        return (
            <VerifyEmailForm
                email={email}
                password={password}
                onAuthSuccess={onAuthSuccess}
                onBackToAuth={() => {
                    setPassword("");
                    setView("sign-in");
                }}
                onBack={() => {
                    setPassword("");
                    setView(lastCredentialsView);
                }}
            />
        );
    }

    return (
        <CredentialsForm
            view={view}
            email={email}
            password={password}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onForgotPassword={() => {
                setPassword("");
                setView("forgot-password");
            }}
            onToggleView={() => {
                const newView = view === "sign-in" ? "sign-up" : "sign-in";
                setView(newView);
                setLastCredentialsView(newView);
            }}
            onStartVerification={(normalizedEmail) => {
                setEmail(normalizedEmail);
                setView("verify");
            }}
            onAuthSuccess={onAuthSuccess}
        />
    );
}

export default AuthForm;
