import React, { useId } from 'react';
import { Form } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';
import { get } from 'lodash';

type InputProps = {
    label: string;
    name: string;
    className?: string;
    placeholder?: string;
    autoComplete?: 'on' | 'off';
    disabled?: boolean;
    type?: 'text' | 'password' | 'number';
    min?: number;
};

const Input: React.FC<InputProps> = (props) => {
    const {
        register,
        formState: { errors },
    } = useFormContext();
    const id = useId();

    const errorMessage = get(errors, props.name)?.message;

    return (
        <Form.Group
            className={`mb-3 ${props.className}`}
            controlId={`${id}_${props.name}`}
        >
            <Form.Label>{props.label}</Form.Label>
            <Form.Control
                {...register(props.name)}
                type={props.type ?? 'text'}
                disabled={props.disabled}
                autoComplete={props.autoComplete}
                placeholder={props.placeholder}
                isInvalid={!!errorMessage}
                min={props.min}
            />
            <Form.Control.Feedback type='invalid'>
                {errorMessage?.toString()}
            </Form.Control.Feedback>
        </Form.Group>
    );
};

export default Input;
