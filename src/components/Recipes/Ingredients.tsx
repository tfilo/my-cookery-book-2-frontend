import React from 'react';
import { Button, Stack } from 'react-bootstrap';
import { useFieldArray, useFormContext } from 'react-hook-form';
import Input from '../UI/Input';

type IngredientsProps = {
    recipeSectionName: string;
};

const Ingredients: React.FC<IngredientsProps> = (props) => {
    const context = useFormContext();

    const { fields, append, remove } = useFieldArray({
        name: `${props.recipeSectionName}.ingredients`,
    });

    return (
        <>
            <Stack direction='horizontal' gap={3}>
                <h3>Suroviny</h3>
                <Button
                    type='button'
                    onClick={() =>
                        append({
                            name: '',
                            sortNumber: null,
                            value: null,
                            unitId: null,
                        })
                    }
                >
                    Pridať ingredienciu
                </Button>
            </Stack>
            {fields.map((field, index) => {
                return (
                    <section key={field?.id}>
                        <input
                            {...context.register(
                                `${props.recipeSectionName}.ingredients.${index}.sortNumber`
                            )}
                            value={index + 1}
                            type='hidden'
                        />

                        <Stack direction='horizontal' gap={1}>
                            <Input
                                name={`${props.recipeSectionName}.ingredients.${index}.name`}
                                label='Názov ingrediencie'
                            />

                            <Input
                                name={`${props.recipeSectionName}.ingredients.${index}.value`}
                                label='value ingrediencie'
                            />
                            <Input
                                name={`${props.recipeSectionName}.ingredients.${index}.unitId`}
                                label='Id ingrediencie'
                            />
                            <Button type='button' onClick={() => remove(index)}>
                                Vymazať ingredienciu
                            </Button>
                        </Stack>
                    </section>
                );
            })}
        </>
    );
};

export default Ingredients;
