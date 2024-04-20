import React, { useCallback, useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import { useQuery } from '@tanstack/react-query';
import { Api } from '../../openapi';
import useRole from '../../hooks/useRole';
import useCriteria from '../../hooks/useCriteria';
import { categoryApi, recipeApi, tagApi } from '../../utils/apiWrapper';
import { formatErrorMessage } from '../../utils/errorMessages';
import Modal from '../../components/UI/Modal';
import Spinner from '../../components/UI/Spinner';
import RecipesPagination from '../../components/Recipes/Search/RecipesPagination';
import RecipesCriteria from '../../components/Recipes/Search/RecipesCriteria';
import RecipesGrid from '../../components/Recipes/Search/RecipesGrid';

const RecipeSearchPage: React.FC = () => {
    const navigate = useNavigate();
    const { hasSome } = useRole();
    const { criteria, searchParams } = useCriteria();
    const [errors, setErrors] = useState<string[]>();

    const {
        data: categories,
        isFetching: isFetchingCategories,
        isError: isErrorCategories,
        error: errorCategories
    } = useQuery({
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

    const {
        data: tags,
        isFetching: isFetchingTags,
        isError: isErrorTags,
        error: errorTags
    } = useQuery({
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

    const {
        data: recipes,
        isFetching: isFetchingRecipes,
        isError: isErrorRecipes,
        error: errorRecipes
    } = useQuery({
        queryKey: ['find', criteria] as const,
        queryFn: async ({ queryKey, signal }) =>
            recipeApi.findRecipe(queryKey[1], {
                signal
            })
    });

    const numOfPages = recipes ? Math.ceil(recipes.count / recipes.pageSize) : null;

    const onCreateRecipeHandler = useCallback(() => {
        navigate(`/recipe/create?${searchParams}`);
    }, [navigate, searchParams]);

    useEffect(() => {
        (async () => {
            const errors: string[] = [];
            if (isErrorCategories) {
                const error = await formatErrorMessage(errorCategories);
                errors.push(`Kategórie: ${error}`);
            }
            if (isErrorRecipes) {
                const error = await formatErrorMessage(errorTags);
                errors.push(`Recepty: ${error}`);
            }
            if (isErrorTags) {
                const error = await formatErrorMessage(errorRecipes);
                errors.push(`Značky: ${error}`);
            }
            if (errors.length > 0) {
                setErrors(errors);
            } else {
                setErrors(undefined);
            }
        })();
    }, [errorCategories, errorRecipes, errorTags, isErrorCategories, isErrorRecipes, isErrorTags]);

    return (
        <>
            <div className='d-flex flex-column flex-md-row mb-3'>
                <h1 className='flex-grow-1'>Recepty</h1>
                {hasSome(Api.User.RoleEnum.ADMIN, Api.User.RoleEnum.CREATOR) && (
                    <Button
                        variant='primary'
                        onClick={onCreateRecipeHandler}
                    >
                        Pridať recept
                    </Button>
                )}
            </div>
            <RecipesCriteria
                tags={tags}
                categories={categories}
            />
            <RecipesGrid recipes={recipes} />
            <RecipesPagination allPages={numOfPages} />
            <Modal
                show={!!errors}
                message={errors}
                type='error'
                onClose={() => {
                    setErrors(undefined);
                }}
            />
            <Spinner show={isFetchingRecipes || isFetchingCategories || isFetchingTags} />
        </>
    );
};

export default RecipeSearchPage;
