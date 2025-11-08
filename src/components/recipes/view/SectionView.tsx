import React from 'react';
import { Api } from '../../../openapi';

const countServes = (ingredientValue: number | null, definedServes: number, serves: number) => {
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

    return parseFloat(((ingredientValue / definedServes) * serves).toFixed(decimalPoints));
};

type IngredientProps = {
    ingredientId: number;
    ingredientValue: number | null;
    ingredientName: string;
    unitName: string;
    unitAbbreviation: string;
    definedServes: number;
    serves: number;
};

const Ingredient: React.FC<IngredientProps> = React.memo(
    ({ ingredientId, ingredientName, ingredientValue, unitName, unitAbbreviation, definedServes, serves }) => {
        return (
            <li key={ingredientId}>
                {countServes(ingredientValue, definedServes, serves)}
                <span title={unitName}> {unitAbbreviation} </span>
                {ingredientName}
            </li>
        );
    }
);

type SectionMethodProps = {
    method: string | null;
};

const SectionMethod: React.FC<SectionMethodProps> = React.memo(({ method }) => {
    if (!method) {
        return null;
    }
    return (
        <>
            <h3>Postup prípravy sekcie</h3>
            <p
                style={{
                    whiteSpace: 'pre-wrap'
                }}
            >
                {method}
            </p>
        </>
    );
});

type SectionProps = {
    recipe: Api.Recipe;
    serves: number;
};

const SectionView: React.FC<SectionProps> = ({ recipe, serves }) => {
    const definedServes = recipe.serves ?? 1;

    return (
        <>
            {recipe.recipeSections.map((section) => {
                return (
                    <section key={section.id}>
                        <h2>{section.name}</h2>
                        <h3>Suroviny</h3>
                        <ul>
                            {section.ingredients.map((ingredient) => (
                                <Ingredient
                                    key={ingredient.id}
                                    definedServes={definedServes}
                                    serves={serves}
                                    ingredientId={ingredient.id}
                                    ingredientName={ingredient.name}
                                    ingredientValue={ingredient.value}
                                    unitName={ingredient.unit.name}
                                    unitAbbreviation={ingredient.unit.abbreviation}
                                />
                            ))}
                        </ul>
                        <SectionMethod method={section.method} />
                    </section>
                );
            })}
        </>
    );
};

export default SectionView;
