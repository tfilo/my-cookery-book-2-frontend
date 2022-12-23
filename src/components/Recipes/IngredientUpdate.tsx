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

const IngredientUpdate: React.FC<IngredientsProps> = (props) => {
const [drag1, setDrag1] = useState();
const [drag2, setDrag2] = useState();

    const { register } = useFormContext();
    const { fields, append, remove, move } = useFieldArray({
        name: `${props.recipeSectionName}.ingredients`,
    });

    const dragStart = (e, position) => {
        setDrag1(position)
        console.log(`position1: ${position}`)
        console.log(e.target.innerHTML);
      };
     
      const dragEnter = (e, position) => {
        setDrag2(position);
        console.log(`position2: ${position}`)
        console.log(e.target.innerHTML);
      };
     
      const drop = () => {
        if (drag1 && drag2) {
            move(drag1, drag2)
        }
        setDrag1(undefined);
        setDrag2(undefined)
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
                            value: undefined,
                            unitId: null,
                        })
                    }
                >
                    <FontAwesomeIcon icon={faCirclePlus} />
                </Button>
            </Stack>

            {fields.map((field, index) => {
                return (
                    <section key={field?.id}>
                        <input
                            {...register(
                                `${props.recipeSectionName}.ingredients.${index}.id`
                            )}
                            type='hidden'
                        />
                        <InputGroup as={'li'} className='mb-2'
                        onDragStart={(e) => dragStart(e, index)}
                        onDragEnter={(e) => dragEnter(e, index)}
                        onDragEnd={drop}
                        draggable
                        
                        >
                            <Button
                                variant='outline-secondary'
                                aria-label='posunúť ingredienciu'
                                type='button'
                                //onClick={() => remove(index)}
                                // onDrag={()=> move(index, index + 1)}
                                
                                style={{
                                    borderLeftColor: 'rgba(0, 0, 0, 0.175)',
                                    borderTopColor: 'rgba(0, 0, 0, 0.175)',
                                    borderBottomColor: 'rgba(0, 0, 0, 0.175)',
                                    borderRightColor: 'rgba(0, 0, 0, 0)',
                                }}
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
                            ></Form.Control>

                            <Form.Control
                                {...register(
                                    `${props.recipeSectionName}.ingredients.${index}.value`
                                )}
                                aria-label='Množstvo suroviny'
                                placeholder='Množstvo'
                                type='number'
                            ></Form.Control>
                            <Form.Select
                                {...register(
                                    `${props.recipeSectionName}.ingredients.${index}.unitId`
                                )}
                                aria-label='Jednotka'
                                name={`${props.recipeSectionName}.ingredients.${index}.unitId`}
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
                        </InputGroup>
                    </section>
                );
            })}
        </>
    );
};

export default IngredientUpdate;
