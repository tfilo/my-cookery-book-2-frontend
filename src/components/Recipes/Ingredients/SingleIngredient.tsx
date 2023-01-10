import { faCircleMinus, faGripVertical } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { SelectGroupOptions } from '../../UI/Select';

type SingleIngredientProps = {
    ingredientName: string;
    ingredientIndex: number;
    ingredientsData: SelectGroupOptions[];
  
};

const SingleIngredient: React.FC<SingleIngredientProps> = (props) => {
    const { register } = useFormContext();
    // console.log(props.ingredientName)
    // console.log(props.ingredientsData);

    const { remove, move } = useFieldArray({
        name: props.ingredientName
    });

    const [dragableGroup, setDragableGroup] = useState<number>();

    const dragStart = (e: React.DragEvent<HTMLElement>, position: number) => {
        console.log(e.target);
        if (dragableGroup) {
            console.log(`position1: ${position}`);
            // e.preventDefault();
            e.dataTransfer.setData('pos1_position', position.toString());
            e.dataTransfer.dropEffect = 'move';
            // setButtonOnClick(false);
        } else {
            console.log('nie som button');
        }
    };

    const dragOver = (e: React.DragEvent<HTMLElement>, position: number) => {
        e.preventDefault();
        console.log(`position2: ${position}`);
        e.dataTransfer.setData('pos2_position', position.toString());
        e.dataTransfer.dropEffect = 'move';
    };

    const drop = (e: React.DragEvent<HTMLElement>, position: number) => {
        console.log(`position3: ${position}`);
        console.log('ahoj');
        // e.preventDefault();
        const data1 = +e.dataTransfer.getData('pos1_position');
        const data2 = +e.dataTransfer.getData('pos2_position');
        console.log(`data1: ${data1} data2: ${data2} position3: ${position}`);
        move(data1, position);
    };

    return (
        
                <section>
                    <input
                        {...register(
                            `${props.ingredientName}.id`
                        )}
                        type='hidden'
                    />
                    <InputGroup
                        className='mb-2 '
                        onDragStart={(e) => dragStart(e, props.ingredientIndex)}
                        onDragOver={(e) => dragOver(e, props.ingredientIndex)}
                        onDrop={(e) => drop(e, props.ingredientIndex)}
                        draggable={dragableGroup === props.ingredientIndex}
                    >
                       <Button
                            variant='outline-secondary'
                            title='Presunúť ingredienciu'
                            type='button'
                            style={{
                                borderLeftColor: 'rgba(0, 0, 0, 0.175)',
                                borderTopColor: 'rgba(0, 0, 0, 0.175)',
                                borderBottomColor: 'rgba(0, 0, 0, 0.175)',
                                borderRightColor: 'rgba(0, 0, 0, 0)',
                            }}
                            onMouseOver={() => setDragableGroup(props.ingredientIndex)}
                            onMouseOut={() => setDragableGroup(undefined)}
                            onTouchStart={() => setDragableGroup(props.ingredientIndex)}
                            onTouchEnd={() => setDragableGroup(undefined)}
                        >
                            <FontAwesomeIcon icon={faGripVertical} />
                        </Button>
                        <Form.Control
                            {...register(
                                `${props.ingredientName}.name`
                            )}
                            aria-label='Názov suroviny'
                            placeholder='Názov'
                            type='text'
                            style={{flex: 10}}
                            //style={{ width: '28%' }}
                            // isInvalid={true}
                        ></Form.Control>

                        <Form.Control
                            {...register(
                                `${props.ingredientName}.value`
                            )}
                            aria-label='Množstvo suroviny'
                            placeholder='Množstvo'
                            type='number'
                            style={{flex: 3.5}}
                            //style={{ width: '12%' }}
                            // isInvalid={false}
                        ></Form.Control>
                        <Form.Select
                            {...register(
                                `${props.ingredientName}.unitId`
                            )}
                            aria-label='Jednotka'
                            name={`${props.ingredientName}.unitId`}
                            style={{flex: 5}}
                            //style={{ width: '23%' }}
                            // isInvalid={false}
                        >
                            <option disabled>Vyberte Jednotku</option>
                            {props.ingredientsData.map((option) => {
                                return (
                                    <optgroup
                                        key={option.optGroupId}
                                        label={option.optGroupName}
                                    >
                                        {option.options.map((opt) => (
                                            <option
                                                key={opt.value}
                                                value={opt.value}
                                            >
                                                {opt.label}
                                            </option>
                                        ))}
                                    </optgroup>
                                );
                            })}
                        </Form.Select>
                        <Button
                            variant='outline-danger'
                            aria-label='vymazať ingredienciu'
                            type='button'
                            onClick={() => remove(props.ingredientIndex)}
                            style={{
                                borderRightColor: 'rgba(0, 0, 0, 0.175)',
                                borderTopColor: 'rgba(0, 0, 0, 0.175)',
                                borderBottomColor: 'rgba(0, 0, 0, 0.175)',
                                borderLeftColor: 'rgba(0, 0, 0, 0)',
                            }}
                        >
                            <FontAwesomeIcon icon={faCircleMinus} />
                        </Button>
                    </InputGroup> 
                </section>
           
    )


};

export default SingleIngredient;
