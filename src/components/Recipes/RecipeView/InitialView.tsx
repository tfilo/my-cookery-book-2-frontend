import React from 'react';
import { RecipesWithUrlInPictures } from './RecipeView';

type InitialProps = {
    recipe: RecipesWithUrlInPictures | undefined;
};

const InitialView: React.FC<InitialProps> = (props) => {
    return (
        <>
            <h3 className='sm mt-3'>{props.recipe?.name}</h3>
            {props.recipe?.method !== null && (
                <section>
                    <h4>Postup prípravy</h4>
                    <p>{props.recipe?.method}</p>
                </section>
            )}
        </>
    );
};

export default InitialView;
