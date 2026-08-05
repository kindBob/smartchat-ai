import Chat from "../components/Chat";
import Sidebar from "../components/Sidebar";

import "./Home.scss";

function Home() {
    return (
        <main className="home">
            <Sidebar />
            <Chat />
        </main>
    );
}

export default Home;
