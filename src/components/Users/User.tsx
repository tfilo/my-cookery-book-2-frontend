import React, { useState } from 'react';
import { Formik } from 'formik';
import { Button, Form } from 'react-bootstrap';
import * as yup from 'yup';

import { userApi } from '../../utils/apiWrapper';
import { Api } from '../../openapi';
import Input from '../UI/Input';
import Modal from '../UI/Modal';
import { formatErrorMessage } from '../../utils/errorMessages';
import Spinner from '../UI/Spinner';
import { useNavigate } from 'react-router-dom';
import Select from '../UI/Select';

type UserForm = Api.CreateUser & {
    confirmPassword?: string;
};

const schema = yup.object({
    username: yup
        .string()
        .trim()
        .min(4, 'Musia byť minimálne 4 znaky')
        .max(50, 'Musí byť maximálne 50 znakov')
        .required('Povinná položka'),
    firstName: yup
        .string()
        .defined()
        .trim()
        .transform(val => val === '' ? null : val)
        .min(3, 'Musia byť minimálne 3 znaky')
        .max(50, 'Musí byť maximálne 50 znakov')
        .default(null)
        .nullable(),
    lastName: yup
        .string()
        .defined()
        .trim()
        .transform(val => val === '' ? null : val)
        .min(3, 'Musia byť minimálne 3 znaky')
        .max(50, 'Musí byť maximálne 50 znakov')
        .default(null)
        .nullable(),
    password: yup
        .string()
        .defined()
        .trim()
        .transform(val => val === '' ? null : val)
        .min(4, 'Musí byť minimálne 8 znakov')
        .max(255, 'Musí byť maximálne 255 znakov')
        .default(null)
        .nullable(),
    confirmPassword: yup
        .string()
        .defined()
        .trim()
        .transform(val => val === '' ? null : val)
        .default(null)
        .equals([yup.ref('password')], 'Zadané heslá sa nezhodujú')
        .nullable(),
    roles: yup
        .array()
        .of(yup.string().oneOf(['ADMIN', 'CREATOR']).required())
        .required(),
});

const User: React.FC = () => {
    const [error, setError] = useState<string>();
    const navigate = useNavigate();

    const cancelHandler = () => {
        navigate('/users');
    };

    const submitHandler = async (values: UserForm) => {
        const request = schema.cast(values, {
            assert: false,
            stripUnknown: true,
        }) as UserForm;
        delete request.confirmPassword;
        try {
            await userApi.createUser(request);
            navigate('/users');
        } catch (err) {
            formatErrorMessage(err).then((message) => setError(message));
        }
    };

    return (
        <div className='row justify-content-center'>
            <div className='col-lg-6 pt-3'>
                <h1>Používateľ</h1>
                <Formik
                    initialValues={{
                        username: '',
                        firstName: '',
                        lastName: '',
                        password: '',
                        confirmPassword: '',
                        roles: [],
                    }}
                    validationSchema={schema}
                    onSubmit={async (values) => {
                        await submitHandler({
                            ...values,
                        });
                    }}
                >
                    {(formik) => (
                        <Form noValidate onSubmit={formik.handleSubmit}>
                            <Input name='username' label='Používateľské meno' />
                            <Input name='firstName' label='Meno' />
                            <Input name='lastName' label='Priezvisko' />
                            <Input name='password' label='Heslo' />
                            <Input
                                name='confirmPassword'
                                label='Potvrdenie hesla'
                            />
                            <Select name='roles' label='Používateľské role' options={[
                                {value: 'ADMIN', label: 'Administrátor'},
                                {value: 'CREATOR', label: 'Tvorca obsahu'},
                            ]} multiple={true}/>

                            <Button variant='primary' type='submit'>
                                Vytvoriť používateľa
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

export default User;
