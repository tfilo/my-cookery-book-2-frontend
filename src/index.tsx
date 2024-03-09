import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import App from './App';
import AuthContextProvider from './store/auth-context';
import { BrowserRouter } from 'react-router-dom';
import { BookmarkContextProvider } from './store/bookmark-context';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <React.StrictMode>
        <AuthContextProvider>
            <BrowserRouter>
                <BookmarkContextProvider>
                    <App />
                </BookmarkContextProvider>
            </BrowserRouter>
        </AuthContextProvider>
    </React.StrictMode>
);
