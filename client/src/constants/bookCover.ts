/**
 * Canonical cover art size & ratio — reference portrait covers (e.g. 742×1000 px, ≈ 3∶4).
 * Use for uploads (`publisherCommonForm`) and layout `aspectRatio` so UI matches uploads.
 */
export const BOOK_COVER_WIDTH = 742;
export const BOOK_COVER_HEIGHT = 1000;
export const BOOK_COVER_ASPECT_RATIO = BOOK_COVER_WIDTH / BOOK_COVER_HEIGHT;
/** Reduced width∶height pair for `expo-image-picker` `aspect`. Same ratio as pixels above. */
export const BOOK_COVER_ASPECT_PAIR = [371, 500] as const;
