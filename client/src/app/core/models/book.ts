export interface Book {
  id: number;
  title: string;
  author: string;
  /** Datum i formatet ÅÅÅÅ-MM-DD */
  publishedDate: string;
  genre?: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Det som skickas till API:t när en bok skapas eller uppdateras. */
export interface BookRequest {
  title: string;
  author: string;
  publishedDate: string;
  genre?: string | null;
}
