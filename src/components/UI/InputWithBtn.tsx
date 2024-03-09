import React, { useId } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';
import { get } from 'lodash';
import { ButtonVariant } from 'react-bootstrap/esm/types';

type InputWithBtnProps = {
    name: string;
    button: {
        variant?: ButtonVariant;
        children: string | JSX.Element;
        label: string;
        style?: React.CSSProperties;
    };
    onClick: () => void;
    placeholder?: string;
    autoComplete?: 'on' | 'off';
    disabled?: boolean;
    type?: 'text' | 'password' | 'number';
};

const InputWithBtn: React.FC<InputWithBtnProps> = (props) => {
    const {
        register,
        formState: { errors }
    } = useFormContext();
    const id = useId();

    const errorMessage = get(errors, props.name)?.message;

    return (
        <InputGroup className='mt-1 mb-1'>
            <Form.Control
                {...register(props.name)}
                id={`${id}_${props.name}`}
                type={props.type ?? 'text'}
                disabled={props.disabled}
                autoComplete={props.autoComplete}
                placeholder={props.placeholder}
                isInvalid={!!errorMessage}
            />
            <Button
                variant={props.button.variant ?? 'outline-secondary'}
                onClick={props.onClick}
                type='button'
                title={props.button.label}
                aria-label={props.button.label}
                style={props.button.style}
            >
                {props.button.children}
            </Button>
            <Form.Control.Feedback type='invalid'>{errorMessage?.toString()}</Form.Control.Feedback>
        </InputGroup>
    );
};

export default InputWithBtn;
