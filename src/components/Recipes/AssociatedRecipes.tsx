import React, { useState, useId } from 'react';
import { Form } from 'react-bootstrap';
import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import { Api } from '../../openapi';
import { recipeApi } from '../../utils/apiWrapper';

import 'react-bootstrap-typeahead/css/Typeahead.css';
import { Controller, useFormContext } from 'react-hook-form';
import { RecipeForm } from './Recipe';
import { get } from 'lodash';

const AssociatedRecipes: React.FC = () => {
    const id = useId();
    const [isLoading, setIsLoading] = useState(false);
    const [list, setList] = useState<{}[]>([]);

    const {
        control,
        formState: { errors },
    } = useFormContext<RecipeForm>();

    const handleSearch = (query: string) => {
        setIsLoading(true);
        (async () => {
            try {
                const data = {
                    search: query,
                    categoryId: null,
                    tags: [],
                    page: 0,
                    pageSize: 5,
                    orderBy: Api.RecipeSearchCriteria.OrderByEnum.Name,
                    order: Api.RecipeSearchCriteria.OrderEnum.ASC,
                };
                const recipes = await recipeApi.findRecipe(data);
                const recipeList = recipes.rows.map((recipe) => {
                    return { name: recipe.name, id: recipe.id };
                });
                setList(recipeList);
            } catch (err) {
                console.error(err); // TODO information for user ?
            } finally {
                setIsLoading(false);
            }
        })();
    };

    console.log('associatedRecipes', errors);

    const errorMessage = get(errors, 'associatedRecipes')?.message;
    const filterBy = () => true;

    return (
        <>
            <Form.Group className='mt-2 mb-3'>
                <Form.Label htmlFor={`${id}associatedRecipes`}>
                    Súvisiace recepty
                </Form.Label>
                <Controller
                    name='associatedRecipes'
                    control={control}
                    render={({ field }) => (
                        <AsyncTypeahead
                            {...field}
                            selected={field.value}
                            filterBy={filterBy}
                            id={`${id}associatedRecipes`}
                            multiple
                            onSearch={handleSearch}
                            options={list}
                            placeholder='Vyberte recept...'
                            isLoading={isLoading}
                            searchText='Vyhľadávam...'
                            promptText='Prosím zadajte vyhľadávaný text.'
                            emptyLabel='Nič sa nenašlo.'
                            labelKey='name'
                            isInvalid={!!errorMessage}
                        />
                    )}
                />
                <Form.Control.Feedback type='invalid'>
                    {errorMessage?.toString()}
                </Form.Control.Feedback>
            </Form.Group>
        </>
    );
};

export default AssociatedRecipes;
