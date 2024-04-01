import { faCirclePlus, faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Button, Stack, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Api } from '../../openapi';
import { AuthContext } from '../../store/auth-context';
import { unitCategoryApi } from '../../utils/apiWrapper';
import { formatErrorMessage } from '../../utils/errorMessages';
import Modal from '../UI/Modal';
import Spinner from '../UI/Spinner';
import Units from './Units';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const UnitCategories: React.FC = () => {
    const [error, setError] = useState<string>();
    const [unitCategory, setUnitCategory] = useState<Api.SimpleUnitCategory>();
    const [isUnitsLoading, setIsUnitsLoading] = useState<boolean>(false);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const authCtx = useContext(AuthContext);

    const {
        data: listOfUnitCategories,
        isFetching: isFetchingListOfUnitCategories,
        error: listOfUnitCategoriesError
    } = useQuery({
        queryKey: ['unitcategories'],
        queryFn: ({ signal }) =>
            unitCategoryApi.getUnitCategories({ signal }).then((data) =>
                data.sort((a, b) =>
                    a.name.localeCompare(b.name, undefined, {
                        sensitivity: 'base'
                    })
                )
            )
    });

    useEffect(() => {
        if (listOfUnitCategoriesError) {
            formatErrorMessage(listOfUnitCategoriesError).then((message) => setError(message));
        }
    }, [listOfUnitCategoriesError]);

    const createUnitCategoryHandler = () => {
        navigate('/unitCategory');
    };

    const createUnitHandler = (unitCategoryId: number) => {
        navigate(`/unit/${unitCategoryId}`);
    };

    const editUnitCategoryHandler = (id: number) => {
        navigate(`/unitCategory/${id}`);
    };

    const deleteUnitCategoryHandler = (unitCategory: Api.SimpleUnitCategory) => {
        setUnitCategory(unitCategory);
    };

    const { mutate: deleteUnitCategory, isPending: isDeleteingUnitCategory } = useMutation({
        mutationFn: (unitCategoryId: number) => unitCategoryApi.deleteUnitCategory(unitCategoryId),
        onMutate: async (unitCategoryId) => {
            await queryClient.cancelQueries({ queryKey: ['unitcategories'] });
            const unitCategories = queryClient.getQueryData<Api.SimpleUnitCategory[]>(['unitcategories']);
            queryClient.setQueryData<Api.SimpleUnitCategory[]>(['unitcategories'], (old) => old?.filter((uc) => uc.id !== unitCategoryId));
            const removed = unitCategories?.find((uc) => uc.id === unitCategoryId);
            const index = unitCategories?.findIndex((uc) => uc.id === unitCategoryId);
            return {
                removed,
                index
            };
        },
        onSuccess: (data, unitCategoryId) => {
            queryClient.removeQueries({
                queryKey: ['unitcategories', unitCategoryId]
            });
        },
        onError: (error, unitCategoryId, context) => {
            queryClient.setQueryData<Api.SimpleUnitCategory[]>(['unitcategories'], (old) => {
                if (old && context && context.index !== undefined && context.removed) {
                    return [...old.slice(0, context.index), context.removed, ...old.slice(context.index)];
                }
                return undefined;
            });
            formatErrorMessage(error).then((message) => setError(message));
        }
    });

    const deleteUnitCategoryConfirmHandler = useCallback(
        (confirmed: boolean) => {
            if (confirmed) {
                if (unitCategory) {
                    deleteUnitCategory(unitCategory.id);
                }
            }
            setUnitCategory(undefined);
        },
        [deleteUnitCategory, unitCategory]
    );

    return (
        <>
            <div className='d-flex flex-column flex-md-row'>
                <h1 className='flex-grow-1'>Jednotky</h1>
                {authCtx.userRoles.find((role) => role === Api.User.RoleEnum.ADMIN) && (
                    <Button
                        variant='primary'
                        onClick={createUnitCategoryHandler}
                    >
                        Pridať kategóriu jednotky
                    </Button>
                )}
            </div>
            <div>
                {listOfUnitCategories?.map((unitCategory) => (
                    <Table
                        striped
                        responsive
                        key={unitCategory.id}
                    >
                        <thead>
                            <tr>
                                <Stack
                                    as={'th'}
                                    style={{ border: 'none' }}
                                    colSpan={3}
                                    direction='horizontal'
                                    gap={2}
                                >
                                    {unitCategory.name}
                                    {authCtx.userRoles.find((role) => role === Api.User.RoleEnum.ADMIN) && (
                                        <Stack
                                            style={{ border: 'none' }}
                                            direction='horizontal'
                                            gap={2}
                                        >
                                            <Button
                                                title={`Pridať kategóriu jednotky ${unitCategory.name}`}
                                                aria-label={`Pridať kategóriu jednotky ${unitCategory.name}`}
                                                variant='outline-success'
                                                type='button'
                                                onClick={createUnitHandler.bind(null, unitCategory.id)}
                                            >
                                                <FontAwesomeIcon icon={faCirclePlus} />
                                            </Button>
                                            <Button
                                                title={`Upraviť kategóriu jednotky ${unitCategory.name}`}
                                                aria-label={`Upraviť kategóriu jednotky ${unitCategory.name}`}
                                                variant='outline-secondary'
                                                onClick={editUnitCategoryHandler.bind(null, unitCategory.id)}
                                            >
                                                <FontAwesomeIcon icon={faPencil} />
                                            </Button>
                                            <Button
                                                title={`Vymazať kategóriu jednotky ${unitCategory.name}`}
                                                aria-label={`Vymazať kategóriu jednotky ${unitCategory.name}`}
                                                variant='outline-danger'
                                                onClick={deleteUnitCategoryHandler.bind(null, unitCategory)}
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </Button>
                                        </Stack>
                                    )}
                                </Stack>
                            </tr>
                            <tr>
                                <th>Názov jednotky</th>
                                <th colSpan={2}>Skratka jednotky</th>
                            </tr>
                        </thead>
                        <Units
                            unitCategoryId={unitCategory.id}
                            setIsLoading={setIsUnitsLoading}
                        />
                    </Table>
                ))}
            </div>
            <Spinner show={isDeleteingUnitCategory || isUnitsLoading || isFetchingListOfUnitCategories} />
            <Modal
                show={!!unitCategory}
                type='question'
                message={`Prajete si vymazať značku "${unitCategory?.name}" ?`}
                onClose={deleteUnitCategoryConfirmHandler}
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

export default UnitCategories;
