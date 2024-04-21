import React, { useMemo } from 'react';
import { Accordion } from 'react-bootstrap';
import AuthorView from './AuthorView';
import PictureView from './PictureView';
import SectionView from './SectionView';
import SourceView from './SourceView';
import { Api } from '../../../openapi';
import { useQuery } from '@tanstack/react-query';
import { recipeApi } from '../../../utils/apiWrapper';
import { Link, useLocation } from 'react-router-dom';
import Spinner from '../../ui/Spinner';

type AssociatedRecipeViewProps = {
    recipeId: number;
    recipeName: string;
    serves: number;
};

const AssociatedRecipeView: React.FC<AssociatedRecipeViewProps> = ({ recipeId, recipeName, serves }) => {
    const { search } = useLocation();
    const searchParams = useMemo(() => new URLSearchParams(search), [search]);

    const { data: recipe, isFetching } = useQuery({
        queryKey: ['recipes', recipeId] as const,
        queryFn: async ({ queryKey, signal }) => recipeApi.getRecipe(queryKey[1], { signal })
    });

    return (
        <Accordion className='mb-3'>
            <Accordion.Item eventKey={recipeName}>
                <Accordion.Header>{recipeName}</Accordion.Header>
                <Accordion.Body>
                    {!!recipe && (
                        <div>
                            <SectionView
                                recipe={recipe}
                                serves={serves}
                            />
                            {recipe.method && (
                                <section>
                                    <h3>Postup prípravy receptu</h3>
                                    <p>{recipe.method}</p>
                                </section>
                            )}
                            <PictureView recipe={recipe} />
                            <SourceView recipe={recipe} />
                            {recipe.associatedRecipes.map((recipe) => {
                                return (
                                    <section
                                        key={recipe.id}
                                        className='mt-3'
                                    >
                                        <h3>Súvisiace recepty</h3>
                                        <ul>
                                            <li>
                                                <Link to={`/recipe/${recipe.id}?${searchParams}`}>{recipe.name}</Link>
                                            </li>
                                        </ul>
                                    </section>
                                );
                            })}

                            <div
                                style={{
                                    border: '1px solid transparent'
                                }}
                            >
                                <hr />
                            </div>
                            <AuthorView recipe={recipe} />
                        </div>
                    )}
                </Accordion.Body>
            </Accordion.Item>
            <Spinner show={isFetching} />
        </Accordion>
    );
};

type AssociatedRecipesViewProps = {
    parentRecipe: Api.Recipe;
    serves: number;
};

const AssociatedRecipesView: React.FC<AssociatedRecipesViewProps> = ({ parentRecipe, serves }) => {
    if (parentRecipe.associatedRecipes.length === 0) {
        return null;
    }
    return (
        <section className='mt-3'>
            <h2>Súvisiace recepty</h2>
            <div>
                {parentRecipe.associatedRecipes.map((recipe) => (
                    <AssociatedRecipeView
                        key={recipe.id}
                        recipeId={recipe.id}
                        recipeName={recipe.name}
                        serves={serves}
                    />
                ))}
            </div>
        </section>
    );
};

export default AssociatedRecipesView;
