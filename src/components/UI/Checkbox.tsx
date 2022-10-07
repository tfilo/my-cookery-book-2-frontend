import React, { useId } from 'react';
import { useField } from 'formik';

type CheckboxProps = {
    label: string;
    name: string;
    disabled?: boolean;
};

const Checkbox: React.FC<CheckboxProps> = (props) => {
    const id = useId();
    const [field, meta] = useField(props);

    return (
        <>
            <div>
                <input
                    {...field}
                    id={`${id}_${props.name}`}
                    type='checkbox'
                    disabled={props.disabled}
                />
                <label htmlFor={`${id}_${props.name}`}>{props.label}:</label>
            </div>
            {meta.touched && meta.error ? <div>{meta.error}</div> : null}
        </>
    );
};

export default Checkbox;
