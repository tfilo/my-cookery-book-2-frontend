import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Api } from '../../openapi';
import { recipeApi } from '../../utils/apiWrapper';
import { formatErrorMessage } from '../../utils/errorMessages';
import Modal from '../UI/Modal';

const Recipes: React.FC = () => {
    const [listOfRecipes, setListOfRecipes] = useState<Api.SimpleRecipePage>();
    const [error, setError] = useState<string>();
    const navigate = useNavigate();
    const [row, setRow] = useState<Api.SimpleRecipe>();

    const data: Api.RecipeSearchCriteria = useMemo(() => {
        return {
            search: '',
            categoryId: null,
            tags: [],
            page: 0,
            pageSize: 10,
            orderBy: Api.RecipeSearchCriteria.OrderByEnum.Name,
            order: Api.RecipeSearchCriteria.OrderEnum.ASC,
        };
    }, []);

    useEffect(() => {
        (async () => {
            try {
                const recipes = await recipeApi.findRecipe(data);
                setListOfRecipes(recipes);
            } catch (err) {
                console.error(err);
            }
        })();
    }, [data]);

    const createRecipeHandler = () => {
        navigate('/recipe/create');
    };

    const updateRecipeHandler = (id: number) => {
        navigate(`/recipe/${id}`);
    };

    const deleteRecipeHandler = (row: Api.SimpleRecipe) => {
        setRow(row);
    };

    const deleteRecipeConfirmHandler = (status: boolean) => {
        (async () => {
            if (status === true) {
                if (row) {
                    try {
                        await recipeApi.deleteRecipe(row.id);
                        const recipes = await recipeApi.findRecipe(data);
                        setListOfRecipes(recipes);
                    } catch (err) {
                        formatErrorMessage(err).then((message) => {
                            setError(message);
                        });
                    }
                } else {
                    setError('Neplatné používateľské ID!');
                }
            }
            setRow(undefined);
        })();
    };

    return (
        <Fragment>
            <div className='d-flex flex-column flex-md-row'>
                <h2 className='flex-grow-1'>Recepty</h2>
                <Button variant='primary' onClick={createRecipeHandler}>
                    Pridať recept
                </Button>
            </div>
            {listOfRecipes?.rows.map((row) => (
                <div key={row.id}>
                    <p>{row.name}</p>
                    <Button onClick={updateRecipeHandler.bind(null, row.id)}>
                        upraviť
                    </Button>
                    <Button onClick={deleteRecipeHandler.bind(null, row)}>
                        vymazať
                    </Button>
                </div>
            ))}
            <Modal
                show={!!row}
                type='question'
                message={`Prajete si vymazať recept "${row?.name}" ?`}
                onClose={deleteRecipeConfirmHandler}
            />
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
