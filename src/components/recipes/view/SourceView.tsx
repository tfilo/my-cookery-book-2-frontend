import React from 'react';
import { Api } from '../../../openapi';

const urlRegex = /(https?:\/\/[^\s]+)/g;

type SourceLinkProps = {
    source: string;
};

const SourceLink: React.FC<SourceLinkProps> = React.memo(({ source }) => {
    return (
        <>
            {source.split(urlRegex).map((p, idx) => {
                if (urlRegex.test(p)) {
                    return (
                        <a
                            href={p}
                            rel='noreferrer'
                            target='_blank'
                            key={idx}
                        >
                            {p}
                        </a>
                    );
                } else {
                    return <span key={idx}>{p}</span>;
                }
            })}
        </>
    );
});

type SourceProps = {
    recipe: Api.Recipe;
};

const SourceView: React.FC<SourceProps> = ({ recipe }) => {
    if (recipe.sources.length === 0) {
        return null;
    }

    return (
        <section className='mt-3'>
            <h2>Zdroje</h2>
            <ul>
                {recipe.sources.map((source) => (
                    <li
                        className='mb-0 text-truncate'
                        key={source}
                    >
                        <SourceLink source={source} />
                    </li>
                ))}
            </ul>
        </section>
    );
};

export default SourceView;
