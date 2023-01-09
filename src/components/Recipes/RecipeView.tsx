import React, { useEffect, useRef, useState } from 'react';
import { Button, Card, Col, Row } from 'react-bootstrap';

import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ReactToPrint from 'react-to-print';
import { Api } from '../../openapi';
import { pictureApi, recipeApi } from '../../utils/apiWrapper';
import { formatErrorMessage } from '../../utils/errorMessages';
import Modal from '../UI/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCircleArrowLeft,
    faLeftLong,
    faRightLong,
    faXmark,
} from '@fortawesome/free-solid-svg-icons';
import BootstrapModal from 'react-bootstrap/Modal';

import { Link } from 'react-router-dom';

interface PicturesWithUrl extends Api.Recipe.Picture {
    url?: string;
    fullPic?: string;
}

interface RecipesWithUrlInPictures extends Omit<Api.Recipe, 'pictures'> {
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
    const [show, setShow] = useState<{
        title: string;
        url: string;
        index: number;
    } | null>(null);

    const navigate = useNavigate();
    const location = useLocation();

    // console.log(recipe);

    useEffect(() => {
        (async () => {
            try {
                if (params.recipeId) {
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
                    setRecipe(rec);
                }
            } catch (err) {
                formatErrorMessage(err).then((message) => setError(message));
            }
        })();
    }, [params.recipeId]);

    const changeServesHandler = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setServes(+event.target.value);
    };

    const urlify = (text: string) => {
        if (text.includes('http://') || text.includes('https://')) {
            let start;
            if (text.includes('http://')) {
                start = text.indexOf('http://');
            } else {
                start = text.indexOf('https://');
            }
            let end = text.indexOf(' ', start);
            if (end === -1) {
                end = text.length;
            }
            if (start) {
                return (
                    <>
                        {text.substring(0, start)}
                        <a href={text.substring(start, end)} rel='noopener'>
                            {text.substring(start, end)}
                        </a>
                        {text.substring(end, text.length)}
                    </>
                );
            }
        } else {
            return text;
        }
    };

    const showPictureHandler = (id: number, title: string, idx: number) => {
        console.log(id);
        (async () => {
            try {
                const data = await pictureApi.getPictureData(id);
                if (data instanceof Blob) {
                    const fullPic = URL.createObjectURL(data);
                    setShow((prev) => {
                        if (prev) {
                            URL.revokeObjectURL(prev.url);
                        }
                        return {
                            title: title,
                            url: fullPic,
                            index: idx,
                        };
                    });
                    console.log(recipe);
                }
                console.log(recipe);
            } catch (err) {
                // formatErrorMessage(err).then((message) => setError(message));
            }
        })();
    };

    const nextPictureHandler = () => {
        if (show && recipe?.pictures) {
            const next = show.index + 1;
            if (next >= recipe?.pictures.length) {
                showPictureHandler(
                    recipe?.pictures[0].id,
                    recipe?.pictures[0].name,
                    0
                );
            } else {
                showPictureHandler(
                    recipe?.pictures[next].id,
                    recipe?.pictures[next].name,
                    next
                );
            }
        }
    };

    const prevPictureHandler = () => {
        if (show && recipe?.pictures) {
            const prev = show.index - 1;
            if (prev < 0) {
                showPictureHandler(
                    recipe?.pictures[recipe?.pictures.length - 1].id,
                    recipe?.pictures[recipe?.pictures.length - 1].name,
                    recipe?.pictures.length - 1
                );
            } else {
                showPictureHandler(
                    recipe?.pictures[prev].id,
                    recipe?.pictures[prev].name,
                    prev
                );
            }
        }
    };

    const hidePictureHandler = () => {
        setShow((current) => {
            if (current) {
                URL.revokeObjectURL(current.url);
            }
            return null;
        });
    };

    return (
        <div>
            <Button
                variant='light'
                aria-label='späť'
                type='button'
                onClick={() => {
                    console.log(location.state);
                    navigate(`/recipes/${location.state.searchingCategory}`, { state: location.state });
                }}
                className='border-0'
            >
                <FontAwesomeIcon icon={faCircleArrowLeft} />
            </Button>
            <ReactToPrint
                trigger={() => <Button variant='light'>Vytlačiť</Button>}
                content={() => componentRef.current}
            ></ReactToPrint>
            <div ref={componentRef}>
                <style>{getPageMargins()}</style>
                <h3>{recipe?.name}</h3>
                {recipe?.description !== null && (
                    <section>
                        <h4>Popis</h4>
                        <p>{recipe?.description}</p>
                    </section>
                )}
                {recipe?.serves !== null && (
                    <section>
                        <h4>Počet porcií</h4>
                        <input
                            type='number'
                            defaultValue={serves}
                            onChange={changeServesHandler}
                            style={{
                                width: 50,
                            }}
                            className='border-0'
                            min={1}
                        ></input>
                    </section>
                )}

                {recipe?.serves === null &&
                    recipe.recipeSections.length > 0 && (
                        <section>
                            <h4>Počet porcií</h4>
                                <input
                                    type='number'
                                    defaultValue={serves}
                                    onChange={changeServesHandler}
                                    style={{
                                        width: 50,
                                    }}
                                    className='border-0'
                                    min={1}
                                ></input>
                        </section>
                    )}

                {recipe?.method !== null && (
                    <section>
                        <h4>Postup prípravy</h4>
                        <p>{recipe?.method}</p>
                    </section>
                )}

                {recipe?.serves === null &&
                    recipe.recipeSections.map((section) => {
                        return (
                            <section key={section.id}>
                                <h4>{section.name}</h4>
                                <h6>Suroviny</h6>
                                <ul>
                                    {section.ingredients.map((ingredient) => {
                                        if (
                                            ingredient.value !== null &&
                                            serves
                                        ) {
                                            // TODO --- urcite nie cez IF ELSE IF ELSE opakuje sa tu vela kodu rovnakeho, len vypocet ma byt samostatny idealne ako funkcia ktoru len zavolas
                                            if (
                                                ingredient.value * serves <
                                                10
                                            ) {
                                                return (
                                                    <li
                                                        key={ingredient.id}
                                                        title={
                                                            ingredient.unit.name
                                                        }
                                                    >
                                                        {`${
                                                            (+(
                                                                ingredient.value *
                                                                serves
                                                            ).toFixed(3) /
                                                                1000) *
                                                            1000
                                                        } ${
                                                            ingredient.unit
                                                                .abbreviation
                                                        } ${ingredient.name}`}
                                                    </li>
                                                );
                                            } else if (
                                                ingredient.value * serves <
                                                100
                                            ) {
                                                return (
                                                    <li
                                                        key={ingredient.id}
                                                        title={
                                                            ingredient.unit.name
                                                        }
                                                    >
                                                        {`${
                                                            (+(
                                                                ingredient.value *
                                                                serves
                                                            ).toFixed(2) /
                                                                100) *
                                                            100
                                                        } ${
                                                            ingredient.unit
                                                                .abbreviation
                                                        } ${ingredient.name}`}
                                                    </li>
                                                );
                                            } else {
                                                return (
                                                    <li key={ingredient.id}>
                                                        {`${
                                                            (+(
                                                                ingredient.value *
                                                                serves
                                                            ).toFixed(1) /
                                                                10) *
                                                            10
                                                        } ${
                                                            ingredient.unit
                                                                .abbreviation
                                                        } ${ingredient.name}`}
                                                    </li>
                                                );
                                            }
                                        } else {
                                            return (
                                                <li
                                                    key={ingredient.id}
                                                >{`${ingredient.unit.abbreviation} ${ingredient.name}`}</li>
                                            );
                                        }
                                    })}
                                </ul>
                                <h6>Postup prípravy</h6>
                                <p>{section?.method}</p>
                            </section>
                        );
                    })}

                {/* toto */}
                {recipe?.serves !== null &&
                    recipe?.recipeSections.map((section) => {
                        return (
                            <section key={section.id}>
                                <h4>{section.name}</h4>
                                <h6>Suroviny</h6>
                                <ul>
                                    {section.ingredients.map((ingredient) => {
                                        if (
                                            ingredient.value !== null &&
                                            serves &&
                                            recipe.serves
                                        ) {
                                            if (
                                                (ingredient.value /
                                                    recipe.serves) *
                                                    serves <
                                                10
                                            ) {
                                                return (
                                                    <li
                                                        key={ingredient.id}
                                                        title={
                                                            ingredient.unit.name
                                                        }
                                                    >
                                                        {`${
                                                            (+(
                                                                (ingredient.value /
                                                                    recipe.serves) *
                                                                serves
                                                            ).toFixed(3) /
                                                                1000) *
                                                            1000
                                                        } ${
                                                            ingredient.unit
                                                                .abbreviation
                                                        } ${ingredient.name}`}
                                                    </li>
                                                );
                                            } else if (
                                                (ingredient.value /
                                                    recipe.serves) *
                                                    serves <
                                                100
                                            ) {
                                                return (
                                                    <li key={ingredient.id}>
                                                        {`${
                                                            (+(
                                                                (ingredient.value /
                                                                    recipe.serves) *
                                                                serves
                                                            ).toFixed(2) /
                                                                100) *
                                                            100
                                                        } ${
                                                            ingredient.unit
                                                                .abbreviation
                                                        } ${ingredient.name}`}
                                                    </li>
                                                );
                                            } else {
                                                return (
                                                    <li key={ingredient.id}>
                                                        {`${
                                                            (+(
                                                                (ingredient.value /
                                                                    recipe.serves) *
                                                                serves
                                                            ).toFixed(1) /
                                                                10) *
                                                            10
                                                        } ${
                                                            ingredient.unit
                                                                .abbreviation
                                                        } ${ingredient.name}`}
                                                    </li>
                                                );
                                            }
                                        } else {
                                            return (
                                                <li
                                                    key={ingredient.id}
                                                >{`${ingredient.unit.abbreviation} ${ingredient.name}`}</li>
                                            );
                                        }
                                    })}
                                </ul>
                                <h6>Postup prípravy</h6>
                                <p>{section?.method}</p>
                            </section>
                        );
                    })}
                <section>
                    <Row xs={1} sm={2} lg={4} className='g-4'>
                        {recipe?.pictures.map((picture, idx) => (
                            <Col key={picture.id}>
                                <Card
                                    className='overflow-hidden'
                                    role='button'
                                    onClick={showPictureHandler.bind(
                                        null,
                                        picture.id,
                                        picture.name,
                                        idx
                                    )}
                                >
                                    <Card.Img
                                        variant='top'
                                        src={picture.url}
                                        alt='obrázok'
                                        style={{
                                            aspectRatio: 1,
                                            objectFit: 'cover',
                                        }}
                                    />
                                    <Card.ImgOverlay className='d-flex flex-column-reverse p-0'>
                                        <Card.Title
                                            className='m-0 p-2'
                                            style={{
                                                backgroundColor:
                                                    'rgba(0,0,0,0.5)',
                                            }}
                                        >
                                            <span className='text-white'>
                                                {picture.name}
                                            </span>
                                        </Card.Title>
                                    </Card.ImgOverlay>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                    {recipe &&
                        recipe.sources &&
                        recipe?.sources.length >= 1 && (
                            <section className='mt-3'>
                                <h4>Zdroje</h4>
                                {recipe.sources.map((source) => (
                                    <p className='mb-0' key={source}>
                                        {urlify(source)}
                                    </p>
                                ))}
                            </section>
                        )}
                </section>
                {recipe &&
                    recipe.associatedRecipes &&
                    recipe?.associatedRecipes.length >= 1 && (
                        <section className='mt-3'>
                            <h4>Súvisiace recepty</h4>
                            {recipe.associatedRecipes.map((recipe) => (
                                <div key={recipe.id}>
                                    <Link
                                        to={`/recipe/display/${recipe.id}`}
                                        className='mb-0'
                                    >
                                        {recipe.name}
                                    </Link>
                                </div>
                            ))}
                        </section>
                    )}
                <hr />
                <p className='mb-0'>
                    {recipe &&
                        recipe.creator &&
                        `Pridal: ${
                            recipe.creator.firstName
                                ? recipe.creator.firstName +
                                      ' ' +
                                      recipe.creator.lastName ?? ''
                                : recipe.creator.username
                        } dňa: ${new Date(
                            recipe.createdAt
                        ).toLocaleDateString()}`.trim()}
                </p>
                <p className='mb-0'>
                    {recipe &&
                        `Upravil: ${
                            recipe.modifier.firstName
                                ? recipe.modifier.firstName +
                                      ' ' +
                                      recipe.modifier.lastName ?? ''
                                : recipe.modifier.username
                        } dňa: ${new Date(
                            recipe.updatedAt
                        ).toLocaleDateString()}`.trim()}
                </p>
            </div>
            <div>
                <div>
                    <BootstrapModal
                        show={!!show}
                        fullscreen={true}
                        onHide={() => hidePictureHandler()}
                    >
                        <BootstrapModal.Header className='bg-dark border-dark'>
                            <div
                                className='position-absolute'
                                style={{ top: 0, right: 0 }}
                            >
                                <Button
                                    size='lg'
                                    title='Predchádzajúci'
                                    variant='outline-secondary'
                                    type='button'
                                    onClick={() => prevPictureHandler()}
                                    className='border-0'
                                >
                                    <FontAwesomeIcon icon={faLeftLong} />
                                </Button>
                                <Button
                                    size='lg'
                                    title='Zavrieť'
                                    variant='outline-secondary'
                                    type='button'
                                    onClick={() => hidePictureHandler()}
                                    className='border-0'
                                >
                                    <FontAwesomeIcon icon={faXmark} />
                                </Button>
                                <Button
                                    size='lg'
                                    title='Nasledujúci'
                                    variant='outline-secondary'
                                    type='button'
                                    onClick={() => nextPictureHandler()}
                                    className='border-0'
                                >
                                    <FontAwesomeIcon icon={faRightLong} />
                                </Button>
                            </div>
                            <BootstrapModal.Title className='bg-dark text-white'>
                                {show?.title}
                            </BootstrapModal.Title>
                        </BootstrapModal.Header>
                        <BootstrapModal.Body className='p-0 bg-dark text-center d-flex justify-content-center'>
                            <img
                                src={show?.url}
                                alt='obrázok'
                                style={{
                                    flex: '1 1',
                                    objectFit: 'contain',
                                    maxWidth: '100vw',
                                }}
                            />
                        </BootstrapModal.Body>
                    </BootstrapModal>
                </div>
            </div>
            <Modal
                show={!!error}
                message={error}
                type='error'
                onClose={() => {
                    setError(undefined);
                }}
            />
        </div>
    );
};

export default RecipeView;
