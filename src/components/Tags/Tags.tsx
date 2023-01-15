import { faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { Button, Stack, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Api } from '../../openapi';
import { tagApi } from '../../utils/apiWrapper';
import { formatErrorMessage } from '../../utils/errorMessages';
import Modal from '../UI/Modal';
import Spinner from '../UI/Spinner';

const Tags: React.FC = () => {
    const [listOfTags, setListOfTags] = useState<Api.SimpleTag[]>([]);
    const [error, setError] = useState<string>();
    const [tag, setTag] = useState<Api.SimpleTag>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            try {
                setIsLoading(true);
                const tags = await tagApi.getTags();
                setListOfTags(tags);
            } catch (err) {
                formatErrorMessage(err).then((message) => setError(message));
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    const createCategoryHandler = () => {
        navigate('/tag');
    };

    const editTagHandler = (id: number) => {
        navigate(`/tag/${id}`);
    };

    const deleteTagHandler = (tag: Api.SimpleTag) => {
        setTag(tag);
    };

    const deleteTagConfirmHandler = (status: boolean) => {
        (async () => {
            if (status === true) {
                if (tag) {
                    try {
                        setIsLoading(true);
                        await tagApi.deleteTag(tag.id);
                        setListOfTags((prev) => {
                            return prev.filter((_tag) => _tag.id !== tag.id);
                        });
                    } catch (err) {
                        formatErrorMessage(err).then((message) => {
                            setError(message);
                        });
                    } finally {
                        setIsLoading(false);
                    }
                } else {
                    setError('Neplatná značka!');
                }
            }
            setTag(undefined);
        })();
    };

    return (
        <>
            <div className='d-flex flex-column flex-md-row'>
                <h2 className='flex-grow-1'>Značky</h2>
                <Button variant='primary' onClick={createCategoryHandler}>
                    Pridať značku
                </Button>
            </div>
            <Table striped responsive>
                <thead>
                    <tr>
                        <th colSpan={2}>Názov značky</th>
                    </tr>
                </thead>
                <tbody>
                    {listOfTags.map((tag) => (
                        <tr key={tag.id}>
                            <td className='align-middle'>{tag.name}</td>
                            <td className='align-middle '>
                                <Stack
                                    direction='horizontal'
                                    gap={2}
                                    className='justify-content-end'
                                >
                                    <Button
                                        title='Upraviť'
                                        aria-label='Upraviť'
                                        variant='outline-secondary'
                                        onClick={editTagHandler.bind(
                                            null,
                                            tag.id
                                        )}
                                        style={{ border: 'none' }}
                                    >
                                        <FontAwesomeIcon icon={faPencil} />
                                    </Button>
                                    <Button
                                        title='Vymazať'
                                        aria-label='Vymazať'
                                        variant='outline-danger'
                                        onClick={deleteTagHandler.bind(
                                            null,
                                            tag
                                        )}
                                        style={{ border: 'none' }}
                                    >
                                        <FontAwesomeIcon icon={faTrash} />
                                    </Button>
                                </Stack>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <Modal
                show={!!tag}
                type='question'
                message={`Prajete si vymazať značku "${tag?.name}" ?`}
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
            {isLoading && <Spinner />}
        </>
    );
};

export default Tags;
