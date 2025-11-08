export default function Error({ error }) {
    return (
        <div className="flex items-center justify-center h-screen bg-red-100">
            <div className="bg-white p-6 rounded shadow-md w-96">
                <h1 className="text-2xl font-bold mb-4 text-red-600">Error</h1>
                <p>{error}</p>
            </div>
        </div>
    );
}

Error.getInitialProps = ({ query }) => {
    return {
        error: query.error || "Unknown error occurred",
    };
};