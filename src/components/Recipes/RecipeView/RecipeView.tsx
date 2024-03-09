import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Stack } from 'react-bootstrap';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ReactToPrint from 'react-to-print';
import { Api } from '../../../openapi';
import { pictureApi, recipeApi } from '../../../utils/apiWrapper';
import { formatErrorMessage } from '../../../utils/errorMessages';
import Modal from '../../UI/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark as faBookmarkSolid, faCircleArrowLeft, faPrint } from '@fortawesome/free-solid-svg-icons';
import { faBookmark } from '@fortawesome/free-regular-svg-icons';
import AssociatedRecipeView from './AssociatedRecipeView';
import SectionView from './SectionView';
import PictureView from './PictureView';
import SourceView from './SourceView';
import ServeView from './ServeView';
import AuthorView from './AuthorView';
import Spinner from '../../UI/Spinner';
import { recipesUrlWithCategory } from '../Recipes';
import { useBookmarContext } from '../../../store/bookmark-context';
import { useQueryClient } from '@tanstack/react-query';

interface PicturesWithUrl extends Api.Recipe.Picture {
    url?: string;
    fullPic?: string;
}

export interface RecipesWithUrlInPictures extends Omit<Api.Recipe, 'pictures'> {
    pictures: PicturesWithUrl[];
}

const getPageMargins = () => {
    return '@page { margin: 40px !important; }';
};

const RecipeView: React.FC = () => {
    const [recipe, setRecipe] = useState<RecipesWithUrlInPictures>();
    const [error, setError] = useState<string>();
    const params = useParams();
    const [serves, setServes] = useState<number>(1);
    const componentRef = useRef<HTMLDivElement>(null);
    const [associatedRecipes, setAssociatedRecipes] = useState<RecipesWithUrlInPictures[]>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const navigate = useNavigate();
    const { state } = useLocation();
    const queryClient = useQueryClient();
    const { contains, addRecipe, removeRecipe } = useBookmarContext();

    const isBookmarked = useMemo(() => {
        if (params.recipeId) {
            return contains(+params.recipeId);
        }
        return false;
    }, [params.recipeId, contains]);

    const onBookmarkHandler = useCallback(() => {
        if (params.recipeId) {
            if (isBookmarked) {
                removeRecipe(+params.recipeId);
            } else {
                addRecipe(+params.recipeId);
            }
        }
    }, [addRecipe, isBookmarked, params.recipeId, removeRecipe]);

    useEffect(() => {
        (async () => {
            try {
                if (params.recipeId) {
                    setIsLoading(true);
                    const rec: RecipesWithUrlInPictures = await queryClient.fetchQuery({
                        queryKey: ['recipes', +params.recipeId] as const,
                        queryFn: async ({ queryKey, signal }) => recipeApi.getRecipe(queryKey[1], { signal })
                    });

                    for (let picture of rec.pictures) {
                        const data = await queryClient.fetchQuery({
                            queryKey: ['thumbnails', picture.id] as const,
                            queryFn: async ({ queryKey, signal }) => pictureApi.getPictureThumbnail(queryKey[1], { signal })
                        });
                        if (data instanceof Blob) {
                            const url = URL.createObjectURL(data);
                            picture.url = url;
                        }
                    }

                    if (rec.serves) {
                        setServes(rec.serves);
                    }

                    if (rec.associatedRecipes.length > 0) {
                        const associatedRecipesId = rec.associatedRecipes.map((a) => a.id);
                        const assRecipes: RecipesWithUrlInPictures[] = [];
                        for (let id of associatedRecipesId) {
                            const assRec: RecipesWithUrlInPictures = await queryClient.fetchQuery({
                                queryKey: ['recipes', id] as const,
                                queryFn: async ({ queryKey, signal }) => recipeApi.getRecipe(queryKey[1], { signal })
                            });
                            assRecipes.push(assRec);
                        }
                        for (let assRecipe of assRecipes) {
                            for (let picture of assRecipe.pictures) {
                                const data = await queryClient.fetchQuery({
                                    queryKey: ['thumbnails', picture.id] as const,
                                    queryFn: async ({ queryKey, signal }) => pictureApi.getPictureThumbnail(queryKey[1], { signal })
                                });
                                if (data instanceof Blob) {
                                    const url = URL.createObjectURL(data);
                                    picture.url = url;
                                }
                            }
                        }
                        setAssociatedRecipes((prev) => {
                            if (prev) {
                                const prevUrls = prev.map((ar) => ar.pictures.filter((apr) => !!apr.url).map((arp) => arp.url!)).flat();
                                const currUrls = assRecipes
                                    .map((ar) => ar.pictures.filter((apr) => !!apr.url).map((arp) => arp.url!))
                                    .flat();
                                prevUrls.forEach((prevUrl) => {
                                    !currUrls.includes(prevUrl) && URL.revokeObjectURL(prevUrl);
                                });
                            }
                            return assRecipes;
                        });
                    }
                    setRecipe((prev) => {
                        if (prev) {
                            const prevUrls = prev.pictures.filter((apr) => !!apr.url).map((arp) => arp.url!);
                            const currUrls = rec.pictures.filter((apr) => !!apr.url).map((arp) => arp.url!);
                            prevUrls.forEach((prevUrl) => {
                                !currUrls.includes(prevUrl) && URL.revokeObjectURL(prevUrl);
                            });
                        }
                        return rec;
                    });
                }
            } catch (err) {
                formatErrorMessage(err).then((message) => setError(message));
            } finally {
                setIsLoading(false);
            }
        })();
    }, [params.recipeId, queryClient]);

    return (
        <>
            <Stack direction='horizontal'>
                <Button
                    variant='light'
                    aria-label='späť'
                    type='button'
                    onClick={() => {
                        navigate(recipesUrlWithCategory(state?.searchingCategory), {
                            state
                        });
                    }}
                >
                    <FontAwesomeIcon icon={faCircleArrowLeft} />
                </Button>
                <div className='flex-grow-1 d-sm-block' />
                <Stack
                    direction='horizontal'
                    gap={2}
                >
                    {!!params.recipeId && (
                        <Button
                            variant='light'
                            onClick={onBookmarkHandler}
                            title={isBookmarked ? 'Odobrať záložku' : 'Pridať záložku'}
                        >
                            <FontAwesomeIcon icon={isBookmarked ? faBookmarkSolid : faBookmark} />
                        </Button>
                    )}
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
            <div ref={componentRef}>
                <style>{getPageMargins()}</style>
                <h1 className='pt-2'>{recipe?.name}</h1>
                <ServeView
                    recipe={recipe}
                    serves={serves}
                    setServes={setServes}
                />
                <SectionView
                    recipe={recipe}
                    serves={serves}
                />
                {recipe?.method && (
                    <section className='pb-2'>
                        <h2>Postup prípravy receptu</h2>
                        <p>{recipe?.method}</p>
                    </section>
                )}
                <PictureView recipe={recipe} />
                <SourceView recipe={recipe} />
                <AssociatedRecipeView
                    recipe={recipe}
                    associatedRecipes={associatedRecipes}
                    serves={serves}
                />
                <div style={{ border: '1px solid transparent' }}>
                    <hr />
                </div>
                <AuthorView recipe={recipe} />
            </div>
            <Modal
                show={!!error}
                message={error}
                type='error'
                onClose={() => {
                    setError(undefined);
                }}
            />
            {isLoading && <Spinner />}
        </>
    );
};

export default RecipeView;
