import React, { ChangeEvent, useCallback, useState } from 'react';
import { Typeahead, TypeaheadComponentProps } from 'react-bootstrap-typeahead';
import { Button, Dropdown, Collapse, Card, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faFilter, faArrowDownZA, faArrowDownAZ, faGripVertical } from '@fortawesome/free-solid-svg-icons';
import { debounce } from 'lodash';
import { Api } from '../../../openapi';
import useCriteria from '../../../hooks/useCriteria';
import { orderByLabels } from '../../../translate/orderByLabels';
import { EMPTY_CATEGORY_OPTION } from '../../../utils/constants';

type RecipesCriteriaProps = {
    categories?: Api.SimpleCategory[];
    tags?: Api.SimpleTag[];
};

const RecipesCriteria: React.FC<RecipesCriteriaProps> = ({ tags, categories }) => {
    const { criteria, updateCriteria } = useCriteria();
    const [showFilter, setShowFilter] = useState(!!criteria.categoryId || criteria.tags.length > 0);

    const onSearchHandler = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const debounceFn = debounce((e) => {
                updateCriteria({ search: e.target.value }, true);
            }, 500);
            debounceFn(e);
        },
        [updateCriteria]
    );

    const onToggleOrderHandler = useCallback(() => {
        if (criteria.order === Api.RecipeSearchCriteria.OrderEnum.ASC) {
            updateCriteria({ order: Api.RecipeSearchCriteria.OrderEnum.DESC }, true);
        } else {
            updateCriteria({ order: Api.RecipeSearchCriteria.OrderEnum.ASC }, true);
        }
    }, [criteria.order, updateCriteria]);

    const onChangeOrderByHandler = (orderBy: Api.RecipeSearchCriteria.OrderByEnum) => {
        updateCriteria({ orderBy: orderBy }, true);
    };

    const onChangeTagsHandler = useCallback(
        (selected: TypeaheadComponentProps['options']) => {
            updateCriteria({ tags: (selected as Api.SimpleTag[]).map((t) => t.id) }, true);
        },
        [updateCriteria]
    );

    const onChangeCategoryHandler = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            updateCriteria({ categoryId: parseInt(e.target.value) }, true);
        },
        [updateCriteria]
    );

    if (tags === undefined || categories === undefined) {
        return null;
    }
    return (
        <>
            <div className='input-group mb-3'>
                <span className='input-group-text'>
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                </span>
                <input
                    type='search'
                    className='form-control'
                    placeholder='Vyhľadávanie'
                    aria-label='vyhľadávanie'
                    onChange={onSearchHandler}
                    defaultValue={criteria.search ?? ''}
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
                    title={criteria.order === Api.RecipeSearchCriteria.OrderEnum.ASC ? 'Zoradiť zostupne' : 'Zoradiť vzostupne'}
                    onClick={onToggleOrderHandler}
                    className='search-button'
                >
                    <FontAwesomeIcon icon={criteria.order === Api.RecipeSearchCriteria.OrderEnum.ASC ? faArrowDownZA : faArrowDownAZ} />
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
                                    onChangeOrderByHandler(value);
                                }}
                                active={criteria.orderBy === value}
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
                                    className={criteria.categoryId === null ? 'text-secondary' : ''}
                                    onChange={onChangeCategoryHandler}
                                    value={`${criteria.categoryId ?? EMPTY_CATEGORY_OPTION}`}
                                >
                                    <option
                                        value={EMPTY_CATEGORY_OPTION.toString()}
                                        className='text-dark'
                                    >
                                        Vyberte kategóriu receptu
                                    </option>
                                    {categories?.map((category) => (
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
                                    onChange={onChangeTagsHandler}
                                    options={tags}
                                    placeholder='Vyberte ľubovoľný počet značiek'
                                    selected={tags.filter((t) => criteria.tags.includes(t.id))}
                                    multiple
                                />
                            </Form.Group>
                        </div>
                    </Card>
                </div>
            </Collapse>
        </>
    );
};

export default RecipesCriteria;
