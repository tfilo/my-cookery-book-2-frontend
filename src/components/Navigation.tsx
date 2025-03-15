import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Container, Nav, Navbar, Offcanvas } from 'react-bootstrap';
import { useQuery } from '@tanstack/react-query';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowRightFromBracket,
    faList,
    faPizzaSlice,
    faScaleBalanced,
    faTags,
    faUser,
    faUsers,
    faUtensils
} from '@fortawesome/free-solid-svg-icons';
import { Api } from '../openapi';
import useRole from '../hooks/use-role';
import { getDefaultSearchParams } from '../hooks/use-criteria';
import { categoryApi } from '../utils/apiWrapper';
import { formatErrorMessage } from '../utils/errorMessages';
import Spinner from './ui/Spinner';
import Modal from './ui/Modal';
import { AuthContext } from '../store/auth-context';

const Navigation: React.FC<{ isLoggedIn: boolean; username: string }> = ({ isLoggedIn, username }) => {
    const { logout: logoutHandler } = useContext(AuthContext);
    const [expanded, setExpanded] = useState(false);
    const [error, setError] = useState<string>();
    const { hasSome } = useRole();

    const openOffcanvas = useCallback(() => {
        setExpanded(true);
    }, []);

    const closeOffcanvas = useCallback(() => {
        setExpanded(false);
    }, []);

    const {
        data: listOfCategories,
        isFetching: isFetchingListOfCategories,
        error: listOfCategoriesError
    } = useQuery({
        queryKey: ['categories'],
        queryFn: ({ signal }) =>
            categoryApi.getCategories({ signal }).then((data) =>
                data.sort((a, b) =>
                    a.name.localeCompare(b.name, undefined, {
                        sensitivity: 'base'
                    })
                )
            ),
        enabled: isLoggedIn
    });

    useEffect(() => {
        if (listOfCategoriesError) {
            formatErrorMessage(listOfCategoriesError).then((message) => setError(message));
        }
    }, [listOfCategoriesError]);

    if (!isLoggedIn) {
        return null;
    }

    return (
        <>
            <Navbar
                bg='primary'
                variant='dark'
                expand={false}
                expanded={expanded}
            >
                <Container fluid>
                    <Navbar.Toggle onClick={openOffcanvas} />
                    <Navbar.Brand
                        as={Link}
                        to='/recipes'
                    >
                        Kuchárska kniha
                    </Navbar.Brand>
                    <Button
                        onClick={logoutHandler}
                        aria-label='Odhlásiť sa'
                    >
                        <FontAwesomeIcon
                            className='d-lg-none'
                            icon={faArrowRightFromBracket}
                            title='Odhlásiť sa'
                            aria-hidden='true'
                        />
                        <span className='d-none d-lg-inline'>Odhlásiť sa</span>
                    </Button>
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
                                    <FontAwesomeIcon
                                        className='mcb-nav-icon'
                                        icon={faUser}
                                    />
                                    Profil
                                </Nav.Link>
                                {hasSome(Api.User.RoleEnum.ADMIN) && (
                                    <Nav.Link
                                        to='/users'
                                        as={Link}
                                        onClick={closeOffcanvas}
                                    >
                                        <FontAwesomeIcon
                                            className='mcb-nav-icon'
                                            icon={faUsers}
                                        />
                                        Používatelia
                                    </Nav.Link>
                                )}
                                <Nav.Link
                                    to='/categories'
                                    as={Link}
                                    onClick={closeOffcanvas}
                                >
                                    <FontAwesomeIcon
                                        className='mcb-nav-icon'
                                        icon={faList}
                                    />
                                    Kategórie
                                </Nav.Link>
                                <Nav.Link
                                    to='/units'
                                    as={Link}
                                    onClick={closeOffcanvas}
                                >
                                    <FontAwesomeIcon
                                        className='mcb-nav-icon'
                                        icon={faScaleBalanced}
                                    />
                                    Jednotky
                                </Nav.Link>
                                <Nav.Link
                                    to='/tags'
                                    as={Link}
                                    onClick={closeOffcanvas}
                                >
                                    <FontAwesomeIcon
                                        className='mcb-nav-icon'
                                        icon={faTags}
                                    />
                                    Značky
                                </Nav.Link>
                                {hasSome(Api.User.RoleEnum.ADMIN, Api.User.RoleEnum.CREATOR) && (
                                    <Nav.Link
                                        to='/recipe/create'
                                        as={Link}
                                        onClick={closeOffcanvas}
                                    >
                                        <FontAwesomeIcon
                                            className='mcb-nav-icon'
                                            icon={faPizzaSlice}
                                        />
                                        Pridať recept
                                    </Nav.Link>
                                )}
                                <hr />
                                <Nav.Link
                                    to={`/recipes?${getDefaultSearchParams()}`}
                                    as={Link}
                                    onClick={closeOffcanvas}
                                >
                                    <FontAwesomeIcon
                                        className='mcb-nav-icon'
                                        icon={faUtensils}
                                    />
                                    Všetky recepty
                                </Nav.Link>
                                <hr />
                                {listOfCategories?.map((category) => (
                                    <Nav.Link
                                        to={`/recipes?${getDefaultSearchParams(category.id)}`}
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
            <Modal
                show={!!error}
                message={error}
                type='error'
                onClose={() => {
                    setError(undefined);
                }}
            />
            <Spinner show={isFetchingListOfCategories} />
        </>
    );
};

export default Navigation;
