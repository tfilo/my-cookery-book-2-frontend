import React, { useId } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';
import { get } from 'lodash';

type InputWithBtnProps = {
    name: string;
    btnLabel: string;
    onClick: () => void;
    placeholder?: string;
    autoComplete?: 'on' | 'off';
    disabled?: boolean;
    type?: 'text' | 'password' | 'number';
};

const InputWithBtn: React.FC<InputWithBtnProps> = (props) => {
    const {
        register,
        formState: { errors },
    } = useFormContext();
    const id = useId();

    //const errorMessage = errors[props.name]?.message;
    const errorMessage = get(errors, props.name)?.message;

    return (
        <InputGroup className='mb-3'>
            <Form.Control
                {...register(props.name)}
                id={`${id}_${props.name}`}
                type={props.type ?? 'text'}
                disabled={props.disabled}
                autoComplete={props.autoComplete}
                placeholder={props.placeholder}
                isInvalid={!!errorMessage}
            />
            <Button variant='outline-secondary' onClick={props.onClick}>
                {props.btnLabel}
            </Button>
            <Form.Control.Feedback type='invalid'>
                {errorMessage?.toString()}
            </Form.Control.Feedback>
        </InputGroup>
    );
};

export default InputWithBtn;
