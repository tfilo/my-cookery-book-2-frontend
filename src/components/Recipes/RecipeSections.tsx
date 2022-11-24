import React from 'react';
import { Button, Card, Stack } from 'react-bootstrap';
import { useFieldArray, useFormContext } from 'react-hook-form';
import Input from '../UI/Input';
import Ingredients from './Ingredients';

const RecipeSections: React.FC = () => {
    const context = useFormContext();

    const { fields, append, remove } = useFieldArray({
        name: 'recipeSections',
    });

    return (
        <>
            <Stack direction='horizontal' gap={3}>
                <h2>Sekcie</h2>
                <Button
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
                    Pridať sekciu
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

                                <Input
                                    name={`recipeSections.${index}.name`}
                                    label='Názov sekcie'
                                />

                                <Ingredients
                                    recipeSectionName={`recipeSections.${index}`}
                                />

                                <Input
                                    name={`recipeSections.${index}.method`}
                                    label='Postup'
                                />

                                <Button
                                    type='button'
                                    onClick={() => remove(index)}
                                >
                                    Vymazať sekciu
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
