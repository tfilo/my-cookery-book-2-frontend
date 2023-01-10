import React from 'react';
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
                    <h4>Počet porcií</h4>
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
                        }}
                        className='border-0'
                        min={1}
                    ></input>
                </section>
            )}
        </>
    );
};

export default ServeView;
