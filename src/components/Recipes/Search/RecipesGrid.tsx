import React from 'react';
import { Col, Row } from 'react-bootstrap';
import { Api } from '../../../openapi';
import RecipeCard from './RecipeCard';

type RecipesGridProps = {
    recipes?: Api.SimpleRecipePage;
};

const RecipesGrid: React.FC<RecipesGridProps> = ({ recipes }) => {
    if (!recipes) {
        return null;
    }

    if (recipes.rows.length < 1) {
        return <p className='mt-3'>Neboli nájdené žiadne výsledky.</p>;
    }

    return (
        <Row
            xs={1}
            sm={2}
            lg={4}
            className='g-4'
        >
            {recipes.rows.map((recipe) => {
                return (
                    <Col key={recipe.id}>
                        <RecipeCard recipe={recipe} />
                    </Col>
                );
            })}
        </Row>
    );
};

export default RecipesGrid;
