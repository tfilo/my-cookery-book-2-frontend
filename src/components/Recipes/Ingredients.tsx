import React from 'react';
import { Button, Card, Col, Row, Stack } from 'react-bootstrap';
import { useFieldArray, useFormContext } from 'react-hook-form';
import Input from '../UI/Input';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCirclePlus,
    faCircleMinus,
    faCircleChevronDown,
    faCircleChevronUp,
} from '@fortawesome/free-solid-svg-icons';
import Select, { SelectGroupOptions } from '../UI/Select';

type IngredientsProps = {
    recipeSectionName: string;
    ingredientsData: SelectGroupOptions[];
};

const Ingredients: React.FC<IngredientsProps> = (props) => {
    const { register } = useFormContext();
    const { fields, append, remove, move } = useFieldArray({
        name: `${props.recipeSectionName}.ingredients`,
    });

    return (
        <>
            <Stack direction='horizontal' gap={3}>
                <h3>Suroviny</h3>
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
                            unitId: null,
                        })
                    }
                >
                    <FontAwesomeIcon icon={faCirclePlus} />
                </Button>
            </Stack>
            <Card className='mb-2'>
                <Card.Body>
                    {fields.map((field, index, array) => {
                        return (
                            <section key={field?.id}>
                                <Row>
                                    <input
                                        {...register(
                                            `${props.recipeSectionName}.ingredients.${index}.id`
                                        )}
                                        type='hidden'
                                    />
                                    <Col sx={12} sm={12} lg={6}>
                                        <Input
                                            name={`${props.recipeSectionName}.ingredients.${index}.name`}
                                            label='Názov ingrediencie'
                                        />
                                    </Col>
                                    <Col sx={6} sm={6} lg={2}>
                                        <Input
                                            name={`${props.recipeSectionName}.ingredients.${index}.value`}
                                            label='Množstvo'
                                            type='number'
                                        />
                                    </Col>
                                    <Col sx={6} sm={6} lg={2}>
                                        <Select
                                            label='Jednotka'
                                            name={`${props.recipeSectionName}.ingredients.${index}.unitId`}
                                            options={props.ingredientsData}
                                        />
                                    </Col>

                                    <Col sx={12} sm={12} lg={2}>
                                        <Stack direction='horizontal' gap={1}>
                                            <Button
                                                variant='outline-light'
                                                aria-label='presunúť ingredienciu nahor'
                                                type='button'
                                                onClick={() =>
                                                    move(index, index - 1)
                                                }
                                                className='border-0 mt-4'
                                                disabled={index === 0}
                                            >
                                                <FontAwesomeIcon
                                                    className='text-dark'
                                                    icon={faCircleChevronUp}
                                                />
                                            </Button>
                                            <Button
                                                variant='outline-light'
                                                aria-label='presunúť ingredienciu nadol'
                                                type='button'
                                                onClick={() =>
                                                    move(index, index + 1)
                                                }
                                                className='border-0 mt-4'
                                                disabled={
                                                    index === array.length - 1
                                                }
                                            >
                                                <FontAwesomeIcon
                                                    className='text-dark'
                                                    icon={faCircleChevronDown}
                                                />
                                            </Button>
                                            <Button
                                                variant='outline-danger'
                                                aria-label='vymazať ingredienciu'
                                                type='button'
                                                onClick={() => remove(index)}
                                                className='border-0 mt-4'
                                            >
                                                <FontAwesomeIcon
                                                    icon={faCircleMinus}
                                                />
                                            </Button>
                                        </Stack>
                                    </Col>
                                    {index < array.length - 1 && <hr className='d-block d-lg-none mt-2' style={{
                                        borderWidth: 3,
                                    }} />}
                                </Row>
                            </section>
                        );
                    })}
                </Card.Body>
            </Card>
        </>
    );
};

export default Ingredients;
