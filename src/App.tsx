import React, { Fragment, useContext } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Container, Navbar, Offcanvas } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import './App.css';
import { AuthContext } from './store/auth-context';
import HomePage from './pages/HomePage';
import SignInPage from './pages/SignInPage';

function App() {
    const authCtx = useContext(AuthContext);
    const isLoggedIn = authCtx.isLoggedIn;

    return (
        <Fragment>
            {isLoggedIn && (
                <Navbar bg='primary' variant='dark' expand={false}>
                    <Container fluid>
                        <Navbar.Toggle />
                        <Navbar.Brand as={Link} to='/'>
                            Kuchárska kniha
                        </Navbar.Brand>
                        <Navbar.Offcanvas placement='start'>
                            <Offcanvas.Header closeButton>
                                <Offcanvas.Title>TODO - meno prihlaseneho ?</Offcanvas.Title>
                            </Offcanvas.Header>
                            <Offcanvas.Body>TODO - polozky menu</Offcanvas.Body>
                        </Navbar.Offcanvas>
                    </Container>
                </Navbar>
            )}
            <Container as={'main'}>
                <Routes>
                    {isLoggedIn ? (
                        <Route path='/home' element={<HomePage />} />
                    ) : (
                        <Route path='/signIn' element={<SignInPage />} />
                    )}

                    <Route
                        path='*'
                        element={
                            <Navigate
                                replace
                                to={isLoggedIn ? '/home' : '/signIn'}
                            />
                        }
                    />
                </Routes>
            </Container>
        </Fragment>
    );
}

export default App;
