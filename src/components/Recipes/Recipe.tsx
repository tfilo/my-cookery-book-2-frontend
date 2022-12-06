import React, { useEffect, useState } from 'react';
import * as yup from 'yup';
import { Api } from '../../openapi';
import Modal from '../UI/Modal';
import { formatErrorMessage } from '../../utils/errorMessages';
import Spinner from '../UI/Spinner';
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    categoryApi,
    recipeApi,
    tagApi,
    unitApi,
    unitCategoryApi,
} from '../../utils/apiWrapper';
import Input from '../UI/Input';
import { Button, Form } from 'react-bootstrap';
import Select, { SelectGroupOptions } from '../UI/Select';
import RecipeSections from './RecipeSections';
import Sources from './Sources';
import Textarea from '../UI/Textarea';
import { useNavigate, useParams } from 'react-router-dom';

interface RecipeForm
    extends Omit<Api.CreateRecipe | Api.UpdateRecipe, 'sources'> {
    sources: {
        value: string;
    }[];
}

const schema = yup.object({
    name: yup
        .string()
        .trim()
        .min(1, 'Musí byť minimálne 1 znak')
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
        .integer()
        .defined()
        .min(0)
        .max(100, 'Musí byť maximálne 100 znakov')
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
    categoryId: yup.number().integer().min(1).required(),
    recipeSections: yup
        .array()
        .of(
            yup.object({
                name: yup
                    .string()
                    .trim()
                    // .min(1, 'Musí byť minimálne 1 znak')
                    .max(80, 'Musí byť maximálne 80 znakov')
                    .required(),
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
                                .required(),
                            value: yup
                                .number()
                                .defined()
                                .min(0)
                                .default(null)
                                .nullable(),
                            unitId: yup
                                .number()
                                .integer()
                                .min(1, 'Prosím vyberte možnosť')
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
        .of(yup.number().integer().min(1).required())
        .nullable(),
    tags: yup.array().of(yup.number().integer().min(1).required()).required(),
    // pictures: yup
    //     .array()
    //     .of(
    //         yup.object({
    //             id: yup.number().integer().min(1).required(),
    //             name: yup
    //                 .string()
    //                 .trim()
    //                 .min(1, 'Musí byť minimálne 1 znak')
    //                 .max(80, 'Musí byť maximálne 80 znakov')
    //                 .required(),
    //             sortNumber: yup.number().integer().min(1).required(),
    //         })
    //     )
    //     .transform((val) => (val === '' ? [] : val))
    //     .required(),
});

const Recipe: React.FC = () => {
    const methods = useForm<RecipeForm>({
        resolver: yupResolver(schema),
        defaultValues: {
            recipeSections: [
                {
                    name: '',
                    method: null,
                    ingredients: [
                        {
                            name: '',
                            value: 0,
                            unitId: -1,
                        },
                    ],
                },
            ],
            tags: [],
            associatedRecipes: [],
            categoryId: -1,
        },
    });

    const {
        formState: { isSubmitting },
    } = methods;

    const [error, setError] = useState<string>();
    const [listOfCategories, setListOfCategories] = useState<
        Api.SimpleCategory[]
    >([]);
    const [listOfTags, setListOfTags] = useState<Api.SimpleTag[]>([]);
    const [ingredientsData, setIngredientsData] = useState<
        SelectGroupOptions[]
    >([]);

    const navigate = useNavigate();
    const params = useParams();

    useEffect(() => {
        (async () => {
            try {
                const categories = await categoryApi.getCategories();
                setListOfCategories(categories);

                const tags = await tagApi.getTags();
                setListOfTags(tags);

                const unitCategories =
                    await unitCategoryApi.getUnitCategories();

                const data: SelectGroupOptions[] = [];
                for (let category of unitCategories) {
                    const unitByCategoryId =
                        await unitApi.getUnitsByUnitCategory(category.id);
                    const updatedUnits = unitByCategoryId.map((unit) => {
                        return { value: unit.id, label: unit.name };
                    });
                    data.push({
                        optGroupId: category.id,
                        optGroupName: category.name,
                        options: updatedUnits,
                    });
                }
                setIngredientsData(data);

                if (params.recipeId) {
                    const paramsNumber = parseInt(params?.recipeId);
                    const data = await recipeApi.getRecipe(paramsNumber);
                    methods.reset({
                        ...data,
                        sources: data.sources.map((s) => {
                            return { value: s };
                        }),
                        associatedRecipes: data.associatedRecipes.map(
                            (ar) => ar.id
                        ),
                        tags: data.tags.map((t) => t.id),
                    });
                }
            } catch (err) {
                formatErrorMessage(err).then((message) => setError(message));
            }
        })();
    }, [params.recipeId, methods]);

    const cancelHandler = () => {
        navigate('/recipes');
    };

    const submitHandler: SubmitHandler<RecipeForm> = async (
        data: RecipeForm
    ) => {
        console.log(data);

        const sendData = {
            ...data,
            sources: data.sources.map((s) => s.value),
            recipeSections: data.recipeSections.map((rs, index) => {
                return {
                    ...rs,
                    sortNumber: index + 1,
                    id: 'id' in rs && rs.id ? rs.id : undefined,
                    ingredients: rs.ingredients.map((i, index) => {
                        return {
                            ...i,
                            sortNumber: index + 1,
                            id: 'id' in i && i.id ? i.id : undefined,
                        };
                    }),
                };
            }),
            pictures: [],
        };
        console.log(sendData);
        try {
            if (params.recipeId) {
                await recipeApi.updateRecipe(+params.recipeId, sendData);
            } else {
                await recipeApi.createRecipe(sendData);
            }
            navigate('/recipes');
        } catch (err) {
            formatErrorMessage(err).then((message) => setError(message));
        }
    };

    return (
        <div className='row justify-content-center'>
            <div className='col-lg-12 pt-3'>
                <h1>Pridanie receptu</h1>
                <FormProvider {...methods}>
                    <Form
                        onSubmit={methods.handleSubmit(submitHandler)}
                        noValidate
                    >
                        <Input name='name' label='Názov' />
                        <Textarea name='description' label='Popis' />
                        <Input
                            name='serves'
                            label='Počet porcií'
                            type='number'
                        />
                        <Textarea label='Postup' name='method' />
                        <RecipeSections ingredientsData={ingredientsData} />
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
                        <Select
                            name='associatedRecipes'
                            label='Súvisiace recepty'
                            options={[]}
                        />
                        <Select
                            name='tags'
                            label='Pridať značky'
                            options={listOfTags?.map((tag) => ({
                                value: tag.id,
                                label: tag.name,
                            }))}
                            multiple={true}
                        />
                        {listOfTags.length < 1 && (
                            <p className='text-danger'>
                                Nie je možné vybrať žiadnu značku, nakoľko
                                žiadna nie je zadefinovaná.
                            </p>
                        )}
                        <Sources />
                        {/* <Input name='pictures' label='Obrázky' /> */}
                        <Button variant='primary' type='submit'>
                            {params.recipeId
                                ? 'Zmeniť recept'
                                : 'Pridať recept'}
                        </Button>
                        {isSubmitting && <Spinner />}
                        <Button
                            variant='warning'
                            type='button'
                            onClick={cancelHandler}
                        >
                            Zrušiť
                        </Button>
                    </Form>
                </FormProvider>
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

export default Recipe;
