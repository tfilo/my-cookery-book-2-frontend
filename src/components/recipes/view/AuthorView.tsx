import React from 'react';
import { Api } from '../../../openapi';

type AuthorProps = {
    recipe: Api.Recipe;
};

const AuthorView: React.FC<AuthorProps> = ({ recipe }) => {
    const creator = recipe.creator.firstName
        ? (recipe.creator.firstName + ' ' + (recipe.creator.lastName ?? '')).trim()
        : recipe.creator.username;
    const createdAt = new Date(recipe.createdAt).toLocaleDateString();

    const modifier = recipe.modifier.firstName
        ? (recipe.modifier.firstName + ' ' + (recipe.modifier.lastName ?? '')).trim()
        : recipe.modifier.username;
    const updatedAt = new Date(recipe.updatedAt).toLocaleDateString();

    const isModified = creator !== modifier || recipe.createdAt !== recipe.updatedAt;

    return (
        <>
            <p className='mb-0'>{`Pridal: ${creator} dňa: ${createdAt}`}</p>
            {isModified && <p className='mb-3'>{`Upravil: ${modifier} dňa: ${updatedAt}`}</p>}
        </>
    );
};

export default AuthorView;
