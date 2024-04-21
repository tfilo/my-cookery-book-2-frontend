import React from 'react';
import { Button, Card, Form, Stack } from 'react-bootstrap';
import { useFieldArray, useFormContext } from 'react-hook-form';
import InputWithBtn from '../../ui/InputWithBtn';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleMinus, faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import { RecipeForm } from '../../../pages/recipes/RecipeEditPage';
import { ButtonVariant } from 'react-bootstrap/esm/types';

const buttonConfig: {
    variant?: ButtonVariant;
    children: string | JSX.Element;
    label: string;
    style?: React.CSSProperties;
} = {
    label: 'Odstrániť zdroj',
    children: <FontAwesomeIcon icon={faCircleMinus} />,
    variant: 'outline-danger',
    style: {
        borderRightColor: 'rgba(0, 0, 0, 0.175)',
        borderTopColor: 'rgba(0, 0, 0, 0.175)',
        borderBottomColor: 'rgba(0, 0, 0, 0.175)',
        borderLeftColor: 'rgba(0, 0, 0, 0)',
        borderTopRightRadius: '0.375rem',
        borderBottomRightRadius: '0.375rem'
    }
};

const Sources: React.FC = () => {
    const { control } = useFormContext<RecipeForm>();
    const { fields, append, remove } = useFieldArray({
        name: 'sources',
        keyName: '_id',
        control
    });

    return (
        <>
            <Stack
                direction='horizontal'
                gap={3}
            >
                <Form.Label>Zdroj receptu</Form.Label>
                <Button
                    aria-label='pridať zdroj receptu'
                    variant='outline-success'
                    type='button'
                    className='border-0'
                    onClick={() =>
                        append({
                            value: ''
                        })
                    }
                >
                    <FontAwesomeIcon icon={faCirclePlus} />
                </Button>
            </Stack>

            {fields.length > 0 && (
                <Card className='mb-3'>
                    <Card.Body>
                        {fields.map((field, index) => {
                            return (
                                <section key={field._id}>
                                    <InputWithBtn
                                        name={`sources.${index}.value`}
                                        placeholder='Url'
                                        button={buttonConfig}
                                        onClick={() => remove(index)}
                                    />
                                </section>
                            );
                        })}
                    </Card.Body>
                </Card>
            )}
        </>
    );
};

export default Sources;
