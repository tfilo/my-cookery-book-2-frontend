import { Api } from '../openapi';

export const roleLabels: { [Property in Api.SimpleUser.RoleEnum]: string } = {
    ADMIN: 'Administrátor',
    CREATOR: 'Tvorca obsahu',
};