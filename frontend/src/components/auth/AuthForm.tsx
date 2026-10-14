import { useState } from "react";
import VerifyEmailForm from "./VerifyEmailForm";
import "./AuthForm.scss";
import CredentialsForm from "./CredentialsForm";

type AuthFormProps = {
    onAuthSuccess: () => Promise<void>;
};

type View = "sign-in" | "sign-up" | "verify";

function AuthForm({ onAuthSuccess }: AuthFormProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [view, setView] = useState<View>("sign-up");
    const [lastCredentialsView, setLastCredentialsView] = useState<"sign-in" | "sign-up">("sign-up");

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
