import React, { useCallback } from 'react';
import { Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencil } from '@fortawesome/free-solid-svg-icons';
import { Api } from '../../../openapi';
import RecipeThumbnail from '../RecipeThumbnail';
import useRole from '../../../hooks/use-role';
import useCriteria from '../../../hooks/use-criteria';

type RecipeCardProps = {
    recipe: Api.SimpleRecipe;
};

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
    const navigate = useNavigate();

    const { hasSome, isOwner } = useRole();
    const { searchParams } = useCriteria();

    const onEditRecipeHandler = useCallback(
        (event: React.MouseEvent<HTMLButtonElement>) => {
            event.stopPropagation();
            navigate(`/recipe/edit/${recipe.id}?${searchParams}`);
        },
        [navigate, recipe.id, searchParams]
    );

    const onShowRecipeHandler = useCallback(() => {
        navigate(`/recipe/${recipe.id}?${searchParams}`, {
            state: {
                reset: true
            }
        });
    }, [navigate, recipe.id, searchParams]);

    const pictureId = recipe.pictures[0]?.id;
    const canEdit = hasSome(Api.User.RoleEnum.ADMIN) || isOwner(recipe.creatorId);

    return (
        <Card
            className='overflow-hidden'
            role='button'
            onClick={onShowRecipeHandler}
        >
            <RecipeThumbnail pictureId={pictureId} />
            <Card.ImgOverlay className='d-flex flex-column-reverse p-0'>
                <Card.Text className='m-0 p-2 mcb-card'>
                    <span className='text-white'>{recipe.description}</span>
                </Card.Text>
                <Card.Title className='m-0 p-2 mcb-card'>
                    <span className='text-white'>{recipe.name}</span>
                </Card.Title>
                {canEdit && (
                    <Button
                        title='Upraviť'
                        variant='outline-secondary'
                        type='button'
                        onClick={onEditRecipeHandler}
                        className='position-absolute border-0 top-0 end-0'
                    >
                        <FontAwesomeIcon icon={faPencil} />
                    </Button>
                )}
            </Card.ImgOverlay>
        </Card>
    );
};

export default RecipeCard;
