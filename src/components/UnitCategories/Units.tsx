import { faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { Button, Stack } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Api } from '../../openapi';
import { unitApi } from '../../utils/apiWrapper';
import { formatErrorMessage } from '../../utils/errorMessages';
import Modal from '../UI/Modal';
import Spinner from '../UI/Spinner';

const Units: React.FC<{ unitCategoryId: number }> = (props) => {
    const [listOfUnits, setListOfUnits] = useState<Api.SimpleUnit[]>([]);
    const [error, setError] = useState<string>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [unit, setUnit] = useState<Api.SimpleUnit>();
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            try {
                setIsLoading(true);
                const units = await unitApi.getUnitsByUnitCategory(
                    props.unitCategoryId
                );
                setListOfUnits(units);
            } catch (err) {
                formatErrorMessage(err).then((message) => setError(message));
            } finally {
                setIsLoading(false);
            }
        })();
    }, [props.unitCategoryId]);

    const editUnitHandler = (id: number) => {
        navigate(`/unit/${props.unitCategoryId}/${id}`);
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
                    setError('Neplatné používateľské ID!');
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
                        <td>
                            <Stack
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
                        </td>
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
            {isLoading && <Spinner />}
        </>
    );
};

export default Units;
