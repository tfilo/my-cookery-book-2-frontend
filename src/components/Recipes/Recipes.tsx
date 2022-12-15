import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { Button, Card, Col, Pagination, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Api } from '../../openapi';
import { pictureApi, recipeApi } from '../../utils/apiWrapper';
import Modal from '../UI/Modal';
import defImg from '../../assets/defaultRecipe.jpg';
import { formatErrorMessage } from '../../utils/errorMessages';

const Recipes: React.FC = () => {
    const [error, setError] = useState<string>();
    const navigate = useNavigate();
    const [list, setList] = useState<RecipeWithUrl>();
    const [currentPage, setCurrentPage] = useState(1);
    const [numberOfPages, setNumberOfPages] = useState<number>();

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
            page: currentPage-1,
            pageSize: 2,
            orderBy: Api.RecipeSearchCriteria.OrderByEnum.Name,
            order: Api.RecipeSearchCriteria.OrderEnum.ASC,
        };
    }, [currentPage]);

    useEffect(() => {
        (async () => {
            try {
                const recipes: RecipeWithUrl = await recipeApi.findRecipe(data);

                const formattedRecipe: RecipeWithUrl = {
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
                    formattedRecipe.rows.push(r);
                }
                const round = Math.ceil(
                    formattedRecipe?.count / formattedRecipe?.pageSize
                );
                setNumberOfPages(round);
                setList(formattedRecipe);
                // console.log(
                //     `currentPage: ${currentPage}, page: ${formattedRecipe?.page} count: ${formattedRecipe?.count} pageSize: ${formattedRecipe?.pageSize} numberOfPages: ${numberOfPages}`
                // );
            } catch (err) {
                formatErrorMessage(err).then((message) => {
                    setError(message);
                });
            }
        })();
    }, [data]);

    const createRecipeHandler = () => {
        navigate('/recipe/create');
    };

    const updateRecipeHandler = (id: number) => {
        navigate(`/recipe/${id}`);
    };

    const showRecipeHandler = (id: number) => {
        navigate(`/recipe/display/${id}`);
    };

    const previousPageHandler = () => {
        setCurrentPage(currentPage - 1);
    };

    const nextPageHandler = () => {
        setCurrentPage((currentPage) => currentPage + 1);
    };

    const firstPageHandler = () => {
        setCurrentPage(1);
    };

    const lastPageHandler = () => {
        if (numberOfPages) {
            setCurrentPage(numberOfPages);
        }
    };

    const previousPageHandler1 = () => {
        setCurrentPage(currentPage - 1);
    };
    const previousPageHandler2 = () => {
        setCurrentPage(currentPage - 2);
    };
    const nextPageHandler1 = () => {
        setCurrentPage(currentPage + 1);
    };
    const nextPageHandler2 = () => {
        setCurrentPage(currentPage + 2);
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
                                        src={defImg}
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
                                </Card.Body>
                            </Card>
                        </Col>
                    );
                })}
            </Row>
            <Pagination className='justify-content-center'>
                <Pagination.First
                    onClick={firstPageHandler}
                    disabled={currentPage === 1}
                />
                <Pagination.Prev
                    onClick={previousPageHandler}
                    disabled={currentPage === 1}
                />
                {currentPage === numberOfPages && (
                    <Pagination.Item onClick={previousPageHandler2}>
                        {currentPage - 2}
                    </Pagination.Item>
                )}

                {currentPage !== 1 && (
                    <Pagination.Item onClick={previousPageHandler1}>
                        {currentPage - 1}
                    </Pagination.Item>
                )}
                <Pagination.Item active>{currentPage}</Pagination.Item>
                {currentPage !== numberOfPages && (
                    <Pagination.Item onClick={nextPageHandler1}>
                        {currentPage + 1}
                    </Pagination.Item>
                )}
                {currentPage === 1 && (
                    <Pagination.Item onClick={nextPageHandler2}>
                        {currentPage + 2}
                    </Pagination.Item>
                )}

                <Pagination.Next
                    onClick={nextPageHandler}
                    disabled={currentPage === numberOfPages}
                />
                <Pagination.Last
                    onClick={lastPageHandler}
                    disabled={currentPage === numberOfPages}
                />
            </Pagination>
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
