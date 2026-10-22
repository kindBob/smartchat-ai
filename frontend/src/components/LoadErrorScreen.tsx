type LoadErrorScreen = {
    message: string;
    onRetry: () => void;
};

function LoadErrorScreen({ message, onRetry }: LoadErrorScreen) {
    return (
        <main className="home-loading">
            <div className="loading-logo">S</div>
            <p className="chat-error">
                {message}
                <button onClick={onRetry}>Try Again</button>
            </p>
        </main>
    );
}

export default LoadErrorScreen;
