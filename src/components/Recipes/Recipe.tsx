import React, { useEffect, useState } from 'react';
import * as yup from 'yup';
import { Api } from '../../openapi';
import Modal from '../UI/Modal';
import { formatErrorMessage } from '../../utils/errorMessages';
import Spinner from '../UI/Spinner';
import {
    useForm,
    SubmitHandler,
    FormProvider,
    useFieldArray,
} from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { categoryApi, recipeApi, tagApi } from '../../utils/apiWrapper';
import Input from '../UI/Input';
import { Button, Card, Form, Stack } from 'react-bootstrap';
import Select from '../UI/Select';
import InputWithBtn from '../UI/InputWithBtn';
import RecipeSections from './RecipeSections';

interface CreateRecipeForm extends Omit<Api.CreateRecipe, 'sources'> {
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
        .min(1, 'Musí byť minimálne 1 znak')
        .max(160, 'Musí byť maximálne 160 znakov')
        .nullable(),
    serves: yup.number().integer().defined().min(0).max(100).nullable(),
    method: yup
        .string()
        .defined()
        .trim()
        .min(1, 'Musí byť minimálne 1 znak')
        .nullable(),
    sources: yup
        .array()
        .of(
            yup.object({
                value: yup
                    .string()
                    .trim()
                    .min(1, 'Musí byť minimálne 1 znak')
                    .max(1000, 'Musí byť maximálne 80 znakov')
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
                    .min(1, 'Musí byť minimálne 1 znak')
                    .max(80, 'Musí byť maximálne 80 znakov')
                    .required(),
                sortNumber: yup.number().integer().min(1).required(),
                method: yup
                    .string()
                    .defined()
                    .trim()
                    .min(1, 'Musí byť minimálne 1 znak')
                    .nullable(),
                ingredients: yup
                    .array()
                    .of(
                        yup.object({
                            name: yup
                                .string()
                                .trim()
                                .min(1, 'Musí byť minimálne 1 znak')
                                .max(80, 'Musí byť maximálne 80 znakov')
                                .required(),
                            sortNumber: yup
                                .number()
                                .integer()
                                .min(1)
                                .required(),
                            value: yup.number().defined().min(0).nullable(),
                            unitId: yup.number().integer().min(1).required(),
                        })
                    )
                    .required(),
            })
        )
        .required(),
    associatedRecipes: yup
        .array()
        .of(yup.number().integer().min(1).required())
        .required(),
    tags: yup.array().of(yup.number().integer().min(1).required()).required(),
    pictures: yup
        .array()
        .of(
            yup.object({
                id: yup.number().integer().min(1).required(),
                name: yup
                    .string()
                    .trim()
                    .min(1, 'Musí byť minimálne 1 znak')
                    .max(80, 'Musí byť maximálne 80 znakov')
                    .required(),
                sortNumber: yup.number().integer().min(1).required(),
            })
        )
        .required(),
});

const Recipe: React.FC = () => {
    const methods = useForm<CreateRecipeForm>({
        resolver: yupResolver(schema),
        defaultValues: {
            recipeSections: [
                {
                    name: '',
                    sortNumber: 1,
                    method: null,
                    ingredients: [],
                },
            ],
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

    const {
        fields: sourcesFields,
        append: sourcesAppend,
        remove: sourcesRemove,
    } = useFieldArray({
        name: 'sources',
        control: methods.control,
    });

    useEffect(() => {
        (async () => {
            try {
                const categories = await categoryApi.getCategories();
                setListOfCategories(categories);
                const tags = await tagApi.getTags();
                setListOfTags(tags);
            } catch (err) {
                console.error(err);
            }
        })();
    }, []);

    const submitHandler: SubmitHandler<CreateRecipeForm> = async (
        data: CreateRecipeForm
    ) => {
        console.log(data);
        try {
            await recipeApi.createRecipe({
                ...data,
                sources: data.sources.map((s) => s.value),
            });
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
                        <Input name='description' label='Popis' />
                        <Input
                            name='serves'
                            label='Počet porcií'
                            type='number'
                        />
                        {/* text area */}
                        <Input name='method' label='Postup' />
                        {/* text area */}

                        <RecipeSections />

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
                        <Input
                            name='associateRecipes'
                            label='Súvisiace recepty'
                            placeholder='Vyhľadajte súvisiaci recept'
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

                        <Stack direction='horizontal' gap={3}>
                            <h2>Zdroj receptu</h2>
                            <Button
                                type='button'
                                onClick={() => sourcesAppend({ value: '' })}
                            >
                                Pridať zdroj receptu
                            </Button>
                        </Stack>

                        {sourcesFields.length > 0 && (
                            <Card>
                                <Card.Body>
                                    {sourcesFields.map((field, index) => {
                                        return (
                                            <section key={field?.id}>
                                                <InputWithBtn
                                                    name={`sources.${index}.value`}
                                                    placeholder='Url'
                                                    btnLabel='Odstrániť'
                                                    onClick={() =>
                                                        sourcesRemove(index)
                                                    }
                                                />
                                            </section>
                                        );
                                    })}
                                </Card.Body>
                            </Card>
                        )}
                        <Input name='pictures' label='Obrázky' />
                        <Button variant='primary' type='submit'>
                            Uložiť recept
                        </Button>
                        {isSubmitting && <Spinner />}
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
