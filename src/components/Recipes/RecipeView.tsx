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
    const [serves, setServes] = useState<number>();
    const componentRef = useRef<HTMLDivElement>(null);

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
                    if (rec.serves) {
                        setServes(rec.serves);
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

    const changeServesHandler = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setServes(+event.target.value);
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
                    <section>
                        <h2>Popis</h2>
                        <p>{recipe?.description}</p>
                    </section>
                )}
                {recipe?.serves !== null && (
                    <section>
                        <h2>Počet porcií</h2>
                        <input
                            type='number'
                            defaultValue={serves}
                            onChange={changeServesHandler}
                            style={{
                                width: 50,
                            }}
                            className='border-0'
                        ></input>
                    </section>
                )}

                {recipe?.method !== null && (
                    <section>
                        <h2>Postup prípravy</h2>
                        <p>{recipe?.method}</p>
                    </section>
                )}
                {recipe?.sources.length !== undefined && (
                    <section>
                        <h2>Zdroje</h2>
                        {recipe.sources.map((source) => (
                            <p key={source}>{source}</p>
                        ))}
                    </section>
                )}
                {recipe?.recipeSections.map((section) => {
                    return (
                        <section key={section.id}>
                            <h2>{section.name}</h2>
                            <h3>Suroviny</h3>
                            <ul>
                                {section.ingredients.map((ingredient) => {
                                    if (
                                        ingredient.value !== null &&
                                        serves &&
                                        recipe.serves
                                    ) {
                                        if (
                                            (ingredient.value / recipe.serves) *
                                                serves <
                                            10
                                        ) {
                                            return (
                                                <li key={ingredient.id}>
                                                    {`${
                                                        (+(
                                                            (ingredient.value /
                                                                recipe.serves) *
                                                            serves
                                                        ).toFixed(3) /
                                                            1000) *
                                                        1000
                                                    } ${
                                                        ingredient.unitAbbreviation
                                                    } ${ingredient.name}`}
                                                </li>
                                            );
                                        } else if (
                                            (ingredient.value / recipe.serves) *
                                                serves <
                                            100
                                        ) {
                                            return (
                                                <li key={ingredient.id}>
                                                    {`${
                                                        (+(
                                                            (ingredient.value /
                                                                recipe.serves) *
                                                            serves
                                                        ).toFixed(2) /
                                                            100) *
                                                        100
                                                    } ${
                                                        ingredient.unitAbbreviation
                                                    } ${ingredient.name}`}
                                                </li>
                                            );
                                        } else {
                                            return (
                                                <li key={ingredient.id}>
                                                    {`${
                                                        (+(
                                                            (ingredient.value /
                                                                recipe.serves) *
                                                            serves
                                                        ).toFixed(1) /
                                                            10) *
                                                        10
                                                    } ${
                                                        ingredient.unitAbbreviation
                                                    } ${ingredient.name}`}
                                                </li>
                                            );
                                        }
                                    } else {
                                        return (
                                            <li
                                                key={ingredient.id}
                                            >{`${ingredient.unitAbbreviation} ${ingredient.name}`}</li>
                                        );
                                    }
                                })}
                            </ul>
                            <h3>Postup prípravy</h3>
                            <p>{section?.method}</p>
                        </section>
                    );
                })}
                <section>
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
                </section>
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
