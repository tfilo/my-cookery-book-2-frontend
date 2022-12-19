import React, {
    Fragment,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { Button, Card, Col, Pagination, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Api } from '../../openapi';
import { pictureApi, recipeApi } from '../../utils/apiWrapper';
import Modal from '../UI/Modal';
import defImg from '../../assets/defaultRecipe.jpg';
import { formatErrorMessage } from '../../utils/errorMessages';


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

const Recipes: React.FC = () => {
    const [error, setError] = useState<string>();
    const navigate = useNavigate();
    const [list, setList] = useState<RecipeWithUrl>();
    const [currentPage, setCurrentPage] = useState(1);
    const [numberOfPages, setNumberOfPages] = useState<number>();
    const [arrayOfPageNumbers, setArrayOfPageNumbers] = useState<number[]>();

    const data: Api.RecipeSearchCriteria = useMemo(() => {
        return {
            search: '',
            categoryId: null,
            tags: [],
            page: currentPage - 1,
            pageSize: 2,
            orderBy: Api.RecipeSearchCriteria.OrderByEnum.Name,
            order: Api.RecipeSearchCriteria.OrderEnum.ASC,
        };
    }, [currentPage]);

    const pagesToShow = 5;
    const calculateArray = useCallback(
        (currentPage: number, numberOfPages: number) => {
            const showNumbers: number[] = [];
            if (numberOfPages) {
                const firstPage = Math.max(
                    Math.min(
                        currentPage - Math.floor((pagesToShow - 1) / 2),
                        numberOfPages - pagesToShow + 1
                    ),
                    1
                );
                const lastPage = Math.min(
                    firstPage + (pagesToShow - 1),
                    numberOfPages
                );

                console.log(firstPage, lastPage, currentPage, numberOfPages);

                for (let i = firstPage; i <= lastPage; i++) {
                    showNumbers.push(i);
                }
            }
            setArrayOfPageNumbers(showNumbers);
            console.log(showNumbers);
        },
        []
    );

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

                calculateArray(recipes.page + 1, round);
                // console.warn(
                //     `currentPage: ${currentPage}, page: ${formattedRecipe?.page} count: ${formattedRecipe?.count} pageSize: ${formattedRecipe?.pageSize} numberOfPages: ${numberOfPages}`
                // );
            } catch (err) {
                formatErrorMessage(err).then((message) => {
                    setError(message);
                });
            }
        })();
    }, [data, calculateArray]);

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

    const changePageHandler = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    
    console.log(list);

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

            {list && list.count / list.pageSize > 1 && (
                <Pagination className='justify-content-center'>
                    <Pagination.First
                        onClick={firstPageHandler}
                        disabled={currentPage === 1}
                    />
                    <Pagination.Prev
                        onClick={previousPageHandler}
                        disabled={currentPage === 1}
                    />

                    {arrayOfPageNumbers?.map((v, idx) => (
                        <Pagination.Item
                            key={idx}
                            onClick={() => changePageHandler(v)}
                            active={v === currentPage}
                        >
                            {v}
                        </Pagination.Item>
                    ))}

                    <Pagination.Next
                        onClick={nextPageHandler}
                        disabled={currentPage === numberOfPages}
                    />
                    <Pagination.Last
                        onClick={lastPageHandler}
                        disabled={currentPage === numberOfPages}
                    />
                </Pagination>
            )}
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
