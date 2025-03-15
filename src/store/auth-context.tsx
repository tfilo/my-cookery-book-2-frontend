import React from 'react';
import { AuthContextObj } from './auth-context-types';

export const AuthContext = React.createContext<AuthContextObj>({
    userId: null,
    userRoles: [],
    isLoggedIn: false,
    login: () => {},
    logout: () => {},
    setHasCookieConsent: () => {},
    hasCookieConsent: false
});
