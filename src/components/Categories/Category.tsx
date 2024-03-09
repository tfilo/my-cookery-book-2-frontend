import React, { useState } from 'react';
import { Button, Form, Stack } from 'react-bootstrap';
import * as yup from 'yup';
import { categoryApi } from '../../utils/apiWrapper';
import { Api } from '../../openapi';
import Input from '../UI/Input';
import Modal from '../UI/Modal';
import { formatErrorMessage } from '../../utils/errorMessages';
import Spinner from '../UI/Spinner';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';

type CategoryForm = Api.CreateCategory | Api.UpdateCategory;

const schema = yup
    .object({
        name: yup.string().trim().min(1, 'Musí byť minimálne 1 znak').max(50, 'Musí byť maximálne 50 znakov').required('Povinná položka')
    })
    .required();

const Category: React.FC = () => {
    const [error, setError] = useState<string>();
    const navigate = useNavigate();
    const params = useParams();
    const queryClient = useQueryClient();

    const methods = useForm<CategoryForm>({
        resolver: yupResolver(schema),
        defaultValues: async () => {
            if (params.id) {
                try {
                    const data = await queryClient.fetchQuery({
                        queryKey: ['categories', parseInt(params?.id)] as const,
                        queryFn: ({ queryKey, signal }) => {
                            return categoryApi.getCategory(queryKey[1], { signal });
                        }
                    });
                    return data;
                } catch (e) {
                    formatErrorMessage(e).then((message) => setError(message));
                }
            }
            return {
                name: ''
            };
        }
    });

    const {
        formState: { isSubmitting, isLoading }
    } = methods;

    const cancelHandler = () => {
        navigate('/categories');
    };

    const { mutate: saveCategory, isPending: isSaving } = useMutation({
        mutationFn: ({ data, categoryId }: { data: CategoryForm; categoryId?: number }) => {
            if (categoryId) {
                return categoryApi.updateCategory(categoryId, data);
            } else {
                return categoryApi.createCategory(data);
            }
        },
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ['categories'] });
        },
        onSettled: async (data, error) => {
            if (error) {
                formatErrorMessage(error).then((message) => setError(message));
            } else if (data) {
                queryClient.setQueryData<Api.Category>(['categories', data.id], () => data);
                queryClient.setQueryData<Api.SimpleCategory[]>(['categories'], (categories) => {
                    const index = categories?.findIndex((c) => c.id === data.id) ?? -1;
                    if (index > -1) {
                        const result = [...(categories ?? [])];
                        result[index] = {
                            id: data.id,
                            name: data.name
                        };
                        return result.sort((a, b) =>
                            a.name.localeCompare(b.name, undefined, {
                                sensitivity: 'base'
                            })
                        );
                    } else {
                        const result = [
                            ...(categories ?? []),
                            {
                                id: data.id,
                                name: data.name
                            }
                        ];
                        return result.sort((a, b) =>
                            a.name.localeCompare(b.name, undefined, {
                                sensitivity: 'base'
                            })
                        );
                    }
                });
                navigate('/categories');
            }
        }
    });

    const submitHandler: SubmitHandler<CategoryForm> = (data: CategoryForm) => {
        saveCategory({
            data,
            categoryId: params.id ? parseInt(params.id) : undefined
        });
    };

    return (
        <div className='row justify-content-center'>
            <div className='col-lg-6 pt-3'>
                <h1>Kategória</h1>
                <FormProvider {...methods}>
                    <Form
                        noValidate
                        onSubmit={methods.handleSubmit(submitHandler)}
                    >
                        <Input
                            name='name'
                            label='Kategória'
                        />
                        <Stack
                            direction='horizontal'
                            gap={2}
                        >
                            <Button
                                variant='primary'
                                type='submit'
                            >
                                {params.id ? 'Zmeniť kategóriu' : 'Vytvoriť kategóriu'}
                            </Button>{' '}
                            <Button
                                variant='warning'
                                type='button'
                                onClick={cancelHandler}
                            >
                                Zrušiť
                            </Button>
                        </Stack>
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
            {(isSubmitting || isLoading || isSaving) && <Spinner />}
        </div>
    );
};

export default Category;
