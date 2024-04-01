import React, { PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { pictureApi, recipeApi } from '../utils/apiWrapper';
import { Stack } from 'react-bootstrap';
import defImg from '../assets/defaultRecipe.jpg';
import { useMatch, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

type BookmarkContextObj = {
    addRecipe: (recipeId: number) => void;
    removeRecipe: (recipeId: number) => void;
    contains: (recipeId: number) => boolean;
    clear: () => void;
};

export const BookmarkContext = React.createContext<BookmarkContextObj | null>(null);

export const useBookmarContext = () => {
    const context = useContext(BookmarkContext);
    if (!context) {
        throw new Error('useBookmarContext must be used within BookmarkContextProvider');
    }
    return context;
};

const Bookmark: React.FC<{ recipeId: number }> = ({ recipeId }) => {
    const match = useMatch('/recipe/display/:recipeId');
    const navigate = useNavigate();
    const [url, setUrl] = useState<string | undefined | null>(undefined);
    const isSelected = match?.params?.recipeId === recipeId.toString();

    const { data: recipe, isLoading: isLoadingRecipe } = useQuery({
        queryKey: ['recipes', recipeId] as const,
        queryFn: ({ queryKey }) => recipeApi.getRecipe(queryKey[1])
    });

    const pictureId = recipe?.pictures[0]?.id;
    const title = recipe?.name;

    const { data: thumbnail, isLoading: isLoadingThumbnail } = useQuery({
        queryKey: ['thumbnails', pictureId] as const,
        queryFn: async ({ queryKey }) => pictureApi.getPictureThumbnail(queryKey[1]!),
        enabled: !!pictureId
    });

    useEffect(() => {
        if (!isLoadingRecipe && !isLoadingThumbnail) {
            if (!!thumbnail && thumbnail instanceof Blob) {
                const url = URL.createObjectURL(thumbnail);
                setUrl(url);

                return () => {
                    if (url) {
                        URL.revokeObjectURL(url);
                    }
                };
            } else {
                setUrl(null);
            }
        }
    }, [thumbnail, isLoadingRecipe, isLoadingThumbnail]);

    const onClickHandler = useCallback(() => {
        navigate('/recipe/display/' + recipeId);
    }, [navigate, recipeId]);

    if (url === undefined) {
        return null;
    }

    return (
        <button
            className='btn btn-link p-0 m-0 pe-auto'
            onClick={onClickHandler}
            title={title}
        >
            <img
                className='rounded-circle border border-light'
                style={{ maxWidth: '64px', opacity: isSelected ? 1 : 0.5 }}
                alt='Založka'
                src={url ?? defImg}
            />
        </button>
    );
};

export const BookmarkContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [bookmarks, setBookmars] = useState<number[]>([]);
    const inRecipes = useMatch('/recipe/display/*');
    const inSearch = useMatch('/recipes/*');

    const showBookmarks = (inRecipes || inSearch) && bookmarks.length > 0;

    const addRecipe = useCallback((recipeId: number) => {
        setBookmars((prev) => {
            const existing = prev.find((id) => id === recipeId);
            if (existing) {
                return prev;
            }
            return [...prev, recipeId];
        });
    }, []);

    const removeRecipe = useCallback((recipeId: number) => {
        setBookmars((prev) => {
            return prev.filter((id) => id !== recipeId);
        });
    }, []);

    const contains = useCallback(
        (recipeId: number) => {
            return bookmarks.includes(recipeId);
        },
        [bookmarks]
    );

    const clear = useCallback(() => {
        setBookmars([]);
    }, []);

    const contextValue: BookmarkContextObj = useMemo(
        () => ({
            addRecipe,
            removeRecipe,
            clear,
            contains
        }),
        [addRecipe, removeRecipe, clear, contains]
    );

    return (
        <>
            <BookmarkContext.Provider value={contextValue}>
                <div className={showBookmarks ? 'pb-5' : ''}>{children}</div>
            </BookmarkContext.Provider>
            {showBookmarks && (
                <Stack
                    direction='horizontal'
                    className='container-fluid position-fixed bottom-0 end-0 start-0 p-3 gap-3 zindex-tooltip align-items-end flex-row-reverse overflow-auto pe-none'
                >
                    {bookmarks.map((recipeId) => {
                        return (
                            <Bookmark
                                key={recipeId}
                                recipeId={recipeId}
                            />
                        );
                    })}
                </Stack>
            )}
        </>
    );
};
