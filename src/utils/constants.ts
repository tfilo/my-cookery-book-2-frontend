import { Api } from '../openapi';

export const PAGES_TO_SHOW = 5 as const;
export const DEFAULT_PAGE = 0 as const;
export const DEFAULT_PAGESIZE = 12 as const;
export const EMPTY_CATEGORY_OPTION = -1 as const;

export const DEFAULT_ORDER_BY = Api.RecipeSearchCriteria.OrderByEnum.UpdatedAt as const;
export const DEFAULT_ORDER = Api.RecipeSearchCriteria.OrderEnum.DESC as const;

export enum CriteriaKeys {
    search = 'search',
    categoryId = 'categoryId',
    tags = 'tags',
    page = 'page',
    pageSize = 'pageSize',
    orderBy = 'orderBy',
    order = 'order'
}