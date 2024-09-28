import React, { useCallback } from 'react';
import { Stack } from 'react-bootstrap';
import { Api } from '../../../openapi';

type ServeProps = {
    recipe: Api.Recipe;
    serves: number;
    setServes: React.Dispatch<React.SetStateAction<number>>;
};

const ServeView: React.FC<ServeProps> = ({ recipe, serves, setServes }) => {
    const changeServesHandler = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            setServes(+event.target.value);
        },
        [setServes]
    );

    if (recipe.serves === null || recipe.recipeSections.length === 0) {
        return null;
    }

    return (
        <Stack
            direction='horizontal'
            gap={3}
        >
            <h2>Počet porcií:</h2>
            <input
                type='number'
                value={serves}
                onChange={changeServesHandler}
                className='border-0 pb-2 mcb-serve-input'
                min={1}
                max={99}
            />
        </Stack>
    );
};

export default ServeView;
