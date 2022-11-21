import React, { useId } from 'react';
import { Form } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';

type SelectProps = {
    label: string;
    name: string;
    options: {
        value: string | number;
        label: string;
    }[];
    disabled?: boolean;
    multiple?: boolean;
};

const Select: React.FC<SelectProps> = (props) => {
    const id = useId();
    const {
        register,
        formState: { errors },
    } = useFormContext();

    const errorMessage = errors[props.name]?.message;

    return (
        <Form.Group className='mb-3' controlId={`${id}_${props.name}`}>
            <Form.Label>{props.label}</Form.Label>
            <Form.Select
                {...register(props.name)}
                disabled={props.disabled}
                multiple={props.multiple}
                isInvalid={!!errorMessage}
            >
                {props.options.map((option) => {
                    return <option key={option.value} value={option.value}>{option.label}</option>;
                })}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
                {errorMessage?.toString()}
            </Form.Control.Feedback>
        </Form.Group>
    );
};

export default Select;
