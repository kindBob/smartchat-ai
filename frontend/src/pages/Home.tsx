import Message from "../components/Message";

function Home() {
    return (
        <main>
            <h1>SmartChat AI</h1>
            <p>What can I help you with?</p>
            <Message text="nigga" sender="assistant" />
        </main>
    );
}

export default Home;
