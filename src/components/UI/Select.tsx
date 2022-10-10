import { useField } from 'formik';
import React, { useId } from 'react';
import { Form } from 'react-bootstrap';

type SelectProps = {
    label: string;
    name: string;
    options: {
        value: string;
        label: string;
    }[];
    disabled?: boolean;
    multiple?: boolean;
};

const Select: React.FC<SelectProps> = (props) => {
    const id = useId();
    const [field, meta] = useField(props);

    return (
        <Form.Group className='mb-3' controlId={`${id}_${props.name}`}>
            <Form.Label>{props.label}</Form.Label>
            <Form.Select
                {...field}
                disabled={props.disabled}
                multiple={props.multiple}
            >
                {props.options.map((option) => {
                    return <option key={option.value} value={option.value}>{option.label}</option>;
                })}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
                {meta.touched && meta.error ? meta.error : null}
            </Form.Control.Feedback>
        </Form.Group>
    );
};

export default Select;
