import React, { useEffect, useState } from 'react';
import { Formik } from 'formik';
import { Button, Form } from 'react-bootstrap';
import * as yup from 'yup';

import { categoryApi } from '../../utils/apiWrapper';
import { Api } from '../../openapi';
import Input from '../UI/Input';
import Modal from '../UI/Modal';
import { formatErrorMessage } from '../../utils/errorMessages';
import Spinner from '../UI/Spinner';
import { useNavigate, useParams } from 'react-router-dom';

type TagForm = Api.CreateCategory | Api.UpdateTag;

const schema = yup.object({
    name: yup
        .string()
        .trim()
        .min(1, 'Musí byť minimálne 1 znak')
        .max(50, 'Musí byť maximálne 50 znakov')
        .required('Povinná položka'),
});


const Category: React.FC = () => {
    const [error, setError] = useState<string>();
    const navigate = useNavigate();
    const params = useParams();
    const [initialValues, setInitialValues] = useState<TagForm>({
        name: '',
    });

    useEffect(() => {
        if (params.id) {
            console.log(params.id);
            const paramsNumber = params?.id;
            (async () => {
                const data = await categoryApi.getCategory(parseInt(paramsNumber));
                console.log(data);
                setInitialValues({
                    name: data.name,
                });
            })();
        }
    }, [params.id]);

    const cancelHandler = () => {
        navigate('/categories');
    };

    const submitHandler = async (values: TagForm) => {
        const request = schema.cast(values, {
            assert: false,
            stripUnknown: true,
        });
        try {
            if (params.id) {
                await categoryApi.updateCategory(parseInt(params.id), request as Api.UpdateTag);
                navigate('/categories');
            } else {
                await categoryApi.createCategory(request as Api.CreateTag);
                navigate('/categories');
            }
        } catch (err) {
            formatErrorMessage(err).then((message) => setError(message));
        }
    };

    return (
        <div className='row justify-content-center'>
            <div className='col-lg-6 pt-3'>
                <h1>Kategória</h1>
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
                            <Input name='name' label='Kategória' />
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

export default Category;