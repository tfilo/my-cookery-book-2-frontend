import { Fragment, useContext, useEffect, useState } from 'react';
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
import { formatErrorMessage } from './utils/errorMessages';
import Spinner from './components/UI/Spinner';
import Modal from './components/UI/Modal';

function App() {
    const authCtx = useContext(AuthContext);
    const isLoggedIn = authCtx.isLoggedIn;
    const [expanded, setExpanded] = useState(false);
    const [userInfo, setUserInfo] = useState<Api.AuthenticatedUser>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>();
    const [listOfCategories, setListOfCategories] = useState<
        Api.SimpleCategory[]
    >([]);

    useEffect(() => {
        if (isLoggedIn) {
            (async () => {
                try {
                    setIsLoading(true);
                    const user = await authApi.user();
                    setUserInfo(user);
                } catch (err) {
                    formatErrorMessage(err).then((message) =>
                        setError(message)
                    );
                } finally {
                    setIsLoading(false);
                }
            })();
        }
    }, [isLoggedIn]);

    useEffect(() => {
        if (isLoggedIn) {
            (async () => {
                try {
                    setIsLoading(true);
                    const categories = await categoryApi.getCategories();
                    setListOfCategories(categories);
                } catch (err) {
                    formatErrorMessage(err).then((message) =>
                        setError(message)
                    );
                } finally {
                    setIsLoading(false);
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
        <>
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
                        <Navbar.Offcanvas
                            placement='start'
                            onHide={closeOffcanvas}
                        >
                            <Offcanvas.Header closeButton>
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
                                        state={{
                                            searchingText: '',
                                            searchingTags: [],
                                            searchingCategory: -1,
                                            currentPage: 1,
                                            order: Api.RecipeSearchCriteria
                                                .OrderEnum.ASC,
                                            orderBy:
                                                Api.RecipeSearchCriteria
                                                    .OrderByEnum.Name,
                                        }}
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
            <Modal
                show={!!error}
                message={error}
                type='error'
                onClose={() => {
                    setError(undefined);
                }}
            />
            {isLoading && <Spinner />}
        </>
    );
}

export default App;
