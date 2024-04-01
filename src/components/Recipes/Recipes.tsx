import React, { Fragment, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Card, Col, Collapse, Dropdown, Form, Pagination, Row } from 'react-bootstrap';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Api } from '../../openapi';
import { categoryApi, pictureApi, recipeApi, tagApi } from '../../utils/apiWrapper';
import Modal from '../UI/Modal';
import defImg from '../../assets/defaultRecipe.jpg';
import { formatErrorMessage } from '../../utils/errorMessages';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDownAZ, faArrowDownZA, faFilter, faGripVertical, faMagnifyingGlass, faPencil } from '@fortawesome/free-solid-svg-icons';
import { Typeahead, TypeaheadComponentProps } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import { debounce } from 'lodash';
import Spinner from '../UI/Spinner';
import { orderByLabels } from '../../translate/orderByLabels';
import { AuthContext } from '../../store/auth-context';
import { useQueryClient } from '@tanstack/react-query';

interface SimpleRecipeWithUrl extends Api.SimpleRecipe {
    url?: string;
}

interface RecipeWithUrl extends Omit<Api.SimpleRecipePage, 'rows'> {
    rows: SimpleRecipeWithUrl[];
}

export type RecipeState = {
    searchingText: string;
    searchingCategory: number | undefined;
    selectedTags: Api.SimpleTag[];
    currentPage: number;
    order: Api.RecipeSearchCriteria.OrderEnum;
    orderBy: Api.RecipeSearchCriteria.OrderByEnum;
};

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
    const [searchingText, setSearchingText] = useState(state?.searchingText ?? '');
    const [listOfCategories, setListOfCategories] = useState<Api.SimpleCategory[]>([]);
    const [listOfTags, setListOfTags] = useState<Api.SimpleTag[]>([]);
    const [selectedTags, setSelectedTags] = useState<Api.SimpleTag[]>(state?.selectedTags ?? []);
    const [showFilter, setShowFilter] = useState(false);
    const [order, setOrder] = useState(state?.order ?? Api.RecipeSearchCriteria.OrderEnum.DESC);
    const [orderBy, setOrderBy] = useState(state?.orderBy ?? Api.RecipeSearchCriteria.OrderByEnum.UpdatedAt);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isLoadingRecipes, setIsLoadingRecipes] = useState<boolean>(false);
    const params = useParams();
    const categoryId = params?.categoryId ? parseInt(params?.categoryId) : -1;
    const authCtx = useContext(AuthContext);
    const searchingTextInputRef = useRef(searchingText);
    const queryClient = useQueryClient();

    useEffect(() => {
        if (categoryId > 0 || selectedTags.length > 0) {
            setShowFilter(true);
        }
    }, [categoryId, selectedTags]);

    useEffect(() => {
        if (state) {
            setCurrentPage(state.currentPage);
            setOrder(state.order);
            setOrderBy(state.orderBy);
            setSelectedTags(state.selectedTags);
            setSearchingText(state.searchingText);
            searchingTextInputRef.current.value = state.searchingText;
        }
    }, [state]);

    const criteria: Api.RecipeSearchCriteria = useMemo(() => {
        return {
            search: searchingText,
            categoryId: categoryId === -1 ? null : categoryId,
            tags: selectedTags.map((t) => t.id),
            page: currentPage - 1,
            pageSize: pageSize,
            orderBy: orderBy,
            order: order
        };
    }, [currentPage, searchingText, selectedTags, categoryId, order, orderBy]);

    const numOfPages = recipes ? Math.ceil(recipes.count / recipes.pageSize) : undefined;

    const pages = useMemo(() => {
        const showNumbers: number[] = [];
        if (numOfPages) {
            const firstPage = Math.max(Math.min(currentPage - Math.floor((pagesToShow - 1) / 2), numOfPages - pagesToShow + 1), 1);
            const lastPage = Math.min(firstPage + (pagesToShow - 1), numOfPages);

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
                const categories = await queryClient.fetchQuery({
                    queryKey: ['categories'] as const,
                    queryFn: ({ signal }) =>
                        categoryApi.getCategories({ signal }).then((data) =>
                            data.sort((a, b) =>
                                a.name.localeCompare(b.name, undefined, {
                                    sensitivity: 'base'
                                })
                            )
                        )
                });
                setListOfCategories(categories);
                const tags = await queryClient.fetchQuery({
                    queryKey: ['tags'] as const,
                    queryFn: ({ signal }) =>
                        tagApi.getTags({ signal }).then((data) =>
                            data.sort((a, b) =>
                                a.name.localeCompare(b.name, undefined, {
                                    sensitivity: 'base'
                                })
                            )
                        )
                });
                setListOfTags(tags);
            } catch (err) {
                formatErrorMessage(err).then((message) => {
                    setError(message);
                });
            } finally {
                setIsLoading(false);
            }
        })();
    }, [queryClient]);

    useEffect(() => {
        let subscribed = true;
        (async () => {
            try {
                setIsLoadingRecipes(true);
                const recipes: RecipeWithUrl = await queryClient.fetchQuery({
                    queryKey: ['find', criteria] as const,
                    queryFn: async ({ queryKey, signal }) =>
                        recipeApi.findRecipe(queryKey[1], {
                            signal
                        })
                });

                const formattedRecipe: RecipeWithUrl = {
                    page: recipes.page,
                    pageSize: recipes.pageSize,
                    count: recipes.count,
                    rows: []
                };

                for (let r of recipes.rows) {
                    if (r.pictures.length === 1 && subscribed) {
                        const receivedData = await queryClient.fetchQuery({
                            queryKey: ['thumbnails', r.pictures[0].id] as const,
                            queryFn: async ({ queryKey, signal }) =>
                                pictureApi.getPictureThumbnail(queryKey[1], {
                                    signal
                                })
                        });
                        if (receivedData instanceof Blob) {
                            const url = URL.createObjectURL(receivedData);
                            r.url = url;
                        }
                    }
                    formattedRecipe.rows.push(r);
                }

                if (subscribed) {
                    setRecipes((prev) => {
                        if (prev) {
                            const prevUrls = prev.rows.filter((sr) => !!sr.url).map((sr) => sr.url!);
                            const currUrls = formattedRecipe.rows.filter((sr) => !!sr.url).map((sr) => sr.url!);
                            prevUrls.forEach((prevUrl) => {
                                !currUrls.includes(prevUrl) && URL.revokeObjectURL(prevUrl);
                            });
                        }
                        return formattedRecipe;
                    });
                    setIsLoadingRecipes(false);
                }
            } catch (err: any) {
                formatErrorMessage(err).then((message) => {
                    setError(message);
                    if (!!message) {
                        setIsLoadingRecipes(false);
                    }
                });
            }
        })();

        return () => {
            queryClient.cancelQueries({ queryKey: ['find', criteria] as const, type: 'active' });
            queryClient.cancelQueries({ queryKey: ['thumbnails'] as const, type: 'active' });
            subscribed = false;
        };
    }, [criteria, queryClient]);

    const navigationState: RecipeState = {
        searchingText: searchingText,
        selectedTags: selectedTags,
        searchingCategory: categoryId,
        currentPage: currentPage,
        order: order,
        orderBy: orderBy
    };

    const createRecipeHandler = () => {
        navigate('/recipe/create', {
            state: navigationState
        });
    };

    const editRecipeHandler = (event: React.MouseEvent<HTMLButtonElement>, id: number) => {
        event.stopPropagation();
        navigate(`/recipe/${id}`, {
            state: navigationState
        });
    };

    const showRecipeHandler = (id: number) => {
        navigate(`/recipe/display/${id}`, {
            state: navigationState
        });
    };

    const changePageHandler = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const searchTextHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchingText(event.target.value);
        setCurrentPage(1);
    };

    const debouncedChangeHandler = useMemo(() => debounce(searchTextHandler, 500), []);

    const toggleOrder = () => {
        setOrder(
            order === Api.RecipeSearchCriteria.OrderEnum.ASC
                ? Api.RecipeSearchCriteria.OrderEnum.DESC
                : Api.RecipeSearchCriteria.OrderEnum.ASC
        );
    };

    const orderByDropdownItems = (orderBy: Api.RecipeSearchCriteria.OrderByEnum) => {
        setOrderBy(orderBy);
        setCurrentPage(1);
    };

    const tagSelectionHandler = useCallback((selected: TypeaheadComponentProps['options']) => {
        setSelectedTags(selected as Api.SimpleTag[]);
        setCurrentPage(1);
    }, []);

    const categorySelectionHandler = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            navigate(recipesUrlWithCategory(e.target.value));
            setCurrentPage(1);
        },
        [navigate]
    );

    return (
        <>
            <div className='d-flex flex-column flex-md-row mb-3'>
                <h1 className='flex-grow-1'>Recepty</h1>
                {authCtx.userRoles.find((role) => role === Api.User.RoleEnum.ADMIN || role === Api.User.RoleEnum.CREATOR) && (
                    <Button
                        variant='primary'
                        onClick={createRecipeHandler}
                    >
                        Pridať recept
                    </Button>
                )}
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
                    ref={searchingTextInputRef}
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
                    title={order === Api.RecipeSearchCriteria.OrderEnum.ASC ? 'Zoradiť zostupne' : 'Zoradiť vzostupne'}
                    onClick={() => {
                        toggleOrder();
                    }}
                    className='search-button'
                >
                    <FontAwesomeIcon icon={order === Api.RecipeSearchCriteria.OrderEnum.ASC ? faArrowDownZA : faArrowDownAZ} />
                </Button>
                <Dropdown>
                    <Dropdown.Toggle
                        variant='outline-secondary'
                        className='search-button dropdown'
                    >
                        <FontAwesomeIcon icon={faGripVertical} />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        {Object.values(Api.RecipeSearchCriteria.OrderByEnum).map((value) => (
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
                    <Card
                        className='mb-3'
                        id='collapse'
                    >
                        <div className='m-3'>
                            <Form.Group className='mb-3'>
                                <Form.Label htmlFor='categorySelection'>Kategória</Form.Label>
                                <Form.Select
                                    id='categorySelection'
                                    aria-label='Výber kategórie receptu'
                                    className={categoryId === -1 ? 'text-secondary' : ''}
                                    onChange={categorySelectionHandler}
                                    value={`${categoryId}`}
                                >
                                    <option
                                        value='-1'
                                        className='text-dark'
                                    >
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
                                <Form.Label htmlFor='tagsMultiselection'>Značky</Form.Label>
                                <Typeahead
                                    id='tagsMultiselection'
                                    labelKey='name'
                                    onChange={tagSelectionHandler}
                                    options={listOfTags}
                                    placeholder='Vyberte ľubovoľný počet značiek'
                                    selected={selectedTags}
                                    multiple
                                />
                            </Form.Group>
                        </div>
                    </Card>
                </div>
            </Collapse>
            <Row
                xs={1}
                sm={2}
                lg={4}
                className='g-4'
            >
                {recipes?.rows.map((row) => {
                    return (
                        <Col key={row.id}>
                            <Card
                                className='overflow-hidden'
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
                                        opacity: row.url ? 1 : 0.3
                                    }}
                                />
                                <Card.ImgOverlay className='d-flex flex-column-reverse p-0'>
                                    <Card.Text
                                        className='m-0 p-2'
                                        style={{
                                            backgroundColor: 'rgba(0,0,0,0.5)'
                                        }}
                                    >
                                        <span className='text-white'>{row.description}</span>
                                    </Card.Text>
                                    <Card.Title
                                        className='m-0 p-2'
                                        style={{
                                            backgroundColor: 'rgba(0,0,0,0.5)'
                                        }}
                                    >
                                        <span className='text-white'>{row.name}</span>
                                    </Card.Title>
                                    {authCtx.userRoles.find(
                                        (role) => role === Api.User.RoleEnum.ADMIN || row.creatorId === authCtx.userId
                                    ) && (
                                        <Button
                                            title='Upraviť'
                                            variant='outline-secondary'
                                            type='button'
                                            onClick={(e) => editRecipeHandler(e, row.id)}
                                            className='position-absolute border-0'
                                            style={{ top: 0, right: 0 }}
                                        >
                                            <FontAwesomeIcon icon={faPencil} />
                                        </Button>
                                    )}
                                </Card.ImgOverlay>
                            </Card>
                        </Col>
                    );
                })}
            </Row>
            {recipes && recipes?.rows.length < 1 && <p className='mt-3'>Neboli nájdené žiadne výsledky.</p>}

            {!!numOfPages && numOfPages > 1 && (
                <Pagination className='mt-3 justify-content-center'>
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
            <Spinner show={isLoading || isLoadingRecipes} />
        </>
    );
};

export default Recipes;
