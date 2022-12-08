import React, { useRef } from 'react';
import { Button, Card, Form } from 'react-bootstrap';
import { useFieldArray, /* useFormContext */ } from 'react-hook-form';
import { pictureApi } from '../../utils/apiWrapper';
// import { formatErrorMessage } from '../../utils/errorMessages';
import Input from '../UI/Input';
// import Modal from '../UI/Modal';
import { RecipeForm } from './Recipe';

const Pictures: React.FC = () => {
    // const { register } = useFormContext();

    const { fields, append, remove } = useFieldArray<
        RecipeForm,
        'pictures',
        'id'
    >({
        name: 'pictures',
    });

    // const [error, setError] = useState<string>();
    // const [uploadedFiles, setUploadedFiles] = useState<
    //     { id: number; url: string; name: string }[]
    // >([]);
    const imageInputRef = useRef<HTMLInputElement>(null);

    const pictureHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log(event);
        (async () => {
            try {
                if (event.target.files && event.target.files.length === 1) {
                    console.log(event.target.files);
                    console.log(event.target.files[0]);
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
                    console.log(data);
                    if (data instanceof Blob) {
                        const url = URL.createObjectURL(data);
                        append({ id: picture.id, url: url, name: pictureName });
                        // setUploadedFiles((prev) => {
                        //     return [
                        //         ...prev,
                        //         { id: picture.id, url: url, name: pictureName },
                        //     ];
                        // });
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
                    onChange={pictureHandler}
                    ref={imageInputRef}
                />
            </Form.Group>
            {fields.map((field, index, array) => {
                return (
                    <Card key={field?.id} className='mb-4'>
                        <Card.Body>
                            <img src={field.url} alt={field.name} />
                            <Input
                                name={`pictures.${index}.name`}
                                type='text'
                                label='názov obrázka'
                            ></Input>
                            {/* <input
                                {...register(`pictures.${index}.id`)}
                                readOnly
                                // type='hidden'
                            ></input> */}
                            <Button
                                variant='danger'
                                type='button'
                                onClick={removePictureHandler.bind(
                                    null,
                                    index,
                                    field.url
                                )}
                                className='border-0'
                            >
                                Odstrániť obrázok
                            </Button>
                        </Card.Body>
                    </Card>
                );
            })}
            {/* {uploadedFiles.map((image) => (
                <img key={image.id} src={image.url} alt={image.name}></img>
            ))} */}
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