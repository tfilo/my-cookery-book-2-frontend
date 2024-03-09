import React from 'react';
import { Stack } from 'react-bootstrap';
import { RecipesWithUrlInPictures } from './RecipeView';

type ServeProps = {
    recipe: RecipesWithUrlInPictures | undefined;
    serves: number;
    setServes: any;
};

const ServeView: React.FC<ServeProps> = (props) => {
    const changeServesHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        props.setServes(+event.target.value);
    };

    return (
        <>
            {(props.recipe?.serves !== null || (props.recipe?.serves === null && props.recipe.recipeSections.length > 0)) && (
                <Stack
                    direction='horizontal'
                    gap={3}
                >
                    <h2>Počet porcií:</h2>
                    <input
                        type='number'
                        defaultValue={props.recipe?.serves !== null ? props.recipe?.serves : props.serves}
                        onChange={changeServesHandler}
                        style={{
                            width: 50,
                            fontSize: '1.3rem'
                        }}
                        className='border-0 pb-2'
                        min={1}
                    />
                </Stack>
            )}
        </>
    );
};

export default ServeView;
