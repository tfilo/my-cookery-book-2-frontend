import { useSearchParams } from 'react-router-dom';
import { Api } from '../openapi';
import { CriteriaKeys, DEFAULT_PAGE, DEFAULT_PAGESIZE, EMPTY_CATEGORY_OPTION } from '../utils/constants';
import { useCallback, useMemo } from 'react';

export const getDefaultSearchParams = (categoryId?: number): string => {
    const params = new URLSearchParams();
    params.set(CriteriaKeys.page, DEFAULT_PAGE.toString());
    params.set(CriteriaKeys.pageSize, DEFAULT_PAGESIZE.toString());
    params.set(CriteriaKeys.orderBy, Api.RecipeSearchCriteria.OrderByEnum.Name);
    params.set(CriteriaKeys.order, Api.RecipeSearchCriteria.OrderEnum.ASC);
    if (!!categoryId) {
        params.set(CriteriaKeys.orderBy, Api.RecipeSearchCriteria.OrderByEnum.Name);
        params.set(CriteriaKeys.order, Api.RecipeSearchCriteria.OrderEnum.ASC);
        params.set(CriteriaKeys.categoryId, categoryId.toString());
    } else {
        params.set(CriteriaKeys.orderBy, Api.RecipeSearchCriteria.OrderByEnum.UpdatedAt);
        params.set(CriteriaKeys.order, Api.RecipeSearchCriteria.OrderEnum.DESC);
    }
    return params.toString();
};

const searchParamsToCriteria = (searchParams: URLSearchParams): Api.RecipeSearchCriteria => {
    const categoryIdParam = searchParams.get(CriteriaKeys.categoryId);
    const categoryId = !!categoryIdParam && !isNaN(parseInt(categoryIdParam)) ? parseInt(categoryIdParam) : null;
    const tagsParam = searchParams.get(CriteriaKeys.tags);
    const tags = !!tagsParam
        ? tagsParam
              .split(',')
              .filter((t) => !isNaN(parseInt(t)))
              .map((t) => +t)
        : [];
    const pageParam = searchParams.get(CriteriaKeys.page);
    const page = !!pageParam && !isNaN(parseInt(pageParam)) ? parseInt(pageParam) : DEFAULT_PAGE;
    const pageSizeParam = searchParams.get(CriteriaKeys.pageSize);
    const pageSize = !!pageSizeParam && !isNaN(parseInt(pageSizeParam)) ? parseInt(pageSizeParam) : DEFAULT_PAGESIZE;
    const orderByParam = searchParams.get(CriteriaKeys.orderBy);
    const orderBy =
        !!orderByParam && Object.values<any>(Api.RecipeSearchCriteria.OrderByEnum).includes(orderByParam)
            ? (orderByParam as Api.RecipeSearchCriteria.OrderByEnum)
            : Api.RecipeSearchCriteria.OrderByEnum.UpdatedAt;
    const orderParam = searchParams.get(CriteriaKeys.order);
    const order =
        !!orderParam && Object.values<any>(Api.RecipeSearchCriteria.OrderEnum).includes(orderParam)
            ? (orderParam as Api.RecipeSearchCriteria.OrderEnum)
            : Api.RecipeSearchCriteria.OrderEnum.DESC;

    return {
        search: searchParams.get(CriteriaKeys.search) ?? '',
        categoryId,
        tags,
        page,
        pageSize,
        orderBy,
        order
    };
};

const useCriteria = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const criteria = useMemo(() => searchParamsToCriteria(searchParams), [searchParams]);

    const updateCriteria = useCallback(
        (updateCriteria: Partial<Api.RecipeSearchCriteria>, resetPage: boolean = false) => {
            const result = new URLSearchParams();
            const update = { ...criteria, ...updateCriteria };
            if (update.categoryId === null || isNaN(update.categoryId) || update.categoryId === EMPTY_CATEGORY_OPTION) {
                result.delete(CriteriaKeys.categoryId);
            } else {
                result.set(CriteriaKeys.categoryId, update.categoryId.toString());
            }
            if (update.search === null || update.search.length === 0) {
                result.delete(CriteriaKeys.search);
            } else {
                result.set(CriteriaKeys.search, update.search);
            }
            if (update.tags.length === 0) {
                result.delete(CriteriaKeys.tags);
            } else {
                result.set(CriteriaKeys.tags, update.tags.join(','));
            }
            result.set(CriteriaKeys.order, update.order);
            result.set(CriteriaKeys.orderBy, update.orderBy);
            result.set(CriteriaKeys.pageSize, update.pageSize.toString());
            if (resetPage) {
                result.set(CriteriaKeys.page, DEFAULT_PAGE.toString());
            } else {
                result.set(CriteriaKeys.page, update.page.toString());
            }
            setSearchParams(result);
        },
        [criteria, setSearchParams]
    );

    return {
        criteria,
        updateCriteria,
        searchParams,
        getDefaultSearchParams
    };
};

export default useCriteria;
