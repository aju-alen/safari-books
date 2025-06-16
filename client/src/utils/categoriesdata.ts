export type BookCategory = 
  | "fiction"
  | "nonfiction"
  | "biography"
  | "selfhelp"
  | "history"
  | "fantasy"
  | "science"
  | "romance"
  | "thriller"
  | "mystery"
  | "poetry"
  | "children"
  | "youngadult"
  | "health"
  | "religion"
  | "business"
  | "education"
  | "travel"
  | "biographiesmemoirs";

  export const BookCategoryLabels: Record<BookCategory, string> = {
  fiction: "Fiction",
  nonfiction: "Non Fiction",
  biography: "Biography",
  selfhelp: "Self Help",
  history: "History",
  fantasy: "Fantasy",
  science: "Science",
  romance: "Romance",
  thriller: "Thriller",
  mystery: "Mystery",
  poetry: "Poetry",
  children: "Children",
  youngadult: "Young Adult",
  health: "Health",
  religion: "Religion",
  business: "Business",
  education: "Education",
  travel: "Travel",
  biographiesmemoirs: "Biographies & Memoirs"
};