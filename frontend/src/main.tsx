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
            theme="dark"
            position="top-center"
            duration={3000}
            visibleToasts={3}
            closeButton
            toastOptions={{
                style: {
                    textAlign: "center",
                },
            }}
            style={
                {
                    "--normal-bg": "#1a0000",
                    "--normal-text": "#ff1515",
                    "--normal-border": "#ff1515",
                    "--error-bg": "#1a0000",
                    "--error-text": "#ff1515",
                    "--error-border": "#ff1515",
                } as React.CSSProperties
            }
        />
    </StrictMode>,
);
