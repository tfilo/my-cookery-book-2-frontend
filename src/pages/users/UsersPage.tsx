import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Stack, Table } from 'react-bootstrap';
import { faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Api } from '../../openapi';
import { userApi } from '../../utils/apiWrapper';
import { formatErrorMessage } from '../../utils/errorMessages';
import { getRoleLabel } from '../../localisations/localisations';
import Modal from '../../components/UI/Modal';
import Spinner from '../../components/UI/Spinner';

const UsersPage: React.FC = () => {
    const [listOfUsers, setListOfUsers] = useState<Api.SimpleUser[]>([]);
    const [error, setError] = useState<string>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [user, setUser] = useState<Api.SimpleUser>();
    const navigate = useNavigate();

    useEffect(() => {
        const controller = new AbortController();
        (async () => {
            try {
                setIsLoading(true);
                const users = await userApi.getUsers({ signal: controller.signal });
                setListOfUsers(users);
            } catch (err) {
                formatErrorMessage(err).then((message) => setError(message));
            } finally {
                setIsLoading(false);
            }
        })();
        return () => controller.abort();
    }, []);

    const createUserHandler = () => {
        navigate('/user');
    };

    const editUserHandler = (id: number) => {
        navigate(`/user/${id}`);
    };

    const deleteUserHandler = (user: Api.SimpleUser) => {
        setUser(user);
    };

    const deleteUserConfirmHandler = (status: boolean) => {
        (async () => {
            if (status === true) {
                if (user) {
                    try {
                        setIsLoading(true);
                        await userApi.deleteUser(user.id);
                        setListOfUsers((prev) => {
                            return prev.filter((_user) => _user.id !== user.id);
                        });
                    } catch (err) {
                        formatErrorMessage(err).then((message) => {
                            setError(message);
                        });
                    } finally {
                        setIsLoading(false);
                    }
                } else {
                    setError('Neplatné používateľské ID!');
                }
            }
            setUser(undefined);
        })();
    };

    return (
        <>
            <div className='d-flex flex-column flex-md-row'>
                <h1 className='flex-grow-1'>Používatelia</h1>
                <Button
                    variant='primary'
                    onClick={createUserHandler}
                >
                    Pridať používateľa
                </Button>
            </div>
            <Table
                striped
                responsive
            >
                <thead>
                    <tr>
                        <th>Používateľské meno</th>
                        <th>Meno</th>
                        <th>Priezvisko</th>
                        <th>Rola</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {listOfUsers.map((user) => (
                        <tr key={user.id}>
                            <td className='align-middle'>{user.username}</td>
                            <td className='align-middle'>{user.firstName}</td>
                            <td className='align-middle'>{user.lastName}</td>
                            <td className='align-middle'>
                                {user.roles
                                    .map((role) => {
                                        return getRoleLabel[role];
                                    })
                                    .join(', ')}
                            </td>
                            <td className='align-middle '>
                                <Stack
                                    direction='horizontal'
                                    gap={2}
                                    className='justify-content-end'
                                >
                                    <Button
                                        title='Upraviť'
                                        aria-label='Upraviť'
                                        variant='outline-secondary'
                                        onClick={editUserHandler.bind(null, user.id)}
                                        style={{ border: 'none' }}
                                    >
                                        <FontAwesomeIcon icon={faPencil} />
                                    </Button>
                                    <Button
                                        title='Vymazať'
                                        aria-label='Vymazať'
                                        variant='outline-danger'
                                        onClick={deleteUserHandler.bind(null, user)}
                                        style={{ border: 'none' }}
                                    >
                                        <FontAwesomeIcon icon={faTrash} />
                                    </Button>
                                </Stack>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <Modal
                show={!!user}
                type='question'
                message={`Prajete si vymazať používateľa "${user?.username}" ?`}
                onClose={deleteUserConfirmHandler}
            />
            <Modal
                show={!!error}
                message={error}
                type='error'
                onClose={() => {
                    setError(undefined);
                }}
            />
            <Spinner show={isLoading} />
        </>
    );
};

export default UsersPage;
