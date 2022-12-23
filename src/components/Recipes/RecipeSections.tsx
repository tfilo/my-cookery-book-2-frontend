import React from 'react';
import { Button, Card, Form, Stack } from 'react-bootstrap';
import { useFieldArray, useFormContext } from 'react-hook-form';
import Input from '../UI/Input';
// import Ingredients from './Ingredients';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCirclePlus,
    faCircleMinus,
    faCircleChevronDown,
    faCircleChevronUp,
} from '@fortawesome/free-solid-svg-icons';
import Textarea from '../UI/Textarea';
import { SelectGroupOptions } from '../UI/Select';
import IngredientUpdate from './IngredientUpdate';

type RecipeSectionsProps = {
    ingredientsData: SelectGroupOptions[];
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
                                    value: 0,
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
                        <Card.Body>
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
                                        disabled={index === array.length-1}
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
                                {/* <Stack direction='horizontal' gap={1}> */}
                                <input
                                    {...register(`recipeSections.${index}.id`)}
                                    type='hidden'
                                />
                                <Input
                                    name={`recipeSections.${index}.name`}
                                    label='Názov sekcie'
                                    className='col-12'
                                />
                                {/* </Stack> */}
                                <IngredientUpdate
                                // <Ingredients
                                    ingredientsData={props.ingredientsData}
                                    recipeSectionName={`recipeSections.${index}`}
                                />
                                <Textarea
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
