import React from 'react';
import { RecipesWithUrlInPictures } from './RecipeView';

type SourceProps = {
    recipe: RecipesWithUrlInPictures | undefined;
};

const SourceView: React.FC<SourceProps> = (props) => {
    const urlify = (text: string) => {
        if (text.includes('http://') || text.includes('https://')) {
            let start;
            if (text.includes('http://')) {
                start = text.indexOf('http://');
            } else {
                start = text.indexOf('https://');
            }
            let end = text.indexOf(' ', start);
            if (end === -1) {
                end = text.length;
            }
            if (start) {
                return (
                    <>
                        {text.substring(0, start)}
                        <a href={text.substring(start, end)} rel='noopener'>
                            {text.substring(start, end)}
                        </a>
                        {text.substring(end, text.length)}
                    </>
                );
            }
        } else {
            return text;
        }
    };
    return (
        <>
            {props.recipe &&
                props.recipe.sources &&
                props.recipe?.sources.length >= 1 && (
                    <section className='mt-3'>
                        <h3>Zdroje</h3>
                        {props.recipe.sources.map((source) => (
                            <p className='mb-0' key={source}>
                                {urlify(source)}
                            </p>
                        ))}
                    </section>
                )}
        </>
    );
};

export default SourceView;
