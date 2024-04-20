import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { Button, Form } from 'react-bootstrap';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Api } from '../../openapi';
import { AuthContext } from '../../store/auth-context';
import { formatErrorMessage } from '../../utils/errorMessages';
import { userApi } from '../../utils/apiWrapper';
import Modal from '../../components/UI/Modal';
import Spinner from '../../components/UI/Spinner';
import Input from '../../components/UI/Input';
import Checkbox from '../../components/UI/Checkbox';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCookieBite } from '@fortawesome/free-solid-svg-icons';

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

const ProfilePage: React.FC = () => {
    const [error, setError] = useState<string>();
    const [showModal, setShowModal] = useState<boolean>(false);
    const { isLoggedIn, hasCookieConsent, setHasCookieConsent } = useContext(AuthContext);
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const methods = useForm<UpdateProfileForm>({
        resolver: yupResolver(schema)
    });

    const {
        formState: { isSubmitting },
        reset
    } = methods;

    const onChangeConsentHandler = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setHasCookieConsent(e.target.checked);
        },
        [setHasCookieConsent]
    );

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

    useEffect(() => {
        if (isLoggedIn) {
            const controller = new AbortController();
            (async () => {
                try {
                    setIsLoading(true);
                    const user = await userApi.getProfile({ signal: controller.signal });
                    reset(user);
                    setUsername(user.username);
                } catch (err) {
                    formatErrorMessage(err).then((message) => setError(message));
                } finally {
                    setIsLoading(false);
                }
            })();
            return () => controller.abort();
        }
    }, [isLoggedIn, reset]);

    return (
        <div className='row justify-content-center'>
            <div className='col-lg-6 pt-3'>
                <h1>Profil používateľa</h1>
                <Form.Group className='mb-3'>
                    <Form.Label>Používateľské meno</Form.Label>
                    <Form.Control
                        type='text'
                        value={username ?? ''}
                        readOnly
                    />
                </Form.Group>
                <FormProvider {...methods}>
                    <Form
                        onSubmit={methods.handleSubmit(submitHandler)}
                        noValidate
                        className='pb-4'
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
                <h2>
                    <FontAwesomeIcon icon={faCookieBite} /> Nastavenia cookies
                </h2>
                <p>
                    Udelením súhlasu umožníte aplikácií ukladať informácie do lokálneho úložiska (localStorage) prehliadača. Aplikácia po
                    udelení súhlasu umožňuje zapamätať si práve prihláseného používateľa. Vďaka tomu sa nebudete musieť pri opätovnej
                    návšteve prihlasovať. Lokálne úložisko sa zároveň môže používať na uloženie "záložiek" na recepty. Uložené záložky sa
                    viažú na prehliadač a nie používateľské konto. Po odhlásení budú tieto údaje odstránené.
                </p>
                <p>Informácia o udelenom súhlase sa ukladá do cookies prehliadača a je platná na 1 rok od udelenia súhlasu.</p>
                <h3>Vaše preferencie cookies</h3>
                <Form.Group className='mb-3'>
                    <Form.Check
                        type='switch'
                        label='Udelenie súhlasu'
                        checked={hasCookieConsent}
                        onChange={onChangeConsentHandler}
                    />
                </Form.Group>
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
            <Spinner show={isSubmitting || isLoading} />
        </div>
    );
};

export default ProfilePage;
