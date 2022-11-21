import React, { useContext, useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { Api } from '../../openapi';
import { AuthContext } from '../../store/auth-context';
import { authApi } from '../../utils/apiWrapper';
import Modal from '../UI/Modal';
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Spinner from '../UI/Spinner';
import Input from '../UI/Input';
import { formatErrorMessage } from '../../utils/errorMessages';

type UpdatePasswordForm = Api.UpdatePasswordRequest;

const schema = yup.object({
    password: yup
        .string()
        .trim()
        .max(255, 'Musí byť maximálne 255 znakov')
        .required(),
    newPassword: yup
        .string()
        .trim()
        .min(8, 'Musí byť minimálne 8 znakov')
        .max(255, 'Musí byť maximálne 255 znakov')
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/,
            'Musí obsahovať aspoň jedno malé písmeno, jedno veľke písmeno a jedno číslo'
        )
        .required(),
});

const Profile: React.FC = () => {
    const [error, setError] = useState<string>();
    const [showModal, setShowModal] = useState<boolean>(false);
    const authCtx = useContext(AuthContext);
    const isLoggedIn = authCtx.isLoggedIn;
    const [userInfo, setUserInfo] = useState<Api.AuthenticatedUser>();

    const methods = useForm<UpdatePasswordForm>({
        resolver: yupResolver(schema),
    });

    const {
        formState: { isSubmitting },
    } = methods;

    useEffect(() => {
        if (isLoggedIn) {
            (async () => {
                try {
                    const user = await authApi.user();
                    setUserInfo(user);
                } catch (err) {
                    console.error(err);
                }
            })();
        }
    }, [isLoggedIn]);

    const submitHandler: SubmitHandler<UpdatePasswordForm> = async (
        data: UpdatePasswordForm
    ) => {
        try {
            await authApi.updatePassword(data);
            setShowModal(true);
        } catch (err) {
            console.log(err);
            if (err instanceof Response && err.statusText === 'Unauthorized') {
                setError('Zadané heslo nebolo platné');
            } else {
                formatErrorMessage(err).then((message) => setError(message));
            }
        }
    };

    return (
        <div className='row justify-content-center'>
            <div className='col-lg-6 pt-3'>
                <h1>Profil používateľa</h1>
                <Form>
                    <Form.Group className='mb-3'>
                        <Form.Label>Používateľské meno</Form.Label>
                        <Form.Control
                            type='text'
                            value={userInfo?.username ?? ''}
                            readOnly
                        />
                    </Form.Group>
                    <Form.Group className='mb-3'>
                        <Form.Label>Meno</Form.Label>
                        <Form.Control
                            type='text'
                            value={userInfo?.firstName ?? ''}
                            readOnly
                        />
                    </Form.Group>
                    <Form.Group className='mb-3'>
                        <Form.Label>Priezvisko</Form.Label>
                        <Form.Control
                            type='text'
                            value={userInfo?.lastName ?? ''}
                            readOnly
                        />
                    </Form.Group>
                </Form>

                <FormProvider {...methods}>
                    <Form
                        onSubmit={methods.handleSubmit(submitHandler)}
                        noValidate
                    >
                        <Input name='password' label='Heslo' type='password'/>
                        <Input name='newPassword' label='Nové heslo' type='password'/>
                        <Button variant='primary' type='submit'>
                            Zmeniť heslo
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
            <Modal
                show={showModal}
                message='Zmena hesla bola úspešná.'
                type='info'
                onClose={() => {
                    setShowModal(false);
                }}
            />
        </div>
    );
};

export default Profile;
