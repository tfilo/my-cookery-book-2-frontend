import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { Button, Card, Col, /*Form,*/ Pagination, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Api } from '../../openapi';
import { pictureApi, recipeApi } from '../../utils/apiWrapper';
import Modal from '../UI/Modal';
import defImg from '../../assets/defaultRecipe.jpg';
import { formatErrorMessage } from '../../utils/errorMessages';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faFilter } from '@fortawesome/free-solid-svg-icons';
// import Input from '../UI/Input';
// import { FormProvider, useForm, SubmitHandler } from 'react-hook-form';
// import Spinner from '../UI/Spinner';

const Recipes: React.FC = () => {
    const [error, setError] = useState<string>();
    const navigate = useNavigate();
    const [list, setList] = useState<RecipeWithUrl>();
    const [currentPage, setCurrentPage] = useState(1);
    const [numberOfPages, setNumberOfPages] = useState<number>();
    // const [showFilter, setShowFilter] = useState<boolean>(false);
    const [arrayOfPageNumbers, setArrayOfPageNumbers] = useState<number[]>();

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
            page: currentPage - 1,
            pageSize: 2,
            orderBy: Api.RecipeSearchCriteria.OrderByEnum.Name,
            order: Api.RecipeSearchCriteria.OrderEnum.ASC,
        };
    }, [currentPage]);

    // const methods = useForm();

    // const {
    //     formState: { isSubmitting },
    // } = methods;

    const pagesToShow = 10;

    const calculateArray = () => {
        const showNumbers: number[] = [];
        // for (let i = 1; i <= pagesToShow; i ++) {
        //     showNumbers.push(i+100)
        // }
        if (numberOfPages) {
                const begginning = Math.max(currentPage - Math.floor((pagesToShow-1)/2), 1);
                //showNumbers.splice(0, 1, begginning);
                const last = Math.min(begginning + pagesToShow, numberOfPages);
                //showNumbers.splice(showNumbers.length-1, 1, last);
                for (let i = begginning; i <= last; i++) {
                    showNumbers.push(i);
                }
        }
        console.log(showNumbers);

        // if(list?.pageSize) {
        //     const trimStart = (currentPage-1) * list?.pageSize;
        //     const trimEnd = trimStart + list.pageSize;
        //     console.log(showNumbers.slice(trimStart, trimEnd))
        // }

        // const pageNumbers = [];
        // if (numberOfPages) {
        //     const begginning = currentPage - Math.floor(pagesToShow/2);
        //     const beg= currentPage - Math.floor(pagesToShow/2) + 1;
        //     const cur = currentPage;
        //     const next = currentPage + Math.floor(pagesToShow/2) -1;
        //     const last = currentPage + Math.floor(pagesToShow/2);
        //     showNumbers.push(begginning, beg, cur, next, last);
        // }
        setArrayOfPageNumbers(showNumbers);
        console.log(showNumbers);

            
        // if (numberOfPages) {
        //     for (let i = 1; i <= numberOfPages; i++) {
        //         pageNumbers.push(i);
        //     }

        //     if (pageNumbers.length < 6) {
        //         showNumbers = [...pageNumbers];
        //         console.log(showNumbers);
        //     } else if (
        //         pageNumbers.length >= 6 &&
        //         pageNumbers.length < 8 &&
        //         currentPage === 1
        //     ) {
        //         showNumbers.push(
        //             currentPage,
        //             currentPage + 1,
        //             currentPage + 2,
        //             currentPage + 3,
        //             currentPage + 4
        //         );
        //     } else if (
        //         pageNumbers.length >= 6 &&
        //         pageNumbers.length < 8 &&
        //         currentPage === 2
        //     ) {
        //         showNumbers.push(
        //             currentPage - 1,
        //             currentPage,
        //             currentPage + 1,
        //             currentPage + 2,
        //             currentPage + 3
        //         );
        //     } else if (
        //         pageNumbers.length >= 6 &&
        //         pageNumbers.length < 8 &&
        //         currentPage === 3
        //     ) {
        //         showNumbers.push(
        //             currentPage - 2,
        //             currentPage - 1,
        //             currentPage,
        //             currentPage + 1,
        //             currentPage + 2
        //         );
        //     } else {
        //         showNumbers.push(
        //             currentPage - 2,
        //             currentPage - 1,
        //             currentPage,
        //             currentPage + 1,
        //             currentPage + 2
        //         );
        //     }
        // }
    };
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

                calculateArray();
                console.log(
                    `currentPage: ${currentPage}, page: ${formattedRecipe?.page} count: ${formattedRecipe?.count} pageSize: ${formattedRecipe?.pageSize} numberOfPages: ${numberOfPages}`
                );
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

    const changePageHandler = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    // const previousPageHandler1 = () => {
    //     setCurrentPage(currentPage - 1);
    // };
    // const previousPageHandler2 = () => {
    //     setCurrentPage(currentPage - 2);
    // };
    // const nextPageHandler1 = () => {
    //     setCurrentPage(currentPage + 1);
    // };
    // const nextPageHandler2 = () => {
    //     setCurrentPage(currentPage + 2);
    // };

    // const showFilterHandler = () => {
    //     setShowFilter(!showFilter);
    // };

    // const submitHandler: SubmitHandler<data> = async (
    //     values: data
    // ) => {
    //     const sendData = {};
    // };

    return (
        <Fragment>
            <div className='d-flex flex-column flex-md-row'>
                <h2 className='flex-grow-1'>Recepty</h2>
                {/* <Button
                    variant='light'
                    aria-label='presunúť sekciu nadol'
                    type='button'
                    onClick={showFilterHandler}
                    className='mb-3'
                >
                    <FontAwesomeIcon className='text-dark' icon={faFilter} />
                </Button> */}
                <Button
                    variant='primary'
                    onClick={createRecipeHandler}
                    className='mb-3'
                >
                    Pridať recept
                </Button>
            </div>
            {/* {showFilter && (
                <FormProvider {...methods}>
                    <Form
                        onSubmit={methods.handleSubmit(submitHandler)}
                        noValidate
                    >
                        <Input name='search' label='Názov'></Input>
                        <Input name='categoryId' label='Kategórie'></Input>
                        <Input name='tags' label='Značky'></Input>
                        <Button
                            variant='primary'
                            type='submit'
                            className='mb-3'
                        >
                            Pridať recept
                        </Button>
                    </Form>
                </FormProvider>
            )} */}
            {/* {isSubmitting && <Spinner />} */}
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
            
            {(list?.count / list?.pageSize) > 1 && (
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

                    {/* {currentPage !== 1 &&
                        currentPage === numberOfPages &&
                        numberOfPages !== 2 && (
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

                    {currentPage !== numberOfPages &&
                        currentPage === 1 &&
                        numberOfPages !== 2 && (
                            <Pagination.Item onClick={nextPageHandler2}>
                                {currentPage + 2}
                            </Pagination.Item>
                        )} */}

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
