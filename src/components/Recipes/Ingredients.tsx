import React, { useState } from 'react';
import { Button, Form, InputGroup, Stack } from 'react-bootstrap';
import { useFieldArray, useFormContext } from 'react-hook-form';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCirclePlus,
    faCircleMinus,
    faGripVertical,
} from '@fortawesome/free-solid-svg-icons';
import { SelectGroupOptions } from '../UI/Select';

type IngredientsProps = {
    recipeSectionName: string;
    ingredientsData: SelectGroupOptions[];
};

const Ingredients: React.FC<IngredientsProps> = (props) => {
    const { register } = useFormContext();
    const { fields, append, remove, move } = useFieldArray({
        name: `${props.recipeSectionName}.ingredients`,
    });

    const [dragableGroup, setDragableGroup] = useState<number>();

    const dragStart = (e: React.DragEvent<HTMLElement>, position: number) => {
        console.log(e.target);
        if (dragableGroup) {
            console.log(`position1: ${position}`);
            // e.preventDefault();
            e.dataTransfer.setData('pos1_position', position.toString());
            e.dataTransfer.dropEffect = 'move';
            // setButtonOnClick(false);
        } else {
            console.log('nie som button');
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
        console.log('ahoj');
        // e.preventDefault();
        const data1 = +e.dataTransfer.getData('pos1_position');
        const data2 = +e.dataTransfer.getData('pos2_position');
        console.log(`data1: ${data1} data2: ${data2} position3: ${position}`);
        move(data1, position);
    };

    return (
        <>
            <Stack direction='horizontal' gap={3}>
                <Form.Label>Suroviny</Form.Label>
                <Button
                    aria-label='pridať ingredienciu'
                    variant='outline-success'
                    type='button'
                    className='border-0'
                    onClick={() =>
                        append({
                            name: '',
                            sortNumber: null,
                            value: null,
                            unitId: null,
                        })
                    }
                >
                    <FontAwesomeIcon icon={faCirclePlus} />
                </Button>
            </Stack>

            {fields.map((field, index) => {
                // console.log(field)
                return (
                    <section key={field?.id}>
                        <input
                            {...register(
                                `${props.recipeSectionName}.ingredients.${index}.id`
                            )}
                            type='hidden'
                        />
                        <InputGroup
                            className='mb-2 '
                            onDragStart={(e) => dragStart(e, index)}
                            onDragOver={(e) => dragOver(e, index)}
                            onDrop={(e) => drop(e, index)}
                            draggable={dragableGroup === index}
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
                                onMouseOver={() => setDragableGroup(index)}
                                onMouseOut={() => setDragableGroup(undefined)}
                                onTouchStart={() => setDragableGroup(index)}
                                onTouchEnd={() => setDragableGroup(undefined)}
                            >
                                <FontAwesomeIcon icon={faGripVertical} />
                            </Button>
                            <Form.Control
                                {...register(
                                    `${props.recipeSectionName}.ingredients.${index}.name`
                                )}
                                aria-label='Názov suroviny'
                                placeholder='Názov'
                                type='text'
                                style={{flex: 10}}
                                //style={{ width: '28%' }}
                                // isInvalid={true}
                            ></Form.Control>

                            <Form.Control
                                {...register(
                                    `${props.recipeSectionName}.ingredients.${index}.value`
                                )}
                                aria-label='Množstvo suroviny'
                                placeholder='Množstvo'
                                type='number'
                                style={{flex: 3.5}}
                                //style={{ width: '12%' }}
                                // isInvalid={false}
                            ></Form.Control>
                            <Form.Select
                                {...register(
                                    `${props.recipeSectionName}.ingredients.${index}.unitId`
                                )}
                                aria-label='Jednotka'
                                name={`${props.recipeSectionName}.ingredients.${index}.unitId`}
                                style={{flex: 5}}
                                //style={{ width: '23%' }}
                                // isInvalid={false}
                            >
                                <option disabled>Vyberte Jednotku</option>
                                {props.ingredientsData.map((option) => {
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
                                style={{
                                    borderRightColor: 'rgba(0, 0, 0, 0.175)',
                                    borderTopColor: 'rgba(0, 0, 0, 0.175)',
                                    borderBottomColor: 'rgba(0, 0, 0, 0.175)',
                                    borderLeftColor: 'rgba(0, 0, 0, 0)',
                                }}
                            >
                                <FontAwesomeIcon icon={faCircleMinus} />
                            </Button>
                            
                            {/* <div onInvalid={()=> console.log('chybicka')}>Prosím dolnte hodnotu</div> */}
                        </InputGroup>
                    </section>
                );
            })}
        </>
    );
};

export default Ingredients;
