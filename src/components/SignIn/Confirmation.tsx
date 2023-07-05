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
    })
    .required();

const Confirmation: React.FC = () => {
    const methods = useForm<Api.ConfirmEmailRequest>({
        resolver: yupResolver(schema),
    });

    const {
        formState: { isSubmitting },
        reset
    } = methods;
    const navigate = useNavigate();
    const [error, setError] = useState<string>();
    const [successfulConfirmation, setSuccessfulConfirmation] = useState(false);
    const {username, key} = useParams();

    useEffect(()=> {
        if(username && key) {
            reset({username: username, key: key})
        }
    }, [reset, username, key])

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
                        <p className='text-primary'>
                            Pre dokončenie registrácie prosím zadajte
                            používateľské meno a registračný kľúč.
                        </p>
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
                message='Potvrdenie registrácie prebehlo úspešne.'
                type='info'
                onClose={() => {
                    navigate('/signIn');
                }}
            />
        </div>
    );
};

export default Confirmation;
