import React, { useContext, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { useQuery } from '@tanstack/react-query';
import { authApi } from '../utils/apiWrapper';
import { formatErrorMessage } from '../utils/errorMessages';
import Navigation from './Navigation';
import CookieConsent from './CookieConsent';
import Spinner from './ui/Spinner';
import Modal from './ui/Modal';
import { AuthContext } from '../store/auth-context';

const Base: React.FC = () => {
    const { isLoggedIn } = useContext(AuthContext);

    const [error, setError] = useState<string>();

    const {
        data: userInfo,
        isFetching: isFetchingUserInfo,
        error: userInfoError
    } = useQuery({
        queryKey: ['currentUser'],
        queryFn: ({ signal }) => authApi.user({ signal }),
        enabled: isLoggedIn
    });

    useEffect(() => {
        if (userInfoError) {
            formatErrorMessage(userInfoError).then((message) => setError(message));
        }
    }, [userInfoError]);

    let username = `${userInfo?.firstName ?? ''} ${userInfo?.lastName ?? ''}`.trim();
    if (!username) {
        username = userInfo?.username ?? '';
    }

    return (
        <>
            <CookieConsent />
            <Navigation
                isLoggedIn={isLoggedIn}
                username={username}
            />

            <React.Suspense fallback={<Spinner show={true} />}>
                <Container
                    as={'main'}
                    className='py-4'
                >
                    <Outlet />
                </Container>
            </React.Suspense>
            <Modal
                show={!!error}
                message={error}
                type='error'
                onClose={() => {
                    setError(undefined);
                }}
            />
            <Spinner show={isFetchingUserInfo} />
        </>
    );
};

export default Base;
