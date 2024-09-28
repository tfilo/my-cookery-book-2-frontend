import React, { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Api } from '../../openapi';
import { formatErrorMessage } from '../../utils/errorMessages';
import { authApi } from '../../utils/apiWrapper';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';

const schema = yup
    .object({
        email: yup.string().trim().max(320, 'Musí mať maximálne 320 znakov').required('Povinná položka')
    })
    .required();

const ResetPasswordRequestPage: React.FC = () => {
    const methods = useForm<Api.ResetPasswordLinkRequest>({
        resolver: yupResolver(schema)
    });

    const {
        formState: { isSubmitting }
    } = methods;
    const [error, setError] = useState<string>();
    const [successfulConfirmation, setSuccessfulConfirmation] = useState(false);

    const submitHandler = async (data: Api.ResetPasswordLinkRequest) => {
        try {
            await authApi.resetPasswordLink(data);
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
                        <p className='text-primary'>Prosím zadajte e-mail, na ktorý Vám bude odoslané informácie pre zmenu hesla.</p>
                        <Input
                            name='email'
                            label='E-mail'
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
                message='Na Váš e-mail bol odoslané informácie pre zmenu hesla.'
                type='info'
                onClose={() => {
                    setSuccessfulConfirmation(false);
                }}
            />
        </div>
    );
};

export default ResetPasswordRequestPage;
