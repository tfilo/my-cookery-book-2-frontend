import React, { useEffect, useMemo, useState } from 'react';
import { Form } from 'react-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
// import { useFieldArray } from 'react-hook-form';
import { Api } from '../../openapi';
import { recipeApi } from '../../utils/apiWrapper';

import 'react-bootstrap-typeahead/css/Typeahead.css';

const AssociatedRecipes: React.FC = () => {
    const [list, setList] = useState<{}[]>([]);
    const [selected, setSelected] = useState<{}[]>([]);

    // const { fields, append, remove, move } = useFieldArray({
    //     name: 'associatedRecipes',
    // });


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
                const recipeList = recipes.rows.map((recipe)=> {return {label: recipe.name, id: recipe.id}});
                setList(recipeList);
            } catch (err) {
                console.error(err);
            }
        })();
    }, [data]);


    return (
        <>
            <Form.Group className='mt-2 mb-3'>
                <Form.Label>Súvisiace recepty</Form.Label>
                <Typeahead 
                    id='basic-example'
                    multiple
                    onChange={setSelected}
                    options={list}
                    placeholder='Vyberte recept...'
                    selected={selected}
                    // labelKey={list.label}
                />
            </Form.Group>
        </>
    );
};

export default AssociatedRecipes;
