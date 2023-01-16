import React from 'react';
import { Stack } from 'react-bootstrap';
import { RecipesWithUrlInPictures } from './RecipeView';

type ServeProps = {
    recipe: RecipesWithUrlInPictures | undefined;
    serves: number;
    setServes: any;
};

const ServeView: React.FC<ServeProps> = (props) => {
    const changeServesHandler = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        props.setServes(+event.target.value);
    };

    return (
        <>
            {(props.recipe?.serves !== null ||
                (props.recipe?.serves === null &&
                    props.recipe.recipeSections.length > 0)) && (
                <section>
                    <Stack direction='horizontal' gap={3}>
                        <h4>Počet porcií:</h4>
                        <input
                            type='number'
                            defaultValue={
                                props.recipe?.serves !== null
                                    ? props.recipe?.serves
                                    : props.serves
                            }
                            onChange={changeServesHandler}
                            style={{
                                width: 50,
                                fontSize: 'calc(1.275rem + .3vw)',
                            }}
                            className='border-0 mb-2'
                            min={1}
                        ></input>
                    </Stack>
                </section>
            )}
        </>
    );
};

export default ServeView;
