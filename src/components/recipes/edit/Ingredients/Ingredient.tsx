import { faCircleMinus, faGripVertical } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { get } from 'lodash';
import React, { useCallback, useId, useState } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { type UseFieldArrayMove, type UseFieldArrayRemove, useFormContext } from 'react-hook-form';
import type { SelectGroupOptions } from '../../../ui/Select';

type IngredientProps = {
    name: string;
    index: number;
    units: SelectGroupOptions[];
    move: UseFieldArrayMove;
    remove: UseFieldArrayRemove;
};

const Ingredient: React.FC<IngredientProps> = ({ index, move, name, remove, units }) => {
    const {
        register,
        formState: { errors }
    } = useFormContext();
    const id = useId();

    const [dragable, setDragable] = useState<boolean>(false);

    const onDragStart = useCallback(
        (e: React.DragEvent<HTMLElement>) => {
            e.dataTransfer.clearData();
            if (dragable) {
                e.dataTransfer.setData('position', index.toString());
                e.dataTransfer.dropEffect = 'move';
            }
        },
        [dragable, index]
    );

    const onDragOver = useCallback((e: React.DragEvent<HTMLElement>) => {
        e.preventDefault();
    }, []);

    const onDrop = useCallback(
        (e: React.DragEvent<HTMLElement>) => {
            const data1 = +e.dataTransfer.getData('position');
            move(data1, index);
        },
        [index, move]
    );

    const nameErrorMessage = get(errors, `${name}.name`)?.message;
    const valueErrorMessage = get(errors, `${name}.value`)?.message;
    const unitErrorMessage = get(errors, `${name}.unitId`)?.message;

    const onEnableDrag = useCallback(() => {
        setDragable(true);
    }, []);

    const onDisableDrag = useCallback(() => {
        setDragable(false);
    }, []);

    return (
        <section>
            <input
                {...register(`${name}.id`)}
                type='hidden'
            />
            <InputGroup
                className='mb-2 '
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDrop={onDrop}
                draggable={dragable}
            >
                <Button
                    variant='outline-secondary'
                    title='Presunúť ingredienciu'
                    type='button'
                    className='mcb-ingredient-handle'
                    onMouseOver={onEnableDrag}
                    onMouseOut={onDisableDrag}
                    onTouchStart={onEnableDrag}
                    onTouchEnd={onDisableDrag}
                >
                    <FontAwesomeIcon icon={faGripVertical} />
                </Button>
                <Form.Control
                    {...register(`${name}.name`)}
                    aria-label='Názov suroviny'
                    placeholder='Názov'
                    type='text'
                    className='mcb-ingredient-name'
                    isInvalid={!!nameErrorMessage}
                    id={`${id}_name`}
                />

                <Form.Control
                    {...register(`${name}.value`)}
                    aria-label='Množstvo suroviny'
                    placeholder='Množstvo'
                    type='number'
                    className='mcb-ingredient-volume'
                    isInvalid={!!valueErrorMessage}
                    id={`${id}_value`}
                    min={0}
                />
                <Form.Select
                    {...register(`${name}.unitId`)}
                    aria-label='Jednotka'
                    name={`${name}.unitId`}
                    className='mcb-ingredient-unit'
                    isInvalid={!!unitErrorMessage}
                    id={`${id}_unitId`}
                >
                    <option
                        disabled
                        value='-1'
                    >
                        Vyberte Jednotku
                    </option>
                    {units.map((option) => {
                        return (
                            <optgroup
                                key={option.optGroupId}
                                label={option.optGroupName}
                            >
                                {option.options.map((opt) => (
                                    <option
                                        key={opt.value}
                                        value={opt.value}
                                    >
                                        {opt.label}
                                    </option>
                                ))}
                            </optgroup>
                        );
                    })}
                </Form.Select>
                <Button
                    variant='outline-danger'
                    aria-label='vymazať ingredienciu'
                    type='button'
                    onClick={() => remove(index)}
                    className='mcb-ingredient-delete'
                >
                    <FontAwesomeIcon icon={faCircleMinus} />
                </Button>
            </InputGroup>
            {(nameErrorMessage || valueErrorMessage || unitErrorMessage) && (
                <ul>
                    {nameErrorMessage && (
                        <li className='text-danger'>
                            <label htmlFor={`${id}_name`}>{nameErrorMessage?.toString()}</label>
                        </li>
                    )}
                    {valueErrorMessage && (
                        <li className='text-danger'>
                            <label htmlFor={`${id}_value`}>{valueErrorMessage?.toString()}</label>
                        </li>
                    )}
                    {unitErrorMessage && (
                        <li className='text-danger'>
                            <label htmlFor={`${id}_unitId`}>{unitErrorMessage?.toString()}</label>
                        </li>
                    )}
                </ul>
            )}
        </section>
    );
};

export default Ingredient;
