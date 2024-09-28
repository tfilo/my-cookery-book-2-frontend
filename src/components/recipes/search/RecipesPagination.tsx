import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Pagination } from 'react-bootstrap';
import { DEFAULT_PAGE, PAGES_TO_SHOW } from '../../../utils/constants';

const availableNavigatePageNumbers = (currentPage: number, allPages: number | null): number[] => {
    const showNumbers: number[] = [];
    if (allPages !== null) {
        const firstPage = Math.max(Math.min(currentPage - Math.floor((PAGES_TO_SHOW - 1) / 2), allPages - PAGES_TO_SHOW + 1), 1);
        const lastPage = Math.min(firstPage + (PAGES_TO_SHOW - 1), allPages);
        for (let i = firstPage; i <= lastPage; i++) {
            showNumbers.push(i);
        }
    }
    return showNumbers;
};

type RecipesPaginationProsp = {
    allPages: number | null;
};

const RecipesPagination: React.FC<RecipesPaginationProsp> = ({ allPages }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const pageParam = searchParams.get('page') ?? `${DEFAULT_PAGE}`;

    const currentPage = useMemo(() => {
        if (pageParam !== null && !isNaN(parseInt(pageParam))) {
            return parseInt(pageParam) + 1;
        } else {
            return DEFAULT_PAGE + 1;
        }
    }, [pageParam]);

    const pages = useMemo(() => {
        return availableNavigatePageNumbers(currentPage, allPages);
    }, [allPages, currentPage]);

    const onChangePageHandler = (pageNumber: number) => {
        const result = new URLSearchParams(searchParams);
        result.set('page', `${pageNumber - 1}`);
        setSearchParams(result);
    };

    if (!allPages || allPages <= 1) {
        return null;
    }

    return (
        <Pagination className='mt-3 justify-content-center'>
            <Pagination.First
                onClick={() => onChangePageHandler(1)}
                disabled={currentPage === 1}
            />
            <Pagination.Prev
                onClick={() => onChangePageHandler(currentPage - 1)}
                disabled={currentPage === 1}
            />

            {pages.map((v, idx) => (
                <Pagination.Item
                    key={idx}
                    onClick={() => onChangePageHandler(v)}
                    active={v === currentPage}
                >
                    {v}
                </Pagination.Item>
            ))}

            <Pagination.Next
                onClick={() => onChangePageHandler(currentPage + 1)}
                disabled={currentPage === allPages}
            />
            <Pagination.Last
                onClick={() => onChangePageHandler(allPages)}
                disabled={currentPage === allPages}
            />
        </Pagination>
    );
};

export default RecipesPagination;
