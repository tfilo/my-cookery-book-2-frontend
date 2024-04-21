import React, { useCallback } from 'react';
import { Stack } from 'react-bootstrap';
import { Api } from '../../../openapi';

const DEFAULT_INPUT_STYLE: React.CSSProperties = {
    width: 50,
    fontSize: '1.3rem'
} as const;

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

    const defaultValue = recipe.serves ?? serves;

    return (
        <Stack
            direction='horizontal'
            gap={3}
        >
            <h2>Počet porcií:</h2>
            <input
                type='number'
                defaultValue={defaultValue}
                onChange={changeServesHandler}
                style={DEFAULT_INPUT_STYLE}
                className='border-0 pb-2'
                min={1}
                max={99}
            />
        </Stack>
    );
};

export default ServeView;
