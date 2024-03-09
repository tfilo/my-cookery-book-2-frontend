import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';
import React, { useEffect, useState, Fragment, useContext } from 'react';
import { Button, Stack, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Api } from '../../openapi';
import { categoryApi } from '../../utils/apiWrapper';
import { formatErrorMessage } from '../../utils/errorMessages';
import Modal from '../UI/Modal';
import Spinner from '../UI/Spinner';
import { AuthContext } from '../../store/auth-context';

const Categories: React.FC = () => {
    const [listOfCategories, setListOfCategories] = useState<Api.SimpleCategory[]>([]);
    const [error, setError] = useState<string>();
    const [category, setCategory] = useState<Api.SimpleCategory>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const navigate = useNavigate();
    const authCtx = useContext(AuthContext);

    useEffect(() => {
        (async () => {
            try {
                setIsLoading(true);
                const categories = await categoryApi.getCategories();
                setListOfCategories(categories);
            } catch (err) {
                formatErrorMessage(err).then((message) => setError(message));
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    const createCategoryHandler = () => {
        navigate('/category');
    };

    const editCategoryHandler = (id: number) => {
        navigate(`/category/${id}`);
    };

    const deleteCategoryHandler = (category: Api.SimpleCategory) => {
        setCategory(category);
    };

    const deleteCategoryConfirmHandler = (status: boolean) => {
        (async () => {
            if (status === true) {
                if (category) {
                    try {
                        setIsLoading(true);
                        await categoryApi.deleteCategory(category.id);
                        setListOfCategories((prev) => {
                            return prev.filter((cat) => cat.id !== category.id);
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
            setCategory(undefined);
        })();
    };

    return (
        <Fragment>
            <div className='d-flex flex-column flex-md-row'>
                <h1 className='flex-grow-1'>Kategórie</h1>
                {authCtx.userRoles.find((role) => role === Api.User.RoleEnum.ADMIN) && (
                    <Button
                        variant='primary'
                        onClick={createCategoryHandler}
                    >
                        Pridať kategóriu
                    </Button>
                )}
            </div>
            <Table
                striped
                responsive
            >
                <thead>
                    <tr>
                        <th>Názov kategórie</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {listOfCategories.map((category) => (
                        <tr key={category.id}>
                            <td className='align-middle'>{category.name}</td>
                            <td className='align-middle '>
                                {authCtx.userRoles.find((role) => role === Api.User.RoleEnum.ADMIN) && (
                                    <Stack
                                        direction='horizontal'
                                        gap={2}
                                        className='justify-content-end'
                                    >
                                        <Button
                                            title='Upraviť'
                                            aria-label='Upraviť'
                                            variant='outline-secondary'
                                            onClick={editCategoryHandler.bind(null, category.id)}
                                            style={{ border: 'none' }}
                                        >
                                            <FontAwesomeIcon icon={faPencil} />
                                        </Button>

                                        <Button
                                            title='Vymazať'
                                            aria-label='Vymazať'
                                            variant='outline-danger'
                                            onClick={deleteCategoryHandler.bind(null, category)}
                                            style={{ border: 'none' }}
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </Button>
                                    </Stack>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            {isLoading && <Spinner />}
            <Modal
                show={!!category}
                type='question'
                message={`Prajete si vymazať kategóriu "${category?.name}" ?`}
                onClose={deleteCategoryConfirmHandler}
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

export default Categories;
