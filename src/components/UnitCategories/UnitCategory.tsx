import React, { useEffect, useState } from 'react';
import { Button, Form, Stack } from 'react-bootstrap';
import * as yup from 'yup';

import { unitCategoryApi } from '../../utils/apiWrapper';
import { Api } from '../../openapi';
import Input from '../UI/Input';
import Modal from '../UI/Modal';
import { formatErrorMessage } from '../../utils/errorMessages';
import Spinner from '../UI/Spinner';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

type UnitCategoryForm = Api.CreateUnitCategory | Api.UpdateUnitCategory;

const schema = yup.object({
    name: yup
        .string()
        .trim()
        .min(1, 'Musí byť minimálne 1 znak')
        .max(80, 'Musí byť maximálne 80 znakov')
        .required('Povinná položka'),
});

const UnitCategory: React.FC = () => {
    const [error, setError] = useState<string>();
    const navigate = useNavigate();
    const params = useParams();

    const methods = useForm<UnitCategoryForm>({
        resolver: yupResolver(schema),
    });

    const {
        formState: { isSubmitting },
    } = methods;

    useEffect(() => {
        if (params.id) {
            console.log(params.id);
            const paramsNumber = params?.id;
            (async () => {
                const data = await unitCategoryApi.getUnitCategory(
                    parseInt(paramsNumber)
                );
                console.log(data);
                methods.reset(data);
            })();
        }
    }, [params.id, methods]);

    const cancelHandler = () => {
        navigate('/units');
    };

    const submitHandler: SubmitHandler<UnitCategoryForm> = async (
        data: UnitCategoryForm
    ) => {
        try {
            if (params.id) {
                await unitCategoryApi.updateUnitCategory(
                    parseInt(params.id),
                    data
                );
                navigate('/units');
            } else {
                await unitCategoryApi.createUnitCategory(data);
                navigate('/units');
            }
        } catch (err) {
            formatErrorMessage(err).then((message) => setError(message));
        }
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
                        <Input name='name' label='Názov kategórie jednotiek' />
                        <Stack direction='horizontal' gap={2}>
                            <Button variant='primary' type='submit'>
                                {params.id
                                    ? 'Zmeniť kategóriu'
                                    : 'Vytvoriť kategóriu'}
                            </Button>{' '}
                            <Button
                                variant='warning'
                                type='button'
                                onClick={cancelHandler}
                            >
                                Zrušiť
                            </Button>
                        </Stack>
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

export default UnitCategory;
