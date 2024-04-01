import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';
import React, { useEffect, useState, Fragment, useContext, useCallback } from 'react';
import { Button, Stack, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Api } from '../../openapi';
import { categoryApi } from '../../utils/apiWrapper';
import { formatErrorMessage } from '../../utils/errorMessages';
import Modal from '../UI/Modal';
import Spinner from '../UI/Spinner';
import { AuthContext } from '../../store/auth-context';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const Categories: React.FC = () => {
    const [error, setError] = useState<string>();
    const [category, setCategory] = useState<Api.SimpleCategory>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const authCtx = useContext(AuthContext);

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
            )
    });

    useEffect(() => {
        if (listOfCategoriesError) {
            formatErrorMessage(listOfCategoriesError).then((message) => setError(message));
        }
    }, [listOfCategoriesError]);

    const createCategoryHandler = () => {
        navigate('/category');
    };

    const editCategoryHandler = (id: number) => {
        navigate(`/category/${id}`);
    };

    const deleteCategoryHandler = (category: Api.SimpleCategory) => {
        setCategory(category);
    };

    const { mutate: deleteCategory, isPending: isDeleteingCategory } = useMutation({
        mutationFn: (categoryId: number) => categoryApi.deleteCategory(categoryId),
        onMutate: async (categoryId) => {
            await queryClient.cancelQueries({ queryKey: ['categories'] });
            const categories = queryClient.getQueryData<Api.SimpleCategory[]>(['categories']);
            queryClient.setQueryData<Api.SimpleCategory[]>(['categories'], (old) => old?.filter((c) => c.id !== categoryId));
            const removed = categories?.find((c) => c.id === categoryId);
            const index = categories?.findIndex((c) => c.id === categoryId);
            return {
                removed,
                index
            };
        },
        onSuccess: (data, categoryId) => {
            queryClient.removeQueries({
                queryKey: ['categories', categoryId]
            });
        },
        onError: (error, categoryId, context) => {
            queryClient.setQueryData<Api.SimpleCategory[]>(['categories'], (old) => {
                if (old && context && context.index !== undefined && context.removed) {
                    return [...old.slice(0, context.index), context.removed, ...old.slice(context.index)];
                }
                return undefined;
            });
            formatErrorMessage(error).then((message) => setError(message));
        }
    });

    const deleteCategoryConfirmHandler = useCallback(
        (confirmed: boolean) => {
            if (confirmed) {
                if (category) {
                    deleteCategory(category.id);
                }
            }
            setCategory(undefined);
        },
        [category, deleteCategory]
    );

    return (
        <>
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
                        <th colSpan={2}>Názov kategórie</th>
                    </tr>
                </thead>
                <tbody>
                    {listOfCategories?.map((category) => (
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
            <Spinner show={isFetchingListOfCategories || isDeleteingCategory} />
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
        </>
    );
};

export default Categories;
