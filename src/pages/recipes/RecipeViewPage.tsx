import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Stack } from 'react-bootstrap';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ReactToPrint from 'react-to-print';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark as faBookmarkSolid, faCircleArrowLeft, faPrint } from '@fortawesome/free-solid-svg-icons';
import { faBookmark } from '@fortawesome/free-regular-svg-icons';
import { useQuery } from '@tanstack/react-query';
import { useBookmarContext } from '../../store/bookmark-context';
import { recipeApi } from '../../utils/apiWrapper';
import { formatErrorMessage } from '../../utils/errorMessages';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import AssociatedRecipeView from '../../components/recipes/view/AssociatedRecipesView';
import SectionView from '../../components/recipes/view/SectionView';
import PictureView from '../../components/recipes/view/PictureView';
import SourceView from '../../components/recipes/view/SourceView';
import ServeView from '../../components/recipes/view/ServeView';
import AuthorView from '../../components/recipes/view/AuthorView';
import MethodView from '../../components/recipes/view/MethodView';

const INLINE_STYLE_FOR_PRINT = '@page { margin: 40px !important; }' as const;

const RecipeViewPage: React.FC = () => {
    const [error, setError] = useState<string>();
    const params = useParams();

    const recipeId = !!params.recipeId ? parseInt(params.recipeId) : NaN;

    if (isNaN(recipeId)) {
        throw new Error('Parameter "recipeId" is required numeric parameter!');
    }

    const [serves, setServes] = useState<number>(1);
    const componentRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const { search } = useLocation();
    const searchParams = useMemo(() => new URLSearchParams(search), [search]);

    const { contains, addRecipe, removeRecipe } = useBookmarContext();

    const {
        data: recipe,
        isFetching,
        isError: isErrorRecipe,
        error: errorRecipe
    } = useQuery({
        queryKey: ['recipes', recipeId] as const,
        queryFn: async ({ queryKey, signal }) =>
            recipeApi.getRecipe(queryKey[1], { signal }).then((recipe) => {
                if (recipe.serves) {
                    setServes(recipe.serves);
                }
                return recipe;
            })
    });

    const isBookmarked = useMemo(() => contains(recipeId), [recipeId, contains]);

    const onBookmarkHandler = useCallback(() => {
        if (isBookmarked) {
            removeRecipe(recipeId);
        } else {
            addRecipe(recipeId);
        }
    }, [addRecipe, isBookmarked, recipeId, removeRecipe]);

    const onNavBackHandler = useCallback(() => {
        navigate(`/recipes?${searchParams}`);
    }, [navigate, searchParams]);

    useEffect(() => {
        (async () => {
            if (isErrorRecipe) {
                setError(await formatErrorMessage(errorRecipe));
            } else {
                setError(undefined);
            }
        })();
    }, [errorRecipe, isErrorRecipe]);

    return (
        <>
            <Stack direction='horizontal'>
                <Button
                    variant='light'
                    aria-label='späť'
                    type='button'
                    onClick={onNavBackHandler}
                >
                    <FontAwesomeIcon icon={faCircleArrowLeft} />
                </Button>
                <div className='flex-grow-1 d-sm-block' />
                <Stack
                    direction='horizontal'
                    gap={2}
                >
                    <Button
                        variant='light'
                        onClick={onBookmarkHandler}
                        title={isBookmarked ? 'Odobrať záložku' : 'Pridať záložku'}
                    >
                        <FontAwesomeIcon icon={isBookmarked ? faBookmarkSolid : faBookmark} />
                    </Button>
                    <ReactToPrint
                        trigger={() => (
                            <Button variant='light'>
                                <FontAwesomeIcon icon={faPrint} />
                            </Button>
                        )}
                        content={() => componentRef.current}
                    />
                </Stack>
            </Stack>
            {!!recipe && (
                <div ref={componentRef}>
                    <style>{INLINE_STYLE_FOR_PRINT}</style>
                    <h1 className='pt-2'>{recipe.name}</h1>
                    <ServeView
                        recipe={recipe}
                        serves={serves}
                        setServes={setServes}
                    />
                    <SectionView
                        recipe={recipe}
                        serves={serves}
                    />
                    <MethodView method={recipe.method} />
                    <PictureView recipe={recipe} />
                    <SourceView recipe={recipe} />
                    <AssociatedRecipeView
                        parentRecipe={recipe}
                        serves={serves}
                    />
                    <div className='mcb-transparent-border'>
                        <hr />
                    </div>
                    <AuthorView recipe={recipe} />
                </div>
            )}
            <Modal
                show={!!error}
                message={error}
                type='error'
                onClose={() => {
                    setError(undefined);
                }}
            />
            <Spinner show={isFetching} />
        </>
    );
};

export default RecipeViewPage;
