import React from 'react';

type MethodViewProps = {
    method: string | null;
};

const MethodView: React.FC<MethodViewProps> = React.memo(({ method }) => {
    if (!method) {
        return null;
    }
    return (
        <section className='pb-2'>
            <h2>Postup prípravy receptu</h2>
            <p>{method}</p>
        </section>
    );
});

export default MethodView;
