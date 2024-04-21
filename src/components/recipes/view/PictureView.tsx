import React, { useCallback, useState } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { Api } from '../../../openapi';
import RecipeThumbnail from '../RecipeThumbnail';
import { CARD_BASE_STYLE } from '../../../utils/constants';
import GalleryView from './GalleryView';

type PictureProps = {
    recipe: Api.Recipe;
};

const PictureView: React.FC<PictureProps> = ({ recipe }) => {
    const [pictureId, setPictureId] = useState<number | null>(null);

    const onCloseGalleryHandler = useCallback(() => {
        setPictureId(null);
    }, []);

    const onShowGalleryHandler = (pictureId: number) => {
        setPictureId(pictureId);
    };

    return (
        <>
            <Row
                xs={1}
                sm={2}
                lg={4}
                className='g-4'
            >
                {recipe.pictures.map((picture) => (
                    <Col key={picture.id}>
                        <Card
                            className='overflow-hidden'
                            role='button'
                            onClick={() => onShowGalleryHandler(picture.id)}
                        >
                            <RecipeThumbnail pictureId={picture.id} />
                            <Card.ImgOverlay className='d-flex flex-column-reverse p-0'>
                                <Card.Title
                                    className='m-0 p-2'
                                    style={CARD_BASE_STYLE}
                                >
                                    <span className='text-white'>{picture.name}</span>
                                </Card.Title>
                            </Card.ImgOverlay>
                        </Card>
                    </Col>
                ))}
            </Row>
            {!!pictureId && (
                <GalleryView
                    pictureId={pictureId}
                    pictures={recipe.pictures}
                    onClose={onCloseGalleryHandler}
                />
            )}
        </>
    );
};

export default PictureView;
