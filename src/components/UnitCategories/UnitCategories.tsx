import {
    faCirclePlus,
    faPencil,
    faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useContext, useEffect, useState } from 'react';
import { Button, Stack, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Api } from '../../openapi';
import { AuthContext } from '../../store/auth-context';
import { unitCategoryApi } from '../../utils/apiWrapper';
import { formatErrorMessage } from '../../utils/errorMessages';
import Modal from '../UI/Modal';
import Spinner from '../UI/Spinner';
import Units from './Units';

const UnitCategories: React.FC = () => {
    const [listOfUnitCategories, setListOfUnitCategories] = useState<
        Api.SimpleUnitCategory[]
    >([]);
    const [error, setError] = useState<string>();
    const [unitCategory, setUnitCategory] = useState<Api.SimpleUnitCategory>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isUnitsLoading, setIsUnitsLoading] = useState<boolean>(false);
    const navigate = useNavigate();
    const authCtx = useContext(AuthContext);

    useEffect(() => {
        (async () => {
            try {
                setIsLoading(true);
                const unitCategories =
                    await unitCategoryApi.getUnitCategories();
                setListOfUnitCategories(unitCategories);
            } catch (err) {
                formatErrorMessage(err).then((message) => setError(message));
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    const createUnitCategoryHandler = () => {
        navigate('/unitCategory');
    };

    const createUnitHandler = (unitCategoryId: number) => {
        navigate(`/unit/${unitCategoryId}`);
    };

    const editUnitCategoryHandler = (id: number) => {
        navigate(`/unitCategory/${id}`);
    };

    const deleteUnitCategoryHandler = (
        unitCategory: Api.SimpleUnitCategory
    ) => {
        setUnitCategory(unitCategory);
    };

    const deleteUnitCategoryConfirmHandler = (status: boolean) => {
        (async () => {
            if (status === true) {
                if (unitCategory) {
                    try {
                        setIsLoading(true);
                        await unitCategoryApi.deleteUnitCategory(
                            unitCategory.id
                        );
                        setListOfUnitCategories((prev) => {
                            return prev.filter(
                                (_unitCategory) =>
                                    _unitCategory.id !== unitCategory.id
                            );
                        });
                    } catch (err) {
                        formatErrorMessage(err).then((message) => {
                            setError(message);
                        });
                    } finally {
                        setIsLoading(false);
                    }
                } else {
                    setError('Neplatná kategória!');
                }
            }
            setUnitCategory(undefined);
        })();
    };

    return (
        <>
            <div className='d-flex flex-column flex-md-row'>
                <h2 className='flex-grow-1'>Jednotky</h2>
                {authCtx.userRoles.find(
                    (role) => role === Api.User.RolesEnum.ADMIN
                ) && (
                    <Button
                        variant='primary'
                        onClick={createUnitCategoryHandler}
                    >
                        Pridať kategóriu jednotky
                    </Button>
                )}
            </div>
            <div>
                {listOfUnitCategories.map((unitCategory) => (
                    <Table striped responsive key={unitCategory.id}>
                        <thead>
                            <tr>
                                <Stack
                                    as={'th'}
                                    style={{ border: 'none' }}
                                    colSpan={3}
                                    direction='horizontal'
                                    gap={2}
                                >
                                    {unitCategory.name}
                                    {authCtx.userRoles.find(
                                        (role) =>
                                            role === Api.User.RolesEnum.ADMIN
                                    ) && (
                                        <Stack
                                            style={{ border: 'none' }}
                                            direction='horizontal'
                                            gap={2}
                                        >
                                            <Button
                                                title={`Pridať kategóriu jednotky ${unitCategory.name}`}
                                                aria-label={`Pridať kategóriu jednotky ${unitCategory.name}`}
                                                variant='outline-success'
                                                type='button'
                                                onClick={createUnitHandler.bind(
                                                    null,
                                                    unitCategory.id
                                                )}
                                            >
                                                <FontAwesomeIcon
                                                    icon={faCirclePlus}
                                                />
                                            </Button>
                                            <Button
                                                title={`Upraviť kategóriu jednotky ${unitCategory.name}`}
                                                aria-label={`Upraviť kategóriu jednotky ${unitCategory.name}`}
                                                variant='outline-secondary'
                                                onClick={editUnitCategoryHandler.bind(
                                                    null,
                                                    unitCategory.id
                                                )}
                                            >
                                                <FontAwesomeIcon
                                                    icon={faPencil}
                                                />
                                            </Button>
                                            <Button
                                                title={`Vymazať kategóriu jednotky ${unitCategory.name}`}
                                                aria-label={`Vymazať kategóriu jednotky ${unitCategory.name}`}
                                                variant='outline-danger'
                                                onClick={deleteUnitCategoryHandler.bind(
                                                    null,
                                                    unitCategory
                                                )}
                                            >
                                                <FontAwesomeIcon
                                                    icon={faTrash}
                                                />
                                            </Button>
                                        </Stack>
                                    )}
                                </Stack>
                            </tr>
                            <tr>
                                <th>Názov jednotky</th>
                                <th colSpan={2}>Skratka jednotky</th>
                            </tr>
                        </thead>
                        <Units
                            unitCategoryId={unitCategory.id}
                            setIsLoading={setIsUnitsLoading}
                        />
                    </Table>
                ))}
            </div>
            <Modal
                show={!!unitCategory}
                type='question'
                message={`Prajete si vymazať značku "${unitCategory?.name}" ?`}
                onClose={deleteUnitCategoryConfirmHandler}
            />
            <Modal
                show={!!error}
                message={error}
                type='error'
                onClose={() => {
                    setError(undefined);
                }}
            />
            {(isLoading || isUnitsLoading) && <Spinner />}
        </>
    );
};

export default UnitCategories;
