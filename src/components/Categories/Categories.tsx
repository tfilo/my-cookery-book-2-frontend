import React, { useEffect, useState, Fragment } from 'react';
import { Button, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Api } from '../../openapi';
import { categoryApi } from '../../utils/apiWrapper';
import { formatErrorMessage } from '../../utils/errorMessages';
import Modal from '../UI/Modal';

const Categories: React.FC = () => {
    const [listOfCategories, setListOfCategories] = useState<
        Api.SimpleCategory[]
    >([]);
    const [error, setError] = useState<string>();
    const [category, setCategory] = useState<Api.SimpleCategory>();
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            try {
                const categories = await categoryApi.getCategories();
                setListOfCategories(categories);
            } catch (err) {
                console.error(err);
            }
        })();
    }, []);

    console.log(listOfCategories);

    const createCategoryHandler = () => {
        navigate('/category');
    };

    const updateCategoryHandler = (id: number) => {
        console.log(id);
        navigate(`/category/${id}`);
    };

    const deleteCategoryHandler = (category: Api.SimpleCategory) => {
        console.log(category.id);
        setCategory(category);
    };

    const deleteCategoryConfirmHandler = (status: boolean) => {
        (async () => {
            if (status === true) {
                if (category) {
                    try {
                        await categoryApi.deleteCategory(category.id);
                        setListOfCategories((prev) => {
                            return prev.filter((cat) => cat.id !== category.id);
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
            setCategory(undefined);
        })();
    };

    return (
        <Fragment>
            <div className='d-flex flex-column flex-md-row'>
                <h2 className='flex-grow-1'>Kategórie</h2>
                <Button variant='primary' onClick={createCategoryHandler}>
                    Pridať kategóriu
                </Button>
            </div>
            <Table striped responsive>
                <thead>
                    <tr>
                        <th>Názov kategórie</th>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {listOfCategories.map((category) => (
                        <tr key={category.id}>
                            <td className='align-middle'>{category.name}</td>
                            <td className='align-middle '>
                                <div className='d-flex flex-column flex-md-row gap-2 justify-content-end'>
                                    <Button
                                        variant='primary'
                                        onClick={updateCategoryHandler.bind(
                                            null,
                                            category.id
                                        )}
                                    >
                                        Upraviť
                                    </Button>

                                    <Button
                                        variant='danger'
                                        onClick={deleteCategoryHandler.bind(
                                            null,
                                            category
                                        )}
                                    >
                                        Vymazať
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
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
