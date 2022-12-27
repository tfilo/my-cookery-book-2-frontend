import React, { Fragment, useEffect, useMemo, useState } from 'react';
import {
    Button,
    Card,
    Col,
    Collapse,
    Form,
    Pagination,
    Row,
} from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
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
    faFilter,
    faMagnifyingGlass,
    faPencil,
} from '@fortawesome/free-solid-svg-icons';
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import { debounce } from 'lodash';

interface SimpleRecipeWithUrl extends Api.SimpleRecipe {
    url?: string;
}

interface RecipeWithUrl extends Omit<Api.SimpleRecipePage, 'rows'> {
    rows: SimpleRecipeWithUrl[];
}

const pagesToShow = 5;
const pageSize = 2;

const Recipes: React.FC = () => {
    const [error, setError] = useState<string>();
    const navigate = useNavigate();
    const [recipes, setRecipes] = useState<RecipeWithUrl>();
    const [currentPage, setCurrentPage] = useState(1);
    const [searchingText, setSearchingText] = useState('');
    const [searchingCategory, setSearchingCategory] = useState<number>(
        -1
    );
    const [listOfCategories, setListOfCategories] = useState<
        Api.SimpleCategory[]
    >([]);
    const [listOfTags, setListOfTags] = useState<Api.SimpleTag[]>([]);
    const [multiSelections, setMultiSelections] = useState<Api.SimpleTag[]>([]);
    const [showFilter, setShowFilter] = useState(false);
    // const [isHover, setIsHover] = useState(false);

    const params = useParams();
    const categoryId = params?.categoryId ? parseInt(params?.categoryId) : -1;
    console.log(categoryId);

    const criteria: Api.RecipeSearchCriteria = useMemo(() => {
        const searchingTags = multiSelections.map((t) => t.id);
        return {
            search: searchingText,
            categoryId: searchingCategory === -1 ? null : searchingCategory,
            tags: searchingTags,
            page: currentPage - 1,
            pageSize: pageSize,
            orderBy: Api.RecipeSearchCriteria.OrderByEnum.Name,
            order: Api.RecipeSearchCriteria.OrderEnum.ASC,
        };
    }, [currentPage, searchingText, searchingCategory, multiSelections]);

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
                const categories = await categoryApi.getCategories();
                setListOfCategories(categories);
                const tags = await tagApi.getTags();
                setListOfTags(tags);
            } catch (err) {
                formatErrorMessage(err).then((message) => {
                    setError(message);
                });
            }
        })();
    }, []);

    useEffect(() => {
        (async () => {
            try {
                console.log(criteria);
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

    const updateRecipeHandler = (
        event: React.MouseEvent<HTMLButtonElement>,
        id: number
    ) => {
        event.stopPropagation();
        navigate(`/recipe/${id}`);
    };

    const showRecipeHandler = (id: number) => {
        navigate(`/recipe/display/${id}`);
    };

    const changePageHandler = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const searchTextHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchingText(event.target.value);
    };

    const debouncedChangeHandler = useMemo(
        () => debounce(searchTextHandler, 500),
        []
    );

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
                />
                <Button
                    // className='input-group-text'
                    variant='outline-secondary'
                    title='Zobraziť filter'
                    onClick={() => setShowFilter(!showFilter)}
                    aria-controls='collapse'
                    aria-expanded={showFilter}
                    style={{
                        borderRightColor: '#ced4da',
                        borderTopColor: '#ced4da',
                        borderBottomColor: '#ced4da',
                        borderLeftColor: '#ced4da',
                        backgroundColor: '#e9ecef',
                        color: '#212529',
                    }}
                >
                    <FontAwesomeIcon icon={faFilter} />
                </Button>
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
                                    className={searchingCategory === -1 ? 'text-secondary' : ''}
                                    onChange={(e) =>
                                        setSearchingCategory(+e.target.value)
                                    }
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
                                <Form.Label htmlFor='tagsMultiselection'>
                                    Značky
                                </Form.Label>
                                <Typeahead
                                    id='tagsMultiselection'
                                    labelKey='name'
                                    onChange={(selected) =>
                                        setMultiSelections(
                                            selected as Api.SimpleTag[]
                                        )
                                    }
                                    options={listOfTags}
                                    placeholder='Vyberte ľubovoľný počet značiek'
                                    selected={multiSelections}
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
                                {row.pictures.length === 0 && (
                                    <Card.Img
                                        variant='top'
                                        src={defImg}
                                        alt='obrázok'
                                        style={{
                                            aspectRatio: 1,
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
                                            aspectRatio: 1,
                                            objectFit: 'cover',
                                        }}
                                    />
                                )}
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
                                            updateRecipeHandler(e, row.id)
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
        </Fragment>
    );
};

export default Recipes;
