import React from 'react';
import { Button, Stack } from 'react-bootstrap';
import { useFieldArray, useFormContext } from 'react-hook-form';
import Input from '../UI/Input';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCirclePlus,
    faCircleMinus,
    faCircleChevronDown,
    faCircleChevronUp,
} from '@fortawesome/free-solid-svg-icons';

type IngredientsProps = {
    recipeSectionName: string;
};

const Ingredients: React.FC<IngredientsProps> = (props) => {
    const context = useFormContext();

    const { fields, append, remove, move } = useFieldArray({
        name: `${props.recipeSectionName}.ingredients`,
    });

    return (
        <>
            <Stack direction='horizontal' gap={3}>
                <h3>Suroviny</h3>
                <Button
                    aria-label='pridať ingredienciu'
                    variant='light'
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
                    <FontAwesomeIcon icon={faCirclePlus} />
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
                            <Button
                                variant='light'
                                aria-label='presunúť ingredienciu nahor'
                                type='button'
                                onClick={() => remove(index)}
                            >
                                <FontAwesomeIcon icon={faCircleChevronUp} />
                            </Button>
                            <Button
                                variant='light'
                                aria-label='presunúť ingredienciu nadol'
                                type='button'
                                onClick={() => move(index, index+1)}
                            >
                                <FontAwesomeIcon icon={faCircleChevronDown} />
                            </Button>
                            <Button
                                variant='light'
                                aria-label='vymazať ingredienciu'
                                type='button'
                                onClick={() => remove(index)}
                            >
                                <FontAwesomeIcon icon={faCircleMinus} />
                            </Button>
                        </Stack>
                    </section>
                );
            })}
        </>
    );
};

export default Ingredients;
