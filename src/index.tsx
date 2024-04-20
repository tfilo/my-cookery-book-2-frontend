import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter } from 'react-router-dom';
import './index.scss';
import App from './App';
import AuthContextProvider from './store/auth-context';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: Infinity
        }
    }
});

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <AuthContextProvider>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </AuthContextProvider>
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    </React.StrictMode>
);
