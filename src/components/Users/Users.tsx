import React, { useEffect, useState, Fragment } from 'react';
import { Button, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Api } from '../../openapi';
import { userApi } from '../../utils/apiWrapper';
import { formatErrorMessage } from '../../utils/errorMessages';
import Modal from '../UI/Modal';

const Users: React.FC = () => {
    const [listOfUsers, setListOfUsers] = useState<Api.SimpleUser[]>([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [error, setError] = useState<string>();
    const [userId, setUserId] = useState<number>();
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
    }

    const deleteUserHandler = (id: number) => {
        console.log(id);
        setUserId(id);
        setShowDeleteModal(true);
    };

    const deleteUserConfirmHandler = (status: boolean) => {
        (async () => {
            if (status === true) {
                if (userId) {
                    try {
                        await userApi.deleteUser(userId);
                        setListOfUsers((prev) => {
                            return prev.filter((user) => user.id !== userId);
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
            setShowDeleteModal(false);
            setUserId(undefined);
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
                        <th>Upraviť</th>
                        <th>Vymazať</th>
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
                            <td className='align-middle'>
                                <Button
                                    variant='primary'
                                    onClick={updateUserHandler.bind(
                                        null,
                                        user.id
                                    )}
                                >
                                    Upraviť
                                </Button>
                            </td>
                            <td className='align-middle'>
                                <Button
                                    variant='danger'
                                    onClick={deleteUserHandler.bind(
                                        null,
                                        user.id
                                    )}
                                >
                                    Vymazať
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <Modal
                show={showDeleteModal}
                type='question'
                message='Prajete si vymazať používateľa?'
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
