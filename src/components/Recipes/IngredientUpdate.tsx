import React from 'react';
import { Button, Card, Form, InputGroup, Stack } from 'react-bootstrap';
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
    const { register } = useFormContext();
    const { fields, append, remove } = useFieldArray({
        name: `${props.recipeSectionName}.ingredients`,
    });
    console.log(props.recipeSectionName)

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
            <Card className='mb-2'>
                <Card.Body>
                    {fields.map((field, index) => {
                        return (
                            <section key={field?.id}>
                                <input
                                    {...register(
                                        `${props.recipeSectionName}.ingredients.${index}.id`
                                    )}
                                    type='hidden'
                                />
                                <InputGroup className='mb-1'>
                                <Button
                                        variant='outline-secondary'
                                        aria-label='posunúť ingredienciu'
                                        type='button'
                                        // onClick={() => remove(index)}
                                        style={{borderLeftColor: 'rgba(0, 0, 0, 0.175)',
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
                                                    {option.options.map(
                                                        (opt) => (
                                                            <option
                                                                key={opt.value}
                                                                value={
                                                                    opt.value
                                                                }
                                                            >
                                                                {opt.label}
                                                            </option>
                                                        )
                                                    )}
                                                </optgroup>
                                            );
                                        })}
                                    </Form.Select>
                                    <Button
                                        variant='outline-danger'
                                        aria-label='vymazať ingredienciu'
                                        type='button'
                                        onClick={() => remove(index)}
                                        style={{borderRightColor: 'rgba(0, 0, 0, 0.175)',
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
                </Card.Body>
            </Card>
        </>
    );
};

export default IngredientUpdate;
