import React, { useEffect, useState, Fragment } from 'react';
import { Button, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Api } from '../../openapi';
import { tagApi } from '../../utils/apiWrapper';
import { formatErrorMessage } from '../../utils/errorMessages';
import Modal from '../UI/Modal';

const Tags: React.FC = () => {
    const [listOfTags, setListOfTags] = useState<Api.SimpleTag[]>([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [error, setError] = useState<string>();
    const [tagId, setTagId] = useState<number>();
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            try {
                const tags = await tagApi.getTags();
                setListOfTags(tags);
            } catch (err) {
                console.error(err);
            }
        })();
    }, []);

    console.log(listOfTags);

    const createCategoryHandler = () => {
        navigate('/tag');
    };

    const updateTagHandler = (id: number) => {
        console.log(id);
        navigate(`/tag/${id}`);
    }

    const deleteTagHandler = (id: number) => {
        console.log(id);
        setTagId(id);
        setShowDeleteModal(true);
    };

    const deleteTagConfirmHandler = (status: boolean) => {
        (async () => {
            if (status === true) {
                if (tagId) {
                    try {
                        await tagApi.deleteTag(tagId);
                        setListOfTags((prev) => {
                            return prev.filter((tag) => tag.id !== tagId);
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
            setShowDeleteModal(false);
            setTagId(undefined);
        })();
    };

    return (
        <Fragment>
            <div className='d-flex flex-column flex-md-row'>
                <h2 className='flex-grow-1'>Značky</h2>
                <Button variant='primary' onClick={createCategoryHandler}>
                    Pridať značku
                </Button>
            </div>
            <Table striped responsive>
                <thead>
                    <tr>
                        <th>Názov značky</th>
                        <th>Upraviť</th>
                        <th>Vymazať</th>
                    </tr>
                </thead>
                <tbody>
                    {listOfTags.map((tag) => (
                        <tr key={tag.id}>
                            <td className='align-middle'>{tag.name}</td>
                            <td className='align-middle'>
                                <Button
                                variant='primary'
                                    onClick={updateTagHandler.bind(
                                        null,
                                        tag.id
                                    )}
                                >
                                    Upraviť
                                </Button>
                            </td>
                            <td className='align-middle'>
                                <Button
                                variant='danger'
                                    onClick={deleteTagHandler.bind(
                                        null,
                                        tag.id
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
                show={showDeleteModal}
                type='question'
                message='Prajete si vymazať značku?'
                onClose={deleteTagConfirmHandler}
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

export default Tags;
