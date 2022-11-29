import React, { useId } from 'react';
import { Form } from 'react-bootstrap';
import { useFormContext, Controller } from 'react-hook-form';
import { get } from 'lodash';

export type SelectIngredientsOption = {
    categoryId: number;
    categoryName: string;
    units: {
        value: string | number;
        label: string;
    }[];
    disabled?: boolean;
};

export type SelectOption = {
    value: string | number;
    label: string;
    disabled?: boolean;
};

type SelectProps = {
    label: string;
    name: string;
    options?: SelectOption[];
    ingredientsOptions?: SelectIngredientsOption[];
    disabled?: boolean;
    multiple?: boolean;
};

const Select: React.FC<SelectProps> = (props) => {

    const id = useId();
    const {
        formState: { errors },
        control,
    } = useFormContext();

    //const errorMessage = errors[props.name]?.message;
    const errorMessage = get(errors, props.name)?.message;

    return (
        <Controller
            name={props.name}
            control={control}
            render={({ field }) => (
                <Form.Group className='mb-3' controlId={`${id}_${props.name}`}>
                    <Form.Label>{props.label}</Form.Label>
                    <Form.Select
                        {...field}
                        value={
                            Array.isArray(field.value)
                                ? field.value.map((v) => v.toString())
                                : field.value?.toString() ?? '-1'
                        }
                        disabled={props.disabled}
                        multiple={props.multiple}
                        isInvalid={!!errorMessage}
                    >
                        {!props.multiple && (
                            <option value='-1' disabled>
                                Prosím zvolte možnosť
                            </option>
                        )}

                        {props.ingredientsOptions?.map((category) => (
                            <optgroup key={category.categoryId} label={category.categoryName}>
                                {category.units.map((unit) => (
                                    <option key={unit.value} value={unit.value}>
                                        {unit.label}
                                    </option>
                                ))}
                            </optgroup>
                        ))}

                        {props.options?.map((option) => {
                            return (
                                <option
                                    key={option.value}
                                    value={option.value}
                                    disabled={option.disabled}
                                >
                                    {option.label}
                                </option>
                            );
                        })}
                    </Form.Select>
                    <Form.Control.Feedback type='invalid'>
                        {errorMessage?.toString()}
                    </Form.Control.Feedback>
                </Form.Group>
            )}
        />
    );
};

export default Select;
