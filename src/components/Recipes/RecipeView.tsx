import React, { useEffect, useRef, useState } from 'react';
import { Button, Card, Col, Row, Stack } from 'react-bootstrap';

import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ReactToPrint from 'react-to-print';
import { Api } from '../../openapi';
import { pictureApi, recipeApi } from '../../utils/apiWrapper';
import { formatErrorMessage } from '../../utils/errorMessages';
import Modal from '../UI/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleArrowLeft, faXmark } from '@fortawesome/free-solid-svg-icons';
import BootstrapModal from 'react-bootstrap/Modal';

const RecipeView: React.FC = () => {
    const [recipe, setRecipe] = useState<RecipesWithUrlInPictures>();
    const [error, setError] = useState<string>();
    const params = useParams();
    const [serves, setServes] = useState<number>(1);
    const componentRef = useRef<HTMLDivElement>(null);
    const [indexOfPic, setIndexOfPic] = useState<number>();
    const [show, setShow] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    interface PicturesWithUrl extends Api.Recipe.Picture {
        url?: string;
        fullPic?: string;
    }

    interface RecipesWithUrlInPictures extends Omit<Api.Recipe, 'pictures'> {
        pictures: PicturesWithUrl[];
    }

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

    const getPageMargins = () => {
        return `@page { margin: 40px !important; }`;
    };

    const changeServesHandler = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setServes(+event.target.value);
    };

    const urlify = (text: string) => {
        if (text.includes('http://') || text.includes('https://')) {
            const start = text.indexOf('https://');
            let end = text.indexOf(' ', start);
            if (end === -1) {
                end = text.length;
            }
            return (
                <>
                    {text.substring(0, start)}
                    <a href={text.substring(start, end)} rel='noopener'>
                        {text.substring(start, end)}
                    </a>
                    {text.substring(end, text.length)}
                </>
            );
        } else {
            return text;
        }
    };

    const showPictureHandler = (id: number) => {
        console.log(id);
        (async () => {
            try {
                const data = await pictureApi.getPictureData(id);
                if (data instanceof Blob) {
                    const fullPic = URL.createObjectURL(data);
                    console.log(recipe);
                    if (id && recipe) {
                        const index = recipe?.pictures.findIndex(
                            (p) => p.id === id
                        );
                        console.log(index);
                        setIndexOfPic(index);
                        console.log(recipe?.pictures[index]);
                        recipe.pictures[index].fullPic = fullPic;
                    }
                }
                console.log(recipe);
                setShow(true);
            } catch (err) {
                // formatErrorMessage(err).then((message) => setError(message));
            }
        })();
    };

    return (
        <div>
            <Button
                variant='light'
                aria-label='späť'
                type='button'
                onClick={() => {
                    console.log(location.state);
                    navigate('/recipes', { state: location.state });
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
                <h1>{recipe?.name}</h1>
                {recipe?.description !== null && (
                    <section>
                        <h2>Popis</h2>
                        <p>{recipe?.description}</p>
                    </section>
                )}
                {recipe?.serves !== null && (
                    <section>
                        <h2>Počet porcií</h2>
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
                            <h2>Počet porcií</h2>
                            <Stack direction='horizontal' gap={2}>
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
                                <span>
                                    * Počet porcií nie je v recepte
                                    zadefinovaný.
                                </span>
                            </Stack>
                        </section>
                    )}

                {recipe?.method !== null && (
                    <section>
                        <h2>Postup prípravy</h2>
                        <p>{recipe?.method}</p>
                    </section>
                )}
                {recipe && recipe.sources && recipe?.sources.length >= 1 && (
                    <section>
                        <h2>Zdroje</h2>
                        {recipe.sources.map((source) => (
                            <p
                                key={source}
                                // dangerouslySetInnerHTML={{
                                //     __html: ,
                                // }}
                            >
                                {urlify(source)}
                            </p>
                        ))}
                    </section>
                )}
                {recipe?.serves === null &&
                    recipe.recipeSections.map((section) => {
                        return (
                            <section key={section.id}>
                                <h2>{section.name}</h2>
                                <h3>Suroviny</h3>
                                <ul>
                                    {section.ingredients.map((ingredient) => {
                                        if (
                                            ingredient.value !== null &&
                                            serves
                                        ) {
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
                                <h3>Postup prípravy</h3>
                                <p>{section?.method}</p>
                            </section>
                        );
                    })}

                {/* toto */}
                {recipe?.serves !== null &&
                    recipe?.recipeSections.map((section) => {
                        return (
                            <section key={section.id}>
                                <h2>{section.name}</h2>
                                <h3>Suroviny</h3>
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
                                <h3>Postup prípravy</h3>
                                <p>{section?.method}</p>
                            </section>
                        );
                    })}
                <section>
                    <Row xs={1} sm={2} lg={4} className='g-4'>
                        {recipe?.pictures.map((picture) => (
                            <Col key={picture.id}>
                                {/* <Card.Img
                                    variant='top'
                                    src={picture.url}
                                    alt='obrázok'
                                    style={{
                                        aspectRatio: 1.33,
                                        objectFit: 'cover',
                                    }}
                                />
                                <Card.Body>
                                    <Card.Title>{picture.name}</Card.Title>
                                </Card.Body> */}

                                {/* toto je nove */}
                                <Card
                                    className='mb-3 overflow-hidden'
                                    role='button'
                                    onClick={showPictureHandler.bind(
                                        null,
                                        picture.id
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
                </section>
                <br></br>
                <hr />
                <p>
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
                <p>
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
                {(indexOfPic || indexOfPic === 0) && recipe && (
                    <div>
                        <BootstrapModal
                            show={show}
                            fullscreen={true}
                            onHide={() => {
                                delete recipe.pictures[indexOfPic].fullPic;
                                setIndexOfPic(undefined);
                                setShow(false);
                            }}
                        >
                            <BootstrapModal.Header
                                // closeButton
                                className='bg-dark border-dark'
                            >
                                <Button
                                    size='lg'
                                    title='Zavrieť'
                                    variant='outline-secondary'
                                    type='button'
                                    onClick={() => {
                                        setIndexOfPic(undefined);
                                        setShow(true);
                                    }}
                                    className='position-absolute border-0'
                                    style={{ top: 0, right: 0 }}
                                >
                                    <FontAwesomeIcon icon={faXmark} />
                                </Button>
                                <BootstrapModal.Title className='bg-dark text-white'>
                                    {recipe.pictures[indexOfPic].name}
                                </BootstrapModal.Title>
                            </BootstrapModal.Header>
                            <BootstrapModal.Body className='p-0 bg-dark'>
                                <Card.Img
                                    variant='top'
                                    src={recipe.pictures[indexOfPic].fullPic}
                                    alt='obrázok'
                                    style={
                                        {
                                            // aspectRatio: 1,
                                            // objectFit: 'cover',
                                        }
                                    }
                                    className='fullScreenPic'
                                />
                                {/* <Card.ImgOverlay className='d-flex flex-column-reverse p-0'>
                                    <Card.Title
                                        className='m-0 p-2'
                                        style={{
                                            backgroundColor: 'rgba(0,0,0,0.5)',
                                        }}
                                    >
                                        <span className='text-white'>
                                            {recipe.pictures[indexOfPic].name}
                                        </span>
                                    </Card.Title> */}
                                {/* </Card.ImgOverlay> */}
                            </BootstrapModal.Body>
                        </BootstrapModal>
                    </div>
                )}
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
