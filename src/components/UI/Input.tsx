import React, { useId } from 'react';
import { useField } from 'formik';

type InputProps = {
    label: string;
    name: string;
    autoComplete?: 'on' | 'off';
    disabled?: boolean;
    type?: 'text' | 'password' | 'number';
};

const Input: React.FC<InputProps> = (props) => {
    const id = useId();
    const [field, meta] = useField(props);

    return (
        <>
            <div>
                <label htmlFor={`${id}_${props.name}`}>{props.label}:</label>
                <input
                    {...field}
                    id={`${id}_${props.name}`}
                    type={props.type ?? 'text'}
                    disabled={props.disabled}
                    autoComplete={props.autoComplete}
                />
            </div>
            {meta.touched && meta.error ? <div>{meta.error}</div> : null}
        </>
    );
};

export default Input;
