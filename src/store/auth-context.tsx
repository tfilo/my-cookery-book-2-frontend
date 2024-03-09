import React, { useState, useEffect, PropsWithChildren, useMemo, useCallback } from 'react';
// eslint-disable-next-line camelcase
import jwt_decode, { JwtPayload } from 'jwt-decode';
import { authApi } from '../utils/apiWrapper';
import { formatErrorMessage } from '../utils/errorMessages';
import Modal from '../components/UI/Modal';
import { Api } from '../openapi';
import Welcome from '../components/Welcome';
import { useQueryClient } from '@tanstack/react-query';

type AuthContextObj = {
    userId: number | null;
    userRoles: Api.User.RoleEnum[];
    isLoggedIn: boolean;
    login: (token: string, refreshToken: string, rememberMe: boolean) => void;
    logout: () => void;
};

type CustomToken = {
    userId: number;
    roles?: string[];
    refresh?: boolean;
} & JwtPayload;

export const AuthContext = React.createContext<AuthContextObj>({
    userId: null,
    userRoles: [],
    isLoggedIn: false,
    login: () => {},
    logout: () => {}
});

const tokenValidity = (token: string | null) => {
    if (token === null) {
        return -1;
    }
    const decoded = jwt_decode<CustomToken>(token);
    if (!decoded.exp) {
        return -1;
    }
    const tokenValidity = decoded.exp * 1000 - Date.now();
    return tokenValidity - 60000;
};

const storedToken = localStorage.getItem('token');
const storedRefreshToken = localStorage.getItem('refreshToken');
// @ts-ignore
window.token = storedToken;

const AuthContextProvider: React.FC<PropsWithChildren> = (props) => {
    const queryClient = useQueryClient();
    const [token, setToken] = useState(tokenValidity(storedToken) > 0 ? storedToken : null);
    const [refreshToken, setRefreshToken] = useState(tokenValidity(storedRefreshToken) > 0 ? storedRefreshToken : null);
    const [rememberMe, setRememberMe] = useState(!!refreshToken);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>();
    const [userId, setUserId] = useState(() => {
        if (token) {
            const decodedToken = jwt_decode<CustomToken>(token);
            return decodedToken.userId;
        } else {
            return null;
        }
    });
    const userIsLoggedIn = !!token;
    const userRoles = useMemo(() => {
        if (token) {
            return jwt_decode<CustomToken>(token).roles?.map((r) => r as Api.User.RoleEnum) ?? [];
        }
        return [];
    }, [token]);

    const logoutHandler = useCallback(() => {
        setToken(null);
        setRefreshToken(null);
        setUserId(null);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        // @ts-ignore
        delete window.token;
        queryClient.removeQueries({
            queryKey: ['currentUser']
        });
    }, [queryClient]);

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
    }, [token, refreshToken, userId, rememberMe, logoutHandler]);

    const loginHandler = (token: string, refreshToken: string, rememberMe: boolean) => {
        setToken(token);
        setRefreshToken(refreshToken);
        setRememberMe(rememberMe);
        const decodedToken = jwt_decode<CustomToken>(token);
        setUserId(decodedToken?.userId);
        if (rememberMe) {
            localStorage.setItem('token', token);
            localStorage.setItem('refreshToken', refreshToken);
        }
        // @ts-ignore
        window.token = token;
    };

    const contextValue: AuthContextObj = {
        userId: userId,
        userRoles,
        isLoggedIn: userIsLoggedIn,
        login: loginHandler,
        logout: logoutHandler
    };

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
