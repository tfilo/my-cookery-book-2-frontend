import React, { useEffect, useState } from 'react';
import { Button, Form, Stack } from 'react-bootstrap';
import * as yup from 'yup';
import { userApi } from '../../utils/apiWrapper';
import { Api } from '../../openapi';
import Input from '../UI/Input';
import Modal from '../UI/Modal';
import { formatErrorMessage } from '../../utils/errorMessages';
import Spinner from '../UI/Spinner';
import { useNavigate, useParams } from 'react-router-dom';
import {
    useForm,
    SubmitHandler,
    FormProvider,
    Controller,
} from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Typeahead } from 'react-bootstrap-typeahead';
import { roleLabels } from '../../translate/roleLabel';

type Roles = { value: Api.User.RolesEnum; name: string }[];

export interface UserForm
    extends Omit<Api.CreateUser | Api.UpdateUser, 'roles'> {
    roles: Roles;
    confirmPassword?: string;
}

const roleOptions = [
    { value: Api.User.RolesEnum.ADMIN, name: 'Administrátor' },
    {
        value: Api.User.RolesEnum.CREATOR,
        name: 'Tvorca obsahu',
    },
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
            .transform((val) => (val === '' ? null : val))
            .equals([yup.ref('password')], 'Zadané heslá sa nezhodujú')
            .required('Povinná položka'),
        roles: yup
            .array()
            .of(
                yup.object({
                    value: yup.string().oneOf(['ADMIN', 'CREATOR']).required('Povinná položka'), //nefunguje
                    name: yup.string(),
                })
            )
            .required(),
    })
    .required();

const User: React.FC = () => {
    const [error, setError] = useState<string>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const navigate = useNavigate();
    const params = useParams();

    const methods = useForm<UserForm>({
        resolver: yupResolver(schema),
        defaultValues: {
            roles: [],
        },
    });

    const {
        formState: { isSubmitting },
        control,
    } = methods;

    useEffect(() => {
        if (params.id) {
            const paramsNumber = params?.id;
            (async () => {
                try {
                    setIsLoading(true);
                    const data = await userApi.getUser(parseInt(paramsNumber));
                    // console.log(data);

                    const receivedRoles = data.roles.map((role) => {
                        return {
                            value: role,
                            name: roleLabels[role],
                        };
                    });

                    // const receivedRoles = [];
                    // for (let r of data.roles) {
                    //     if (r === Api.User.RolesEnum.ADMIN) {
                    //         receivedRoles.push({
                    //             value: Api.User.RolesEnum.ADMIN,
                    //             name: 'Administrátor',
                    //         });
                    //     }
                    //     if (r === Api.User.RolesEnum.CREATOR) {
                    //         receivedRoles.push({
                    //             value: Api.User.RolesEnum.CREATOR,
                    //             name: 'Tvorca obsahu',
                    //         });
                    //     }
                    // }

                    const formattedData: UserForm = {
                        ...data,
                        password: '',
                        confirmPassword: '',
                        roles: receivedRoles,
                    };
                    methods.reset(formattedData);
                } catch (err) {
                    formatErrorMessage(err).then((message) =>
                        setError(message)
                    );
                } finally {
                    setIsLoading(false);
                }
            })();
        }
    }, [params.id, methods]);

    const cancelHandler = () => {
        navigate('/users');
    };

    const submitHandler: SubmitHandler<UserForm> = async (data: UserForm) => {
        const sendData = {
            ...data,
            roles: data.roles.map((role) => role.value),
        };
        try {
            if (params.id) {
                await userApi.updateUser(parseInt(params.id), sendData);
            } else {
                await userApi.createUser(sendData as Api.CreateUser);
            }
            navigate('/users');
        } catch (err) {
            formatErrorMessage(err).then((message) => setError(message));
        }
    };

    return (
        <div className='row justify-content-center'>
            <div className='col-lg-6 pt-3'>
                <h1>Používateľ</h1>
                <FormProvider {...methods}>
                    <Form
                        noValidate
                        onSubmit={methods.handleSubmit(submitHandler)}
                    >
                        <Input name='username' label='Používateľské meno' />
                        <Input name='firstName' label='Meno' />
                        <Input name='lastName' label='Priezvisko' />
                        <Input name='password' label='Heslo' />
                        <Input
                            name='confirmPassword'
                            label='Potvrdenie hesla'
                        />
                        <Form.Group className='mb-3'>
                            <Form.Label htmlFor='tagsMultiselection'>
                                Používateľské role
                            </Form.Label>
                            <Controller
                                control={control}
                                name='roles'
                                render={({ field: { onChange, value } }) => (
                                    <Typeahead
                                        id='roles'
                                        labelKey='name'
                                        onChange={onChange}
                                        options={roleOptions}
                                        placeholder='Vyberte ľubovoľný počet značiek'
                                        selected={value}
                                        multiple
                                    />
                                )}
                            />
                        </Form.Group>
                        <Stack direction='horizontal' gap={2}>
                            <Button variant='primary' type='submit'>
                                {params.id
                                    ? 'Zmeniť používateľa'
                                    : 'Vytvoriť používateľa'}
                            </Button>{' '}
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
            {(isSubmitting || isLoading) && <Spinner />}
        </div>
    );
};

export default User;
