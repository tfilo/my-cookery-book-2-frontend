import {
    faCircleMinus,
    faGripVertical,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { get } from 'lodash';
import React, { useId, useState } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import {
    UseFieldArrayMove,
    UseFieldArrayRemove,
    useFormContext,
} from 'react-hook-form';
import { SelectGroupOptions } from '../../UI/Select';

type IngredientProps = {
    name: string;
    index: number;
    units: SelectGroupOptions[];
    move: UseFieldArrayMove;
    remove: UseFieldArrayRemove;
};

const Ingredient: React.FC<IngredientProps> = (props) => {
    const {
        register,
        formState: { errors },
    } = useFormContext();
    const id = useId();

    const [dragableGroup, setDragableGroup] = useState<number>();

    const dragStart = (e: React.DragEvent<HTMLElement>, position: number) => {
        if (dragableGroup) {
            console.log(`position1: ${position}`);
            e.dataTransfer.setData('pos1_position', position.toString());
            e.dataTransfer.dropEffect = 'move';
        }
    };

    const dragOver = (e: React.DragEvent<HTMLElement>, position: number) => {
        e.preventDefault();
        console.log(`position2: ${position}`);
        e.dataTransfer.setData('pos2_position', position.toString());
        e.dataTransfer.dropEffect = 'move';
    };

    const drop = (e: React.DragEvent<HTMLElement>, position: number) => {
        console.log(`position3: ${position}`);
        const data1 = +e.dataTransfer.getData('pos1_position');
        const data2 = +e.dataTransfer.getData('pos2_position');
        console.log(`data1: ${data1} data2: ${data2} position3: ${position}`);
        props.move(data1, position);
    };

    const nameErrorMessage = get(errors, `${props.name}.name`)?.message;
    const valueErrorMessage = get(errors, `${props.name}.value`)?.message;
    const unitErrorMessage = get(errors, `${props.name}.unitId`)?.message;

    return (
        <section>
            <input {...register(`${props.name}.id`)} type='hidden' />
            <InputGroup
                className='mb-2 '
                onDragStart={(e) => dragStart(e, props.index)}
                onDragOver={(e) => dragOver(e, props.index)}
                onDrop={(e) => drop(e, props.index)}
                draggable={dragableGroup === props.index}
            >
                <Button
                    variant='outline-secondary'
                    title='Presunúť ingredienciu'
                    type='button'
                    style={{
                        borderLeftColor: 'rgba(0, 0, 0, 0.175)',
                        borderTopColor: 'rgba(0, 0, 0, 0.175)',
                        borderBottomColor: 'rgba(0, 0, 0, 0.175)',
                        borderRightColor: 'rgba(0, 0, 0, 0)',
                    }}
                    onMouseOver={() => setDragableGroup(props.index)}
                    onMouseOut={() => setDragableGroup(undefined)}
                    onTouchStart={() => setDragableGroup(props.index)}
                    onTouchEnd={() => setDragableGroup(undefined)}
                >
                    <FontAwesomeIcon icon={faGripVertical} />
                </Button>
                <Form.Control
                    {...register(`${props.name}.name`)}
                    aria-label='Názov suroviny'
                    placeholder='Názov'
                    type='text'
                    style={{ flex: 10 }}
                    isInvalid={!!nameErrorMessage}
                    id={`${id}_name`}
                ></Form.Control>

                <Form.Control
                    {...register(`${props.name}.value`)}
                    aria-label='Množstvo suroviny'
                    placeholder='Množstvo'
                    type='number'
                    style={{ flex: 3.5 }}
                    isInvalid={!!valueErrorMessage}
                    id={`${id}_value`}
                    min={0}
                ></Form.Control>
                <Form.Select
                    {...register(`${props.name}.unitId`)}
                    aria-label='Jednotka'
                    name={`${props.name}.unitId`}
                    style={{ flex: 5 }}
                    isInvalid={!!unitErrorMessage}
                    id={`${id}_unitId`}
                >
                    <option disabled value='-1'>
                        Vyberte Jednotku
                    </option>
                    {props.units.map((option) => {
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
                    })}
                </Form.Select>
                <Button
                    variant='outline-danger'
                    aria-label='vymazať ingredienciu'
                    type='button'
                    onClick={() => props.remove(props.index)}
                    style={{
                        borderRightColor: 'rgba(0, 0, 0, 0.175)',
                        borderTopColor: 'rgba(0, 0, 0, 0.175)',
                        borderBottomColor: 'rgba(0, 0, 0, 0.175)',
                        borderLeftColor: 'rgba(0, 0, 0, 0)',
                    }}
                >
                    <FontAwesomeIcon icon={faCircleMinus} />
                </Button>
            </InputGroup>
            {(nameErrorMessage || valueErrorMessage || unitErrorMessage) && (
                <ul>
                    {nameErrorMessage && (
                        <li className='text-danger'>
                            <label htmlFor={`${id}_name`}>
                                {nameErrorMessage?.toString()}
                            </label>
                        </li>
                    )}
                    {valueErrorMessage && (
                        <li className='text-danger'>
                            <label htmlFor={`${id}_value`}>
                                {valueErrorMessage?.toString()}
                            </label>
                        </li>
                    )}
                    {unitErrorMessage && (
                        <li className='text-danger'>
                            <label htmlFor={`${id}_unitId`}>
                                {unitErrorMessage?.toString()}
                            </label>
                        </li>
                    )}
                </ul>
            )}
        </section>
    );
};

export default Ingredient;
