import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import BookCatalogScreen from '@/components/BookCatalogScreen';

const AllAudioBooks = () => {
  const { category } = useLocalSearchParams();
  const categoryString = Array.isArray(category) ? category[0] : category;

  return <BookCatalogScreen categoryKey={categoryString || undefined} />;
};

export default AllAudioBooks;
