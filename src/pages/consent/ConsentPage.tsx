import React, { useCallback, useContext } from 'react';
import { Button, Form } from 'react-bootstrap';
import { AuthContext } from '../../store/auth-context';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

const ConsentPage: React.FC = () => {
    const navigate = useNavigate();
    const { hasCookieConsent, setHasCookieConsent } = useContext(AuthContext);

    const onChangeConsentHandler = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setHasCookieConsent(e.target.checked);
        },
        [setHasCookieConsent]
    );

    const onNavBackHandler = useCallback(() => {
        navigate('/');
    }, [navigate]);

    return (
        <div className='row justify-content-center'>
            <div className='col-lg-6 pt-3'>
                <h1>
                    <Button
                        variant='light'
                        aria-label='späť'
                        type='button'
                        onClick={onNavBackHandler}
                    >
                        <FontAwesomeIcon icon={faCircleArrowLeft} />
                    </Button>
                    Nastavenia cookies
                </h1>
                <p>
                    Udelením súhlasu umožníte aplikácií ukladať informácie do lokálneho úložiska (localStorage) prehliadača. Aplikácia po
                    udelení súhlasu umožňuje zapamätať si práve prihláseného používateľa. Vďaka tomu sa nebudete musieť pri opätovnej
                    návšteve prihlasovať. Lokálne úložisko sa zároveň môže používať na uloženie "záložiek" na recepty. Uložené záložky sa
                    viažú na prehliadač a nie používateľské konto. Po odhlásení budú tieto údaje odstránené.
                </p>
                <p>Informácia o udelenom súhlase sa ukladá do cookies prehliadača a je platná na 1 rok od udelenia súhlasu.</p>
                <h2>Vaše preferencie</h2>
                <Form.Group className='mb-3'>
                    <Form.Check
                        type='switch'
                        label='Udelenie súhlasu'
                        checked={hasCookieConsent}
                        onChange={onChangeConsentHandler}
                    />
                </Form.Group>
            </div>
        </div>
    );
};

export default ConsentPage;
