import { faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useContext, useEffect, useState } from 'react';
import { Button, Stack } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Api } from '../../openapi';
import { AuthContext } from '../../store/auth-context';
import { unitApi } from '../../utils/apiWrapper';
import { formatErrorMessage } from '../../utils/errorMessages';
import Modal from '../UI/Modal';

const Units: React.FC<{
    unitCategoryId: number;
    setIsLoading: (loading: boolean) => void;
}> = (props) => {
    const [listOfUnits, setListOfUnits] = useState<Api.SimpleUnit[]>([]);
    const [error, setError] = useState<string>();
    const [unit, setUnit] = useState<Api.SimpleUnit>();
    const navigate = useNavigate();
    const { unitCategoryId, setIsLoading } = props;
    const authCtx = useContext(AuthContext);

    useEffect(() => {
        (async () => {
            try {
                setIsLoading(true);
                const units = await unitApi.getUnitsByUnitCategory(
                    unitCategoryId
                );
                setListOfUnits(units);
            } catch (err) {
                formatErrorMessage(err).then((message) => setError(message));
            } finally {
                setIsLoading(false);
            }
        })();
    }, [unitCategoryId, setIsLoading]);

    const editUnitHandler = (id: number) => {
        navigate(`/unit/${unitCategoryId}/${id}`);
    };

    const deleteUnitHandler = (unit: Api.SimpleUnit) => {
        setUnit(unit);
    };

    const deleteUnitConfirmHandler = (status: boolean) => {
        (async () => {
            if (status === true) {
                if (unit) {
                    try {
                        setIsLoading(true);
                        await unitApi.deleteUnit(unit.id);
                        setListOfUnits((prev) => {
                            return prev.filter((_unit) => _unit.id !== unit.id);
                        });
                    } catch (err) {
                        formatErrorMessage(err).then((message) => {
                            setError(message);
                        });
                    } finally {
                        setIsLoading(false);
                    }
                } else {
                    setError('Neplatná jednotka!');
                }
            }
            setUnit(undefined);
        })();
    };

    return (
        <>
            <tbody>
                {listOfUnits.map((unit) => (
                    <tr key={unit.id}>
                        <td className='align-middle'>{unit.name}</td>
                        <td className='align-middle'>{unit.abbreviation}</td>
                        {authCtx.userRoles.find(
                            (role) => role === Api.User.RolesEnum.ADMIN
                        ) && (
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
                                    onClick={editUnitHandler.bind(
                                        null,
                                        unit.id
                                    )}
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
