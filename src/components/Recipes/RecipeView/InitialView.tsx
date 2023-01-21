import React from 'react';
import { RecipesWithUrlInPictures } from './RecipeView';

type InitialProps = {
    recipe: RecipesWithUrlInPictures | undefined;
};

const InitialView: React.FC<InitialProps> = (props) => {
    return (
        <>
            <h2 className='sm mt-3'>{props.recipe?.name}</h2>
            {props.recipe?.method && (
                <section>
                    <h3>Postup prípravy</h3>
                    <p>{props.recipe?.method}</p>
                </section>
            )}
        </>
    );
};

export default InitialView;
