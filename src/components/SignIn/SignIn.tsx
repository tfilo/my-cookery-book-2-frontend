import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as yup from 'yup';
import { AuthContext } from '../../store/auth-context';
import { authApi } from '../../utils/apiWrapper';
import { Api } from '../../openapi';
import Input from '../UI/Input';
import Checkbox from '../UI/Checkbox';

type SignInForm = Api.LoginRequest & {
    login: boolean;
};

const schema = yup.object({
    username: yup
        .string()
        .trim()
        .max(50, 'Musi byt maximalne 50 znakov')
        .required('Povinná položka'),
    password: yup
        .string()
        .trim()
        .max(255, 'Musi byt maximalne 255 znakov')
        .required('Povinná položka'),
    login: yup.boolean().required('Povinná položka'),
});

const SignIn: React.FC = () => {
    const authCtx = useContext(AuthContext);
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
            const error = err as Response;
            alert('Nastala chyba pri prihlásení. ' + error.statusText);
        }
    };

    return (
        <div>
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
                    <Form>
                        <Input name='username' label='Prihlasovacie meno' />
                        <Input name='password' label='Heslo' />
                        <Checkbox name='login' label='Zapamätať prihlásenie' />

                        <button type='submit'>Prihlásiť sa</button>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default SignIn;
