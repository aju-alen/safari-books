import { create } from 'zustand';

export type QueuedBook = {
  id: string;
  title: string;
  authorName: string;
  coverImage: string;
  completeAudioUrl?: string;
};

type PlaybackQueueState = {
  items: QueuedBook[];
  addToQueue: (book: QueuedBook) => void;
  removeFromQueue: (id: string) => void;
  moveUp: (id: string) => void;
  clearQueue: () => void;
  peekNext: () => QueuedBook | undefined;
  /** Removes and returns the first queued item (auto-advance / play next). */
  shiftNext: () => QueuedBook | undefined;
};

export const usePlaybackQueueStore = create<PlaybackQueueState>((set, get) => ({
  items: [],
  addToQueue: (book) => {
    const id = String(book.id);
    set((s) => {
      if (s.items.some((i) => String(i.id) === id)) return s;
      return {
        items: [
          ...s.items,
          {
            ...book,
            id,
            title: book.title ?? 'Untitled',
            authorName: book.authorName ?? '',
            coverImage: book.coverImage ?? '',
          },
        ],
      };
    });
  },
  removeFromQueue: (id) => {
    const sid = String(id);
    set((s) => ({ items: s.items.filter((i) => String(i.id) !== sid) }));
  },
  moveUp: (id) => {
    const sid = String(id);
    set((s) => {
      const idx = s.items.findIndex((i) => String(i.id) === sid);
      if (idx <= 0) return s;
      const next = [...s.items];
      const tmp = next[idx - 1];
      next[idx - 1] = next[idx];
      next[idx] = tmp;
      return { items: next };
    });
  },
  clearQueue: () => set({ items: [] }),
  peekNext: () => get().items[0],
  shiftNext: () => {
    const items = get().items;
    if (!items.length) return undefined;
    const [first, ...rest] = items;
    set({ items: rest });
    return first;
  },
}));
