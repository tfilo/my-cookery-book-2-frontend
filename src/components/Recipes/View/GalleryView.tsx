import { faLeftLong, faRightLong, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from 'react-bootstrap';
import BootstrapModal from 'react-bootstrap/Modal';
import { Api } from '../../../openapi';
import { useQuery } from '@tanstack/react-query';
import { pictureApi } from '../../../utils/apiWrapper';
import Spinner from '../../UI/Spinner';

const FULLSCREEN_IMG_STYLE: React.CSSProperties = {
    flex: '1 1',
    objectFit: 'contain',
    maxWidth: '100vw'
} as const;

type GalleryViewProps = {
    pictureId: number;
    pictures: Api.Recipe.Picture[];
    onClose: () => void;
};

const GalleryView: React.FC<GalleryViewProps> = ({ pictureId, pictures, onClose }) => {
    const [picture, setPicture] = useState<{
        id: number;
        url: string | null;
    }>({
        id: pictureId,
        url: null
    });

    const { data, isFetching } = useQuery({
        queryKey: ['pictures', picture.id] as const,
        queryFn: ({ queryKey, signal }) => pictureApi.getPictureData(queryKey[1], { signal })
    });

    useEffect(() => {
        if (data && data instanceof Blob) {
            const url = URL.createObjectURL(data);
            setPicture((prev) => {
                return {
                    ...prev,
                    url
                };
            });
            return () => URL.revokeObjectURL(url);
        }
    }, [data]);

    const currentPictureIdx = useMemo(() => pictures.findIndex((p) => p.id === picture.id), [picture.id, pictures]);
    const currentPicture = pictures[currentPictureIdx];

    const nextPictureHandler = useCallback(() => {
        if (pictures.length > 1) {
            const next = currentPictureIdx + 1;
            if (next >= pictures.length) {
                setPicture({
                    id: pictures[0].id,
                    url: null
                });
            } else {
                setPicture({
                    id: pictures[next].id,
                    url: null
                });
            }
        }
    }, [currentPictureIdx, pictures]);

    const prevPictureHandler = useCallback(() => {
        if (pictures.length > 1) {
            const prev = currentPictureIdx - 1;
            if (prev < 0) {
                setPicture({
                    id: pictures[pictures.length - 1].id,
                    url: null
                });
            } else {
                setPicture({
                    id: pictures[prev].id,
                    url: null
                });
            }
        }
    }, [currentPictureIdx, pictures]);

    return (
        <BootstrapModal
            show={true}
            fullscreen={true}
            onHide={onClose}
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
                        onClick={prevPictureHandler}
                        className='border-0'
                    >
                        <FontAwesomeIcon icon={faLeftLong} />
                    </Button>
                    <Button
                        size='lg'
                        title='Zavrieť'
                        variant='outline-secondary'
                        type='button'
                        onClick={onClose}
                        className='border-0'
                    >
                        <FontAwesomeIcon icon={faXmark} />
                    </Button>
                    <Button
                        size='lg'
                        title='Nasledujúci'
                        variant='outline-secondary'
                        type='button'
                        onClick={nextPictureHandler}
                        className='border-0'
                    >
                        <FontAwesomeIcon icon={faRightLong} />
                    </Button>
                </div>
                <BootstrapModal.Title className='bg-dark text-white'>{currentPicture?.name}</BootstrapModal.Title>
            </BootstrapModal.Header>
            <BootstrapModal.Body className='p-0 bg-dark text-center d-flex justify-content-center'>
                {!!picture.url && (
                    <img
                        src={picture.url}
                        alt={`Obrázok ${currentPicture?.name}`}
                        style={FULLSCREEN_IMG_STYLE}
                    />
                )}
            </BootstrapModal.Body>
            <Spinner
                show={isFetching}
                light={true}
            />
        </BootstrapModal>
    );
};

export default GalleryView;
