import { Api } from '../openapi';

export const roleLabels: { [Property in Api.SimpleUser.RolesEnum]: string } = {
    ADMIN: 'Administrátor',
    CREATOR: 'Tvorca obsahu',
};