import React, { useEffect, useRef, useState } from 'react';
import { Button, Card, Col, Row } from 'react-bootstrap';

import { useParams } from 'react-router-dom';
import ReactToPrint from 'react-to-print';
import { Api } from '../../openapi';
import {
    pictureApi,
    recipeApi,
    unitApi,
    userApi,
} from '../../utils/apiWrapper';
import { formatErrorMessage } from '../../utils/errorMessages';
import Modal from '../UI/Modal';

const RecipeView: React.FC = () => {
    const [recipe, setRecipe] = useState<UpdatedRecipe>();
    const [error, setError] = useState<string>();
    const params = useParams();

    const componentRef = useRef<HTMLDivElement>(null);
    // const handlePrint = useReactToPrint({
    //     content: () => componentRef.current,
    // });

    type UpdatedRecipe = {
        id: number;
        name: string;
        description: string | null;
        serves: number | null;
        method: string | null;
        sources: string[];
        categoryId: number;
        modifierId: number;
        modifierUsername?: string;
        modifierFirstName?: string | null;
        modifierLastName?: string | null;
        creatorId: number;
        creatorUsername?: string;
        creatorFirstName?: string | null;
        creatorLastName?: string | null;
        recipeSections: {
            id: number;
            name: string;
            sortNumber: number;
            method: string | null;
            ingredients: {
                id: number;
                name: string;
                sortNumber: number;
                value: number;
                unitId: number;
                unitAbbreviation?: string;
            }[];
        }[];
        associatedRecipes: Api.Recipe.AssociatedRecipe[];
        tags: Api.Recipe.Tag[];
        pictures: {
            id: number;
            name: string;
            sortNumber: number;
            url?: string;
        }[];
        createdAt: string;
        updatedAt: string;
    };

    useEffect(() => {
        (async () => {
            try {
                if (params.recipeId) {
                    const rec: UpdatedRecipe = await recipeApi.getRecipe(
                        +params.recipeId
                    );
                    const creatorInfo = await userApi.getUser(rec.creatorId);
                    rec.creatorUsername = creatorInfo.username;
                    rec.creatorFirstName = creatorInfo.firstName;
                    rec.creatorLastName = creatorInfo.lastName;
                    const modifierInfo = await userApi.getUser(rec.modifierId);
                    rec.modifierUsername = modifierInfo.username;
                    rec.modifierFirstName = modifierInfo.firstName;
                    rec.modifierLastName = modifierInfo.lastName;

                    for (let section of rec.recipeSections) {
                        for (let ingredient of section.ingredients) {
                            const unit = await unitApi.getUnit(
                                ingredient.unitId
                            );
                            ingredient.unitAbbreviation = unit.abbreviation;
                        }
                    }

                    for (let picture of rec.pictures) {
                        const data = await pictureApi.getPictureThumbnail(
                            picture.id
                        );
                        if (data instanceof Blob) {
                            const url = URL.createObjectURL(data);
                            picture.url = url;
                        }
                    }

                    setRecipe(rec);
                }
            } catch (err) {
                formatErrorMessage(err).then((message) => setError(message));
            }
        })();
    }, [params.recipeId]);

    const getPageMargins = () => {
        return `@page { margin: 40px !important; }`;
      };

    return (
        <div>
            <ReactToPrint
                trigger={() => <Button variant='light'>Vytlačiť</Button>}
                content={() => componentRef.current}
            ></ReactToPrint>
            <div ref={componentRef}>
            <style>{getPageMargins()}</style>
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
                                            <li
                                                key={ingredient.id}
                                            >{`${ingredient.value} ${ingredient.unitAbbreviation} ${ingredient.name}`}</li>
                                        );
                                    } else {
                                        return (
                                            <li
                                                key={ingredient.id}
                                            >{`${ingredient.unitAbbreviation} ${ingredient.name}`}</li>
                                        );
                                    }
                                })}
                            </ul>
                            <h6>Postup prípravy</h6>
                            <div className='mb-3'>{section?.method}</div>
                        </div>
                    );
                })}
                <Row xs={1} sm={2} lg={4} className='g-4'>
                    {recipe?.pictures.map((picture) => (
                        <Col key={picture.id}>
                            <Card.Img
                                variant='top'
                                src={picture.url}
                                alt='obrázok'
                                style={{
                                    aspectRatio: 1.33,
                                    objectFit: 'cover',
                                }}
                            />
                            <Card.Body>
                                <Card.Title>{picture.name}</Card.Title>
                            </Card.Body>
                        </Col>
                    ))}
                </Row>
                <hr />
                <p>
                    {recipe &&
                        `Pridal: ${
                            recipe.creatorFirstName
                                ? recipe.creatorFirstName +
                                      ' ' +
                                      recipe.creatorLastName ?? ''
                                : recipe.creatorUsername
                        } dňa: ${new Date(
                            recipe.createdAt
                        ).toLocaleDateString()}`.trim()}
                </p>
                <p>
                    {recipe &&
                        `Upravil: ${
                            recipe.modifierFirstName
                                ? recipe.modifierFirstName +
                                      ' ' +
                                      recipe.modifierLastName ?? ''
                                : recipe.modifierUsername
                        } dňa: ${new Date(
                            recipe.updatedAt
                        ).toLocaleDateString()}`.trim()}
                </p>
            </div>
            {/* <button onClick={handlePrint}>Vytlačiť</button> */}
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

export default RecipeView;
