import React from 'react';
import { Button, Card, Form, Stack } from 'react-bootstrap';
import { useFieldArray, useFormContext } from 'react-hook-form';
import Input from '../UI/Input';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCirclePlus,
    faCircleMinus,
    faCircleChevronDown,
    faCircleChevronUp,
} from '@fortawesome/free-solid-svg-icons';
import Textarea from '../UI/Textarea';
import { SelectGroupOptions } from '../UI/Select';
import Ingredients from './Ingredients/Ingredients';

type RecipeSectionsProps = {
    units: SelectGroupOptions[];
};

const RecipeSections: React.FC<RecipeSectionsProps> = (props) => {
    const { register } = useFormContext();

    const { fields, append, remove, move } = useFieldArray({
        name: 'recipeSections',
    });

    return (
        <>
            <Stack direction='horizontal' gap={3}>
                <Form.Label>Sekcie</Form.Label>
                <Button
                    aria-label='pridať sekciu'
                    variant='outline-success'
                    type='button'
                    className='border-0'
                    onClick={() =>
                        append({
                            name: '',
                            method: null,
                            ingredients: [
                                {
                                    name: '',
                                    value: null,
                                    unitId: -1,
                                },
                            ],
                        })
                    }
                >
                    <FontAwesomeIcon icon={faCirclePlus} />
                </Button>
            </Stack>

            {fields.map((field, index, array) => {
                return (
                    <Card key={field?.id} className='mb-3'>
                        <Card.Body className='pb-0'>
                            <section>
                                <div
                                    className='position-absolute'
                                    style={{
                                        top: '0px',
                                        right: '0px',
                                    }}
                                >
                                    <Button
                                        variant='outline-light'
                                        aria-label='presunúť sekciu nahor'
                                        type='button'
                                        onClick={() => move(index, index - 1)}
                                        className='border-0'
                                        disabled={index === 0}
                                    >
                                        <FontAwesomeIcon
                                            className='text-dark'
                                            icon={faCircleChevronUp}
                                        />
                                    </Button>
                                    <Button
                                        variant='outline-light'
                                        aria-label='presunúť sekciu nadol'
                                        type='button'
                                        onClick={() => move(index, index + 1)}
                                        className='border-0'
                                        disabled={index === array.length - 1}
                                    >
                                        <FontAwesomeIcon
                                            className='text-dark'
                                            icon={faCircleChevronDown}
                                        />
                                    </Button>
                                    <Button
                                        aria-label='vymazať sekciu'
                                        variant='outline-danger'
                                        type='button'
                                        onClick={() => remove(index)}
                                        className='border-0'
                                    >
                                        <FontAwesomeIcon icon={faCircleMinus} />
                                    </Button>
                                </div>
                                <input
                                    {...register(`recipeSections.${index}.id`)}
                                    type='hidden'
                                />
                                <Input
                                    name={`recipeSections.${index}.name`}
                                    label='Názov sekcie'
                                    className='col-12'
                                />
                                <Ingredients
                                    units={props.units}
                                    recipeSectionName={`recipeSections.${index}`}
                                />
                                <Textarea
                                    rows={10}
                                    className='mt-3'
                                    label='Postup prípravy'
                                    name={`recipeSections.${index}.method`}
                                />
                            </section>
                        </Card.Body>
                    </Card>
                );
            })}
        </>
    );
};

export default RecipeSections;
