import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Form } from 'react-bootstrap';
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Api } from '../../openapi';
import { AuthContext } from '../../store/auth-context';
import { authApi } from '../../utils/apiWrapper';
import { formatErrorMessage } from '../../utils/errorMessages';
import Input from '../../components/ui/Input';
import Checkbox from '../../components/ui/Checkbox';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCookieBite } from '@fortawesome/free-solid-svg-icons';

type SignInForm = Api.LoginRequest & {
    rememberMe: boolean;
};

const schema = yup
    .object({
        username: yup.string().trim().max(50, 'Musí byť maximálne 50 znakov').required('Povinná položka'),
        password: yup.string().trim().max(255, 'Musí byť maximálne 255 znakov').required('Povinná položka'),
        rememberMe: yup.boolean().default(false).required('Povinná položka')
    })
    .required();

const SignInPage: React.FC = () => {
    const navigate = useNavigate();

    const methods = useForm<SignInForm>({
        resolver: yupResolver(schema)
    });

    const {
        formState: { isSubmitting }
    } = methods;

    const authCtx = useContext(AuthContext);
    const [error, setError] = useState<string>();

    const submitHandler: SubmitHandler<SignInForm> = async (data: SignInForm) => {
        const sendData = {
            username: data.username,
            password: data.password
        };
        try {
            const response = await authApi.login(sendData);
            authCtx.login(response.token, response.refreshToken, data.rememberMe);
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
                        <Input
                            name='username'
                            label='Prihlasovacie meno'
                        />
                        <Input
                            name='password'
                            label='Heslo'
                            type='password'
                        />
                        <div className='d-flex flex-column flex-md-row justify-content-between'>
                            <Checkbox
                                name='rememberMe'
                                label='Zapamätať prihlásenie'
                                disabled={!authCtx.hasCookieConsent}
                            />
                            <Link
                                to={'/resetRequest'}
                                className='mcb-light-link'
                            >
                                <p>Zabudol si heslo?</p>
                            </Link>
                        </div>
                        <div className='d-flex flex-column flex-md-row justify-content-between mcb-gap'>
                            <Button
                                variant='primary'
                                type='submit'
                            >
                                Prihlásiť sa
                            </Button>
                            <Button
                                variant='secondary'
                                type='button'
                                onClick={() => navigate('/consent')}
                            >
                                <FontAwesomeIcon icon={faCookieBite} /> Cookies
                            </Button>
                        </div>
                        <Spinner show={isSubmitting} />
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

export default SignInPage;
