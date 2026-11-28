import {
    AuthApi,
    CategoryApi,
    HealthApi,
    Configuration,
    PictureApi,
    RecipeApi,
    TagApi,
    UnitApi,
    UnitCategoryApi,
    UserApi
} from '../openapi';

const config = new Configuration({
    authorization: () => window.token ?? null,
    basePath: '/api'
});

const authApi = new AuthApi(config);
const categoryApi = new CategoryApi(config);
const pictureApi = new PictureApi(config);
const recipeApi = new RecipeApi(config);
const tagApi = new TagApi(config);
const unitApi = new UnitApi(config);
const unitCategoryApi = new UnitCategoryApi(config);
const userApi = new UserApi(config);
const healthApi = new HealthApi(config);

export { authApi, categoryApi, pictureApi, recipeApi, tagApi, unitApi, unitCategoryApi, userApi, healthApi };
