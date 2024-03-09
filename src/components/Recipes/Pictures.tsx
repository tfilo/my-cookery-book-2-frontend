import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import { FieldArrayWithId, UseFieldArrayMove, UseFieldArrayRemove, useFieldArray, useFormContext } from 'react-hook-form';
import { pictureApi } from '../../utils/apiWrapper';
import Input from '../UI/Input';
import { RecipeForm } from './Recipe';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGripVertical, faTrash } from '@fortawesome/free-solid-svg-icons';
import { formatErrorMessage } from '../../utils/errorMessages';
import Modal from '../UI/Modal';
import Spinner from '../UI/Spinner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Api } from '../../openapi';

type PictureProps = {
    field: FieldArrayWithId<RecipeForm, 'pictures', '_id'>;
    remove: UseFieldArrayRemove;
    move: UseFieldArrayMove;
    index: number;
};

const imageStyle: React.CSSProperties = {
    aspectRatio: 1.33,
    objectFit: 'cover'
};

const handleStyle: React.CSSProperties = { top: 0, left: 0 };

const Picture: React.FC<PictureProps> = ({ remove, move, field, index }) => {
    const [dragable, setDragable] = useState<boolean>(false);
    const [url, setUrl] = useState<string>();
    const queryClient = useQueryClient();

    useEffect(() => {
        let url: string | undefined = undefined;
        (async () => {
            const response = await queryClient.fetchQuery({
                queryKey: ['thumbnails', field.id] as const,
                queryFn: async ({ queryKey }) => pictureApi.getPictureThumbnail(queryKey[1])
            });
            if (response instanceof Blob) {
                url = URL.createObjectURL(response);
                setUrl(url);
            }
        })();

        return () => {
            if (url) {
                URL.revokeObjectURL(url);
            }
        };
    }, [field.id, queryClient]);

    const onDragStart = useCallback(
        (e: React.DragEvent<HTMLElement>) => {
            e.dataTransfer.clearData();
            if (dragable) {
                e.dataTransfer.setData('position', index.toString());
                e.dataTransfer.dropEffect = 'move';
            }
        },
        [dragable, index]
    );

    const onDragOver = useCallback((e: React.DragEvent<HTMLElement>) => {
        e.preventDefault();
    }, []);

    const onDrop = useCallback(
        (e: React.DragEvent<HTMLElement>) => {
            const data1 = +e.dataTransfer.getData('position');
            move(data1, index);
        },
        [move, index]
    );

    const removePictureHandler = useCallback(
        async (index: number, url?: string) => {
            remove(index);
            queryClient.removeQueries({
                queryKey: ['thumbnails', field.id]
            });
            queryClient.removeQueries({
                queryKey: ['pictures', field.id]
            });
            if (url) {
                URL.revokeObjectURL(url);
            }
        },
        [field.id, queryClient, remove]
    );

    const onEnableDrag = useCallback(() => {
        setDragable(true);
    }, []);

    const onDisableDrag = useCallback(() => {
        setDragable(false);
    }, []);

    return (
        <Col>
            <Card
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDrop={onDrop}
                draggable={dragable}
            >
                <Card.Img
                    variant='top'
                    src={url}
                    alt={field.name}
                    style={imageStyle}
                />
                <Button
                    title='Vymazať obrázok'
                    variant='outline-danger'
                    type='button'
                    onClick={removePictureHandler.bind(null, index, url)}
                    className='position-absolute border-0'
                    style={{ top: 0, right: 0 }}
                >
                    <FontAwesomeIcon icon={faTrash} />
                </Button>
                <Button
                    title='Presunúť obrázok'
                    variant='outline-secondary'
                    type='button'
                    className='position-absolute border-0'
                    style={handleStyle}
                    onMouseOver={onEnableDrag}
                    onMouseOut={onDisableDrag}
                    onTouchStart={onEnableDrag}
                    onTouchEnd={onDisableDrag}
                >
                    <FontAwesomeIcon icon={faGripVertical} />
                </Button>
                <Card.Body className='pb-0'>
                    <Input
                        name={`pictures.${index}.name`}
                        type='text'
                        label='názov obrázka'
                    />
                </Card.Body>
            </Card>
        </Col>
    );
};

const Pictures: React.FC = () => {
    const { control } = useFormContext<RecipeForm>();
    const { fields, append, remove, move } = useFieldArray({
        name: 'pictures',
        keyName: '_id',
        control
    });

    const imageInputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState<string>();
    const queryClient = useQueryClient();

    const { mutate: uploadImage, isPending: isUploadingImage } = useMutation({
        mutationFn: (image: Api.UploadPictureRequest.MultipartFormData) => {
            return pictureApi.uploadPicture(image);
        },
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ['thumbnails'] });
            await queryClient.cancelQueries({ queryKey: ['pictures'] });
        },
        onSettled: (data, error, image) => {
            if (error) {
                formatErrorMessage(error).then((message) => setError(message));
            } else if (data) {
                queryClient.removeQueries({ queryKey: ['thumbnails', data.id] });
                queryClient.removeQueries({ queryKey: ['pictures', data.id] });
                append({ id: data.id, name: image.file!.filename!, sortNumber: fields.length + 1 });
                if (imageInputRef.current) {
                    imageInputRef.current.value = '';
                }
            }
        }
    });

    const pictureHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length === 1) {
            const pictureName = event.target.files[0]?.name;
            uploadImage({
                file: {
                    value: event.target.files[0],
                    filename: pictureName
                }
            });
        }
    };

    return (
        <>
            <Form.Group
                controlId='pictureUpload'
                className='mb-3'
            >
                <Form.Label>Pridajte obrázok</Form.Label>
                <Form.Control
                    type='file'
                    accept='image/jpeg'
                    onChange={pictureHandler}
                    ref={imageInputRef}
                />
            </Form.Group>
            <Row
                xs={1}
                sm={2}
                lg={4}
                className='g-4 pb-4'
            >
                {fields.map((field, index) => {
                    return (
                        <Picture
                            key={field.id}
                            field={field}
                            move={move}
                            remove={remove}
                            index={index}
                        />
                    );
                })}
            </Row>
            <Modal
                show={!!error}
                message={error}
                type='error'
                onClose={() => {
                    setError(undefined);
                }}
            />
            {isUploadingImage && <Spinner />}
        </>
    );
};

export default Pictures;
