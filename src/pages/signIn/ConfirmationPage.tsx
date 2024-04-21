import React, { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Api } from '../../openapi';
import { authApi } from '../../utils/apiWrapper';
import { formatErrorMessage } from '../../utils/errorMessages';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';

const schema = yup
    .object({
        username: yup
            .string()
            .trim()
            .min(4, 'Musia byť minimálne 4 znaky')
            .max(50, 'Musí byť maximálne 50 znakov')
            .required('Povinná položka'),
        key: yup.string().trim().max(36, 'Musí byť maximálne 36 znakov').required('Povinná položka')
    })
    .required();

const ConfirmationPage: React.FC = () => {
    const methods = useForm<Api.ConfirmEmailRequest>({
        resolver: yupResolver(schema)
    });

    const {
        formState: { isSubmitting },
        reset
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

    const submitHandler = async (data: Api.ConfirmEmailRequest) => {
        try {
            await authApi.confirmEmail(data);
            setSuccessfulConfirmation(true);
        } catch (err) {
            formatErrorMessage(err).then((message) => setError(message));
        }
    };
    return (
        <div className='row justify-content-center'>
            <div className='col-lg-6 pt-3'>
                <h1>Potvrdenie registrácie</h1>
                <FormProvider {...methods}>
                    <Form
                        onSubmit={methods.handleSubmit(submitHandler)}
                        noValidate
                    >
                        <p className='text-primary'>Pre dokončenie registrácie prosím zadajte prihlasovacie meno a registračný kľúč.</p>
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
                        <Button
                            variant='primary'
                            type='submit'
                        >
                            Potvrdiť
                        </Button>
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
            <Modal
                show={successfulConfirmation}
                message='Potvrdenie registrácie prebehlo úspešne.'
                type='info'
                onClose={() => {
                    navigate('/signIn');
                }}
            />
        </div>
    );
};

export default ConfirmationPage;
