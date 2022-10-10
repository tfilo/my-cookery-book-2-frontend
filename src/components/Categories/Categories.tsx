import React, { useEffect, useState, Fragment } from 'react';
import { Button, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Api } from '../../openapi';
import { categoryApi } from '../../utils/apiWrapper';
import { formatErrorMessage } from '../../utils/errorMessages';
import Modal from '../UI/Modal';

const Categories: React.FC = () => {
    const [listOfCategories, setListOfCategories] = useState<Api.SimpleCategory[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState<string>();
    const [categoryId, setCategoryId] = useState<number>();
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
        navigate('/newCategory');
    };

    const deleteCategoryHandler = (id: number) => {
        console.log(id);
        setCategoryId(id);
        setShowModal(true);
    };

    const deleteCategoryConfirmHandler = (status: boolean) => {
        (async () => {
            if (status === true) {
                if (categoryId) {
                    try {
                        await categoryApi.deleteCategory(categoryId);
                        setListOfCategories((prev) => {
                            return prev.filter((cat) => cat.id !== categoryId);
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
            setShowModal(false);
            setCategoryId(undefined);
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
                        <th>Upraviť</th>
                        <th>Vymazať</th>
                    </tr>
                </thead>
                <tbody>
                    {listOfCategories.map((category) => (
                        <tr key={category.id}>
                            <td className='align-middle'>{category.name}</td>
                            <td className='align-middle'>
                                <Button>Upraviť</Button>
                            </td>
                            <td className='align-middle'>
                                <Button
                                    onClick={deleteCategoryHandler.bind(
                                        null,
                                        category.id
                                    )}
                                >
                                    Vymazať
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <Modal
                show={showModal}
                type='question'
                message='Prajete si vymazať používateľa?'
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