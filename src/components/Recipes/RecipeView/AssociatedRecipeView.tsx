import React from 'react';
import { Accordion } from 'react-bootstrap';
import AuthorView from './AuthorView';
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
            {props.recipe && props.recipe.associatedRecipes && props.recipe?.associatedRecipes.length >= 1 && (
                <section className='mt-3'>
                    <h2>Súvisiace recepty</h2>
                    <div>
                        {props.recipe.associatedRecipes.map((assRecipe, index) => {
                            return (
                                <Accordion
                                    key={index}
                                    className='mb-3'
                                >
                                    <Accordion.Item eventKey={assRecipe.name}>
                                        <Accordion.Header>{assRecipe.name}</Accordion.Header>
                                        <Accordion.Body>
                                            <div>
                                                {props.associatedRecipes && (
                                                    <>
                                                        <SectionView
                                                            recipe={props.associatedRecipes[index]}
                                                            serves={props.serves}
                                                        />
                                                        {props.associatedRecipes[index]?.method && (
                                                            <section>
                                                                <h3>Postup prípravy receptu</h3>
                                                                <p>{props.associatedRecipes[index]?.method}</p>
                                                            </section>
                                                        )}
                                                        <PictureView recipe={props.associatedRecipes[index]} />
                                                        <SourceView recipe={props.associatedRecipes[index]} />
                                                        {props.associatedRecipes[index].associatedRecipes.map((recipe) => {
                                                            return (
                                                                <section
                                                                    key={recipe.id}
                                                                    className='mt-3'
                                                                >
                                                                    <h3>Súvisiace recepty</h3>
                                                                    <div>{recipe.name}</div>
                                                                </section>
                                                            );
                                                        })}

                                                        <div
                                                            style={{
                                                                border: '1px solid transparent'
                                                            }}
                                                        >
                                                            {/* Fix for correct <hr /> on safari */}
                                                            <hr />
                                                        </div>
                                                        <AuthorView recipe={props.associatedRecipes[index]} />
                                                    </>
                                                )}
                                            </div>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                </Accordion>
                            );
                        })}
                    </div>
                </section>
            )}
        </>
    );
};

export default AssociatedRecipeView;
