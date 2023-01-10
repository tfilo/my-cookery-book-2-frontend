import React from 'react';
import { Link } from 'react-router-dom';
import { RecipesWithUrlInPictures } from './RecipeView';

type AssociatedRecipeProps = {
    recipe: RecipesWithUrlInPictures | undefined;
};

const AssociatedRecipeView: React.FC<AssociatedRecipeProps> = (props) => {
    return (
        <>
            {props.recipe &&
                props.recipe.associatedRecipes &&
                props.recipe?.associatedRecipes.length >= 1 && (
                    <section className='mt-3'>
                        <h4>Súvisiace recepty</h4>
                        {props.recipe.associatedRecipes.map((recipe) => (
                            <div key={recipe.id}>
                                <Link
                                    to={`/recipe/display/${recipe.id}`}
                                    className='mb-0'
                                >
                                    {recipe.name}
                                </Link>
                            </div>
                        ))}
                    </section>
                )}
        </>
    );
};

export default AssociatedRecipeView;
