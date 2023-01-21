import React from 'react';
import { Button, Form, Stack } from 'react-bootstrap';
import { useFieldArray } from 'react-hook-form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import { SelectGroupOptions } from '../../UI/Select';
import Ingredient from './Ingredient';

type IngredientsProps = {
    recipeSectionName: string;
    units: SelectGroupOptions[];
};

const Ingredients: React.FC<IngredientsProps> = (props) => {
    const { fields, append, remove, move } = useFieldArray({
        name: `${props.recipeSectionName}.ingredients`,
    });

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
                        key={field.id}
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
