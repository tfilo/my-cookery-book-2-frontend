import React from 'react';
import { Button, Card, Stack } from 'react-bootstrap';
import { useFieldArray, useFormContext } from 'react-hook-form';
import Input from '../UI/Input';
import Ingredients from './Ingredients';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCirclePlus,
    faCircleMinus,
    faCircleChevronDown,
    faCircleChevronUp,
} from '@fortawesome/free-solid-svg-icons';
import Textarea from '../UI/Textarea';
import { SelectGroupOptions } from '../UI/Select';

type RecipeSectionsProps = {
    ingredientsData: SelectGroupOptions[];
};

const RecipeSections: React.FC<RecipeSectionsProps> = (props) => {
    const context = useFormContext();

    const { fields, append, remove, move } = useFieldArray({
        name: 'recipeSections',
    });

    return (
        <>
            <Stack direction='horizontal' gap={3}>
                <h2>Sekcie</h2>
                <Button
                    aria-label='pridať sekciu'
                    variant='outline-success'
                    type='button'
                    className='border-0'
                    onClick={() =>
                        append({
                            name: '',
                            sortNumber: null,
                            method: null,
                            ingredients: [],
                        })
                    }
                >
                    <FontAwesomeIcon icon={faCirclePlus} />
                </Button>
            </Stack>

            {fields.map((field, index) => {
                return (
                    <Card key={field?.id} className='mb-4'>
                        <Card.Body>
                            <section>
                                <input
                                    {...context.register(
                                        `recipeSections.${index}.sortNumber`
                                    )}
                                    value={index + 1}
                                    type='hidden'
                                />
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
                                <Input
                                    name={`recipeSections.${index}.name`}
                                    label='Názov sekcie'
                                    className='col-12'
                                />
                                {/* </Stack> */}
                                <Ingredients
                                    ingredientsData={props.ingredientsData}
                                    recipeSectionName={`recipeSections.${index}`}
                                />
                                <Textarea
                                    label='Postup'
                                    name={`recipeSections.${index}.methods`}
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
