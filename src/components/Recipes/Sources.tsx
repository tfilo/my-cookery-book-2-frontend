import React from 'react';
import { Button, Card, Stack } from 'react-bootstrap';
import { useFieldArray } from 'react-hook-form';
import InputWithBtn from '../UI/InputWithBtn';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCirclePlus,
} from '@fortawesome/free-solid-svg-icons';

const Sources: React.FC = () => {
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
                <h2>Zdroj receptu</h2>
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
                <Card>
                    <Card.Body>
                        {sourcesFields.map((field, index) => {
                            return (
                                <section key={field?.id}>
                                    <InputWithBtn
                                        name={`sources.${index}.value`}
                                        placeholder='Url'
                                        btnLabel='Odstrániť'
                                        onClick={() => sourcesRemove(index)}
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
