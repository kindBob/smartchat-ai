import AuthForm from "./components/auth/AuthForm";
import { useAuth } from "./hooks/useAuth";
import Home from "./pages/Home";

function App() {
    const { session, user, loading, signOut, refreshSession } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!session || !user) {
        return <AuthForm onAuthSuccess={refreshSession} />;
    }

    return (
        <>
            <button onClick={signOut}> Sign Out</button>
            <Home />
        </>
    );
}

export default App;
