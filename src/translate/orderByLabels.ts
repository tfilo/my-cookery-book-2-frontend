import { Api } from '../openapi';

export const orderByLabels: {
    [Property in Api.RecipeSearchCriteria.OrderByEnum]: string;
} = {
    name: 'Názov',
    createdAt: 'Dátum vytvorenia',
    updatedAt: 'Dátum úpravy'
};
