import { Api } from '../openapi';

export const getOrderByLabel: {
    [Property in Api.RecipeSearchCriteria.OrderByEnum]: string;
} = {
    name: 'Názov',
    createdAt: 'Dátum vytvorenia',
    updatedAt: 'Dátum úpravy'
};

export const getRoleLabel: { [Property in Api.SimpleUser.RoleEnum]: string } = {
    ADMIN: 'Administrátor',
    CREATOR: 'Tvorca obsahu'
};

export const getErrorMessageLabel: { [name: string]: string } = {
    Unauthorized: 'Nemáte oprávnenie',
    GENERAL_ERROR: 'Nastala neznáma chyba',
    DATABASE_ERROR: 'Chyba spojenia s databázou',
    NOT_FOUND: 'Vyžadovaný záznam sa nenašiel',
    VALIDATION_FAILED: 'Nesprávny vstup',
    INVALID_CREDENTIALS: 'Nesprávne prihlasovacie údaje!',
    FORBIDEN: 'Neplatný prístup',
    EXPIRED_TOKEN: 'Vypršaná autentifikácia',
    INVALID_TOKEN: 'Neplatná autentifikácia',
    UNIQUE_CONSTRAINT_ERROR: 'Záznam s rovnakými parametrami už existuje',
    CONSTRAINT_FAILED: 'Nemožno odstrániť, daný záznam sa používa'
};