import React, { useEffect, useId } from 'react';
import { Form } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';
import { get } from 'lodash';

export type SelectGroupOptions = {
    optGroupId: number;
    optGroupName: string;
    options: SelectOption[];
};

export type SelectOption = {
    value: string | number;
    label: string;
};

type SelectProps = {
    label: string;
    name: string;
    options: (SelectOption | SelectGroupOptions)[];
    disabled?: boolean;
    multiple?: boolean;
};

const Select: React.FC<SelectProps> = (props) => {
    const id = useId();
    const {
        register,
        formState: { errors },
        getValues,
        setValue,
    } = useFormContext();

    const errorMessage = get(errors, props.name)?.message;

    const value = getValues(props.name);

    useEffect(() => {
        if (props.multiple) {
            if (Array.isArray(value)) {
                setValue(
                    props.name,
                    value.filter((v) => !!v).map((v) => v.toString())
                );
            } else if (!!value) {
                setValue(props.name, value ? [value.toString()] : []);
            }
        } else {
            setValue(props.name, value ? value.toString() : '-1');
        }
    }, [value, props.multiple]);

    return (
        <Form.Group className='mb-3' controlId={`${id}_${props.name}`}>
            <Form.Label>{props.label}</Form.Label>
            <Form.Select
                {...register(props.name)}
                disabled={props.disabled}
                multiple={props.multiple}
                isInvalid={!!errorMessage}
            >
                {!props.multiple && (
                    <option value='-1' disabled>
                        Prosím zvolte možnosť
                    </option>
                )}
                {props.options.map((option) => {
                    if ('options' in option) {
                        return (
                            <optgroup
                                key={option.optGroupId}
                                label={option.optGroupName}
                            >
                                {option.options.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </optgroup>
                        );
                    } else {
                        return (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        );
                    }
                })}
            </Form.Select>
            <Form.Control.Feedback type='invalid'>
                {errorMessage?.toString()}
            </Form.Control.Feedback>
        </Form.Group>
    );
};

export default Select;
