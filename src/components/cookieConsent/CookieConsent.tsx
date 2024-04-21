import React, { useCallback, useContext } from 'react';
import ReactCookieConsent from 'react-cookie-consent';
import { AuthContext } from '../../store/auth-context';
import { Link } from 'react-router-dom';

const CookieConsent: React.FC = () => {
    const { setHasCookieConsent } = useContext(AuthContext);

    const onAcceptHandler = useCallback(() => {
        setHasCookieConsent(true);
    }, [setHasCookieConsent]);

    const onDeclineHandler = useCallback(() => {
        setHasCookieConsent(false);
    }, [setHasCookieConsent]);

    return (
        <ReactCookieConsent
            location='bottom'
            buttonText='Súhlasím'
            declineButtonText='Nesúhlasím'
            containerClasses='bg-primary'
            buttonClasses='btn btn-warning rounded m-2'
            declineButtonClasses='btn btn-danger rounded m-2'
            buttonWrapperClasses='d-flex flex-column'
            sameSite='Lax'
            cookieSecurity={false}
            enableDeclineButton={true}
            disableButtonStyles={true}
            setDeclineCookie={false}
            flipButtons={true}
            overlay={true}
            onAccept={onAcceptHandler}
            onDecline={onDeclineHandler}
        >
            <h2>Cookies</h2>
            <p>
                Udelením súhlasu umožníte aplikácií ukladať informácie do lokálneho úložiska (localStorage) prehliadača. Aplikácia po
                udelení súhlasu umožňuje zapamätať si práve prihláseného používateľa. Vďaka tomu sa nebudete musieť pri opätovnej návšteve
                prihlasovať. Lokálne úložisko sa zároveň môže používať na uloženie "záložiek" na recepty. Uložené záložky sa viažú na
                prehliadač a nie používateľské konto. Po odhlásení budú tieto údaje odstránené.
            </p>
            <p>Informácia o udelenom súhlase sa ukladá do cookies prehliadača a je platná na 1 rok od udelenia súhlasu.</p>
            <p>
                Svoje rozhodnutie môžete zmeniť v{' '}
                <Link
                    to={'/consent'}
                    className='text-white text-decoration-underline'
                >
                    nastaveniach cookies
                </Link>{' '}
                alebo po prihlásení v profile používateľa.
            </p>
        </ReactCookieConsent>
    );
};

export default CookieConsent;
