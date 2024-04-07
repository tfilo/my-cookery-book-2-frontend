import React, { useEffect, useState } from 'react';
import defImg from '../../../assets/defaultRecipe.jpg';
import { useQuery } from '@tanstack/react-query';
import { Card } from 'react-bootstrap';
import { pictureApi } from '../../../utils/apiWrapper';

const BASE_THUMBNAIL_STYLE: React.CSSProperties = {
    aspectRatio: 1,
    objectFit: 'cover'
} as const;

const TRANSPARENT_THUMBNAIL_STYLE: React.CSSProperties = {
    ...BASE_THUMBNAIL_STYLE,
    opacity: 0.3
} as const;

type RecipeThumbnailProps = {
    pictureId?: number;
};

const RecipeThumbnail: React.FC<RecipeThumbnailProps> = React.memo(({ pictureId }) => {
    const [url, setUrl] = useState<string>(defImg);

    const { data, isFetching } = useQuery({
        queryKey: ['thumbnails', pictureId] as const,
        queryFn: async ({ queryKey, signal }) =>
            pictureApi.getPictureThumbnail(queryKey[1]!, {
                signal
            }),
        enabled: !!pictureId
    });

    useEffect(() => {
        if (data && data instanceof Blob) {
            const url = URL.createObjectURL(data);
            setUrl(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [data]);

    if (!pictureId) {
        return (
            <Card.Img
                variant='top'
                src={defImg}
                alt='obrázok receptu'
                style={TRANSPARENT_THUMBNAIL_STYLE}
            />
        );
    }

    return (
        <Card.Img
            variant='top'
            src={url}
            className={isFetching ? 'pulse' : 'fadeIn'}
            alt='obrázok receptu'
            style={BASE_THUMBNAIL_STYLE}
        />
    );
});

export default RecipeThumbnail;
