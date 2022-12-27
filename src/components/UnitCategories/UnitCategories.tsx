import {
    faCirclePlus,
    faPencil,
    faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState, Fragment } from 'react';
import { Button, Stack, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Api } from '../../openapi';
import { unitCategoryApi } from '../../utils/apiWrapper';
import { formatErrorMessage } from '../../utils/errorMessages';
import Modal from '../UI/Modal';
import Units from './Units';

const UnitCategories: React.FC = () => {
    const [listOfUnitCategories, setListOfUnitCategories] = useState<
        Api.SimpleUnitCategory[]
    >([]);
    const [error, setError] = useState<string>();
    const [unitCategory, setUnitCategory] = useState<Api.SimpleUnitCategory>();
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            try {
                const unitCategories =
                    await unitCategoryApi.getUnitCategories();
                setListOfUnitCategories(unitCategories);
            } catch (err) {
                console.error(err);
            }
        })();
    }, []);

    const createUnitCategoryHandler = () => {
        navigate('/unitCategory');
    };

    const createUnitHandler = (unitCategoryId: number) => {
        console.log(unitCategoryId);
        navigate(`/unit/${unitCategoryId}`);
    };

    const updateUnitCategoryHandler = (id: number) => {
        console.log(id);
        navigate(`/unitCategory/${id}`);
    };

    const deleteUnitCategoryHandler = (
        unitCategory: Api.SimpleUnitCategory
    ) => {
        console.log(unitCategory.id);
        setUnitCategory(unitCategory);
    };

    const deleteUnitCategoryConfirmHandler = (status: boolean) => {
        (async () => {
            if (status === true) {
                if (unitCategory) {
                    try {
                        await unitCategoryApi.deleteUnitCategory(
                            unitCategory.id
                        );
                        setListOfUnitCategories((prev) => {
                            return prev.filter(
                                (_unitCategory) =>
                                    _unitCategory.id !== unitCategory.id
                            );
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
            setUnitCategory(undefined);
        })();
    };

    return (
        <Fragment>
            <div className='d-flex flex-column flex-md-row'>
                <h2 className='flex-grow-1'>Jednotky</h2>
                <Button variant='primary' onClick={createUnitCategoryHandler}>
                    Pridať kategóriu jednotky
                </Button>
            </div>
            <div>
                {listOfUnitCategories.map((unitCategory) => (
                    <Table striped responsive key={unitCategory.id}>
                        <thead>
                            <tr>
                                <th style={{border: 'none'}} colSpan={3}>
                                    <Stack direction='horizontal' gap={2}>
                                        {unitCategory.name}
                                        {/* <th></th> */}

                                        {/* <div className='d-flex flex-column flex-md-row gap-2 justify-content-end'> */}
                                        <Button
                                            title={`Pridať jednotku kategórie ${unitCategory.name}`}
                                            aria-label={`Pridať jednotku kategórie ${unitCategory.name}`}
                                            variant='outline-success'
                                            type='button'
                                            onClick={createUnitHandler.bind(
                                                null,
                                                unitCategory.id
                                            )}
                                        >
                                            <FontAwesomeIcon
                                                icon={faCirclePlus}
                                            />
                                        </Button>
                                        <Button
                                            title={`Upraviť jednotku kategórie ${unitCategory.name}`}
                                            aria-label={`Upraviť jednotku kategórie ${unitCategory.name}`}
                                            variant='outline-secondary'
                                            onClick={updateUnitCategoryHandler.bind(
                                                null,
                                                unitCategory.id
                                            )}
                                        >
                                            <FontAwesomeIcon icon={faPencil} />
                                        </Button>
                                        <Button
                                            title={`Vymazať jednotku kategórie ${unitCategory.name}`}
                                            aria-label={`Vymazať jednotku kategórie ${unitCategory.name}`}
                                            variant='outline-danger'
                                            onClick={deleteUnitCategoryHandler.bind(
                                                null,
                                                unitCategory
                                            )}
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </Button>
                                        {/* </div> */}
                                    </Stack>
                                </th>
                            </tr>
                            <tr>
                                <th>Názov jednotky</th>
                                <th colSpan={2}>Skratka jednotky</th>
                            </tr>
                        </thead>
                        <Units unitCategoryId={unitCategory.id} />
                    </Table>
                ))}
            </div>

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
        </Fragment>
    );
};

export default UnitCategories;
