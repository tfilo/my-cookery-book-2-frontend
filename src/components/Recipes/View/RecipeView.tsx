import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Stack } from 'react-bootstrap';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ReactToPrint from 'react-to-print';
import { recipeApi } from '../../../utils/apiWrapper';
import { formatErrorMessage } from '../../../utils/errorMessages';
import Modal from '../../UI/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark as faBookmarkSolid, faCircleArrowLeft, faPrint } from '@fortawesome/free-solid-svg-icons';
import { faBookmark } from '@fortawesome/free-regular-svg-icons';
import AssociatedRecipeView from './AssociatedRecipesView';
import SectionView from './SectionView';
import PictureView from './PictureView';
import SourceView from './SourceView';
import ServeView from './ServeView';
import AuthorView from './AuthorView';
import Spinner from '../../UI/Spinner';
import { useBookmarContext } from '../../../store/bookmark-context';
import { useQuery } from '@tanstack/react-query';
import MethodView from './MethodView';

const INLINE_STYLE_FOR_PRINT = '@page { margin: 40px !important; }' as const;

const RecipeView: React.FC = () => {
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
                    <div style={{ border: '1px solid transparent' }}>
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

export default RecipeView;
