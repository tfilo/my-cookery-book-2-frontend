import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik } from 'formik';
import { Button, Form } from 'react-bootstrap';
import * as yup from 'yup';

import { AuthContext } from '../../store/auth-context';
import { authApi } from '../../utils/apiWrapper';
import { Api } from '../../openapi';
import Input from '../UI/Input';
import Checkbox from '../UI/Checkbox';
import Modal from '../UI/Modal';
import { formatErrorMessage } from '../../utils/errorMessages';
import Spinner from '../UI/Spinner';

type SignInForm = Api.LoginRequest & {
    login: boolean;
};

const schema = yup.object({
    username: yup
        .string()
        .trim()
        .max(50, 'Musí byť maximálne 50 znakov')
        .required('Povinná položka'),
    password: yup
        .string()
        .trim()
        .max(255, 'Musí byť maximálne 255 znakov')
        .required('Povinná položka'),
    login: yup.boolean().required('Povinná položka'),
});

const SignIn: React.FC = () => {
    const authCtx = useContext(AuthContext);
    const [error, setError] = useState<string>();
    const navigate = useNavigate();

    useEffect(() => {
        authCtx.isLoggedIn && navigate('/home');
    }, [authCtx.isLoggedIn, navigate]);

    const submitHandler = async (values: SignInForm) => {
        const sendData = {
            username: values.username,
            password: values.password,
        };
        try {
            const response = await authApi.login(sendData);
            authCtx.login(response.token, response.refreshToken);
        } catch (err) {
            formatErrorMessage(err).then((message) => setError(message));
        }
    };

    return (
        <div className='row justify-content-center'>
            <div className='col-lg-6 pt-3'>
                <h1>Prihlasovacia obrazovka</h1>
                <Formik
                    initialValues={{
                        username: '',
                        password: '',
                        login: false,
                    }}
                    validationSchema={schema}
                    onSubmit={async (values, actions) => {
                        await submitHandler(values);
                    }}
                >
                    {(formik) => (
                        <Form noValidate onSubmit={formik.handleSubmit}>
                            <Input name='username' label='Prihlasovacie meno' />
                            <Input name='password' label='Heslo' />
                            <Checkbox
                                name='login'
                                label='Zapamätať prihlásenie'
                            />

                            <Button variant='primary' type='submit'>
                                Prihlásiť sa
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

export default SignIn;
