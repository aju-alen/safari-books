import React from 'react';
import BookCatalogScreen from '@/components/BookCatalogScreen';

const SearchTab = () => (
  <BookCatalogScreen
    showBackButton={false}
    screenTitle="Search"
    autoFocusSearch
  />
);

export default SearchTab;
