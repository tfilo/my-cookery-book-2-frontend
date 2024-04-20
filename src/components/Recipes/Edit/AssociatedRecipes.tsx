import React, { useState, useId } from 'react';
import { Form } from 'react-bootstrap';
import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import { Api } from '../../../openapi';
import { recipeApi } from '../../../utils/apiWrapper';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import { Controller, useFormContext } from 'react-hook-form';
import { RecipeForm } from '../../../pages/recipes/RecipeEditPage';
import { get } from 'lodash';
import Spinner from '../../UI/Spinner';
import { formatErrorMessage } from '../../../utils/errorMessages';
import Modal from '../../UI/Modal';
import { useQueryClient } from '@tanstack/react-query';

const AssociatedRecipes: React.FC = () => {
    const id = useId();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>();
    const [list, setList] = useState<{}[]>([]);
    const queryClient = useQueryClient();

    const {
        control,
        formState: { errors }
    } = useFormContext<RecipeForm>();

    const handleSearch = async (query: string) => {
        try {
            setIsLoading(true);
            const data = {
                search: query,
                categoryId: null,
                tags: [],
                page: 0,
                pageSize: 5,
                orderBy: Api.RecipeSearchCriteria.OrderByEnum.Name,
                order: Api.RecipeSearchCriteria.OrderEnum.ASC
            };
            const recipes = await queryClient.fetchQuery({
                queryKey: ['find', data] as const,
                queryFn: async ({ queryKey, signal }) => recipeApi.findRecipe(queryKey[1], { signal })
            });
            const recipeList = recipes.rows.map((recipe) => {
                return { name: recipe.name, id: recipe.id };
            });
            setList(recipeList);
        } catch (err) {
            formatErrorMessage(err).then((message) => setError(message));
        } finally {
            setIsLoading(false);
        }
    };

    const errorMessage = get(errors, 'associatedRecipes')?.message;
    const filterBy = () => true;

    return (
        <>
            <Form.Group className='mt-2 mb-3'>
                <Form.Label htmlFor={`${id}associatedRecipes`}>Súvisiace recepty</Form.Label>
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
                <Form.Control.Feedback type='invalid'>{errorMessage?.toString()}</Form.Control.Feedback>
            </Form.Group>
            <Modal
                show={!!error}
                message={error}
                type='error'
                onClose={() => {
                    setError(undefined);
                }}
            />
            <Spinner show={isLoading} />
        </>
    );
};

export default AssociatedRecipes;
