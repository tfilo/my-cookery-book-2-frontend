import React, { useMemo, lazy } from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';
import { BookmarkContextProvider } from '../store/bookmark-context-provider';

import SignInPage from '../pages/signIn/SignInPage';
import RecipeSearchPage from '../pages/recipes/RecipeSearchPage';
import RecipeViewPage from '../pages/recipes/RecipeViewPage';
import Base from '../components/Base';

const UsersPage = lazy(() => import('../pages/users/UsersPage'));
const UnitCategoriesPage = lazy(() => import('../pages/unitCategories/UnitCategoriesPage'));
const TagsPage = lazy(() => import('../pages/tags/TagsPage'));
const ProfilePage = lazy(() => import('../pages/profile/ProfilePage'));
const CategoryPage = lazy(() => import('../pages/categories/CategoryPage'));
const RecipeEditPage = lazy(() => import('../pages/recipes/RecipeEditPage'));
const UserPage = lazy(() => import('../pages/users/UserPage'));
const CategoriesPage = lazy(() => import('../pages/categories/CategoriesPage'));
const TagPage = lazy(() => import('../pages/tags/TagPage'));
const UnitCategoryPage = lazy(() => import('../pages/unitCategories/UnitCategoryPage'));
const UnitPage = lazy(() => import('../pages/unitCategories/UnitPage'));
const ConfirmationPage = lazy(() => import('../pages/signIn/ConfirmationPage'));
const ResetPasswordPage = lazy(() => import('../pages/signIn/ResetPasswordPage'));
const ResetPasswordRequestPage = lazy(() => import('../pages/signIn/ResetPasswordRequestPage'));
const ConsentPage = lazy(() => import('../pages/consent/ConsentPage'));

const useRouter = (isLoggedIn: boolean) => {
    const router = useMemo(() => {
        if (isLoggedIn) {
            return createBrowserRouter([
                {
                    path: '/',
                    element: (
                        <BookmarkContextProvider>
                            <Base />
                        </BookmarkContextProvider>
                    ),
                    children: [
                        {
                            index: true,
                            element: (
                                <Navigate
                                    replace
                                    to={'/recipes'}
                                />
                            )
                        },
                        {
                            path: 'profile',
                            element: <ProfilePage />
                        },
                        {
                            path: 'users',
                            element: <UsersPage />
                        },
                        {
                            path: 'user',
                            element: <UserPage />
                        },
                        {
                            path: 'user/:id',
                            element: <UserPage />
                        },
                        {
                            path: 'categories',
                            element: <CategoriesPage />
                        },
                        {
                            path: 'category',
                            element: <CategoryPage />
                        },
                        {
                            path: 'category/:id',
                            element: <CategoryPage />
                        },
                        {
                            path: 'tags',
                            element: <TagsPage />
                        },
                        {
                            path: 'tag',
                            element: <TagPage />
                        },
                        {
                            path: 'tag/:id',
                            element: <TagPage />
                        },
                        {
                            path: 'units',
                            element: <UnitCategoriesPage />
                        },
                        {
                            path: 'unit/:categoryId/',
                            element: <UnitPage />
                        },
                        {
                            path: 'unit/:categoryId/:unitId',
                            element: <UnitPage />
                        },
                        {
                            path: 'unitCategory',
                            element: <UnitCategoryPage />
                        },
                        {
                            path: 'unitCategory/:id',
                            element: <UnitCategoryPage />
                        },
                        {
                            path: 'recipe/create',
                            element: <RecipeEditPage />
                        },
                        {
                            path: 'recipe/edit/:recipeId',
                            element: <RecipeEditPage />
                        },
                        {
                            path: 'recipe/:recipeId',
                            element: <RecipeViewPage />
                        },
                        {
                            path: 'recipes',
                            element: <RecipeSearchPage />
                        },
                        {
                            // Fallback
                            path: '*',
                            element: (
                                <Navigate
                                    replace
                                    to='/recipes'
                                />
                            )
                        }
                    ]
                }
            ]);
        } else {
            return createBrowserRouter([
                {
                    path: '/',
                    element: <Base />,
                    children: [
                        {
                            index: true,
                            element: (
                                <Navigate
                                    replace
                                    to={'/signIn'}
                                />
                            )
                        },
                        { path: 'signIn', element: <SignInPage /> },
                        {
                            path: '/confirm',
                            element: <ConfirmationPage />
                        },
                        {
                            path: '/confirm/:username/:key',
                            element: <ConfirmationPage />
                        },
                        {
                            path: '/resetRequest',
                            element: <ResetPasswordRequestPage />
                        },
                        {
                            path: '/reset',
                            element: <ResetPasswordPage />
                        },
                        {
                            path: '/reset/:username/:key',
                            element: <ResetPasswordPage />
                        },
                        {
                            path: '/consent',
                            element: <ConsentPage />
                        },
                        {
                            // Fallback
                            path: '*',
                            element: (
                                <Navigate
                                    replace
                                    to='/signIn'
                                />
                            )
                        }
                    ]
                }
            ]);
        }
    }, [isLoggedIn]);

    return router;
};

export default useRouter;
