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

    const { fields, append, remove } = useFieldArray({
        name: 'recipeSections',
    });

    return (
        <>
            <Stack direction='horizontal' gap={3}>
                <h2>Sekcie</h2>
                <Button
                    aria-label='pridať sekciu'
                    variant='light'
                    type='button'
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
                                <Button
                                    aria-label='vymazať sekciu'
                                    variant='light'
                                    type='button'
                                    onClick={() => remove(index)}
                                >
                                    <FontAwesomeIcon icon={faCircleMinus} />
                                </Button>
                                <input
                                    {...context.register(
                                        `recipeSections.${index}.sortNumber`
                                    )}
                                    value={index + 1}
                                    type='hidden'
                                />

                                <Input
                                    name={`recipeSections.${index}.name`}
                                    label='Názov sekcie'
                                />

                                <Ingredients
                                    ingredientsData={props.ingredientsData}
                                    recipeSectionName={`recipeSections.${index}`}
                                />
                                <Textarea
                                    label='Postup'
                                    name={`recipeSections.${index}.methods`}
                                />
                                <Button
                                    variant='light'
                                    aria-label='presunúť sekciu nahor'
                                    type='button'
                                    onClick={() => remove(index)}
                                >
                                    <FontAwesomeIcon icon={faCircleChevronUp} />
                                </Button>
                                <Button
                                    variant='light'
                                    aria-label='presunúť sekciu nadol'
                                    type='button'
                                    onClick={() => remove(index)}
                                >
                                    <FontAwesomeIcon
                                        icon={faCircleChevronDown}
                                    />
                                </Button>
                            </section>
                        </Card.Body>
                    </Card>
                );
            })}
        </>
    );
};

export default RecipeSections;
