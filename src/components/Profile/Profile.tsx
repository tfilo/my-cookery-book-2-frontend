import React, { useContext, useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { Api } from '../../openapi';
import { AuthContext } from '../../store/auth-context';
import { userApi } from '../../utils/apiWrapper';
import Modal from '../UI/Modal';
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Spinner from '../UI/Spinner';
import Input from '../UI/Input';
import { formatErrorMessage } from '../../utils/errorMessages';
import Checkbox from '../UI/Checkbox';

type UpdateProfileForm = Api.UpdateProfileRequest;

const schema = yup
    .object({
        password: yup.string().trim().max(255, 'Musí byť maximálne 255 znakov').required('Povinná položka'),
        newPassword: yup
            .string()
            .trim()
            .transform((val) => (val === '' ? null : val))
            .min(8, 'Musí byť minimálne 8 znakov')
            .max(255, 'Musí byť maximálne 255 znakov')
            .matches(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/,
                'Musí obsahovať aspoň jedno malé písmeno, jedno veľke písmeno a jedno číslo'
            )
            .default(null)
            .nullable(),
        firstName: yup
            .string()
            .trim()
            .transform((val) => (val === '' ? null : val))
            .min(3, 'Musí mať minimálne 3 znaky')
            .max(50, 'Musí mať maximálne 50 znakov')
            .default(null)
            .nullable(),
        lastName: yup
            .string()
            .trim()
            .transform((val) => (val === '' ? null : val))
            .min(3, 'Musí mať minimálne 3 znaky')
            .max(50, 'Musí mať maximálne 50 znakov')
            .default(null)
            .nullable(),
        email: yup.string().trim().max(320, 'Musí mať maximálne 320 znakov').required('Povinná položka'),
        notifications: yup.boolean().required('Povinná položka')
    })
    .required();

const Profile: React.FC = () => {
    const [error, setError] = useState<string>();
    const [showModal, setShowModal] = useState<boolean>(false);
    const authCtx = useContext(AuthContext);
    const isLoggedIn = authCtx.isLoggedIn;
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const methods = useForm<UpdateProfileForm>({
        resolver: yupResolver(schema)
    });

    const {
        formState: { isSubmitting },
        reset
    } = methods;

    useEffect(() => {
        if (isLoggedIn) {
            (async () => {
                try {
                    setIsLoading(true);
                    const user = await userApi.getProfile();
                    reset(user);
                    setUsername(user.username);
                } catch (err) {
                    formatErrorMessage(err).then((message) => setError(message));
                } finally {
                    setIsLoading(false);
                }
            })();
        }
    }, [isLoggedIn, reset]);

    const submitHandler: SubmitHandler<UpdateProfileForm> = async (data: UpdateProfileForm) => {
        try {
            await userApi.updateProfile(data);
            setShowModal(true);
        } catch (err) {
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
                            value={username ?? ''}
                            readOnly
                        />
                    </Form.Group>
                </Form>
                <FormProvider {...methods}>
                    <Form
                        onSubmit={methods.handleSubmit(submitHandler)}
                        noValidate
                    >
                        <Input
                            name='firstName'
                            label='Meno'
                            type='text'
                        />
                        <Input
                            name='lastName'
                            label='Priezvisko'
                            type='text'
                        />
                        <Input
                            name='email'
                            label='E-mail'
                            type='email'
                        />
                        <Input
                            name='password'
                            label='Heslo'
                            type='password'
                        />
                        <Input
                            name='newPassword'
                            label='Nové heslo'
                            type='password'
                        />
                        <Checkbox
                            name='notifications'
                            label='Posielať notifikácie e-mailom'
                        />
                        <Button
                            variant='primary'
                            type='submit'
                        >
                            Zmeniť
                        </Button>
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
                message='Zmena profilu bola úspešná.'
                type='info'
                onClose={() => {
                    setShowModal(false);
                }}
            />
            {(isSubmitting || isLoading) && <Spinner />}
        </div>
    );
};

export default Profile;
