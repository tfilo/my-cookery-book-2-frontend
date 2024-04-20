import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Button, Stack, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Api } from '../../openapi';
import { AuthContext } from '../../store/auth-context';
import { tagApi } from '../../utils/apiWrapper';
import { formatErrorMessage } from '../../utils/errorMessages';
import Modal from '../../components/UI/Modal';
import Spinner from '../../components/UI/Spinner';

const TagsPage: React.FC = () => {
    const [error, setError] = useState<string>();
    const [tag, setTag] = useState<Api.SimpleTag>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const authCtx = useContext(AuthContext);

    const {
        data: listOfTags,
        isFetching: isFetchingListOfTags,
        error: listOfTagsError
    } = useQuery({
        queryKey: ['tags'],
        queryFn: ({ signal }) =>
            tagApi.getTags({ signal }).then((data) =>
                data.sort((a, b) =>
                    a.name.localeCompare(b.name, undefined, {
                        sensitivity: 'base'
                    })
                )
            )
    });

    useEffect(() => {
        if (listOfTagsError) {
            formatErrorMessage(listOfTagsError).then((message) => setError(message));
        }
    }, [listOfTagsError]);

    const createTagHandler = () => {
        navigate('/tag');
    };

    const editTagHandler = (id: number) => {
        navigate(`/tag/${id}`);
    };

    const deleteTagHandler = (tag: Api.SimpleTag) => {
        setTag(tag);
    };

    const { mutate: deleteTag, isPending: isDeleteingTag } = useMutation({
        mutationFn: (tagId: number) => tagApi.deleteTag(tagId),
        onMutate: async (tagId) => {
            await queryClient.cancelQueries({ queryKey: ['tags'] });
            const tags = queryClient.getQueryData<Api.SimpleTag[]>(['tags']);
            queryClient.setQueryData<Api.SimpleTag[]>(['tags'], (old) => old?.filter((t) => t.id !== tagId));
            const removed = tags?.find((t) => t.id === tagId);
            const index = tags?.findIndex((t) => t.id === tagId);
            return {
                removed,
                index
            };
        },
        onSuccess: (data, tagId) => {
            queryClient.removeQueries({
                queryKey: ['tags', tagId]
            });
        },
        onError: (error, tagId, context) => {
            queryClient.setQueryData<Api.SimpleTag[]>(['tags'], (old) => {
                if (old && context && context.index !== undefined && context.removed) {
                    return [...old.slice(0, context.index), context.removed, ...old.slice(context.index)];
                }
                return undefined;
            });
            formatErrorMessage(error).then((message) => setError(message));
        }
    });

    const deleteTagConfirmHandler = useCallback(
        (confirmed: boolean) => {
            if (confirmed) {
                if (tag) {
                    deleteTag(tag.id);
                }
            }
            setTag(undefined);
        },
        [deleteTag, tag]
    );

    return (
        <>
            <div className='d-flex flex-column flex-md-row'>
                <h1 className='flex-grow-1'>Značky</h1>
                {authCtx.userRoles.find((role) => role === Api.User.RoleEnum.ADMIN) && (
                    <Button
                        variant='primary'
                        onClick={createTagHandler}
                    >
                        Pridať značku
                    </Button>
                )}
            </div>
            <Table
                striped
                responsive
            >
                <thead>
                    <tr>
                        <th colSpan={2}>Názov značky</th>
                    </tr>
                </thead>
                <tbody>
                    {listOfTags?.map((tag) => (
                        <tr key={tag.id}>
                            <td className='align-middle'>{tag.name}</td>
                            <td className='align-middle '>
                                {authCtx.userRoles.find((role) => role === Api.User.RoleEnum.ADMIN) && (
                                    <Stack
                                        direction='horizontal'
                                        gap={2}
                                        className='justify-content-end'
                                    >
                                        <Button
                                            title='Upraviť'
                                            aria-label='Upraviť'
                                            variant='outline-secondary'
                                            onClick={editTagHandler.bind(null, tag.id)}
                                            style={{ border: 'none' }}
                                        >
                                            <FontAwesomeIcon icon={faPencil} />
                                        </Button>
                                        <Button
                                            title='Vymazať'
                                            aria-label='Vymazať'
                                            variant='outline-danger'
                                            onClick={deleteTagHandler.bind(null, tag)}
                                            style={{ border: 'none' }}
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </Button>
                                    </Stack>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <Spinner show={isFetchingListOfTags || isDeleteingTag} />
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
        </>
    );
};

export default TagsPage;
