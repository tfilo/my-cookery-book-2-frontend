import React from 'react';
import { Spinner as BootstrapSpinner } from 'react-bootstrap';

type SpinnerProps = {
    show: boolean;
    light?: boolean;
};

const Spinner: React.FC<SpinnerProps> = React.memo(({ show, light = false }) => {
    if (!show) {
        return null;
    }
    return (
        <div className='position-fixed top-0 bottom-0 start-0 end-0 d-flex justify-content-center align-items-center'>
            <div className='bg-secondary opacity-25 position-fixed top-0 bottom-0 start-0 end-0'></div>
            <BootstrapSpinner
                animation='border'
                role='status'
                style={light ? { color: 'white' } : undefined}
            >
                <span className='visually-hidden'>Načítava sa...</span>
            </BootstrapSpinner>
        </div>
    );
});

export default Spinner;
