import React, { useEffect, useState, Fragment } from 'react';
import { Button, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Api } from '../../openapi';
import { userApi } from '../../utils/apiWrapper';
import { formatErrorMessage } from '../../utils/errorMessages';
import Modal from '../UI/Modal';

const Users: React.FC = () => {
    const [listOfUsers, setListOfUsers] = useState<Api.SimpleUser[]>([]);
    const [error, setError] = useState<string>();
    const [user, setUser] = useState<Api.SimpleUser>();
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            try {
                const users = await userApi.getUsers();
                setListOfUsers(users);
            } catch (err) {
                console.error(err);
            }
        })();
    }, []);

    console.log(listOfUsers);

    const createUserHandler = () => {
        navigate('/user');
    };

    const updateUserHandler = (id: number) => {
        console.log(id);
        navigate(`/user/${id}`);
    };

    const deleteUserHandler = (user: Api.SimpleUser) => {
        console.log(user.id);
        setUser(user);
    };

    const deleteUserConfirmHandler = (status: boolean) => {
        (async () => {
            if (status === true) {
                if (user) {
                    try {
                        await userApi.deleteUser(user.id);
                        setListOfUsers((prev) => {
                            return prev.filter((_user) => _user.id !== user.id);
                        });
                    } catch (err) {
                        formatErrorMessage(err).then((message) => {
                            setError(message);
                        });
                    }
                } else {
                    setError('Neplatné používateľské ID!');
                }
            }
            setUser(undefined);
        })();
    };

    return (
        <Fragment>
            <div className='d-flex flex-column flex-md-row'>
                <h2 className='flex-grow-1'>Používatelia</h2>
                <Button variant='primary' onClick={createUserHandler}>
                    Pridať používateľa
                </Button>
            </div>
            <Table striped responsive>
                <thead>
                    <tr>
                        <th>Používateľské meno</th>
                        <th>Meno</th>
                        <th>Priezvisko</th>
                        <th>Rola</th>
                        <th></th>
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
                                        if (
                                            role ===
                                            Api.SimpleUser.RolesEnum.ADMIN
                                        ) {
                                            return 'Administrátor';
                                        }
                                        if (
                                            role ===
                                            Api.SimpleUser.RolesEnum.CREATOR
                                        ) {
                                            return 'Tvorca obsahu';
                                        }
                                        return '';
                                    })
                                    .join(', ')}
                            </td>
                            <td className='align-middle '>
                                <div className='d-flex flex-column flex-md-row gap-2 justify-content-end'>
                                    <Button
                                        variant='primary'
                                        onClick={updateUserHandler.bind(
                                            null,
                                            user.id
                                        )}
                                    >
                                        Upraviť
                                    </Button>
                                    <Button
                                        variant='danger'
                                        onClick={deleteUserHandler.bind(
                                            null,
                                            user
                                        )}
                                    >
                                        Vymazať
                                    </Button>
                                </div>
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
        </Fragment>
    );
};

export default Users;
