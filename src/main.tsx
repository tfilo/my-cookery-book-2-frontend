import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import './main.scss';
import App from './App';
import AuthContextProvider from './store/auth-context-provider';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: Infinity
        }
    }
});

const rootElement = document.getElementById('root')!;
createRoot(rootElement).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <AuthContextProvider>
                <App />
            </AuthContextProvider>
            <ReactQueryDevtools
                initialIsOpen={false}
                buttonPosition='bottom-left'
            />
        </QueryClientProvider>
    </StrictMode>
);
