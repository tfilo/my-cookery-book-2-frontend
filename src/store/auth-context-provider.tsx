import React, { useState, useEffect, type PropsWithChildren, useMemo, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { authApi } from '../utils/apiWrapper';
import { formatErrorMessage } from '../utils/errorMessages';
import Modal from '../components/ui/Modal';
import { Api } from '../openapi';
import Welcome from '../components/Welcome';
import { useQueryClient } from '@tanstack/react-query';
import { AuthContextObj, CustomToken } from './auth-context-types';
import { AuthContext } from './auth-context';

const tokenValidity = (token: string | null) => {
    if (token === null) {
        return -1;
    }
    const decoded = jwtDecode<CustomToken>(token);
    if (!decoded.exp) {
        return -1;
    }
    const tokenValidity = decoded.exp * 1000 - Date.now();
    return tokenValidity - 60000;
};

const storedToken = localStorage.getItem('token');
const storedRefreshToken = localStorage.getItem('refreshToken');
window.token = storedToken;

const hasCookieConsentStored = () => {
    try {
        return (
            document.cookie
                .split(';')
                .find((cookie) => cookie.startsWith('CookieConsent'))
                ?.split('=')[1] === 'true'
        );
    } catch {
        console.error('Pri čítaní cookies nastala chyba.');
    }
    return false;
};

const AuthContextProvider: React.FC<PropsWithChildren> = (props) => {
    const queryClient = useQueryClient();
    const [hasCookieConsent, setHasCookieConsent] = useState(hasCookieConsentStored());
    const [token, setToken] = useState(tokenValidity(storedToken) > 0 ? storedToken : null);
    const [refreshToken, setRefreshToken] = useState(tokenValidity(storedRefreshToken) > 0 ? storedRefreshToken : null);
    const [rememberMe, setRememberMe] = useState(!!refreshToken);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>();
    const [userId, setUserId] = useState(() => {
        if (token) {
            const decodedToken = jwtDecode<CustomToken>(token);
            return decodedToken.userId;
        } else {
            return null;
        }
    });
    const userIsLoggedIn = !!token;
    const userRoles = useMemo(() => {
        if (token) {
            return jwtDecode<CustomToken>(token).roles?.map((r) => r as Api.User.RoleEnum) ?? [];
        }
        return [];
    }, [token]);

    const logoutHandler = useCallback(() => {
        setToken(null);
        setRefreshToken(null);
        setUserId(null);
        localStorage.clear();
        delete window.token;
        queryClient.removeQueries({
            queryKey: ['currentUser']
        });
    }, [queryClient]);

    const loginHandler = useCallback(
        (token: string, refreshToken: string, rememberMe: boolean) => {
            setToken(token);
            setRefreshToken(refreshToken);
            setRememberMe(rememberMe);
            const decodedToken = jwtDecode<CustomToken>(token);
            setUserId(decodedToken?.userId);
            if (rememberMe && hasCookieConsent) {
                localStorage.setItem('token', token);
                localStorage.setItem('refreshToken', refreshToken);
            }
            window.token = token;
        },
        [hasCookieConsent]
    );

    const setHasCookieConsentHandler = useCallback((consent: boolean) => {
        if (!consent) {
            // remove cookies and clear localStorage
            document.cookie = 'CookieConsent=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; samesite=lax';
            localStorage.clear();
        } else if (!hasCookieConsentStored()) {
            // set new cookie valid for one year if not set yet by cookie consent banner
            document.cookie = 'CookieConsent=true; max-age=31536000; path=/; samesite=lax';
        }
        setHasCookieConsent(consent);
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        const tokenIsValid = tokenValidity(token) > 0;
        const refreshTokenIsValid = tokenValidity(refreshToken) > 0;
        if (tokenIsValid && refreshTokenIsValid) {
            const interval = setTimeout(() => {
                (async () => {
                    if (refreshToken) {
                        try {
                            const data = await authApi.refreshToken(
                                {
                                    refreshToken
                                },
                                { signal: controller.signal }
                            );
                            if (data) {
                                loginHandler(data.token, data.refreshToken, rememberMe);
                            }
                            if (!data) {
                                logoutHandler();
                            }
                        } catch (err) {
                            formatErrorMessage(err).then((message) => setError(message));
                        }
                    }
                })();
            }, tokenValidity(token));
            setIsLoading(false);
            return () => {
                clearInterval(interval);
            };
        } else if (refreshTokenIsValid) {
            (async () => {
                if (refreshToken) {
                    try {
                        const data = await authApi.refreshToken(
                            {
                                refreshToken
                            },
                            { signal: controller.signal }
                        );
                        if (data) {
                            loginHandler(data.token, data.refreshToken, rememberMe);
                        }
                        if (!data) {
                            logoutHandler();
                        }
                    } catch (err) {
                        formatErrorMessage(err).then((message) => setError(message));
                    } finally {
                        setIsLoading(false);
                    }
                }
            })();
        } else {
            logoutHandler();
            setIsLoading(false);
        }
        return () => controller.abort();
    }, [token, refreshToken, userId, rememberMe, logoutHandler, loginHandler]);

    const contextValue: AuthContextObj = useMemo(
        () => ({
            userId: userId,
            userRoles,
            isLoggedIn: userIsLoggedIn,
            login: loginHandler,
            logout: logoutHandler,
            hasCookieConsent,
            setHasCookieConsent: setHasCookieConsentHandler
        }),
        [hasCookieConsent, loginHandler, logoutHandler, setHasCookieConsentHandler, userId, userIsLoggedIn, userRoles]
    );

    return (
        <>
            <Welcome show={isLoading} />
            <AuthContext.Provider value={contextValue}>{props.children}</AuthContext.Provider>
            <Modal
                show={!!error}
                message={error}
                type='error'
                onClose={() => {
                    setError(undefined);
                }}
            />
        </>
    );
};

export default AuthContextProvider;
