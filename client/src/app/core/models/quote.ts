export interface Quote {
  id: number;
  text: string;
  author: string;
  createdAt: string;
}

export interface QuoteRequest {
  text: string;
  author: string;
}
