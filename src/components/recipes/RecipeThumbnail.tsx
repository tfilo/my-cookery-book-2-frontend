import React, { useEffect, useState } from 'react';
import defImg from '../../assets/defaultRecipe.jpg';
import { useQuery } from '@tanstack/react-query';
import { Card } from 'react-bootstrap';
import { pictureApi } from '../../utils/apiWrapper';

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
                className='mcb-thumbnail mcb-thumbnail_transparent'
            />
        );
    }

    return (
        <Card.Img
            variant='top'
            src={url}
            className={`${isFetching ? 'mcb-pulse' : 'mcb-fade-in'} mcb-thumbnail`}
            alt='obrázok receptu'
        />
    );
});

export default RecipeThumbnail;
