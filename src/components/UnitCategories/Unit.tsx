import React, { useEffect, useState } from 'react';
import { Formik } from 'formik';
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
    unitCategoryId: yup.number().required('Povinná položka'),
});

const Unit: React.FC = () => {
    const [error, setError] = useState<string>();
    const navigate = useNavigate();
    const params = useParams();
    const [initialValues, setInitialValues] = useState<UnitForm>({
        name: '',
        abbreviation: '',
        required: true,
        unitCategoryId: parseInt(params?.categoryId ?? '-1'),
    });

    useEffect(() => {
        console.log(params.unitId);
        if (params.unitId) {
            console.log(params.unitId);
            const unitId = parseInt(params.unitId);
            (async () => {
                const data = await unitApi.getUnit(unitId);
                console.log(data);
                setInitialValues({
                    name: data.name,
                    abbreviation: data.abbreviation,
                    required: data.required,
                    unitCategoryId: data.unitCategoryId,
                });
            })();
        }
    }, [params.unitId]);

    const cancelHandler = () => {
        navigate('/units');
    };

    const submitHandler = async (values: UnitForm) => {
        const request = schema.cast(values, {
            assert: false,
            stripUnknown: true,
        });
        try {
            if (params.unitId) {
                await unitApi.updateUnit(
                    parseInt(params.unitId),
                    request as Api.UpdateUnit
                );
                navigate('/units');
            } else {
                await unitApi.createUnit(request as Api.CreateUnit);
                navigate('/units');
            }
        } catch (err) {
            formatErrorMessage(err).then((message) => setError(message));
        }
    };

    return (
        <div className='row justify-content-center'>
            <div className='col-lg-6 pt-3'>
                <h1>Jednotka</h1>
                <Formik
                    enableReinitialize={true}
                    initialValues={initialValues}
                    validationSchema={schema}
                    onSubmit={async (values) => {
                        await submitHandler({
                            ...values,
                        });
                    }}
                >
                    {(formik) => (
                        <Form noValidate onSubmit={formik.handleSubmit}>
                            <Input name='name' label='Názov jednotky' />
                            <Input name='abbreviation' label='Skratka' />
                            <Checkbox name='required' label='Povinná hodnota' />
                            {/* <Input
                                name='unitCategoryId'
                                label='unitcategoryId'
                            /> */}
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
                            {formik.isSubmitting && <Spinner />}
                        </Form>
                    )}
                </Formik>
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
