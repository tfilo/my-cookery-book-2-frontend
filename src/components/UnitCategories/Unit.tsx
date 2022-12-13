import React, { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
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

type UnitForm = Api.CreateUnit | Api.UpdateUnit;

const schema = yup.object({
    name: yup
        .string()
        .trim()
        .max(80, 'Musí byť maximálne 80 znakov')
        .required('Povinná položka'),
    abbreviation: yup
        .string()
        .trim()
        .max(20, 'Musí byť maximálne 20 znakov')
        .required('Povinná položka'),
    required: yup.boolean().required('Povinná položka'),
});

const Unit: React.FC = () => {
    const [error, setError] = useState<string>();
    const navigate = useNavigate();
    const params = useParams();
    const categoryId = params?.categoryId ? parseInt(params?.categoryId) : null;

    const methods = useForm<UnitForm>({
        resolver: yupResolver(schema),
    });

    const {
        formState: { isSubmitting },
    } = methods;

    useEffect(() => {
        if (params.unitId) {
            const unitId = parseInt(params.unitId);
            (async () => {
                const data = await unitApi.getUnit(unitId);
                console.log(data);
                methods.reset(data);
            })();
        }
    }, [params.unitId, methods]);

    const cancelHandler = () => {
        navigate('/units');
    };

    const submitHandler: SubmitHandler<UnitForm> = async (data: UnitForm) => {
        try {
            if (categoryId) {
                if (params.unitId) {
                    await unitApi.updateUnit(parseInt(params.unitId), {
                        ...data,
                        unitCategoryId: categoryId,
                    });
                    navigate('/units');
                } else {
                    await unitApi.createUnit({
                        ...data,
                        unitCategoryId: categoryId,
                    });
                    navigate('/units');
                }
            } else {
                console.error('Missing unitCategoryId in route parameters!');
            }
        } catch (err) {
            formatErrorMessage(err).then((message) => setError(message));
        }
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
                        <Input name='name' label='Názov jednotky' />
                        <Input name='abbreviation' label='Skratka' />
                        <Checkbox name='required' label='Povinná hodnota' />
                        <Button variant='primary' type='submit'>
                            {params.unitId
                                ? 'Zmeniť jednotku'
                                : 'Vytvoriť jednotku'}
                        </Button>{' '}
                        <Button
                            variant='warning'
                            type='button'
                            onClick={cancelHandler}
                        >
                            Zrušiť
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

export default Unit;
