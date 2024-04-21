import { Outlet } from 'react-router-dom';
import CookieConsent from './cookieConsent/CookieConsent';
import Navigation from './navigation/Navigation';
import Modal from './ui/Modal';
import Spinner from './ui/Spinner';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../store/auth-context';
import { useQuery } from '@tanstack/react-query';
import { authApi } from '../utils/apiWrapper';
import { formatErrorMessage } from '../utils/errorMessages';
import { Container } from 'react-bootstrap';

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
            <Container
                as={'main'}
                className='py-4'
            >
                <Outlet />
            </Container>
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
