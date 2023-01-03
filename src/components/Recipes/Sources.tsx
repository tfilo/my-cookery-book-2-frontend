import React from 'react';
import { Button, Card, Form, InputGroup, Stack } from 'react-bootstrap';
import { useFieldArray, useFormContext } from 'react-hook-form';
// import InputWithBtn from '../UI/InputWithBtn';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleMinus, faCirclePlus } from '@fortawesome/free-solid-svg-icons';

const Sources: React.FC = () => {
    const { register } = useFormContext();
    const {
        fields: sourcesFields,
        append: sourcesAppend,
        remove: sourcesRemove,
    } = useFieldArray({
        name: 'sources',
    });

    return (
        <>
            <Stack direction='horizontal' gap={3}>
                <Form.Label>Zdroj receptu</Form.Label>
                <Button
                    aria-label='pridať zdroj receptu'
                    variant='outline-success'
                    type='button'
                    className='border-0'
                    onClick={() =>
                        sourcesAppend({
                            value: '',
                        })
                    }
                >
                    <FontAwesomeIcon icon={faCirclePlus} />
                </Button>
            </Stack>

            {sourcesFields.length > 0 && (
                <Card className='mb-3'>
                    <Card.Body>
                        {sourcesFields.map((field, index) => {
                            return (
                                <section key={field?.id}>
                                    {/* <InputWithBtn
                                        name={`sources.${index}.value`}
                                        placeholder='Url'
                                        btnLabel='Odstrániť'
                                        onClick={() => sourcesRemove(index)}
                                    /> */}
                                    <InputGroup className='mb-2'>
                                        <Form.Control
                                            {...register(
                                                `sources.${index}.value`
                                            )}
                                            aria-label='Názov suroviny'
                                            placeholder='Url'
                                            type='text'
                                        ></Form.Control>
                                        <Button
                                            variant='outline-danger'
                                            aria-label='vymazať ingredienciu'
                                            type='button'
                                            onClick={() => sourcesRemove(index)}
                                            style={{
                                                borderRightColor:
                                                    'rgba(0, 0, 0, 0.175)',
                                                borderTopColor:
                                                    'rgba(0, 0, 0, 0.175)',
                                                borderBottomColor:
                                                    'rgba(0, 0, 0, 0.175)',
                                                borderLeftColor:
                                                    'rgba(0, 0, 0, 0)',
                                            }}
                                        >
                                            <FontAwesomeIcon
                                                icon={faCircleMinus}
                                            />
                                        </Button>
                                    </InputGroup>
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
