import { JwtPayload } from 'jwt-decode';
import { Api } from '../openapi';

export type AuthContextObj = {
    userId: number | null;
    userRoles: Api.User.RoleEnum[];
    isLoggedIn: boolean;
    login: (token: string, refreshToken: string, rememberMe: boolean) => void;
    logout: () => void;
    setHasCookieConsent: (consent: boolean) => void;
    hasCookieConsent: boolean;
};

export type CustomToken = {
    userId: number;
    roles?: string[];
    refresh?: boolean;
} & JwtPayload;