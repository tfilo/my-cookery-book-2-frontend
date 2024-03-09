import React from 'react';
import { Button, Form, Stack } from 'react-bootstrap';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import { SelectGroupOptions } from '../../UI/Select';
import Ingredient from './Ingredient';
import { RecipeForm } from '../Recipe';

type IngredientsProps = {
    recipeSectionName: string;
    units: SelectGroupOptions[];
};

const Ingredients: React.FC<IngredientsProps> = (props) => {
    const { control } = useFormContext<RecipeForm>();

    const { fields, append, remove, move } = useFieldArray({
        name: `${props.recipeSectionName}.ingredients` as 'recipeSections.0.ingredients',
        keyName: '_id',
        control
    });

    return (
        <>
            <Stack
                direction='horizontal'
                gap={3}
            >
                <Form.Label>Suroviny</Form.Label>
                <Button
                    aria-label='pridať ingredienciu'
                    variant='outline-success'
                    type='button'
                    className='border-0'
                    onClick={() =>
                        append({
                            name: '',
                            sortNumber: fields.length + 1,
                            value: null,
                            unitId: -1
                        })
                    }
                >
                    <FontAwesomeIcon icon={faCirclePlus} />
                </Button>
            </Stack>

            {fields.map((field, index) => {
                return (
                    <Ingredient
                        key={field._id}
                        name={`${props.recipeSectionName}.ingredients.${index}`}
                        index={index}
                        units={props.units}
                        move={move}
                        remove={remove}
                    />
                );
            })}
        </>
    );
};

export default Ingredients;
