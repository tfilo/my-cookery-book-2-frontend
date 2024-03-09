import { faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Button, Stack } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Api } from '../../openapi';
import { AuthContext } from '../../store/auth-context';
import { unitApi } from '../../utils/apiWrapper';
import { formatErrorMessage } from '../../utils/errorMessages';
import Modal from '../UI/Modal';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const Units: React.FC<{
    unitCategoryId: number;
    setIsLoading: (loading: boolean) => void;
}> = (props) => {
    const [error, setError] = useState<string>();
    const [unit, setUnit] = useState<Api.SimpleUnit>();
    const navigate = useNavigate();
    const { unitCategoryId, setIsLoading } = props;
    const queryClient = useQueryClient();
    const authCtx = useContext(AuthContext);

    const {
        data: listOfUnits,
        isFetching: isFetchingListOfUnits,
        error: listOfUnitsError
    } = useQuery({
        queryKey: ['unitcategories', unitCategoryId, 'units'] as const,
        queryFn: ({ queryKey, signal }) =>
            unitApi.getUnitsByUnitCategory(queryKey[1], { signal }).then((data) =>
                data.sort((a, b) =>
                    a.name.localeCompare(b.name, undefined, {
                        sensitivity: 'base'
                    })
                )
            )
    });

    useEffect(() => {
        if (listOfUnitsError) {
            formatErrorMessage(listOfUnitsError).then((message) => setError(message));
        }
    }, [listOfUnitsError]);

    const editUnitHandler = (id: number) => {
        navigate(`/unit/${unitCategoryId}/${id}`);
    };

    const deleteUnitHandler = (unit: Api.SimpleUnit) => {
        setUnit(unit);
    };

    const { mutate: deleteUnit, isPending: isDeleteingUnit } = useMutation({
        mutationFn: (unitId: number) => unitApi.deleteUnit(unitId),
        onMutate: async (unitId) => {
            await queryClient.cancelQueries({ queryKey: ['unitcategories', unitCategoryId, 'units'] });
            const units = queryClient.getQueryData<Api.SimpleUnit[]>(['unitcategories', unitCategoryId, 'units']);
            queryClient.setQueryData<Api.SimpleUnit[]>(['unitcategories', unitCategoryId, 'units'], (old) =>
                old?.filter((u) => u.id !== unitId)
            );
            const removed = units?.find((u) => u.id === unitId);
            const index = units?.findIndex((u) => u.id === unitId);
            return {
                removed,
                index
            };
        },
        onSuccess: (data, unitId) => {
            queryClient.removeQueries({
                queryKey: ['unitcategories', unitCategoryId, 'units', unitId]
            });
        },
        onError: (error, categoryId, context) => {
            queryClient.setQueryData<Api.SimpleUnit[]>(['unitcategories', unitCategoryId, 'units'], (old) => {
                if (old && context && context.index !== undefined && context.removed) {
                    return [...old.slice(0, context.index), context.removed, ...old.slice(context.index)];
                }
                return undefined;
            });
            formatErrorMessage(error).then((message) => setError(message));
        }
    });

    const deleteUnitConfirmHandler = useCallback(
        (confirmed: boolean) => {
            if (confirmed) {
                if (unit) {
                    deleteUnit(unit.id);
                }
            }
            setUnit(undefined);
        },
        [unit, deleteUnit]
    );

    useEffect(() => {
        setIsLoading(isFetchingListOfUnits || isDeleteingUnit);
    }, [setIsLoading, isFetchingListOfUnits, isDeleteingUnit]);

    return (
        <>
            <tbody>
                {listOfUnits?.map((unit) => (
                    <tr key={unit.id}>
                        <td className='align-middle'>{unit.name}</td>
                        <td className='align-middle'>{unit.abbreviation}</td>
                        {authCtx.userRoles.find((role) => role === Api.User.RoleEnum.ADMIN) && (
                            <Stack
                                as={'td'}
                                direction='horizontal'
                                gap={2}
                                className='justify-content-end'
                            >
                                <Button
                                    title='Upraviť'
                                    aria-label='Upraviť'
                                    variant='outline-secondary'
                                    onClick={editUnitHandler.bind(null, unit.id)}
                                    style={{ border: 'none' }}
                                >
                                    <FontAwesomeIcon icon={faPencil} />
                                </Button>
                                <Button
                                    title='Vymazať'
                                    aria-label='Vymazať'
                                    variant='outline-danger'
                                    onClick={deleteUnitHandler.bind(null, unit)}
                                    style={{ border: 'none' }}
                                >
                                    <FontAwesomeIcon icon={faTrash} />
                                </Button>
                            </Stack>
                        )}
                    </tr>
                ))}
            </tbody>
            <Modal
                show={!!unit}
                type='question'
                message={`Prajete si vymazať značku "${unit?.name}" ?`}
                onClose={deleteUnitConfirmHandler}
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

export default Units;
