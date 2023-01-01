import React, { useEffect, useRef, useState } from 'react';
import { Button, Card, Col, Row } from 'react-bootstrap';

import { useParams } from 'react-router-dom';
import ReactToPrint from 'react-to-print';
import { Api } from '../../openapi';
import { pictureApi, recipeApi } from '../../utils/apiWrapper';
import { formatErrorMessage } from '../../utils/errorMessages';
import Modal from '../UI/Modal';

const RecipeView: React.FC = () => {
    const [recipe, setRecipe] = useState<RecipesWithUrlInPictures>();
    const [error, setError] = useState<string>();
    const params = useParams();
    const [serves, setServes] = useState<number>();
    const componentRef = useRef<HTMLDivElement>(null);

    interface PicturesWithUrl extends Api.Recipe.Picture {
        url?: string;
    }

    interface RecipesWithUrlInPictures extends Omit<Api.Recipe, 'pictures'> {
        pictures: PicturesWithUrl[];
    }

    useEffect(() => {
        (async () => {
            try {
                if (params.recipeId) {
                    const rec: RecipesWithUrlInPictures =
                        await recipeApi.getRecipe(+params.recipeId);

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

    function urlify(text: string) {
        var urlRegex = /(https?:\/\/[^\s]+)/g;

        return text.replace(urlRegex, (url) => {
            return `<a href="${url}" rel="noopener">${url}</a>`;
        });
    }

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
                {recipe && recipe.sources && recipe?.sources.length >= 1 && (
                    <section>
                        <h2>Zdroje</h2>
                        {recipe.sources.map((source) => (
                            <p
                                key={source}
                                dangerouslySetInnerHTML={{
                                    __html: urlify(source),
                                }}
                            ></p>
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
                                                        ingredient.unit
                                                            .abbreviation
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
                                                        ingredient.unit
                                                            .abbreviation
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
                                                        ingredient.unit
                                                            .abbreviation
                                                    } ${ingredient.name}`}
                                                </li>
                                            );
                                        }
                                    } else {
                                        return (
                                            <li
                                                key={ingredient.id}
                                            >{`${ingredient.unit.abbreviation} ${ingredient.name}`}</li>
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
                <br></br>
                <hr />
                <p>
                    {recipe &&
                        recipe.creator &&
                        `Pridal: ${
                            recipe.creator.firstName
                                ? recipe.creator.firstName +
                                      ' ' +
                                      recipe.creator.lastName ?? ''
                                : recipe.creator.username
                        } dňa: ${new Date(
                            recipe.createdAt
                        ).toLocaleDateString()}`.trim()}
                </p>
                <p>
                    {recipe &&
                        `Upravil: ${
                            recipe.modifier.firstName
                                ? recipe.modifier.firstName +
                                      ' ' +
                                      recipe.modifier.lastName ?? ''
                                : recipe.modifier.username
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
