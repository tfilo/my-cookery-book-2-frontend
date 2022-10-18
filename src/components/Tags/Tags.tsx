import React, { useEffect, useState, Fragment } from 'react';
import { Button, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Api } from '../../openapi';
import { tagApi } from '../../utils/apiWrapper';
import { formatErrorMessage } from '../../utils/errorMessages';
import Modal from '../UI/Modal';

const Tags: React.FC = () => {
    const [listOfTags, setListOfTags] = useState<Api.SimpleTag[]>([]);
    const [error, setError] = useState<string>();
    const [tag, setTag] = useState<Api.SimpleTag>();
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
    };

    const deleteTagHandler = (tag: Api.SimpleTag) => {
        console.log(tag.id);
        setTag(tag);
    };

    const deleteTagConfirmHandler = (status: boolean) => {
        (async () => {
            if (status === true) {
                if (tag) {
                    try {
                        await tagApi.deleteTag(tag.id);
                        setListOfTags((prev) => {
                            return prev.filter((_tag) => _tag.id !== tag.id);
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
            setTag(undefined);
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
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
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
        </Fragment>
    );
};

export default Tags;
