import React from 'react';
import { RecipesWithUrlInPictures } from './RecipeView';

type SourceProps = {
    recipe: RecipesWithUrlInPictures | undefined;
};

const SourceView: React.FC<SourceProps> = (props) => {
    const stringWithUrlToJSX = (input: string) => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;

        return input.split(urlRegex).map((p, idx) => {
            if (urlRegex.test(p)) {
                return (
                    <a href={p} rel='noreferrer' target='_blank' key={idx}>
                        {p}
                    </a>
                );
            } else {
                return <span key={idx}>{p}</span>;
            }
        });
    };

    return (
        <>
            {props.recipe &&
                props.recipe.sources &&
                props.recipe?.sources.length >= 1 && (
                    <section className='mt-3'>
                        <h2>Zdroje</h2>
                        <ul>
                            {props.recipe.sources.map((source) => (
                                <li className='mb-0 text-truncate' key={source}>
                                    {stringWithUrlToJSX(source)}
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
        </>
    );
};

export default SourceView;
