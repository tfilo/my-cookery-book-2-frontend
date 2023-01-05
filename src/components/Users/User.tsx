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
// import Select from '../UI/Select';
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Typeahead } from 'react-bootstrap-typeahead';

export interface UserForm
    extends Omit<Api.CreateUser | Api.UpdateUser, 'roles'> {
    roles: {
        value: string;
        name: string;
    }[];
    confirmPassword?: string;
}

// type UserForm = (Api.CreateUser | Api.UpdateUser) & {
//     confirmPassword?: string;
// };

type Roles = { value: string; name: string }[];

const schema = yup.object({
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
        .required(),
    confirmPassword: yup
        .string()
        .trim()
        .transform((val) => (val === '' ? null : val))
        .equals([yup.ref('password')], 'Zadané heslá sa nezhodujú')
        .required(),
    roles: yup
        .array()
        .of(
            yup.object({
                value: yup.string().oneOf(['ADMIN', 'CREATOR']).required(),
                name: yup.string(),
            })
        )
        .required(),
});

const User: React.FC = () => {
    const [error, setError] = useState<string>();
    const [multiSelections, setMultiSelections] = useState<Roles>();
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
    } = methods;

    const roleOptions = [
        { value: 'ADMIN', name: 'Administrátor' },
        {
            value: 'CREATOR',
            name: 'Tvorca obsahu',
        },
    ];

    useEffect(() => {
        if (params.id) {
            // console.log(params.id);
            const paramsNumber = params?.id;
            (async () => {
                const data = await userApi.getUser(parseInt(paramsNumber));
                // console.log(data);

                const receivedRoles = [];
                for (let r of data.roles) {
                    if (r === 'ADMIN') {
                        receivedRoles.push({
                            value: 'ADMIN',
                            name: 'Administrátor',
                        });
                    }
                    if (r === 'CREATOR') {
                        receivedRoles.push({
                            value: 'CREATOR',
                            name: 'Tvorca obsahu',
                        });
                    }
                }
                setMultiSelections(receivedRoles);
                const formattedData: UserForm = {
                    ...data,
                    password: '',
                    confirmPassword: '',
                    roles: receivedRoles,
                };
                methods.reset(formattedData);
            })();
        }
    }, [params.id, methods]);

    const cancelHandler = () => {
        navigate('/users');
    };

    const submitHandler: SubmitHandler<UserForm> = async (data: UserForm) => {
        // console.log(data);
        // console.log(multiSelections);
        const selectedRoles: Api.User.RolesEnum[] = [];
        const roles = multiSelections?.map((role) => role.value);
        if (roles && roles.length > 0) {
            for (let role of roles) {
                if (role === 'ADMIN') {
                    selectedRoles.push(Api.User.RolesEnum.ADMIN);
                }
                if (role === 'CREATOR') {
                    selectedRoles.push(Api.User.RolesEnum.CREATOR);
                }
            }
        }
        // const selectedRoles: Api.User.RolesEnum[] = multiSelections?.map((role) => role.value);
        const sendData = {
            ...data,
            roles: selectedRoles,
        };
        console.log(sendData);
        try {
            if (params.id) {
                await userApi.updateUser(parseInt(params.id), sendData);
                navigate('/users');
            } else {
                await userApi.createUser(sendData as Api.CreateUser);
                navigate('/users');
            }
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
                            <Typeahead
                                {...methods.register('roles')}
                                id='roles'
                                labelKey='name'
                                onChange={(selected) => {
                                    setMultiSelections(selected as Roles);
                                }}
                                options={roleOptions}
                                placeholder='Vyberte ľubovoľný počet značiek'
                                selected={multiSelections}
                                multiple
                            />
                        </Form.Group>

                        {/* <Select
                            name='roles'
                            label='Používateľské role'
                            options={[
                                { value: 'ADMIN', label: 'Administrátor' },
                                {
                                    value: 'CREATOR',
                                    label: 'Tvorca obsahu',
                                },
                            ]}
                            multiple={true}
                        /> */}
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
        </div>
    );
};

export default User;
