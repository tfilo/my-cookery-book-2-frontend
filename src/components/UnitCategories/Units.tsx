import React, { useEffect, useState, Fragment } from 'react';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Api } from '../../openapi';
import { unitApi } from '../../utils/apiWrapper';
import { formatErrorMessage } from '../../utils/errorMessages';
import Modal from '../UI/Modal';

const Units: React.FC<{ unitCategoryId: number }> = (props) => {
    const [listOfUnits, setListOfUnits] = useState<Api.SimpleUnit[]>([]);
    const [error, setError] = useState<string>();
    const [unit, setUnit] = useState<Api.SimpleUnit>();
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            try {
                const units = await unitApi.getUnitsByUnitCategory(
                    props.unitCategoryId
                );
                setListOfUnits(units);
            } catch (err) {
                console.error(err);
            }
        })();
    }, [props.unitCategoryId]);

    const updateUnitHandler = (id: number) => {
        console.log(id);
        navigate(`/unit/${props.unitCategoryId}/${id}`);
    };

    const deleteUnitHandler = (unit: Api.SimpleUnit) => {
        console.log(unit.id);
        setUnit(unit);
    };

    const deleteUnitConfirmHandler = (status: boolean) => {
        (async () => {
            if (status === true) {
                if (unit) {
                    try {
                        await unitApi.deleteUnit(unit.id);
                        setListOfUnits((prev) => {
                            return prev.filter((_unit) => _unit.id !== unit.id);
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
            setUnit(undefined);
        })();
    };

    return (
        <Fragment>
            <tbody>
                {listOfUnits.map((unit) => (
                    <tr key={unit.id}>
                        <td>{unit.name}</td>
                        <td>{unit.abbreviation}</td>
                        <td>
                            <div className='d-flex flex-column flex-md-row gap-2 justify-content-end'>
                                <Button
                                    variant='primary'
                                    onClick={updateUnitHandler.bind(
                                        null,
                                        unit.id
                                    )}
                                >
                                    Upraviť
                                </Button>
                                <Button
                                    variant='danger'
                                    onClick={deleteUnitHandler.bind(null, unit)}
                                >
                                    Vymazať
                                </Button>
                            </div>
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
        </Fragment>
    );
};

export default Units;
