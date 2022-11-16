import React, { useId } from 'react';
import { Form } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';

type CheckboxProps = {
    label: string;
    name: string;
    disabled?: boolean;
};

const Checkbox: React.FC<CheckboxProps> = (props) => {
    const id = useId();
    const {
        register,
        formState: { errors },
    } = useFormContext();

    const errorMessage = errors[props.name]?.message;

    return (
        <Form.Group className='mb-3' controlId={`${id}_${props.name}`}>
            <Form.Check
                {...register(props.name)}
                label={props.label}
                feedback={errorMessage?.toString()}
                feedbackType='invalid'
                isInvalid={!!errorMessage}
            />
        </Form.Group>
    );
};

export default Checkbox;
