import React, { useEffect, useRef, useState } from 'react';
import { Button, Stack } from 'react-bootstrap';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ReactToPrint from 'react-to-print';
import { Api } from '../../../openapi';
import { pictureApi, recipeApi } from '../../../utils/apiWrapper';
import { formatErrorMessage } from '../../../utils/errorMessages';
import Modal from '../../UI/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleArrowLeft, faPrint } from '@fortawesome/free-solid-svg-icons';
import AssociatedRecipeView from './AssociatedRecipeView';
import SectionView from './SectionView';
import PictureView from './PictureView';
import SourceView from './SourceView';
import InitialView from './InitialView';
import ServeView from './ServeView';
import AuthorView from './AuthorView';
import Spinner from '../../UI/Spinner';
import { recipesUrlWithCategory } from '../Recipes';

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
    const [associatedRecipes, setAssociatedRecipes] =
        useState<RecipesWithUrlInPictures[]>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const navigate = useNavigate();
    const { state } = useLocation();

    useEffect(() => {
        (async () => {
            try {
                if (params.recipeId) {
                    setIsLoading(true);
                    const rec: RecipesWithUrlInPictures =
                        await recipeApi.getRecipe(+params.recipeId);

                    for (let picture of rec.pictures) {
                        const data = await pictureApi.getPictureThumbnail(
                            picture.id
                        );
                        if (data instanceof Blob) {
                            const url = URL.createObjectURL(data);
                            picture.url = url;
                        }
                    }

                    if (rec.serves) {
                        setServes(rec.serves);
                    }

                    if (rec.associatedRecipes.length > 0) {
                        const associatedRecipesId = rec.associatedRecipes.map(
                            (a) => a.id
                        );
                        const assRecipes: RecipesWithUrlInPictures[] = [];
                        for (let id of associatedRecipesId) {
                            const assRec: RecipesWithUrlInPictures =
                                await recipeApi.getRecipe(id);
                            assRecipes.push(assRec);
                        }
                        for (let assRecipe of assRecipes) {
                            for (let picture of assRecipe.pictures) {
                                const data =
                                    await pictureApi.getPictureThumbnail(
                                        picture.id
                                    );
                                if (data instanceof Blob) {
                                    const url = URL.createObjectURL(data);
                                    picture.url = url;
                                }
                            }
                        }
                        setAssociatedRecipes((prev) => {
                            if (prev) {
                                prev.forEach((assRecipe) => {
                                    assRecipe.pictures.forEach(
                                        (assRecipePicture) => {
                                            assRecipePicture.url &&
                                                URL.revokeObjectURL(
                                                    assRecipePicture.url
                                                );
                                        }
                                    );
                                });
                            }
                            return assRecipes;
                        });
                    }
                    setRecipe((prev) => {
                        if (prev) {
                            prev.pictures.forEach((p) => {
                                p.url && URL.revokeObjectURL(p.url);
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
    }, [params.recipeId]);

    return (
        <div>
            <Stack direction='horizontal'>
            <div className='w-100'>
                <Button
                    variant='light'
                    aria-label='späť'
                    type='button'
                    style={{ position: 'absolute', left: 10, top: 60 }}
                    onClick={() => {
                        navigate(
                            recipesUrlWithCategory(state?.searchingCategory),
                            {
                                state,
                            }
                        );
                    }}
                >
                    <FontAwesomeIcon icon={faCircleArrowLeft} />
                </Button>
                <ReactToPrint
                    trigger={() => (
                        <Button
                            variant='light'
                            // className='justify-content-end'
                            style={{ position: 'absolute', right: 10, top: 60 }}
                        >
                            <FontAwesomeIcon icon={faPrint} />
                        </Button>
                    )}
                    content={() => componentRef.current}
                ></ReactToPrint>
            </div>
            </Stack>
            <div ref={componentRef}>
                <style>{getPageMargins()}</style>
                <InitialView recipe={recipe} />
                <ServeView
                    recipe={recipe}
                    serves={serves}
                    setServes={setServes}
                ></ServeView>
                <SectionView recipe={recipe} serves={serves} />
                <PictureView recipe={recipe} />
                <SourceView recipe={recipe} />
                <AssociatedRecipeView
                    recipe={recipe}
                    associatedRecipes={associatedRecipes}
                    serves={serves}
                />
                <hr />
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
        </div>
    );
};

export default RecipeView;
