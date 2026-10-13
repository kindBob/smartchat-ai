type AuthMessagesProps = {
    error: string | null;
    success: string | null;
};

function AuthMessages({ error, success }: AuthMessagesProps) {
    return (
        <>
            {error && (
                <div className="auth-error" role="alert">
                    {error}
                </div>
            )}
            {success && (
                <div className="auth-success" role="status">
                    {success}
                </div>
            )}
        </>
    );
}

export default AuthMessages;
