import React from 'react';
import { RecipesWithUrlInPictures } from './RecipeView';

type AuthorProps = {
    recipe: RecipesWithUrlInPictures | undefined;
};

const AuthorView: React.FC<AuthorProps> = (props) => {
    return (
        <>
            <p className='mb-0'>
                {props.recipe &&
                    props.recipe.creator &&
                    `Pridal: ${
                        props.recipe.creator.firstName
                            ? props.recipe.creator.firstName +
                                  ' ' +
                                  props.recipe.creator.lastName ?? ''
                            : props.recipe.creator.username
                    } dňa: ${new Date(
                        props.recipe.createdAt
                    ).toLocaleDateString()}`.trim()}
            </p>
            <p className='mb-3'>
                {props.recipe &&
                    `Upravil: ${
                        props.recipe.modifier.firstName
                            ? props.recipe.modifier.firstName +
                                  ' ' +
                                  props.recipe.modifier.lastName ?? ''
                            : props.recipe.modifier.username
                    } dňa: ${new Date(
                        props.recipe.updatedAt
                    ).toLocaleDateString()}`.trim()}
            </p>
        </>
    );
};

export default AuthorView;
