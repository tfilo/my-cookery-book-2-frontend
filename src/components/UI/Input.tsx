import React , { useId } from 'react';
import { useField } from 'formik';
import { Form } from 'react-bootstrap';

type InputProps = {
    label: string;
    name: string;
    placeholder?: string;
    autoComplete?: 'on' | 'off';
    disabled?: boolean;
    type?: 'text' | 'password' | 'number';
};

const Input: React.FC<InputProps> = (props) => {
    const id = useId();
    const [field, meta] = useField(props);

    return (
        <Form.Group className='mb-3' controlId={`${id}_${props.name}`}>
            <Form.Label>{props.label}</Form.Label>
            <Form.Control
                {...field}
                type={props.type ?? 'text'}
                disabled={props.disabled}
                autoComplete={props.autoComplete}
                placeholder={props.placeholder}
                isInvalid={meta.touched && !!meta.error}
            />
            <Form.Control.Feedback type="invalid">
                {meta.touched && meta.error ? meta.error : null}
            </Form.Control.Feedback>
        </Form.Group>
    );
};

export default Input;
