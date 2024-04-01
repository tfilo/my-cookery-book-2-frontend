import React, { useState } from 'react';
import { Button, Form, Stack } from 'react-bootstrap';
import * as yup from 'yup';

import { unitApi } from '../../utils/apiWrapper';
import { Api } from '../../openapi';
import Input from '../UI/Input';
import Modal from '../UI/Modal';
import { formatErrorMessage } from '../../utils/errorMessages';
import Spinner from '../UI/Spinner';
import { useNavigate, useParams } from 'react-router-dom';
import Checkbox from '../UI/Checkbox';
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';

type UnitForm = Api.CreateUnit | Api.UpdateUnit;

const schema = yup
    .object({
        name: yup.string().trim().max(80, 'Musí byť maximálne 80 znakov').required('Povinná položka'),
        abbreviation: yup.string().trim().max(20, 'Musí byť maximálne 20 znakov').required('Povinná položka'),
        required: yup.boolean().required('Povinná položka')
    })
    .required();

const Unit: React.FC = () => {
    const [error, setError] = useState<string>();
    const navigate = useNavigate();
    const params = useParams();
    if (!params.categoryId) {
        throw new Error('categoryId is required parameter');
    }
    const categoryId = parseInt(params.categoryId);
    const queryClient = useQueryClient();

    console.log(params);

    const methods = useForm<UnitForm>({
        resolver: yupResolver(schema),
        defaultValues: async () => {
            if (params.unitId) {
                try {
                    const data = await queryClient.fetchQuery({
                        queryKey: ['unitcategories', categoryId, 'units', parseInt(params.unitId)] as const,
                        queryFn: ({ queryKey, signal }) => {
                            return unitApi.getUnit(queryKey[3], { signal });
                        }
                    });
                    console.log(data);
                    return data;
                } catch (e) {
                    formatErrorMessage(e).then((message) => setError(message));
                }
            }
            return {
                name: '',
                abbreviation: '',
                required: false,
                unitCategoryId: categoryId
            };
        }
    });

    const {
        formState: { isSubmitting, isLoading }
    } = methods;

    const cancelHandler = () => {
        navigate('/units');
    };

    const { mutate: saveUnit, isPending: isSaving } = useMutation({
        mutationFn: ({ data, unitId }: { data: UnitForm & { unitCategoryId: number }; unitId?: number }) => {
            if (unitId) {
                return unitApi.updateUnit(unitId, data);
            } else {
                return unitApi.createUnit(data);
            }
        },
        onMutate: async ({ data }) => {
            await queryClient.cancelQueries({ queryKey: ['unitcategories', data.unitCategoryId, 'units'] });
        },
        onSettled: async (data, error) => {
            if (error) {
                formatErrorMessage(error).then((message) => setError(message));
            } else if (data) {
                queryClient.setQueryData<Api.Unit>(['unitcategories', data.unitCategoryId, 'units', data.id], () => data);
                queryClient.setQueryData<Api.SimpleUnit[]>(['unitcategories', data.unitCategoryId, 'units'], (units) => {
                    const index = units?.findIndex((u) => u.id === data.id) ?? -1;
                    if (index > -1) {
                        const result = [...(units ?? [])];
                        result[index] = {
                            id: data.id,
                            name: data.name,
                            abbreviation: data.abbreviation,
                            required: data.required
                        };
                        return result.sort((a, b) =>
                            a.name.localeCompare(b.name, undefined, {
                                sensitivity: 'base'
                            })
                        );
                    } else {
                        const result = [
                            ...(units ?? []),
                            {
                                id: data.id,
                                name: data.name,
                                abbreviation: data.abbreviation,
                                required: data.required
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

    const submitHandler: SubmitHandler<UnitForm> = (data: UnitForm) => {
        saveUnit({
            data: {
                ...data,
                unitCategoryId: categoryId
            },
            unitId: params.unitId ? parseInt(params.unitId) : undefined
        });
    };

    return (
        <div className='row justify-content-center'>
            <div className='col-lg-6 pt-3'>
                <h1>Jednotka</h1>
                <FormProvider {...methods}>
                    <Form
                        noValidate
                        onSubmit={methods.handleSubmit(submitHandler)}
                    >
                        <Input
                            name='name'
                            label='Názov jednotky'
                        />
                        <Input
                            name='abbreviation'
                            label='Skratka'
                        />
                        <Checkbox
                            name='required'
                            label='Povinná hodnota'
                        />
                        <Stack
                            direction='horizontal'
                            gap={2}
                        >
                            <Button
                                variant='primary'
                                type='submit'
                            >
                                {params.unitId ? 'Zmeniť jednotku' : 'Vytvoriť jednotku'}
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

export default Unit;
