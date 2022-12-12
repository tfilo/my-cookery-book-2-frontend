import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { Button, Card, Col, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Api } from '../../openapi';
import { pictureApi, recipeApi } from '../../utils/apiWrapper';
import { formatErrorMessage } from '../../utils/errorMessages';
import Modal from '../UI/Modal';

const Recipes: React.FC = () => {
    // const [listOfRecipes, setListOfRecipes] = useState<Api.SimpleRecipePage>();
    const [error, setError] = useState<string>();
    const navigate = useNavigate();
    const [row, setRow] = useState<Api.SimpleRecipe>();
    const [list, setList] = useState<RecipeWithUrl>();

    type RecipeWithUrl = {
        page: number;
        pageSize: number;
        rows: {
            id: number;
            name: string;
            description: string | null;
            url?: string;
            pictures: Api.SimpleRecipe.Picture[];
        }[];
        count: number;
    };

    const data: Api.RecipeSearchCriteria = useMemo(() => {
        return {
            search: '',
            categoryId: null,
            tags: [],
            page: 0,
            pageSize: 24,
            orderBy: Api.RecipeSearchCriteria.OrderByEnum.Name,
            order: Api.RecipeSearchCriteria.OrderEnum.ASC,
        };
    }, []);

    useEffect(() => {
        (async () => {
            try {
                const recipes: RecipeWithUrl = await recipeApi.findRecipe(data);

                const xy: RecipeWithUrl = {
                    page: recipes.page,
                    pageSize: recipes.pageSize,
                    count: recipes.count,
                    rows: [],
                };

                for (let r of recipes.rows) {
                    if (r.pictures.length === 1) {
                        const receivedData =
                            await pictureApi.getPictureThumbnail(
                                r.pictures[0].id
                            );
                        if (receivedData instanceof Blob) {
                            const url = URL.createObjectURL(receivedData);
                            r.url = url;
                        }
                    } else {
                        r.url = '';
                    }
                    xy.rows.push(r);
                }
                setList(xy);
            } catch (err) {
                console.error(err);
            }
        })();
    }, [data]);

    const createRecipeHandler = () => {
        navigate('/recipe/create');
    };

    const updateRecipeHandler = (id: number) => {
        navigate(`/recipe/${id}`);
    };

    const deleteRecipeHandler = (row: Api.SimpleRecipe) => {
        setRow(row);
    };

    const deleteRecipeConfirmHandler = (status: boolean) => {
        (async () => {
            if (status === true) {
                if (row) {
                    try {
                        await recipeApi.deleteRecipe(row.id);
                        const recipes: RecipeWithUrl =
                            await recipeApi.findRecipe(data);

                        const xy: RecipeWithUrl = {
                            page: recipes.page,
                            pageSize: recipes.pageSize,
                            count: recipes.count,
                            rows: [],
                        };

                        for (let r of recipes.rows) {
                            if (r.pictures.length === 1) {
                                const receivedData =
                                    await pictureApi.getPictureThumbnail(
                                        r.pictures[0].id
                                    );
                                if (receivedData instanceof Blob) {
                                    const url =
                                        URL.createObjectURL(receivedData);
                                    r.url = url;
                                }
                            } else {
                                r.url = '';
                            }
                            xy.rows.push(r);
                        }
                        setList(xy);
                    } catch (err) {
                        formatErrorMessage(err).then((message) => {
                            setError(message);
                        });
                    }
                } else {
                    setError('Neplatné používateľské ID!');
                }
            }
            setRow(undefined);
        })();
    };

    const showRecipeHandler = (id: number) => {
        navigate(`/recipe/display/${id}`);
    };

    return (
        <Fragment>
            <div className='d-flex flex-column flex-md-row'>
                <h2 className='flex-grow-1'>Recepty</h2>
                <Button
                    variant='primary'
                    onClick={createRecipeHandler}
                    className='mb-3'
                >
                    Pridať recept
                </Button>
            </div>
            <Row xs={1} sm={2} lg={4} className='g-4'>
                {list?.rows.map((row) => {
                    return (
                        <Col key={row.id}>
                            <Card className='mb-4'>
                                {row.pictures.length === 0 && (
                                    <Card.Img
                                        onClick={showRecipeHandler.bind(
                                            null,
                                            row.id
                                        )}
                                        variant='top'
                                        src={
                                            process.env.PUBLIC_URL + '/177.jpg'
                                        }
                                        alt='obrázok'
                                        style={{
                                            aspectRatio: 1.33,
                                            objectFit: 'cover',
                                            opacity: 0.3,
                                        }}
                                    />
                                )}
                                {row.pictures.length > 0 && (
                                    <Card.Img
                                        onClick={showRecipeHandler.bind(
                                            null,
                                            row.id
                                        )}
                                        variant='top'
                                        src={row.url}
                                        alt='obrázok'
                                        style={{
                                            aspectRatio: 1.33,
                                            objectFit: 'cover',
                                        }}
                                    />
                                )}
                                <Card.Body>
                                    <Card.Title>{row.name}</Card.Title>
                                    <Button
                                        variant='outline-primary'
                                        type='button'
                                        onClick={updateRecipeHandler.bind(
                                            null,
                                            row.id
                                        )}
                                        className='w-100'
                                    >
                                        Upraviť recept
                                    </Button>
                                    <Button
                                        variant='outline-danger'
                                        type='button'
                                        onClick={deleteRecipeHandler.bind(
                                            null,
                                            row
                                        )}
                                        className='w-100 mt-1'
                                    >
                                        Vymazať recept
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    );
                })}
            </Row>

            <Modal
                show={!!row}
                type='question'
                message={`Prajete si vymazať recept "${row?.name}" ?`}
                onClose={deleteRecipeConfirmHandler}
            />
            <Modal
                show={!!error}
                message={error}
                type='error'
                onClose={() => {
                    setError(undefined);
                }}
            />
        </Fragment>
    );
};

export default Recipes;
