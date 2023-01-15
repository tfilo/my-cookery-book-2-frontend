import React, { useEffect, useMemo, useState } from 'react';
import * as yup from 'yup';
import { Api } from '../../openapi';
import Modal from '../UI/Modal';
import { formatErrorMessage } from '../../utils/errorMessages';
import Spinner from '../UI/Spinner';
import {
    useForm,
    SubmitHandler,
    FormProvider,
    Controller,
} from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    categoryApi,
    pictureApi,
    recipeApi,
    tagApi,
    unitApi,
    unitCategoryApi,
} from '../../utils/apiWrapper';
import Input from '../UI/Input';
import { Button, Form, Stack } from 'react-bootstrap';
import Select, { SelectGroupOptions } from '../UI/Select';
import RecipeSections from './RecipeSections';
import Sources from './Sources';
import Textarea from '../UI/Textarea';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Pictures from './Pictures';
import AssociatedRecipes from './AssociatedRecipes';
import { Typeahead } from 'react-bootstrap-typeahead';

export interface RecipeForm
    extends Omit<
        Api.CreateRecipe | Api.UpdateRecipe,
        'sources' | 'pictures' | 'associatedRecipes' | 'tags'
    > {
    sources: {
        value: string;
    }[];
    pictures: {
        id: number;
        name: string;
        url: string;
    }[];
    associatedRecipes: {
        id: number;
        name: string;
    }[];
    tags: {
        id: number;
        name: string;
    }[];
}

const schema = yup
    .object({
        name: yup
            .string()
            .trim()
            .min(1, 'Povinná položka')
            .max(80, 'Musí byť maximálne 80 znakov')
            .required(),
        description: yup
            .string()
            .defined()
            .trim()
            .transform((val) => (val === '' ? null : val))
            // .min(1, 'Musí byť minimálne 1 znak')
            .max(160, 'Musí byť maximálne 160 znakov')
            .default(null)
            .nullable(),
        serves: yup
            .number()
            .transform((val) =>
                /\b([1-9]|[1-9][0-9]|100)\b/.test(val) ? val : null
            )
            .integer()
            .defined()
            .min(1, 'Musí byť minimálne 1 porcia alebo porciu nedefinovať')
            .max(100, 'Musí byť maximálne 100')
            .default(null)
            .nullable(),
        method: yup
            .string()
            .defined()
            .trim()
            .transform((val) => (val === '' ? null : val))
            // .min(1, 'Musí byť minimálne 1 znak')
            .default(null)
            .nullable(),
        sources: yup
            .array()
            .of(
                yup.object({
                    value: yup
                        .string()
                        .trim()
                        // .min(1, 'Musí byť minimálne 1 znak')
                        .max(1000, 'Musí byť maximálne 1000 znakov')
                        .required(),
                })
            )
            .required(),
        categoryId: yup
            .number()
            .integer()
            .min(1, 'Prosím vyberte možnosť')
            .required(),
        recipeSections: yup
            .array()
            .of(
                yup.object({
                    name: yup
                        .string()
                        .defined()
                        .trim()
                        .transform((val) => (val === '' ? null : val))
                        // .min(1, 'Musí byť minimálne 1 znak')
                        .max(80, 'Musí byť maximálne 80 znakov')
                        .default(null)
                        .nullable(),
                    method: yup
                        .string()
                        .defined()
                        .trim()
                        .transform((val) => (val === '' ? null : val))
                        // .min(1, 'Musí byť minimálne 1 znak')
                        .default(null)
                        .nullable(),
                    ingredients: yup
                        .array()
                        .of(
                            yup.object({
                                name: yup
                                    .string()
                                    .trim()
                                    // .min(1, 'Musí byť minimálne 1 znak')
                                    .max(80, 'Musí byť maximálne 80 znakov')
                                    .required('Povinná položka'),
                                value: yup
                                    .number()
                                    .defined()
                                    .min(0, 'Hodnota musí byť minimálne 0')
                                    .default(null)
                                    .nullable()
                                    .transform((val) =>
                                        isNaN(val) ? null : val
                                    ),
                                unitId: yup
                                    .number()
                                    .integer()
                                    .min(1, 'Povinná položka')
                                    .required(),
                            })
                        )
                        .required(),
                })
            )
            .required(),
        associatedRecipes: yup
            .array()
            .defined()
            .transform((val) => (val === null ? [] : val))
            .of(
                yup.object({
                    id: yup.number().integer().min(1).required(),
                    name: yup
                        .string()
                        .trim()
                        .min(1, 'Povinná položka')
                        .max(80, 'Musí byť maximálne 80 znakov')
                        .required(),
                })
            )
            .required(),
        tags: yup
            .array()
            .of(
                yup
                    .object({
                        id: yup.number().integer().min(1).required(),
                        name: yup.string(),
                    })
                    .required()
            )
            .required(),
        pictures: yup
            .array()
            .of(
                yup.object({
                    id: yup.number().integer().min(1).required(),
                    name: yup
                        .string()
                        .trim()
                        .min(1, 'Povinná položka')
                        .max(80, 'Musí byť maximálne 80 znakov')
                        .required(),
                })
            )
            .transform((val) => (val === '' ? [] : val))
            .required(),
    })
    .required();

const Recipe: React.FC = () => {
    const defaultValues = useMemo(() => {
        return {
            name: '',
            description: null,
            serves: null,
            method: null,
            sources: [],
            recipeSections: [],
            tags: [],
            associatedRecipes: [],
            categoryId: -1,
            pictures: [],
        };
    }, []);

    const methods = useForm<RecipeForm>({
        resolver: yupResolver(schema),
        defaultValues,
    });

    const {
        formState: { isSubmitting },
        control,
    } = methods;

    const [error, setError] = useState<string>();
    const [listOfCategories, setListOfCategories] = useState<
        Api.SimpleCategory[]
    >([]);
    const [listOfTags, setListOfTags] = useState<Api.SimpleTag[]>([]);
    const [units, setUnits] = useState<SelectGroupOptions[]>([]);
    const [requiredUnits, setRequiredUnits] = useState<
        { id: number; required: boolean }[]
    >([]);
    const [nameOfRecipe, setNameOfRecipe] = useState<string>();
    const [deleteModal, setDeleteModal] = useState<boolean>(false);
    const navigate = useNavigate();
    const params = useParams();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const location = useLocation();

    useEffect(() => {
        (async () => {
            try {
                setIsLoading(true);
                const categories = await categoryApi.getCategories();
                setListOfCategories(categories);

                const tags = await tagApi.getTags();
                setListOfTags(tags);

                const unitCategories =
                    await unitCategoryApi.getUnitCategories();
                const units: SelectGroupOptions[] = [];
                const requiredUnit: { id: number; required: boolean }[] = [];
                for (let category of unitCategories) {
                    const unitByCategoryId =
                        await unitApi.getUnitsByUnitCategory(category.id);

                    unitByCategoryId.forEach((unit) => {
                        requiredUnit.push({
                            id: unit.id,
                            required: unit.required,
                        });
                    });

                    const updatedUnits = unitByCategoryId.map((unit) => {
                        return { value: unit.id, label: unit.name };
                    });
                    units.push({
                        optGroupId: category.id,
                        optGroupName: category.name,
                        options: updatedUnits,
                    });
                }
                setRequiredUnits(requiredUnit);
                setUnits(units);

                if (params.recipeId) {
                    const data = await recipeApi.getRecipe(+params?.recipeId);
                    const formattedData: RecipeForm = {
                        ...data,
                        sources: data.sources.map((s) => {
                            return { value: s };
                        }),
                        associatedRecipes: data.associatedRecipes.map((ar) => {
                            return { id: ar.id, name: ar.name };
                        }),
                        pictures: [],
                    };

                    for (let pic of data.pictures) {
                        const response = await pictureApi.getPictureThumbnail(
                            pic.id
                        );
                        if (response instanceof Blob) {
                            const url = URL.createObjectURL(response);
                            formattedData.pictures.push({
                                id: pic.id,
                                name: pic.name,
                                url: url,
                            });
                        }
                    }

                    methods.reset(formattedData);
                    setNameOfRecipe(formattedData.name);
                } else {
                    methods.reset(defaultValues);
                }
            } catch (err) {
                formatErrorMessage(err).then((message) => setError(message));
            } finally {
                setIsLoading(false);
            }
        })();
    }, [params.recipeId, methods, defaultValues]);

    const cancelHandler = () => {
        navigate(`/recipes/${location.state?.searchingCategory ?? ''}`, {
            state: location.state,
        });
    };

    const submitHandler: SubmitHandler<RecipeForm> = async (
        data: RecipeForm
    ) => {
        const sendData = {
            ...data,
            tags: data.tags.map((tag) => tag.id),
            sources: data.sources.map((s) => s.value),
            associatedRecipes: data.associatedRecipes.map((rec) => rec.id),
            recipeSections: data.recipeSections.map((rs, rsIndex) => {
                return {
                    ...rs,
                    sortNumber: rsIndex + 1,
                    id: 'id' in rs && rs.id ? rs.id : undefined,
                    ingredients: rs.ingredients.map((i, iIndex) => {
                        if (i.value === null) {
                            const unitById = requiredUnits.find(
                                (unit) => unit.id === i.unitId
                            );
                            if (unitById?.required) {
                                methods.setError(
                                    `recipeSections.${rsIndex}.ingredients.${iIndex}.value`,
                                    {
                                        type: 'required',
                                        message:
                                            'Pri danej jednotke musí byť zadané množstvo.',
                                    }
                                );
                                throw new Error('chyba validacie');
                            }
                        }
                        return {
                            ...i,
                            sortNumber: iIndex + 1,
                            id: 'id' in i && i.id ? i.id : undefined,
                        };
                    }),
                };
            }),
            pictures: data.pictures.map((p, pIndex) => {
                return {
                    id: p.id,
                    name: p.name,
                    sortNumber: pIndex + 1,
                };
            }),
        };

        try {
            setIsLoading(true);
            if (params.recipeId) {
                await recipeApi.updateRecipe(+params.recipeId, sendData);
            } else {
                await recipeApi.createRecipe(sendData);
            }

            for (let pic of data.pictures) {
                URL.revokeObjectURL(pic.url);
            }

            navigate(`/recipes/${location.state?.searchingCategory ?? ''}`, {
                state: location.state,
            });
        } catch (err) {
            formatErrorMessage(err).then((message) => setError(message));
        } finally {
            setIsLoading(false);
        }
    };

    const deleteRecipeHandler = () => {
        setDeleteModal(true);
    };

    const deleteRecipeConfirmHandler = (status: boolean) => {
        (async () => {
            if (status === true) {
                if (params.recipeId) {
                    try {
                        setIsLoading(true);
                        await recipeApi.deleteRecipe(+params.recipeId);
                        navigate(
                            `/recipes/${location.state.searchingCategory}`,
                            {
                                state: {
                                    ...location.state,
                                    currentPage: 1,
                                },
                            }
                        );
                    } catch (err) {
                        formatErrorMessage(err).then((message) => {
                            setError(message);
                        });
                    } finally {
                        setIsLoading(false);
                    }
                } else {
                    setError('Neplatné používateľské ID!');
                }
            }
            setDeleteModal(false);
        })();
    };

    return (
        <div className='row justify-content-center'>
            <div className='col-lg-12 pt-3'>
                <h1>
                    {params.recipeId ? 'Zmena receptu' : 'Pridanie receptu'}
                </h1>
                <FormProvider {...methods}>
                    <Form
                        onSubmit={methods.handleSubmit(submitHandler)}
                        noValidate
                        autoComplete='off'
                    >
                        <Input name='name' label='Názov' />
                        <Textarea name='description' label='Popis' />
                        <Input
                            name='serves'
                            label='Počet porcií'
                            type='number'
                            min={1}
                        />
                        <Textarea
                            label='Postup prípravy'
                            name='method'
                            rows={10}
                        />
                        <RecipeSections units={units} />
                        <Select
                            name='categoryId'
                            label='Kategória receptu'
                            multiple={false}
                            options={listOfCategories?.map((category) => ({
                                value: category.id,
                                label: category.name,
                            }))}
                        />
                        {listOfCategories.length < 1 && (
                            <p className='text-danger'>
                                Nie je možné vybrať žiadnu kategóriu, nakoľko
                                žiadna nie je zadefinovaná.
                            </p>
                        )}
                        <AssociatedRecipes></AssociatedRecipes>
                        <Form.Group>
                            <Form.Label htmlFor='tagsMultiselection'>
                                Značky
                            </Form.Label>
                            <Controller
                                control={control}
                                name='tags'
                                render={({ field: { onChange, value } }) => (
                                    <Typeahead
                                        id='tags'
                                        labelKey='name'
                                        onChange={onChange}
                                        options={listOfTags}
                                        placeholder='Vyberte ľubovoľný počet značiek'
                                        selected={value}
                                        multiple
                                    />
                                )}
                            />

                            {listOfTags.length < 1 && (
                                <p className='text-danger'>
                                    Nie je možné vybrať žiadnu značku, nakoľko
                                    žiadna nie je zadefinovaná.
                                </p>
                            )}
                        </Form.Group>
                        <Sources />
                        <Pictures />
                        <Stack gap={2} className='flex-md-row'>
                            <Button variant='primary' type='submit'>
                                {params.recipeId
                                    ? 'Zmeniť recept'
                                    : 'Pridať recept'}
                            </Button>
                            <Button
                                variant='warning'
                                type='button'
                                onClick={cancelHandler}
                            >
                                Zrušiť
                            </Button>
                            <div className='flex-grow-1 d-none d-md-block'></div>

                            {params.recipeId && (
                                <Button
                                    variant='danger'
                                    type='button'
                                    onClick={deleteRecipeHandler}
                                >
                                    Vymazať recept
                                </Button>
                            )}
                        </Stack>
                    </Form>
                </FormProvider>
            </div>
            {(isSubmitting || isLoading) && <Spinner />}
            <Modal
                show={!!deleteModal}
                type='question'
                message={`Prajete si vymazať recept "${nameOfRecipe}" ?`}
                onClose={deleteRecipeConfirmHandler}
            />
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

export default Recipe;
