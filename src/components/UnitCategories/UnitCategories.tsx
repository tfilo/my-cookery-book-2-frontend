import React, { useEffect, useState, Fragment } from 'react';
import { Button, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Api } from '../../openapi';
import { unitCategoryApi } from '../../utils/apiWrapper';
import { formatErrorMessage } from '../../utils/errorMessages';
import Modal from '../UI/Modal';

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

    console.log(listOfUnitCategories);

    const createUnitCategoryHandler = () => {
        navigate('/unitCategory');
    };

    const updateUnitCategoryHandler = (id: number) => {
        console.log(id);
        navigate(`/unitCategory/${id}`);
    };

    const deleteUnitCategoryHandler = (unitCategory: Api.SimpleUnitCategory) => {
        console.log(unitCategory.id);
        setUnitCategory(unitCategory);
    };

    const deleteUnitCategoryConfirmHandler = (status: boolean) => {
        (async () => {
            if (status === true) {
                if (unitCategory) {
                    try {
                        await unitCategoryApi.deleteUnitCategory(unitCategory.id);
                        setListOfUnitCategories((prev) => {
                            return prev.filter((_unitCategory) => _unitCategory.id !== unitCategory.id);
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
            <Table striped responsive>
                <thead>
                    {listOfUnitCategories.map((unitCategory) => (
                        <tr key={unitCategory.id}>
                            <th>{unitCategory.name}</th>
                            <th></th>
                            <th>
                                <div className='d-flex flex-column flex-md-row gap-2 justify-content-end'>
                                    <Button
                                        variant='primary'
                                        onClick={updateUnitCategoryHandler.bind(
                                            null,
                                            unitCategory.id
                                        )}
                                    >
                                        Upraviť
                                    </Button>
                                    <Button
                                        variant='danger'
                                        onClick={deleteUnitCategoryHandler.bind(
                                            null,
                                            unitCategory
                                        )}
                                    >
                                        Vymazať
                                    </Button>
                                </div>
                            </th>
                        </tr>
                    ))}
                </thead>
                {/* <thead>
                    <tr>
                        <th>Množstvo</th>
                        <th></th>
                        <th></th>
                    </tr>
                </thead> */}
                {/* <tbody>
                    {listOfTags.map((tag) => (
                        <tr key={tag.id}>
                            <td className='align-middle'>{tag.name}</td>
                            <td className='align-middle '>
                                <div className='d-flex flex-column flex-md-row gap-2 justify-content-end'>
                                    <Button
                                        variant='primary'
                                        onClick={updateTagHandler.bind(
                                            null,
                                            tag.id
                                        )}
                                    >
                                        Upraviť
                                    </Button>
                                    <Button
                                        variant='danger'
                                        onClick={deleteTagHandler.bind(
                                            null,
                                            tag
                                        )}
                                    >
                                        Vymazať
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody> */}
            </Table>
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
