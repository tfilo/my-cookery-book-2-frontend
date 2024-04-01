import React, { useState } from 'react';
import { Button, Card, Col, Row } from 'react-bootstrap';
import BootstrapModal from 'react-bootstrap/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLeftLong, faRightLong, faXmark } from '@fortawesome/free-solid-svg-icons';
import { pictureApi } from '../../../utils/apiWrapper';
import { RecipesWithUrlInPictures } from './RecipeView';
import { formatErrorMessage } from '../../../utils/errorMessages';
import Modal from '../../UI/Modal';
import Spinner from '../../UI/Spinner';
import { useQueryClient } from '@tanstack/react-query';

type PictureProps = {
    recipe: RecipesWithUrlInPictures | undefined;
};

const PictureView: React.FC<PictureProps> = (props) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>();
    const [show, setShow] = useState<{
        title: string;
        url: string;
        index: number;
    } | null>(null);
    const queryClient = useQueryClient();

    const showPictureHandler = (id: number, title: string, idx: number) => {
        (async () => {
            try {
                setIsLoading(true);
                const data = await queryClient.fetchQuery({
                    queryKey: ['pictures', id] as const,
                    queryFn: ({ signal }) => pictureApi.getPictureData(id, { signal })
                });

                if (data instanceof Blob) {
                    const fullPic = URL.createObjectURL(data);
                    setShow((prev) => {
                        if (prev) {
                            URL.revokeObjectURL(prev.url);
                        }
                        return {
                            title: title,
                            url: fullPic,
                            index: idx
                        };
                    });
                }
            } catch (err) {
                formatErrorMessage(err).then((message) => setError(message));
            } finally {
                setIsLoading(false);
            }
        })();
    };

    const nextPictureHandler = () => {
        if (show && props.recipe?.pictures) {
            const next = show.index + 1;
            if (next >= props.recipe?.pictures.length) {
                showPictureHandler(props.recipe?.pictures[0].id, props.recipe?.pictures[0].name, 0);
            } else {
                showPictureHandler(props.recipe?.pictures[next].id, props.recipe?.pictures[next].name, next);
            }
        }
    };

    const prevPictureHandler = () => {
        if (show && props.recipe?.pictures) {
            const prev = show.index - 1;
            if (prev < 0) {
                showPictureHandler(
                    props.recipe?.pictures[props.recipe?.pictures.length - 1].id,
                    props.recipe?.pictures[props.recipe?.pictures.length - 1].name,
                    props.recipe?.pictures.length - 1
                );
            } else {
                showPictureHandler(props.recipe?.pictures[prev].id, props.recipe?.pictures[prev].name, prev);
            }
        }
    };

    const hidePictureHandler = () => {
        setShow((current) => {
            if (current) {
                URL.revokeObjectURL(current.url);
            }
            return null;
        });
    };

    return (
        <>
            <Row
                xs={1}
                sm={2}
                lg={4}
                className='g-4'
            >
                {props.recipe?.pictures.map((picture, idx) => (
                    <Col key={picture.id}>
                        <Card
                            className='overflow-hidden'
                            role='button'
                            onClick={showPictureHandler.bind(null, picture.id, picture.name, idx)}
                        >
                            <Card.Img
                                variant='top'
                                src={picture.url}
                                alt='obrázok'
                                style={{
                                    aspectRatio: 1,
                                    objectFit: 'cover'
                                }}
                            />
                            <Card.ImgOverlay className='d-flex flex-column-reverse p-0'>
                                <Card.Title
                                    className='m-0 p-2'
                                    style={{
                                        backgroundColor: 'rgba(0,0,0,0.5)'
                                    }}
                                >
                                    <span className='text-white'>{picture.name}</span>
                                </Card.Title>
                            </Card.ImgOverlay>
                        </Card>
                    </Col>
                ))}
            </Row>

            <BootstrapModal
                show={!!show}
                fullscreen={true}
                onHide={() => hidePictureHandler()}
            >
                <BootstrapModal.Header className='bg-dark border-dark'>
                    <div
                        className='position-absolute'
                        style={{ top: 0, right: 0 }}
                    >
                        <Button
                            size='lg'
                            title='Predchádzajúci'
                            variant='outline-secondary'
                            type='button'
                            onClick={() => prevPictureHandler()}
                            className='border-0'
                        >
                            <FontAwesomeIcon icon={faLeftLong} />
                        </Button>
                        <Button
                            size='lg'
                            title='Zavrieť'
                            variant='outline-secondary'
                            type='button'
                            onClick={() => hidePictureHandler()}
                            className='border-0'
                        >
                            <FontAwesomeIcon icon={faXmark} />
                        </Button>
                        <Button
                            size='lg'
                            title='Nasledujúci'
                            variant='outline-secondary'
                            type='button'
                            onClick={() => nextPictureHandler()}
                            className='border-0'
                        >
                            <FontAwesomeIcon icon={faRightLong} />
                        </Button>
                    </div>
                    <BootstrapModal.Title className='bg-dark text-white'>{show?.title}</BootstrapModal.Title>
                </BootstrapModal.Header>
                <BootstrapModal.Body className='p-0 bg-dark text-center d-flex justify-content-center'>
                    <img
                        src={show?.url}
                        alt='obrázok'
                        style={{
                            flex: '1 1',
                            objectFit: 'contain',
                            maxWidth: '100vw'
                        }}
                    />
                </BootstrapModal.Body>
            </BootstrapModal>
            <Modal
                show={!!error}
                message={error}
                type='error'
                onClose={() => {
                    setError(undefined);
                }}
            />
            <Spinner show={isLoading} />
        </>
    );
};

export default PictureView;
