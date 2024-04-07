import React, { useCallback, useId, useState } from 'react';
import * as yup from 'yup';
import { Api } from '../../openapi';
import Modal from '../UI/Modal';
import { formatErrorMessage } from '../../utils/errorMessages';
import Spinner from '../UI/Spinner';
import { useForm, SubmitHandler, FormProvider, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { categoryApi, recipeApi, tagApi, unitApi, unitCategoryApi } from '../../utils/apiWrapper';
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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DEFAULT_PAGE } from '../../utils/constants';

export interface RecipeForm extends Omit<Api.CreateRecipe | Api.UpdateRecipe, 'sources' | 'associatedRecipes' | 'tags'> {
    sources: {
        value: string;
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
        name: yup.string().trim().min(1, 'Povinná položka').max(80, 'Musí byť maximálne 80 znakov').required(),
        description: yup
            .string()
            .defined()
            .trim()
            .transform((val) => (val === '' ? null : val))
            .max(160, 'Musí byť maximálne 160 znakov')
            .default(null)
            .nullable(),
        serves: yup
            .number()
            .transform((val) => (/\b([1-9]|[1-9][0-9]|100)\b/.test(val) ? val : null))
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
            .default(null)
            .nullable(),
        sources: yup
            .array()
            .of(
                yup.object({
                    value: yup.string().trim().max(1000, 'Musí byť maximálne 1000 znakov').required()
                })
            )
            .required(),
        categoryId: yup.number().integer().min(1, 'Prosím vyberte možnosť').required(),
        recipeSections: yup
            .array()
            .of(
                yup.object({
                    name: yup
                        .string()
                        .defined()
                        .trim()
                        .transform((val) => (val === '' ? null : val))
                        .max(80, 'Musí byť maximálne 80 znakov')
                        .default(null)
                        .nullable(),
                    method: yup
                        .string()
                        .defined()
                        .trim()
                        .transform((val) => (val === '' ? null : val))
                        .default(null)
                        .nullable(),
                    ingredients: yup
                        .array()
                        .of(
                            yup.object({
                                name: yup.string().trim().max(80, 'Musí byť maximálne 80 znakov').required('Povinná položka'),
                                value: yup
                                    .number()
                                    .defined()
                                    .min(0, 'Hodnota musí byť minimálne 0')
                                    .default(null)
                                    .nullable()
                                    .transform((val) => (isNaN(val) ? null : val)),
                                unitId: yup.number().integer().min(1, 'Povinná položka').required()
                            })
                        )
                        .required()
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
                    name: yup.string().trim().min(1, 'Povinná položka').max(80, 'Musí byť maximálne 80 znakov').required()
                })
            )
            .required(),
        tags: yup
            .array()
            .of(
                yup
                    .object({
                        id: yup.number().integer().min(1).required(),
                        name: yup.string().trim().min(1, 'Povinná položka').max(80, 'Musí byť maximálne 80 znakov').required()
                    })
                    .required()
            )
            .required(),
        pictures: yup
            .array()
            .of(
                yup.object({
                    id: yup.number().integer().min(1).required(),
                    name: yup.string().trim().min(1, 'Povinná položka').max(80, 'Musí byť maximálne 80 znakov').required()
                })
            )
            .transform((val) => (val === '' ? [] : val))
            .required()
    })
    .required();

const defaultValues = {
    name: '',
    description: null,
    serves: null,
    method: null,
    sources: [],
    recipeSections: [
        {
            name: '',
            sortNumber: 1,
            method: null,
            ingredients: [{ name: '', sortNumber: 1, value: null, unitId: -1 }]
        }
    ],
    tags: [],
    associatedRecipes: [],
    categoryId: -1,
    pictures: []
};

const Recipe: React.FC = () => {
    const [error, setError] = useState<string>();
    const [units, setUnits] = useState<SelectGroupOptions[]>([]);
    const [listOfCategories, setListOfCategories] = useState<Api.SimpleCategory[]>([]);
    const [listOfTags, setListOfTags] = useState<Api.SimpleTag[]>([]);
    const [requiredUnits, setRequiredUnits] = useState<{ id: number; required: boolean }[]>([]);
    const [nameOfRecipe, setNameOfRecipe] = useState<string>();
    const [deleteModal, setDeleteModal] = useState<boolean>(false);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const params = useParams();
    const { search } = useLocation();
    const searchParams = new URLSearchParams(search);
    const id = useId();

    const methods = useForm<RecipeForm>({
        resolver: yupResolver(schema),
        defaultValues: async () => {
            try {
                const units: SelectGroupOptions[] = [];
                const requiredUnit: { id: number; required: boolean }[] = [];

                const listOfCategories = await queryClient.fetchQuery({
                    queryKey: ['categories'],
                    queryFn: ({ signal }) =>
                        categoryApi.getCategories({ signal }).then((data) =>
                            data.sort((a, b) =>
                                a.name.localeCompare(b.name, undefined, {
                                    sensitivity: 'base'
                                })
                            )
                        )
                });

                const listOfTags = await queryClient.fetchQuery({
                    queryKey: ['tags'],
                    queryFn: ({ signal }) =>
                        tagApi.getTags({ signal }).then((data) =>
                            data.sort((a, b) =>
                                a.name.localeCompare(b.name, undefined, {
                                    sensitivity: 'base'
                                })
                            )
                        )
                });

                const listOfUnitCategories = await queryClient.fetchQuery({
                    queryKey: ['unitcategories'],
                    queryFn: ({ signal }) =>
                        unitCategoryApi.getUnitCategories({ signal }).then((data) =>
                            data.sort((a, b) =>
                                a.name.localeCompare(b.name, undefined, {
                                    sensitivity: 'base'
                                })
                            )
                        )
                });

                for (let category of listOfUnitCategories) {
                    const unitsOfCategory = await queryClient.fetchQuery({
                        queryKey: ['unitcategories', category.id, 'units'] as const,
                        queryFn: async ({ queryKey }) => {
                            const data = await unitApi.getUnitsByUnitCategory(queryKey[1]);
                            return data.sort((a, b) =>
                                a.name.localeCompare(b.name, undefined, {
                                    sensitivity: 'base'
                                })
                            );
                        }
                    });

                    unitsOfCategory.forEach((unit) => {
                        requiredUnit.push({
                            id: unit.id,
                            required: unit.required
                        });
                    });

                    units.push({
                        optGroupId: category.id,
                        optGroupName: category.name,
                        options: unitsOfCategory.map((unit) => {
                            return { value: unit.id, label: unit.name };
                        })
                    });
                }

                setListOfCategories(listOfCategories);
                setListOfTags(listOfTags);
                setRequiredUnits(requiredUnit);
                setUnits(units);

                if (params.recipeId) {
                    const data = await queryClient.fetchQuery({
                        queryKey: ['recipes', +params?.recipeId] as const,
                        queryFn: async ({ queryKey, signal }) => recipeApi.getRecipe(queryKey[1], { signal })
                    });

                    const formattedData: RecipeForm = {
                        ...data,
                        sources: data.sources.map((s) => {
                            return { value: s };
                        }),
                        associatedRecipes: data.associatedRecipes.map((ar) => {
                            return { id: ar.id, name: ar.name };
                        })
                    };

                    setNameOfRecipe(formattedData.name);
                    return formattedData;
                }
            } catch (e) {
                formatErrorMessage(e).then((message) => setError(message));
            }
            return defaultValues;
        }
    });

    const {
        formState: { isSubmitting, isLoading },
        control
    } = methods;

    const cancelHandler = () => {
        navigate(`/recipes?${searchParams}`);
    };

    const { mutate: saveRecipe, isPending: isSavingRecipe } = useMutation({
        mutationFn: async ({ data, recipeId }: { data: Api.UpdateRecipe | Api.CreateRecipe; recipeId?: number }) => {
            if (recipeId) {
                await recipeApi.updateRecipe(recipeId, data);
                return { id: recipeId };
            } else {
                return recipeApi.createRecipe(data);
            }
        },
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ['recipes'] });
            queryClient.removeQueries({
                queryKey: ['find']
            });
        },
        onSettled: (data, error) => {
            if (error) {
                formatErrorMessage(error).then((message) => setError(message));
            } else if (data) {
                queryClient.removeQueries({ queryKey: ['recipes', data.id] });
                navigate(`/recipes?${searchParams}`);
            }
        }
    });

    const submitHandler: SubmitHandler<RecipeForm> = async (data: RecipeForm) => {
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
                            const unitById = requiredUnits.find((unit) => unit.id === i.unitId);
                            if (unitById?.required) {
                                // TODO solve in yup
                                methods.setError(`recipeSections.${rsIndex}.ingredients.${iIndex}.value`, {
                                    type: 'required',
                                    message: 'Pri danej jednotke musí byť zadané množstvo.'
                                });
                                throw new Error('chyba validacie');
                            }
                        }
                        return {
                            ...i,
                            sortNumber: iIndex + 1,
                            id: 'id' in i && i.id ? i.id : undefined
                        };
                    })
                };
            })
        };
        saveRecipe({ data: sendData, recipeId: params.recipeId ? +params.recipeId : undefined });
    };

    const deleteRecipeHandler = useCallback(() => {
        setDeleteModal(true);
    }, []);

    const { mutate: deleteRecipe, isPending: isDeletingRecipe } = useMutation({
        mutationFn: (recipeId: number) => recipeApi.deleteRecipe(recipeId),
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ['recipes'] });
            queryClient.removeQueries({
                queryKey: ['find']
            });
        },
        onSettled: (data, error, recipeId) => {
            if (error) {
                formatErrorMessage(error).then((message) => setError(message));
            } else if (recipeId) {
                queryClient.removeQueries({ queryKey: ['recipes', recipeId] });
                searchParams.set('page', `${DEFAULT_PAGE}`);
                navigate(`/recipes?${searchParams}`);
            }
        }
    });

    const deleteRecipeConfirmHandler = useCallback(
        (confirmed: boolean) => {
            if (confirmed) {
                if (params.recipeId) {
                    deleteRecipe(+params.recipeId);
                } else {
                    setError('Neplatné používateľské ID!');
                }
            }
            setDeleteModal(false);
        },
        [deleteRecipe, params.recipeId]
    );

    return (
        <div className='row justify-content-center'>
            <div className='col-lg-12 pt-3'>
                <h1>{params.recipeId ? 'Zmena receptu' : 'Pridanie receptu'}</h1>
                <FormProvider {...methods}>
                    <Form
                        onSubmit={methods.handleSubmit(submitHandler)}
                        noValidate
                        autoComplete='off'
                    >
                        <Input
                            name='name'
                            label='Názov'
                        />
                        <Textarea
                            name='description'
                            label='Popis'
                        />
                        <Input
                            name='serves'
                            label='Počet porcií'
                            type='number'
                            min={1}
                        />
                        <RecipeSections units={units} />
                        <Textarea
                            label='Postup prípravy receptu (voliteľné)'
                            name='method'
                            rows={10}
                        />
                        <Select
                            name='categoryId'
                            label='Kategória receptu'
                            multiple={false}
                            options={
                                listOfCategories.map((category) => ({
                                    value: category.id,
                                    label: category.name
                                })) ?? []
                            }
                        />
                        {listOfCategories.length === 0 && (
                            <p className='text-danger'>Nie je možné vybrať žiadnu kategóriu, nakoľko žiadna nie je zadefinovaná.</p>
                        )}
                        <AssociatedRecipes />
                        <Form.Group className='mb-3'>
                            <Form.Label htmlFor='tagsMultiselection'>Značky</Form.Label>
                            <Controller
                                control={control}
                                name='tags'
                                render={({ field: { onChange, value } }) => (
                                    <Typeahead
                                        id={id + 'tags'}
                                        labelKey='name'
                                        onChange={onChange}
                                        options={listOfTags ?? []}
                                        placeholder='Vyberte ľubovoľný počet značiek'
                                        selected={value}
                                        multiple
                                    />
                                )}
                            />

                            {listOfTags.length === 0 && (
                                <p className='text-danger'>Nie je možné vybrať žiadnu značku, nakoľko žiadna nie je zadefinovaná.</p>
                            )}
                        </Form.Group>
                        <Sources />
                        <Pictures />
                        <Stack
                            gap={2}
                            className='flex-md-row'
                        >
                            <Button
                                variant='primary'
                                type='submit'
                            >
                                {params.recipeId ? 'Zmeniť recept' : 'Pridať recept'}
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
            <Spinner show={isSubmitting || isLoading || isSavingRecipe || isDeletingRecipe} />
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
