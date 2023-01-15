import React, { Fragment, useEffect, useMemo, useState } from 'react';
import {
    Button,
    Card,
    Col,
    Collapse,
    Dropdown,
    Form,
    Pagination,
    Row,
} from 'react-bootstrap';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
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
import {
    faArrowDownAZ,
    faArrowDownZA,
    faFilter,
    faGripVertical,
    faMagnifyingGlass,
    faPencil,
} from '@fortawesome/free-solid-svg-icons';
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import { debounce } from 'lodash';
import Spinner from '../UI/Spinner';
import { orderByLabels } from '../../translate/orderByLabels';

interface SimpleRecipeWithUrl extends Api.SimpleRecipe {
    url?: string;
}

interface RecipeWithUrl extends Omit<Api.SimpleRecipePage, 'rows'> {
    rows: SimpleRecipeWithUrl[];
}

const pagesToShow = 5;
const pageSize = 12;

export const recipesUrlWithCategory = (categoryId?: string | number) => {
    if (!categoryId || categoryId.toString() === '-1') {
        return '/recipes';
    }
    return '/recipes/' + categoryId;
};

const Recipes: React.FC = () => {
    const [error, setError] = useState<string>();
    const navigate = useNavigate();
    const { state } = useLocation();
    const [recipes, setRecipes] = useState<RecipeWithUrl>();
    const [currentPage, setCurrentPage] = useState(state?.currentPage ?? 1);
    const [searchingText, setSearchingText] = useState(
        state?.searchingText ?? ''
    );
    const [listOfCategories, setListOfCategories] = useState<
        Api.SimpleCategory[]
    >([]);
    const [listOfTags, setListOfTags] = useState<Api.SimpleTag[]>([]);
    const [selectedTags, setSelectedTags] = useState<Api.SimpleTag[]>(
        state?.searchingTags ?? []
    );
    const [showFilter, setShowFilter] = useState(false);
    const [order, setOrder] = useState(
        state?.order ?? Api.RecipeSearchCriteria.OrderEnum.ASC
    );
    const [orderBy, setOrderBy] = useState(
        state?.orderBy ?? Api.RecipeSearchCriteria.OrderByEnum.Name
    );
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isLoadingRecipes, setIsLoadingRecipes] = useState<boolean>(false);
    const params = useParams();
    const categoryId = params?.categoryId ? parseInt(params?.categoryId) : -1;

    useEffect(() => {
        if (categoryId > 0 || selectedTags.length > 0) {
            setShowFilter(true);
        }
    }, [categoryId, selectedTags]);

    const criteria: Api.RecipeSearchCriteria = useMemo(() => {
        const searchingTags = selectedTags.map((t) => t.id);
        return {
            search: searchingText,
            categoryId: categoryId === -1 ? null : categoryId,
            tags: searchingTags,
            page: currentPage - 1,
            pageSize: pageSize,
            orderBy: orderBy,
            order: order,
        };
    }, [currentPage, searchingText, selectedTags, categoryId, order, orderBy]);

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

    useEffect(() => {
        (async () => {
            try {
                setIsLoading(true);
                const categories = await categoryApi.getCategories();
                setListOfCategories(categories);
                const tags = await tagApi.getTags();
                setListOfTags(tags);
            } catch (err) {
                formatErrorMessage(err).then((message) => {
                    setError(message);
                });
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    useEffect(() => {
        (async () => {
            try {
                setIsLoadingRecipes(true);
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
                    }
                    formattedRecipe.rows.push(r);
                }
                setRecipes((prev) => {
                    if (prev) {
                        prev.rows.forEach(
                            (r) => r.url && URL.revokeObjectURL(r.url)
                        );
                    }
                    return formattedRecipe;
                });
            } catch (err) {
                formatErrorMessage(err).then((message) => {
                    setError(message);
                });
            } finally {
                setIsLoadingRecipes(false);
            }
        })();
    }, [criteria]);

    const createRecipeHandler = () => {
        navigate('/recipe/create', {
            state: {
                searchingText: searchingText,
                searchingTags: selectedTags,
                searchingCategory: categoryId,
                currentPage: currentPage,
                order: order,
                orderBy: orderBy,
            },
        });
    };

    const editRecipeHandler = (
        event: React.MouseEvent<HTMLButtonElement>,
        id: number
    ) => {
        event.stopPropagation();
        navigate(`/recipe/${id}`, {
            state: {
                searchingText: searchingText,
                searchingTags: selectedTags,
                searchingCategory: categoryId,
                currentPage: currentPage,
                order: order,
                orderBy: orderBy,
            },
        });
    };

    const showRecipeHandler = (id: number) => {
        navigate(`/recipe/display/${id}`, {
            state: {
                searchingText: searchingText,
                searchingTags: selectedTags,
                searchingCategory: categoryId,
                currentPage: currentPage,
                order: order,
                orderBy: orderBy,
            },
        });
    };

    const changePageHandler = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const searchTextHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchingText(event.target.value);
        setCurrentPage(1);
    };

    const debouncedChangeHandler = useMemo(
        () => debounce(searchTextHandler, 500),
        []
    );

    const toggleOrder = () => {
        setOrder(
            order === Api.RecipeSearchCriteria.OrderEnum.ASC
                ? Api.RecipeSearchCriteria.OrderEnum.DESC
                : Api.RecipeSearchCriteria.OrderEnum.ASC
        );
    };

    const orderByDropdownItems = (
        orderBy: Api.RecipeSearchCriteria.OrderByEnum
    ) => {
        setOrderBy(orderBy);
        setCurrentPage(1);
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
                    onChange={debouncedChangeHandler}
                    defaultValue={searchingText}
                />
                <Button
                    variant='outline-secondary'
                    title='Zobraziť filter'
                    onClick={() => setShowFilter(!showFilter)}
                    aria-controls='collapse'
                    aria-expanded={showFilter}
                    className='search-button'
                >
                    <FontAwesomeIcon icon={faFilter} />
                </Button>
                <Button
                    variant='outline-secondary'
                    title={
                        order === Api.RecipeSearchCriteria.OrderEnum.ASC
                            ? 'Zoradiť zostupne'
                            : 'Zoradiť vzostupne'
                    }
                    onClick={() => {
                        toggleOrder();
                    }}
                    className='search-button'
                >
                    <FontAwesomeIcon
                        icon={
                            order === Api.RecipeSearchCriteria.OrderEnum.ASC
                                ? faArrowDownZA
                                : faArrowDownAZ
                        }
                    />
                </Button>
                <Dropdown>
                    <Dropdown.Toggle
                        variant='outline-secondary'
                        className='search-button dropdown'
                    >
                        <FontAwesomeIcon icon={faGripVertical} />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        {Object.values(
                            Api.RecipeSearchCriteria.OrderByEnum
                        ).map((value) => (
                            <Dropdown.Item
                                key={value}
                                onClick={() => {
                                    orderByDropdownItems(value);
                                }}
                                active={orderBy === value}
                            >
                                {orderByLabels[value]}
                            </Dropdown.Item>
                        ))}
                    </Dropdown.Menu>
                </Dropdown>
            </div>
            <Collapse in={showFilter}>
                <div>
                    <Card className='mb-3' id='collapse'>
                        <div className='m-3'>
                            <Form.Group className='mb-3'>
                                <Form.Label htmlFor='categorySelection'>
                                    Kategória
                                </Form.Label>
                                <Form.Select
                                    id='categorySelection'
                                    aria-label='Výber kategórie receptu'
                                    className={
                                        categoryId === -1
                                            ? 'text-secondary'
                                            : ''
                                    }
                                    onChange={(e) => {
                                        navigate(recipesUrlWithCategory(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    value={`${categoryId}`}
                                >
                                    <option value='-1' className='text-dark'>
                                        Vyberte kategóriu receptu
                                    </option>
                                    {listOfCategories?.map((category) => (
                                        <option
                                            key={category.id}
                                            value={category.id}
                                            className='text-dark'
                                        >
                                            {category.name}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label htmlFor='tagsMultiselection'>
                                    Značky
                                </Form.Label>
                                <Typeahead
                                    id='tagsMultiselection'
                                    labelKey='name'
                                    onChange={(selected) => {
                                        // TODO toto tiez moze byt ako handler ale nemusi :)
                                        setSelectedTags(
                                            selected as Api.SimpleTag[]
                                        );
                                        setCurrentPage(1);
                                    }}
                                    options={listOfTags}
                                    placeholder='Vyberte ľubovoľný počet značiek'
                                    selected={selectedTags}
                                    multiple
                                />
                                {listOfTags.length < 1 && (
                                    <p className='text-danger'>
                                        Nie je možné vybrať žiadnu značku,
                                        nakoľko žiadna nie je zadefinovaná.
                                    </p>
                                )}
                            </Form.Group>
                        </div>
                    </Card>
                </div>
            </Collapse>
            <Row xs={1} sm={2} lg={4} className='g-4'>
                {recipes?.rows.map((row) => {
                    return (
                        <Col key={row.id}>
                            <Card
                                className='mb-3 overflow-hidden'
                                role='button'
                                onClick={showRecipeHandler.bind(null, row.id)}
                            >
                                <Card.Img
                                    variant='top'
                                    src={row.url ?? defImg}
                                    alt='obrázok'
                                    style={{
                                        aspectRatio: 1,
                                        objectFit: 'cover',
                                        opacity: row.url ? 1 : 0.3,
                                    }}
                                />
                                <Card.ImgOverlay className='d-flex flex-column-reverse p-0'>
                                    <Card.Text
                                        className='m-0 p-2'
                                        style={{
                                            backgroundColor: 'rgba(0,0,0,0.5)',
                                        }}
                                    >
                                        <span className='text-white'>
                                            {row.description}
                                        </span>
                                    </Card.Text>
                                    <Card.Title
                                        className='m-0 p-2'
                                        style={{
                                            backgroundColor: 'rgba(0,0,0,0.5)',
                                        }}
                                    >
                                        <span className='text-white'>
                                            {row.name}
                                        </span>
                                    </Card.Title>
                                    <Button
                                        title='Upraviť'
                                        variant='outline-secondary'
                                        type='button'
                                        onClick={(e) =>
                                            editRecipeHandler(e, row.id)
                                        }
                                        className='position-absolute border-0'
                                        style={{ top: 0, right: 0 }}
                                    >
                                        <FontAwesomeIcon icon={faPencil} />
                                    </Button>
                                </Card.ImgOverlay>
                            </Card>
                        </Col>
                    );
                })}
            </Row>
            {recipes && recipes?.rows.length < 1 && (
                <p className='mt-3'>Neboli nájdené žiadne výsledky.</p>
            )}

            {!!numOfPages && numOfPages > 1 && (
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
            {(isLoading || isLoadingRecipes) && <Spinner />}
        </Fragment>
    );
};

export default Recipes;
