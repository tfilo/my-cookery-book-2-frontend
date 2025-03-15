import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Stack } from 'react-bootstrap';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark as faBookmarkSolid, faCircleArrowLeft, faPrint } from '@fortawesome/free-solid-svg-icons';
import { faBookmark } from '@fortawesome/free-regular-svg-icons';
import { useQuery } from '@tanstack/react-query';
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
import { Api } from '../../openapi';
import { useBookmarContext } from '../../hooks/use-bookmark-context';

const INLINE_STYLE_FOR_PRINT = '@page { margin: 40px !important; }';

class PrevState {
    private state: {
        [id: number]: { serves: number | null } | undefined;
    };

    constructor() {
        this.state = {};
    }

    setState = (recipeId: number, serves: number | null) => {
        this.state[recipeId] = { serves };
    };

    getState = (recipeId: number) => {
        return this.state[recipeId];
    };

    removeState = (recipeId: number) => {
        delete this.state[recipeId];
    };

    clearState = () => {
        this.state = {};
    };
}

const prevState = new PrevState();

const Recipe: React.FC<{
    recipe: Api.Recipe;
    ref: React.RefObject<HTMLDivElement | null>;
}> = ({ recipe, ref }) => {
    const { state } = useLocation();
    if (state?.reset) {
        prevState.removeState(recipe.id);
    }
    const [serves, setServes] = useState<number>(prevState.getState(recipe.id)?.serves ?? recipe.serves ?? 1);

    useEffect(() => {
        return () => {
            prevState.setState(recipe.id, serves);
        };
    }, [recipe.id, serves]);

    return (
        <div ref={ref}>
            <style>{INLINE_STYLE_FOR_PRINT}</style>
            <h1 className='pt-2'>{recipe.name}</h1>
            <ServeView
                key={recipe.id}
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
    );
};

const RecipeViewPage: React.FC = () => {
    const params = useParams();

    const recipeId = params.recipeId !== undefined && params.recipeId.trim() !== '' ? parseInt(params.recipeId) : NaN;

    if (isNaN(recipeId)) {
        throw new Error('Parameter "recipeId" is required numeric parameter!');
    }

    const navigate = useNavigate();
    const { search } = useLocation();
    const [error, setError] = useState<string>();
    const componentRef = useRef<HTMLDivElement>(null);
    const reactToPrintFn = useReactToPrint({ contentRef: componentRef });

    const searchParams = useMemo(() => new URLSearchParams(search), [search]);

    const { contains, addRecipe, removeRecipe } = useBookmarContext();

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

    const {
        data: recipe,
        isFetching,
        isError: isErrorRecipe,
        error: errorRecipe
    } = useQuery({
        queryKey: ['recipes', recipeId] as const,
        queryFn: async ({ queryKey, signal }) => recipeApi.getRecipe(queryKey[1], { signal })
    });

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
                    <Button
                        variant='light'
                        onClick={() => reactToPrintFn()}
                    >
                        <FontAwesomeIcon icon={faPrint} />
                    </Button>
                </Stack>
            </Stack>
            {!!recipe && (
                <Recipe
                    key={recipe.id}
                    recipe={recipe}
                    ref={componentRef}
                />
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
