import { AuthForm } from "@neondatabase/auth/react";
import { useAuth } from "./hooks/useAuth";
import Home from "./pages/Home";

function App() {
    const { session, user, loading, signOut } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!session || !user) {
        return <AuthForm />;
    }

    return (
        <>
            <button onClick={signOut}> Sign Out</button> <Home />
        </>
    );
}

export default App;
