import React from 'react';
import { RecipesWithUrlInPictures } from './RecipeView';

type SectionProps = {
    recipe: RecipesWithUrlInPictures | undefined;
    serves: number;
};

const SectionView: React.FC<SectionProps> = (props) => {
    const showList = (
        ingredientId: number,
        ingredientValue: number | null,
        serves: number,
        unitName: string,
        unitAbbreviation: string,
        ingredientName: string
    ) => {
        const definedServes = props.recipe?.serves ?? 1;
        if (ingredientValue !== null) {
            let decimalPoints;
            let decPlacesWONull;
            if ((ingredientValue / definedServes) * serves < 10) {
                decimalPoints = 3;
                decPlacesWONull = 1000;
            } else if ((ingredientValue / definedServes) * serves < 100) {
                decimalPoints = 2;
                decPlacesWONull = 100;
            } else {
                decimalPoints = 1;
                decPlacesWONull = 10;
            }
            return (
                <li key={ingredientId}>
                    {(+((ingredientValue / definedServes) * serves).toFixed(
                        decimalPoints
                    ) /
                        decPlacesWONull) *
                        decPlacesWONull}
                    <span title={unitName}> {unitAbbreviation} </span>
                    {ingredientName}
                </li>
            );
        } else {
            return (
                <li key={ingredientId}>
                    <span title={unitName}> {unitAbbreviation} </span>
                    {ingredientName}
                </li>
            );
        }
    };

    return (
        <>
            {props.recipe?.recipeSections.map((section) => {
                return (
                    <section key={section.id}>
                        <h4>{section.name}</h4>
                        <h6>Suroviny</h6>
                        <ul>
                            {section.ingredients.map((ingredient) =>
                                showList(
                                    ingredient.id,
                                    ingredient.value,
                                    props.serves,
                                    ingredient.unit.name,
                                    ingredient.unit.abbreviation,
                                    ingredient.name
                                )
                            )}
                        </ul>
                        <h6>Postup prípravy</h6>
                        <p>{section?.method}</p>
                    </section>
                );
            })}
        </>
    );
};

export default SectionView;
