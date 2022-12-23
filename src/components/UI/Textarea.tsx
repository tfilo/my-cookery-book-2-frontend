import React, { useId } from 'react';
import { Form } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';

type TextareaProps = {
    label: string;
    name: string;
    disabled?: boolean;
    className?: string;
};

const Textarea: React.FC<TextareaProps> = (props) => {
    const id = useId();
    const {
        register,
        formState: { errors },
    } = useFormContext();

    const errorMessage = errors[props.name]?.message;

    return (
        <Form.Group className={`mb-3 ${props.className ?? ''}`} controlId={`${id}_${props.name}`}>
            <Form.Label>{props.label}</Form.Label>
            <Form.Control
                {...register(props.name)}
                as='textarea'
                name={props.name}
                disabled={props.disabled}
                isInvalid={!!errorMessage}
            />
            <Form.Control.Feedback type='invalid'>
                {errorMessage?.toString()}
            </Form.Control.Feedback>
        </Form.Group>
    );
};

export default Textarea;
