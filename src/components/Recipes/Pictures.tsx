import React, { useRef, useState } from 'react';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import { useFieldArray /* useFormContext */ } from 'react-hook-form';
import { pictureApi } from '../../utils/apiWrapper';
// import { formatErrorMessage } from '../../utils/errorMessages';
import Input from '../UI/Input';
// import Modal from '../UI/Modal';
import { RecipeForm } from './Recipe';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGripVertical, faTrash } from '@fortawesome/free-solid-svg-icons';

const Pictures: React.FC = () => {
    // const { register } = useFormContext();

    const { fields, append, remove, move } = useFieldArray<
        RecipeForm,
        'pictures',
        'id'
    >({
        name: 'pictures',
    });

    const imageInputRef = useRef<HTMLInputElement>(null);

    const [dragableGroup, setDragableGroup] = useState<number>();

    const dragStart = (e: React.DragEvent<HTMLElement>, position: number) => {
        console.log(e.target);
        if (dragableGroup) {
            console.log(`position1: ${position}`);
            // e.preventDefault();
            e.dataTransfer.setData('pos1_position', position.toString());
            e.dataTransfer.dropEffect = 'move';
            // setButtonOnClick(false);
        } else {
            console.log('nie som button');
        }
    };

    const dragOver = (e: React.DragEvent<HTMLElement>, position: number) => {
        e.preventDefault();
        console.log(`position2: ${position}`);
        e.dataTransfer.setData('pos2_position', position.toString());
        e.dataTransfer.dropEffect = 'move';
    };

    const drop = (e: React.DragEvent<HTMLElement>, position: number) => {
        console.log(`position3: ${position}`);
        console.log('ahoj');
        // e.preventDefault();
        const data1 = +e.dataTransfer.getData('pos1_position');
        const data2 = +e.dataTransfer.getData('pos2_position');
        console.log(`data1: ${data1} data2: ${data2} position3: ${position}`);
        move(data1, position);
    };

    const pictureHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        (async () => {
            try {
                if (event.target.files && event.target.files.length === 1) {
                    const pictureName = event.target.files[0]?.name;
                    const picture = await pictureApi.uploadPicture({
                        file: {
                            value: event.target.files[0],
                            filename: pictureName,
                        },
                    });
                    const data = await pictureApi.getPictureThumbnail(
                        picture.id
                    );
                    if (data instanceof Blob) {
                        const url = URL.createObjectURL(data);
                        append({ id: picture.id, url: url, name: pictureName });
                    }
                    if (imageInputRef.current) {
                        console.log(imageInputRef.current.value);
                        imageInputRef.current.value = '';
                        console.log(imageInputRef.current.value);
                    }
                }
            } catch (err) {
                // formatErrorMessage(err).then((message) => setError(message));
            }
        })();
    };

    const removePictureHandler = (index: number, url: string) => {
        remove(index);
        URL.revokeObjectURL(url);
    };

    return (
        <>
            <Form.Group controlId='pictureUpload' className='mb-3'>
                <Form.Label>Pridajte obrázok</Form.Label>
                <Form.Control
                    type='file'
                    accept='image/jpeg'
                    onChange={pictureHandler}
                    ref={imageInputRef}
                />
            </Form.Group>
            <Row xs={1} sm={2} lg={4} className='g-4 mb-4'>
                {fields.map((field, index) => {
                    return (
                        <Col key={field?.id}>
                            <Card
                                onDragStart={(e) => dragStart(e, index)}
                                onDragOver={(e) => dragOver(e, index)}
                                onDrop={(e) => drop(e, index)}
                                draggable={dragableGroup === index}
                            >
                                <Card.Img
                                    variant='top'
                                    src={field.url}
                                    alt={field.name}
                                    style={{
                                        aspectRatio: 1.33,
                                        objectFit: 'cover',
                                    }}
                                />
                                <Button
                                    title='Vymazať obrázok'
                                    variant='outline-danger'
                                    type='button'
                                    onClick={removePictureHandler.bind(
                                        null,
                                        index,
                                        field.url
                                    )}
                                    className='position-absolute border-0'
                                    style={{ top: 0, right: 0 }}
                                >
                                    <FontAwesomeIcon icon={faTrash} />
                                </Button>
                                <Button
                                    title='Presunúť obrázok'
                                    variant='outline-secondary'
                                    type='button'
                                    onClick={removePictureHandler.bind(
                                        null,
                                        index,
                                        field.url
                                    )}
                                    className='position-absolute border-0'
                                    style={{ top: 0, left: 0 }}
                                    onMouseOver={() => setDragableGroup(index)}
                                    onMouseOut={() =>
                                        setDragableGroup(undefined)
                                    }
                                    onTouchStart={() => setDragableGroup(index)}
                                    onTouchEnd={() =>
                                        setDragableGroup(undefined)
                                    }
                                >
                                    <FontAwesomeIcon icon={faGripVertical} />
                                </Button>
                                <Card.Body className='pb-0'>
                                    <Input
                                        name={`pictures.${index}.name`}
                                        type='text'
                                        label='názov obrázka'
                                    ></Input>
                                    {/* <Button
                                        variant='outline-danger'
                                        type='button'
                                        onClick={removePictureHandler.bind(
                                            null,
                                            index,
                                            field.url
                                        )}
                                        className='w-100'
                                    >
                                        Odstrániť obrázok
                                    </Button> */}
                                </Card.Body>
                            </Card>
                        </Col>
                    );
                })}
            </Row>

            {/* <Modal
                show={!!error}
                message={error}
                type='error'
                onClose={() => {
                    setError(undefined);
                }}
            /> */}
        </>
    );
};

export default Pictures;
