import React, { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import * as yup from 'yup';
import { Api } from '../../openapi';
import Input from '../UI/Input';
import Modal from '../UI/Modal';
import { formatErrorMessage } from '../../utils/errorMessages';
import Spinner from '../UI/Spinner';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate, useParams } from 'react-router-dom';
import { authApi } from '../../utils/apiWrapper';

type ResetPasswordData = Api.ResetPasswordRequest & {
    confirmPassword: string;
};

const schema = yup
    .object({
        username: yup
            .string()
            .trim()
            .min(4, 'Musia byť minimálne 4 znaky')
            .max(50, 'Musí byť maximálne 50 znakov')
            .required('Povinná položka'),
        key: yup
            .string()
            .trim()
            .max(36, 'Musí byť maximálne 36 znakov')
            .required('Povinná položka'),
        newPassword: yup
            .string()
            .trim()
            .min(8, 'Musí byť minimálne 8 znakov')
            .max(255, 'Musí byť maximálne 255 znakov')
            .matches(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/,
                'Musí obsahovať aspoň jedno malé písmeno, jedno veľké písmeno a jedno číslo'
            )
            .required('Povinná položka'),
        confirmPassword: yup
            .string()
            .trim()
            .equals([yup.ref('newPassword')], 'Zadané heslá sa nezhodujú')
            .required('Povinná položka'),
    })
    .required();

const ResetPassword: React.FC = () => {
    const methods = useForm<ResetPasswordData>({
        resolver: yupResolver(schema),
    });

    const {
        formState: { isSubmitting },
        reset,
    } = methods;
    const navigate = useNavigate();
    const [error, setError] = useState<string>();
    const [successfulConfirmation, setSuccessfulConfirmation] = useState(false);
    const { username, key } = useParams();

    useEffect(() => {
        if (username && key) {
            reset({ username: username, key: key });
        }
    }, [reset, username, key]);

    const submitHandler = async (data: ResetPasswordData) => {
        console.log(data);
        const { confirmPassword, ...formattedData } = data;
        console.log(formattedData);
        try {
            await authApi.resetPassword(formattedData);
            setSuccessfulConfirmation(true);
        } catch (err) {
            formatErrorMessage(err).then((message) => setError(message));
        }
    };
    return (
        <div className='row justify-content-center'>
            <div className='col-lg-6 pt-3'>
                <h1>Zmena hesla</h1>
                <FormProvider {...methods}>
                    <Form
                        onSubmit={methods.handleSubmit(submitHandler)}
                        noValidate
                    >
                        {/* <p className='text-primary'>
                            Pre dokončenie registrácie prosím zadajte
                            používateľské meno a registračný kľúč.
                        </p> */}
                        <Input
                            name='username'
                            label='Prihlasovacie meno'
                            type='text'
                        />
                        <Input
                            name='key'
                            label='Registračný kľúč'
                            type='text'
                        />
                        <Input name='newPassword' label='Heslo' />
                        <Input
                            name='confirmPassword'
                            label='Potvrdenie hesla'
                        />
                        <Button variant='primary' type='submit'>
                            Potvrdiť
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
                show={successfulConfirmation}
                message='Zmena hesla prebehla úspešne.'
                type='info'
                onClose={() => {
                    navigate('/signIn');
                }}
            />
        </div>
    );
};

export default ResetPassword;
