import React, { useState } from 'react';

const Welcome: React.FC<{
    show: boolean;
}> = ({ show }) => {
    const [isVisible, setIsVisible] = useState(show);

    if (!isVisible) {
        return null;
    }

    return (
        <div
            className={`${
                show ? 'opacity-100' : 'opacity-0'
            } position-fixed top-0 bottom-0 start-0 end-0 d-flex justify-content-center align-items-center bg-white pe-none mcb-welcome-overlay`}
            onTransitionEnd={() => setIsVisible(false)}
        >
            <div className='w-100 text-center'>
                <img
                    src='/logo512.png'
                    alt=''
                    style={{
                        maxWidth: show ? '512px' : '1024px',
                        width: show ? '50%' : '80%'
                    }}
                    className={`${show ? 'opacity-100' : 'opacity-0'} rounded-5 mcb-welcome-logo`}
                />
                <h1 className={`${show ? 'opacity-100' : 'opacity-0'} pt-2 mcb-welcome-title`}>Načítava sa...</h1>
            </div>
        </div>
    );
};

export default Welcome;
