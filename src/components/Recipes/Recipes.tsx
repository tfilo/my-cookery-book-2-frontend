import React, { Fragment, useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Api } from '../../openapi';
import { recipeApi } from '../../utils/apiWrapper';
import Modal from '../UI/Modal';

const Recipes: React.FC = () => {
    const [listOfRecipes, setListOfRecipes] = useState<Api.SimpleRecipePage>();
    const [error, setError] = useState<string>();
    const navigate = useNavigate();

    useEffect(() => {
        const data: Api.RecipeSearchCriteria = {
            search: '',
            categoryId: null,
            tags: [],
            page: 0,
            pageSize: 1,
            orderBy: Api.RecipeSearchCriteria.OrderByEnum.Name,
            order: Api.RecipeSearchCriteria.OrderEnum.ASC,
        };

        (async () => {
            try {
                const recipes = await recipeApi.findRecipe(data);
                setListOfRecipes(recipes);
            } catch (err) {
                console.error(err);
            }
        })();
    }, []);

    const createRecipeHandler = () => {
        navigate('/addRecipe');
    };

    console.log(listOfRecipes);

    return (
        <Fragment>
            <div className='d-flex flex-column flex-md-row'>
                <h2 className='flex-grow-1'>Recepty</h2>
                <Button variant='primary' onClick={createRecipeHandler}>
                    Pridať recept
                </Button>
            </div>
            {listOfRecipes?.rows.map((r) => (
                <p key={r.id}>{r.name}</p>
            ))}
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
