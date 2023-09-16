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
            } z-3 position-fixed top-0 bottom-0 start-0 end-0 d-flex justify-content-center align-items-center bg-white`}
            style={{
                transition: 'opacity 2s',
                transitionDelay: '1s',
            }}
            onTransitionEnd={() => setIsVisible(false)}
        >
            <div className='w-100 text-center'>
                <img
                    src='/logo512.png'
                    alt='obrázok'
                    style={{
                        aspectRatio: 1,
                        maxWidth: show ? '512px' : '1024px',
                        width: show ? '50%' : '80%',
                        transition: 'all 2s',
                        transitionDelay: '1s',
                    }}
                    className={`${
                        show ? 'opacity-100' : 'opacity-0'
                    } rounded-5`}
                />
                <h1
                    className={`${show ? 'opacity-100' : 'opacity-0'} pt-2`}
                    style={{ transition: 'opacity 2s', transitionDelay: '1s' }}
                >
                    Načítava sa...
                </h1>
            </div>
        </div>
    );
};

export default Welcome;
