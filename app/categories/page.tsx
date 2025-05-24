import CategoriesClient from './CategoriesClient';
import { fetchCategoriesWithCount } from '@/lib/api/categories-with-count';

export default async function CategoriesPage() {
  const { data: categories, error } = await fetchCategoriesWithCount();

  if (error) {
    console.error('Error fetching categories:', error);
  }

  return <CategoriesClient categories={categories} />;
}
