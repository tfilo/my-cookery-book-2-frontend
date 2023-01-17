import React from 'react';
import { RecipesWithUrlInPictures } from './RecipeView';

type SectionProps = {
    recipe: RecipesWithUrlInPictures | undefined;
    serves: number;
};

const countServes = (
    ingredientValue: number | null,
    definedServes: number,
    serves: number
) => {
    if (ingredientValue === null) {
        return;
    }
    let decimalPoints;
    if ((ingredientValue / definedServes) * serves < 10) {
        decimalPoints = 3;
    } else if ((ingredientValue / definedServes) * serves < 100) {
        decimalPoints = 2;
    } else {
        decimalPoints = 1;
    }

    return parseFloat(
        ((ingredientValue / definedServes) * serves).toFixed(decimalPoints)
    );
};

const SectionView: React.FC<SectionProps> = (props) => {
    const showIngredients = (
        ingredientId: number,
        ingredientValue: number | null,
        serves: number,
        unitName: string,
        unitAbbreviation: string,
        ingredientName: string
    ) => {
        const definedServes = props.recipe?.serves ?? 1;
        return (
            <li key={ingredientId}>
                {countServes(ingredientValue, definedServes, serves)}
                <span title={unitName}> {unitAbbreviation} </span>
                {ingredientName}
            </li>
        );
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
                                showIngredients(
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
