import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { Button, Form, Stack } from 'react-bootstrap';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as yup from 'yup';
import { Api } from '../../openapi';
import { unitCategoryApi } from '../../utils/apiWrapper';
import { formatErrorMessage } from '../../utils/errorMessages';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';

type UnitCategoryForm = Api.CreateUnitCategory | Api.UpdateUnitCategory;

const schema = yup
    .object({
        name: yup.string().trim().min(1, 'Musí byť minimálne 1 znak').max(80, 'Musí byť maximálne 80 znakov').required('Povinná položka')
    })
    .required();

const UnitCategoryPage: React.FC = () => {
    const [error, setError] = useState<string>();
    const navigate = useNavigate();
    const params = useParams();
    const queryClient = useQueryClient();

    const methods = useForm<UnitCategoryForm>({
        resolver: yupResolver(schema),
        defaultValues: async () => {
            if (params.id) {
                try {
                    const data = await queryClient.fetchQuery({
                        queryKey: ['unitcategories', parseInt(params?.id)] as const,
                        queryFn: ({ queryKey, signal }) => {
                            return unitCategoryApi.getUnitCategory(queryKey[1], { signal });
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
        navigate('/units');
    };

    const { mutate: saveUnitCategory, isPending: isSaving } = useMutation({
        mutationFn: ({ data, unitCategoryId }: { data: UnitCategoryForm; unitCategoryId?: number }) => {
            if (unitCategoryId) {
                return unitCategoryApi.updateUnitCategory(unitCategoryId, data);
            } else {
                return unitCategoryApi.createUnitCategory(data);
            }
        },
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ['unitcategories'] });
        },
        onSettled: async (data, error) => {
            if (error) {
                formatErrorMessage(error).then((message) => setError(message));
            } else if (data) {
                queryClient.setQueryData<Api.UnitCategory>(['unitcategories', data.id], () => data);
                queryClient.setQueryData<Api.SimpleUnitCategory[]>(['unitcategories'], (unitCategories) => {
                    const index = unitCategories?.findIndex((c) => c.id === data.id) ?? -1;
                    if (index > -1) {
                        const result = [...(unitCategories ?? [])];
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
                            ...(unitCategories ?? []),
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
                navigate('/units');
            }
        }
    });

    const submitHandler: SubmitHandler<UnitCategoryForm> = (data: UnitCategoryForm) => {
        saveUnitCategory({
            data,
            unitCategoryId: params.id ? parseInt(params.id) : undefined
        });
    };

    return (
        <div className='row justify-content-center'>
            <div className='col-lg-6 pt-3'>
                <h1>Kategória jednotiek</h1>
                <FormProvider {...methods}>
                    <Form
                        noValidate
                        onSubmit={methods.handleSubmit(submitHandler)}
                    >
                        <Input
                            name='name'
                            label='Názov kategórie jednotiek'
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
            <Spinner show={isSubmitting || isLoading || isSaving} />
        </div>
    );
};

export default UnitCategoryPage;
