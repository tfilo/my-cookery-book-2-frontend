import React from 'react';
import { Button, Card, Stack } from 'react-bootstrap';
import { useFieldArray } from 'react-hook-form';
import InputWithBtn from '../UI/InputWithBtn';

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
                    type='button'
                    onClick={() => sourcesAppend({ value: '' })}
                >
                    Pridať zdroj receptu
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
