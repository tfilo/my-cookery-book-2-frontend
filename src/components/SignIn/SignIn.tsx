import React, { useContext, useState } from 'react';
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
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link } from 'react-router-dom';

type SignInForm = Api.LoginRequest & {
    login: boolean;
};

const schema = yup
    .object({
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
    })
    .required();

const SignIn: React.FC = () => {
    const methods = useForm<SignInForm>({
        resolver: yupResolver(schema),
    });

    const {
        formState: { isSubmitting },
    } = methods;

    const authCtx = useContext(AuthContext);
    const [error, setError] = useState<string>();

    const submitHandler: SubmitHandler<SignInForm> = async (
        data: SignInForm
    ) => {
        const sendData = {
            username: data.username,
            password: data.password,
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
                <FormProvider {...methods}>
                    <Form
                        onSubmit={methods.handleSubmit(submitHandler)}
                        noValidate
                    >
                        <Input name='username' label='Prihlasovacie meno' />
                        <Input name='password' label='Heslo' type='password' />
                        <div className='d-flex flex-column flex-md-row justify-content-between'>
                        <Checkbox name='login' label='Zapamätať prihlásenie'/>
                        <Link to={'/reset'} style={{textDecoration: 'none'}}><p  style={{"color": "#b4b4b4"}}>Zabudol si heslo?</p></Link>
                        </div><Button variant='primary' type='submit'>
                            Prihlásiť sa
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

export default SignIn;
