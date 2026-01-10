import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
                    <h1 className="text-3xl font-bold mb-4 text-red-500">Something went wrong</h1>
                    <div className="bg-gray-800 p-6 rounded-lg max-w-2xl w-full overflow-auto">
                        <h2 className="text-xl font-semibold mb-2">Error:</h2>
                        <pre className="text-red-300 whitespace-pre-wrap mb-4">
                            {this.state.error?.toString()}
                        </pre>
                        <h2 className="text-xl font-semibold mb-2">Component Stack:</h2>
                        <pre className="text-gray-400 text-sm whitespace-pre-wrap">
                            {this.state.errorInfo?.componentStack}
                        </pre>
                    </div>
                    <button
                        className="mt-6 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition"
                        onClick={() => window.location.reload()}
                    >
                        Reload Application
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
