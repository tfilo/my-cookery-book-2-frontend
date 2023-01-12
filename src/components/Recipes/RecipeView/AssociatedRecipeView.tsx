import React from 'react';
import { Accordion } from 'react-bootstrap';
import AuthorView from './AuthorView';
import InitialView from './InitialView';
import PictureView from './PictureView';
import { RecipesWithUrlInPictures } from './RecipeView';
import SectionView from './SectionView';
import SourceView from './SourceView';

type AssociatedRecipeProps = {
    recipe: RecipesWithUrlInPictures | undefined;
    associatedRecipes: RecipesWithUrlInPictures[] | undefined;
    serves: number;
};

const AssociatedRecipeView: React.FC<AssociatedRecipeProps> = (props) => {
    return (
        <>
            {props.recipe &&
                props.recipe.associatedRecipes &&
                props.recipe?.associatedRecipes.length >= 1 && (
                    <section className='mt-3'>
                        <h4>Súvisiace recepty</h4>
                        <div>
                            {props.recipe.associatedRecipes.map(
                                (assRecipe, index) => {
                                    return (
                                        <Accordion key={index} className='mb-3'>
                                            <Accordion.Item
                                                eventKey={assRecipe.name}
                                            >
                                                <Accordion.Header>
                                                    {assRecipe.name}{' '}
                                                    {assRecipe.description !==
                                                    null
                                                        ? `- ${assRecipe.description}`
                                                        : ''}
                                                </Accordion.Header>
                                                <Accordion.Body>
                                                    <div>
                                                        {props.associatedRecipes && (
                                                            <>
                                                                <InitialView
                                                                    recipe={
                                                                        props
                                                                            .associatedRecipes[
                                                                            index
                                                                        ]
                                                                    }
                                                                />
                                                                <SectionView
                                                                    recipe={
                                                                        props
                                                                            .associatedRecipes[
                                                                            index
                                                                        ]
                                                                    }
                                                                    serves={
                                                                        props.serves
                                                                    }
                                                                />
                                                                <PictureView
                                                                    recipe={
                                                                        props
                                                                            .associatedRecipes[
                                                                            index
                                                                        ]
                                                                    }
                                                                />
                                                                <SourceView
                                                                    recipe={
                                                                        props
                                                                            .associatedRecipes[
                                                                            index
                                                                        ]
                                                                    }
                                                                />
                                                                {props.associatedRecipes[
                                                                    index
                                                                ].associatedRecipes.map(
                                                                    (
                                                                        recipe
                                                                    ) => {
                                                                        return (
                                                                            <section
                                                                                key={
                                                                                    recipe.id
                                                                                }
                                                                                className='mt-3'
                                                                            >
                                                                                <h4>
                                                                                    Súvisiace
                                                                                    recepty
                                                                                </h4>
                                                                                <div>
                                                                                    {
                                                                                        recipe.name
                                                                                    }{' '}
                                                                                    {recipe.description !==
                                                                                    null
                                                                                        ? `- ${recipe.description}`
                                                                                        : ''}
                                                                                </div>
                                                                            </section>
                                                                        );
                                                                    }
                                                                )}

                                                                <hr />
                                                                <AuthorView
                                                                    recipe={
                                                                        props
                                                                            .associatedRecipes[
                                                                            index
                                                                        ]
                                                                    }
                                                                />
                                                            </>
                                                        )}
                                                    </div>
                                                </Accordion.Body>
                                            </Accordion.Item>
                                        </Accordion>
                                    );
                                }
                            )}
                        </div>
                    </section>
                )}
        </>
    );
};

export default AssociatedRecipeView;
