import React, { Fragment, useContext, useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Button, Container, Nav, Navbar, Offcanvas } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import './App.css';
import { AuthContext } from './store/auth-context';
import SignInPage from './pages/SignInPage';
import UsersPage from './pages/UsersPage';
import UnitsPage from './pages/UnitsPage';
import TagsPage from './pages/TagsPage';
import ProfilePage from './pages/ProfilePage';
import CategoryPage from './pages/CategoryPage';
import RecipePage from './pages/RecipePage';
import { authApi, categoryApi } from './utils/apiWrapper';
import { Api } from './openapi';
import UserPage from './pages/UserPage';
import CategoriesPage from './pages/CategoriesPage';
import TagPage from './pages/TagPage';
import UnitCategoryPage from './pages/UnitCategoryPage';
import UnitPage from './pages/UnitPage';
import RecipesPage from './pages/RecipesPage';
import RecipeViewPage from './pages/RecipeViewPage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faList,
    faPizzaSlice,
    faScaleBalanced,
    faTags,
    faUser,
    faUsers,
    faUtensils,
} from '@fortawesome/free-solid-svg-icons';

function App() {
    const authCtx = useContext(AuthContext);
    const isLoggedIn = authCtx.isLoggedIn;
    const [expanded, setExpanded] = useState(false);
    const [userInfo, setUserInfo] = useState<Api.AuthenticatedUser>();
    const [listOfCategories, setListOfCategories] = useState<
        Api.SimpleCategory[]
    >([]);

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

    useEffect(() => {
        if (isLoggedIn) {
            (async () => {
                try {
                    const categories = await categoryApi.getCategories();
                    setListOfCategories(categories);
                } catch (err) {
                    console.error(err);
                }
            })();
        }
    }, [isLoggedIn]);

    let username = `${userInfo?.firstName ?? ''} ${
        userInfo?.lastName ?? ''
    }`.trim();
    if (!username) {
        username = userInfo?.username ?? '';
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
                        <Navbar.Brand as={Link} to='/recipes'>
                            Kuchárska kniha
                        </Navbar.Brand>
                        <Button onClick={logoutHandler}>Odhlásiť sa</Button>
                        <Navbar.Offcanvas placement='start' onHide={closeOffcanvas}>
                            <Offcanvas.Header
                                closeButton
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
                                        <FontAwesomeIcon icon={faUser} /> Profil
                                    </Nav.Link>
                                    <Nav.Link
                                        to='/users'
                                        as={Link}
                                        onClick={closeOffcanvas}
                                    >
                                        <FontAwesomeIcon icon={faUsers} />{' '}
                                        Používatelia
                                    </Nav.Link>
                                    <Nav.Link
                                        to='/categories'
                                        as={Link}
                                        onClick={closeOffcanvas}
                                    >
                                        <FontAwesomeIcon icon={faList} />{' '}
                                        Kategórie
                                    </Nav.Link>
                                    <Nav.Link
                                        to='/units'
                                        as={Link}
                                        onClick={closeOffcanvas}
                                    >
                                        <FontAwesomeIcon
                                            icon={faScaleBalanced}
                                        />{' '}
                                        Jednotky
                                    </Nav.Link>
                                    <Nav.Link
                                        to='/tags'
                                        as={Link}
                                        onClick={closeOffcanvas}
                                    >
                                        <FontAwesomeIcon icon={faTags} /> Značky
                                    </Nav.Link>
                                    <Nav.Link
                                        to='/recipe/create'
                                        as={Link}
                                        onClick={closeOffcanvas}
                                    >
                                        <FontAwesomeIcon icon={faPizzaSlice} />{' '}
                                        Pridať recept
                                    </Nav.Link>
                                    <hr />
                                    <Nav.Link
                                        to='/recipes'
                                        as={Link}
                                        onClick={closeOffcanvas}
                                    >
                                        <FontAwesomeIcon icon={faUtensils} />{' '}
                                        Všetky recepty
                                    </Nav.Link>
                                    <hr />
                                    {listOfCategories.map((category) => (
                                        <Nav.Link
                                            to={`/recipes/${category.id}`}
                                            as={Link}
                                            onClick={closeOffcanvas}
                                            key={category.id}
                                        >
                                            {category.name}
                                        </Nav.Link>
                                    ))}
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
                                path='/unit/:categoryId/'
                                element={<UnitPage />}
                            />
                            <Route
                                path='/unit/:categoryId/:unitId'
                                element={<UnitPage />}
                            />
                            <Route
                                path='/unitCategory'
                                element={<UnitCategoryPage />}
                            />
                            <Route
                                path='/unitCategory/:id'
                                element={<UnitCategoryPage />}
                            />
                            <Route
                                path='/recipe/create'
                                element={<RecipePage />}
                            />
                            <Route
                                path='/recipe/:recipeId'
                                element={<RecipePage />}
                            />
                            <Route
                                path='/recipe/display/:recipeId'
                                element={<RecipeViewPage />}
                            />
                            <Route path='/recipes' element={<RecipesPage />} />
                            <Route
                                path='/recipes/:categoryId/'
                                element={<RecipesPage />}
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
                                to={isLoggedIn ? '/recipes' : '/signIn'}
                            />
                        }
                    />
                </Routes>
            </Container>
        </Fragment>
    );
}

export default App;
