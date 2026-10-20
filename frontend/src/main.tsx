import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { Toaster } from "sonner";
import "./index.scss";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <App />
        <Toaster
            className="toaster"
            theme="light"
            position="top-center"
            duration={3000}
            visibleToasts={3}
            style={
                {
                    "--normal-bg": "#2a2a2a",
                    "--normal-text": "#fff",
                    "--normal-border": "rgba(255, 255, 255, 0.08)",
                    "--error-bg": "#2a2a2a",
                    "--error-text": "#fff",
                    "--error-border": "rgba(218, 131, 89, 0.5)",
                } as React.CSSProperties
            }
        />
    </StrictMode>,
);
