import React, { useEffect, useState, useId } from 'react';
import { Button, Form, Stack } from 'react-bootstrap';
import * as yup from 'yup';
import { userApi } from '../../utils/apiWrapper';
import { Api } from '../../openapi';
import Input from '../UI/Input';
import Modal from '../UI/Modal';
import { formatErrorMessage } from '../../utils/errorMessages';
import Spinner from '../UI/Spinner';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, SubmitHandler, FormProvider, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Typeahead } from 'react-bootstrap-typeahead';
import { roleLabels } from '../../translate/roleLabel';
import Checkbox from '../UI/Checkbox';
import { get } from 'lodash';

type Roles = { value: Api.User.RoleEnum; name: string }[];

export interface UserForm extends Omit<Api.CreateUser | Api.UpdateUser, 'roles'> {
    roles: Roles;
    confirmPassword?: string;
}

const roleOptions = [
    { value: Api.User.RoleEnum.ADMIN, name: 'Administrátor' },
    {
        value: Api.User.RoleEnum.CREATOR,
        name: 'Tvorca obsahu'
    }
];

const schema = yup
    .object({
        username: yup
            .string()
            .trim()
            .min(4, 'Musia byť minimálne 4 znaky')
            .max(50, 'Musí byť maximálne 50 znakov')
            .matches(/^[a-z0-9]+/, 'Musí obsahovať iba malé písmená a čísla')
            .required('Povinná položka'),
        firstName: yup
            .string()
            .defined()
            .trim()
            .transform((val) => (val === '' ? null : val))
            .min(3, 'Musia byť minimálne 3 znaky')
            .max(50, 'Musí byť maximálne 50 znakov')
            .default(null)
            .nullable(),
        lastName: yup
            .string()
            .defined()
            .trim()
            .transform((val) => (val === '' ? null : val))
            .min(3, 'Musia byť minimálne 3 znaky')
            .max(50, 'Musí byť maximálne 50 znakov')
            .default(null)
            .nullable(),
        email: yup.string().trim().max(320, 'Musí mať maximálne 320 znakov').required('Povinná položka'),
        password: yup
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
            .equals([yup.ref('password')], 'Zadané heslá sa nezhodujú')
            .required('Povinná položka'),
        roles: yup
            .array()
            .of(
                yup.object({
                    value: yup.string().oneOf(['ADMIN', 'CREATOR']),
                    name: yup.string()
                })
            )
            .min(1, 'Musí byť minimálne jedna rola')
            .required(),
        notifications: yup.boolean().required('Povinná položka')
    })
    .required();

const User: React.FC = () => {
    const uniqueId = useId();
    const [error, setError] = useState<string>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isUserConfirmed, setIsUserConfirmed] = useState<boolean>(false);
    const [emailWasSend, setEmailWasSend] = useState<boolean>(false);
    const navigate = useNavigate();
    const params = useParams();

    const methods = useForm<UserForm>({
        resolver: yupResolver(schema),
        defaultValues: {
            roles: []
        }
    });

    const {
        formState: { isSubmitting, errors },
        control
    } = methods;

    useEffect(() => {
        if (params.id) {
            const controller = new AbortController();
            const paramsNumber = params?.id;
            (async () => {
                try {
                    setIsLoading(true);
                    const data = await userApi.getUser(parseInt(paramsNumber), { signal: controller.signal });
                    setIsUserConfirmed(data.confirmed);
                    const receivedRoles = data.roles.map((role) => {
                        return {
                            value: role,
                            name: roleLabels[role]
                        };
                    });

                    const formattedData: UserForm = {
                        ...data,
                        password: '',
                        confirmPassword: '',
                        roles: receivedRoles
                    };
                    methods.reset(formattedData);
                } catch (err) {
                    formatErrorMessage(err).then((message) => setError(message));
                } finally {
                    setIsLoading(false);
                }
            })();
            return () => controller.abort();
        }
    }, [params.id, methods]);

    const cancelHandler = () => {
        navigate('/users');
    };

    const confirmHandler = async () => {
        if (params.id) {
            await userApi.resendConfirmation(+params.id);
            setEmailWasSend(true);
        }
    };

    const submitHandler: SubmitHandler<UserForm> = async (data: UserForm) => {
        const sendData = {
            ...data,
            roles: data.roles.map((role) => role.value)
        };
        try {
            if (params.id) {
                await userApi.updateUser(parseInt(params.id), sendData as Api.UpdateUser);
            } else {
                await userApi.createUser(sendData as Api.CreateUser);
            }
            navigate('/users');
        } catch (err) {
            formatErrorMessage(err).then((message) => setError(message));
        }
    };

    const rolesErrorMessage = get(errors, 'roles')?.message;

    return (
        <div className='row justify-content-center'>
            <div className='col-lg-6 pt-3'>
                <h1>Používateľ</h1>
                <FormProvider {...methods}>
                    <Form
                        noValidate
                        onSubmit={methods.handleSubmit(submitHandler)}
                    >
                        <Input
                            name='username'
                            label='Používateľské meno'
                        />
                        <Input
                            name='firstName'
                            label='Meno'
                        />
                        <Input
                            name='lastName'
                            label='Priezvisko'
                        />
                        <Input
                            name='email'
                            label='E-mail'
                        />
                        <Input
                            name='password'
                            label='Heslo'
                        />
                        <Input
                            name='confirmPassword'
                            label='Potvrdenie hesla'
                        />
                        <Form.Group className='mb-3'>
                            <Form.Label htmlFor='tagsMultiselection'>Používateľské role</Form.Label>
                            <Controller
                                control={control}
                                name='roles'
                                render={({ field: { onChange, value } }) => (
                                    <Typeahead
                                        id={uniqueId + 'roles'}
                                        labelKey='name'
                                        onChange={onChange}
                                        options={roleOptions}
                                        placeholder='Vyberte ľubovoľný počet rolí'
                                        selected={value}
                                        isInvalid={!!rolesErrorMessage}
                                        multiple
                                    />
                                )}
                            />
                            <Form.Control.Feedback type='invalid'>{rolesErrorMessage?.toString()}</Form.Control.Feedback>
                        </Form.Group>
                        <Checkbox
                            name='notifications'
                            label='Posielať notifikácie e-mailom'
                        />
                        <Stack
                            direction='horizontal'
                            gap={2}
                        >
                            <Button
                                variant='primary'
                                type='submit'
                            >
                                {params.id ? 'Zmeniť používateľa' : 'Vytvoriť používateľa'}
                            </Button>{' '}
                            {!isUserConfirmed && (
                                <Button
                                    variant='secondary'
                                    type='button'
                                    onClick={confirmHandler}
                                >
                                    Poslať potvrdzujúci e-mail
                                </Button>
                            )}
                            <Button
                                variant='warning'
                                type='button'
                                onClick={cancelHandler}
                            >
                                Zrušiť
                            </Button>
                        </Stack>
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
                show={emailWasSend}
                message='Potvrdzujúci e-mail bol zaslaný používateľovi.'
                type='info'
                onClose={() => {
                    setEmailWasSend(false);
                }}
            />
            <Spinner show={isSubmitting || isLoading} />
        </div>
    );
};

export default User;
