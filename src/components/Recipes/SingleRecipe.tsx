import React, { useEffect, useState } from 'react';

import { useParams } from 'react-router-dom';
import { Api } from '../../openapi';
import { recipeApi } from '../../utils/apiWrapper';
import { formatErrorMessage } from '../../utils/errorMessages';
import Modal from '../UI/Modal';

const SingleRecipe: React.FC = () => {
    const [recipe, setRecipe] = useState<Api.Recipe>();
    const [error, setError] = useState<string>();
    const params = useParams();

    useEffect(() => {
        (async () => {
            try {
                if (params.recipeId) {
                    const rec = await recipeApi.getRecipe(+params.recipeId);
                    console.log(rec);
                    setRecipe(rec);
                }
            } catch (err) {
                formatErrorMessage(err).then((message) => setError(message));
            }
        })();
    }, [params.recipeId]);

    return (
        <div>
            <h1>{recipe?.name}</h1>
            {recipe?.description !== null && (
                <>
                    <h4>Popis</h4>
                    <div>{recipe?.description}</div>
                </>
            )}
            {recipe?.serves !== null && (
                <>
                    <h4>Počet porcií</h4>
                    <div>{recipe?.serves}</div>
                </>
            )}
            <h4>Kategória</h4>
            <div>{recipe?.categoryId}</div>
            <h4>Značky</h4>
            {recipe?.tags.map((tag) => (
                <div key={tag.id}>{`${tag.name} `}</div>
            ))}
            {recipe?.method !== null && (
                <>
                    <h4>Postup prípravy</h4>
                    <div>{recipe?.method}</div>
                </>
            )}
            {recipe?.sources.length !== undefined && (
                <>
                    <h4>Zdroje</h4>
                    {recipe.sources.map((source) => (
                        <div key={source}>{source}</div>
                    ))}
                </>
            )}
            {recipe?.recipeSections.map((section) => {
                return (
                    <div key={section.id}>
                        <h4>{section.name}</h4>
                        <h6>Suroviny</h6>
                        <ul>
                            {section.ingredients.map((ingredient) => {
                                if (ingredient.value !== null) {
                                    return (
                                        <li key={ingredient.id}>{`${ingredient.value} ${ingredient.unitId} ${ingredient.name}`}</li>
                                    );
                                } else {
                                    return (
                                        <li key={ingredient.id}>{`${ingredient.unitId} ${ingredient.name}`}</li>
                                    );
                                }
                            })}
                        </ul>
                        <h6>Postup prípravy</h6>
                        <div>{section?.method}</div>
                    </div>
                );
            })}
            <hr/>
            <p>Pridal </p>
            <p>Upravil </p>
            <Modal
                show={!!error}
                message={error}
                type='error'
                onClose={() => {
                    setError(undefined);
                }}
            />
        </div>
    );
};

export default SingleRecipe;
