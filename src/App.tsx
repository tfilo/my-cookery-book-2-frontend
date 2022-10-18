import React, { Fragment, useContext, useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Button, Container, Nav, Navbar, Offcanvas } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import './App.css';
import { AuthContext } from './store/auth-context';
import HomePage from './pages/HomePage';
import SignInPage from './pages/SignInPage';
import UsersPage from './pages/UsersPage';
import UnitsPage from './pages/UnitsPage';
import TagsPage from './pages/TagsPage';
import ProfilePage from './pages/ProfilePage';
import CategoryPage from './pages/CategoryPage';
import AddRecipePage from './pages/AddRecipePage';
import { authApi } from './utils/apiWrapper';
import { Api } from './openapi';
import UserPage from './pages/UserPage';
import CategoriesPage from './pages/CategoriesPage';
import TagPage from './pages/TagPage';

function App() {
    const authCtx = useContext(AuthContext);
    const isLoggedIn = authCtx.isLoggedIn;
    const [expanded, setExpanded] = useState(false);
    const [userInfo, setUserInfo] = useState<Api.AuthenticatedUser>();

    useEffect(() => {
        if (isLoggedIn) {
            (async () => {
                try {
                    const user = await authApi.user();
                    setUserInfo(user);
                } catch (err) {
                    console.error(err);
                }
            })();
        }
    }, [isLoggedIn]);

    let username = '';
    if (userInfo) {
        username = `${userInfo.firstName ?? ''} ${
            userInfo.lastName ?? ''
        }`.trim();
        if (username === '') {
            username = userInfo.username;
        }
    }

    const openOffcanvas = () => {
        setExpanded(true);
    };

    const closeOffcanvas = () => {
        setExpanded(false);
    };

    const logoutHandler = () => {
        authCtx.logout();
    };

    return (
        <Fragment>
            {isLoggedIn && (
                <Navbar
                    bg='primary'
                    variant='dark'
                    expand={false}
                    expanded={expanded}
                >
                    <Container fluid>
                        <Navbar.Toggle onClick={openOffcanvas} />
                        <Navbar.Brand as={Link} to='/'>
                            Kuchárska kniha
                        </Navbar.Brand>
                        <Button onClick={logoutHandler}>Odhlásiť sa</Button>
                        <Navbar.Offcanvas placement='start'>
                            <Offcanvas.Header
                                closeButton
                                onHide={closeOffcanvas}
                            >
                                <Offcanvas.Title>{username}</Offcanvas.Title>
                            </Offcanvas.Header>
                            <Offcanvas.Body>
                                <Nav>
                                    <Nav.Link
                                        to='/profile'
                                        as={Link}
                                        onClick={closeOffcanvas}
                                    >
                                        Profil
                                    </Nav.Link>
                                    <Nav.Link
                                        to='/users'
                                        as={Link}
                                        onClick={closeOffcanvas}
                                    >
                                        Používatelia
                                    </Nav.Link>
                                    <Nav.Link
                                        to='/categories'
                                        as={Link}
                                        onClick={closeOffcanvas}
                                    >
                                        Kategórie
                                    </Nav.Link>
                                    <Nav.Link
                                        to='/units'
                                        as={Link}
                                        onClick={closeOffcanvas}
                                    >
                                        Jednotky
                                    </Nav.Link>
                                    <Nav.Link
                                        to='/tags'
                                        as={Link}
                                        onClick={closeOffcanvas}
                                    >
                                        Značky
                                    </Nav.Link>
                                    <Nav.Link
                                        to='/addRecipe'
                                        as={Link}
                                        onClick={closeOffcanvas}
                                    >
                                        Pridať recept
                                    </Nav.Link>
                                </Nav>
                            </Offcanvas.Body>
                        </Navbar.Offcanvas>
                    </Container>
                </Navbar>
            )}
            <Container as={'main'} className='py-4'>
                <Routes>
                    {isLoggedIn ? (
                        <Fragment>
                            <Route path='/home' element={<HomePage />} />
                            <Route path='/profile' element={<ProfilePage />} />
                            <Route path='/users' element={<UsersPage />} />
                            <Route path='/user' element={<UserPage />} />
                            <Route path='/user/:id' element={<UserPage />} />
                            <Route
                                path='/categories'
                                element={<CategoriesPage />}
                            />
                            <Route
                                path='/category'
                                element={<CategoryPage />}
                            />
                            <Route
                                path='/category/:id'
                                element={<CategoryPage />}
                            />
                            <Route path='/tags' element={<TagsPage />} />
                            <Route path='/tag' element={<TagPage />} />
                            <Route path='/tag/:id' element={<TagPage />} />
                            <Route path='/units' element={<UnitsPage />} />
                            <Route
                                path='/addRecipe'
                                element={<AddRecipePage />}
                            />
                        </Fragment>
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
