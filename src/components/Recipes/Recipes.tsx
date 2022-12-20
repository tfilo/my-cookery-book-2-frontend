import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { Button, Card, Col, Form, Pagination, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Api } from '../../openapi';
import {
    categoryApi,
    pictureApi,
    recipeApi,
    tagApi,
} from '../../utils/apiWrapper';
import Modal from '../UI/Modal';
import defImg from '../../assets/defaultRecipe.jpg';
import { formatErrorMessage } from '../../utils/errorMessages';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

interface SimpleRecipeWithUrl extends Api.SimpleRecipe {
    url?: string
}

interface RecipeWithUrl extends Omit<Api.SimpleRecipePage, 'rows'> {
    rows: SimpleRecipeWithUrl[]
}

// type RecipeWithUrl = {
//     page: number;
//     pageSize: number;
//     rows: {
//         id: number;
//         name: string;
//         description: string | null;
//         url?: string;
//         pictures: Api.SimpleRecipe.Picture[];
//     }[];
//     count: number;
// };

const pagesToShow = 5;
const pageSize = 2;

const Recipes: React.FC = () => {
    const [error, setError] = useState<string>();
    const navigate = useNavigate();
    const [recipes, setRecipes] = useState<RecipeWithUrl>();
    const [currentPage, setCurrentPage] = useState(1);
    const [searchingText, setSearchingText] = useState('');
    const [searchingCategory, setSearchingCategory] = useState<number | null>(
        null
    );
    const [searchingTags, setSearchingTags] = useState<number[]>([]);
    const [listOfCategories, setListOfCategories] = useState<
        Api.SimpleCategory[]
    >([]);
    const [listOfTags, setListOfTags] = useState<Api.SimpleTag[]>([]);

    const criteria: Api.RecipeSearchCriteria = useMemo(() => {
        return {
            search: searchingText,
            categoryId: searchingCategory,
            tags: searchingTags,
            page: currentPage - 1,
            pageSize: pageSize,
            orderBy: Api.RecipeSearchCriteria.OrderByEnum.Name,
            order: Api.RecipeSearchCriteria.OrderEnum.ASC,
        };
    }, [currentPage, searchingText, searchingCategory, searchingTags]);

    const numOfPages = recipes
        ? Math.ceil(recipes.count / recipes.pageSize)
        : undefined;

    const pages = useMemo(() => {
        const showNumbers: number[] = [];
        if (numOfPages) {
            const firstPage = Math.max(
                Math.min(
                    currentPage - Math.floor((pagesToShow - 1) / 2),
                    numOfPages - pagesToShow + 1
                ),
                1
            );
            const lastPage = Math.min(
                firstPage + (pagesToShow - 1),
                numOfPages
            );

            for (let i = firstPage; i <= lastPage; i++) {
                showNumbers.push(i);
            }
        }
        return showNumbers;
    }, [numOfPages, currentPage]);

    // useEffect(() => {
    //     (async() => {
    //         try {
    //             const categories = await categoryApi.getCategories();
    //             setListOfCategories(categories);
    //             const tags = await tagApi.getTags();
    //             setListOfTags(tags);
    //         }

    //     })();
    // }, [])

    useEffect(() => {
        (async () => {
            try {

                // TODO toto sa nema tahat pri kazdej zmene kriterii, nie je na to dovod
                const categories = await categoryApi.getCategories();
                setListOfCategories(categories);

                // TODO toto sa nema tahat pri kazdej zmene kriterii, nie je na to dovod
                const tags = await tagApi.getTags();
                setListOfTags(tags);

                const recipes: RecipeWithUrl = await recipeApi.findRecipe(
                    criteria
                );

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
                setRecipes(formattedRecipe);
            } catch (err) {
                formatErrorMessage(err).then((message) => {
                    setError(message);
                });
            }
        })();
    }, [criteria]);

    const createRecipeHandler = () => {
        navigate('/recipe/create');
    };

    const updateRecipeHandler = (id: number) => {
        navigate(`/recipe/${id}`);
    };

    const showRecipeHandler = (id: number) => {
        navigate(`/recipe/display/${id}`);
    };

    const changePageHandler = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const changeSearchingHandler = (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        const selectedOptions = (event.currentTarget.selectedOptions);
        const options = [];
        for (let o = 0;  o < selectedOptions.length; o++) {
            options.push(+selectedOptions[o].value)
        }
        console.log(options);
        setSearchingTags(options);
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
            <div className='input-group mb-3'>
                <span className='input-group-text'>
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                </span>
                <input
                    type='search'
                    className='form-control'
                    placeholder='Vyhľadávanie'
                    aria-label='vyhľadávanie'
                    onChange={(e) => setSearchingText(e.target.value)}
                />
            </div>
            <Form.Select
                aria-label='Výber kategórie receptu'
                className='mb-3'
                onChange={(e) => setSearchingCategory(+e.target.value)}
            >
                <option>Vyberte kategóriu receptu</option>
                {listOfCategories?.map((category) => (
                    <option key={category.id} value={category.id}>
                        {category.name}
                    </option>
                ))}
            </Form.Select>
            {listOfCategories.length < 1 && (
                <p className='text-danger'>
                    Nie je možné vybrať žiadnu kategóriu, nakoľko žiadna nie je
                    zadefinovaná.
                </p>
            )}
            <Form.Select
                aria-label='Viacnásobný výber značky receptu'
                className='mb-3'
                multiple
                onChange={changeSearchingHandler}
            >
                {listOfTags?.map((tag) => (
                    <option key={tag.id} value={tag.id}>
                        {tag.name}
                    </option>
                ))}
            </Form.Select>
            {listOfTags.length < 1 && (
                <p className='text-danger'>
                    Nie je možné vybrať žiadnu značku, nakoľko žiadna nie je
                    zadefinovaná.
                </p>
            )}
            <Row xs={1} sm={2} lg={4} className='g-4'>
                {recipes?.rows.map((row) => {
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

            {numOfPages && numOfPages > 1 && (
                <Pagination className='justify-content-center'>
                    <Pagination.First
                        onClick={() => changePageHandler(1)}
                        disabled={currentPage === 1}
                    />
                    <Pagination.Prev
                        onClick={() => changePageHandler(currentPage - 1)}
                        disabled={currentPage === 1}
                    />

                    {pages.map((v, idx) => (
                        <Pagination.Item
                            key={idx}
                            onClick={() => changePageHandler(v)}
                            active={v === currentPage}
                        >
                            {v}
                        </Pagination.Item>
                    ))}

                    <Pagination.Next
                        onClick={() => changePageHandler(currentPage + 1)}
                        disabled={currentPage === numOfPages}
                    />
                    <Pagination.Last
                        onClick={() => changePageHandler(numOfPages)}
                        disabled={currentPage === numOfPages}
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
