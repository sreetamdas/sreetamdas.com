export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
	public: {
		Tables: {
			authors: {
				Row: {
					id: number;
					created_at: string | null;
					name: string;
				};
				Insert: {
					id?: number;
					created_at?: string | null;
					name: string;
				};
				Update: {
					id?: number;
					created_at?: string | null;
					name?: string;
				};
			};
			book_status: {
				Row: {
					id: number;
					created_at: string | null;
					value: string;
				};
				Insert: {
					id?: number;
					created_at?: string | null;
					value: string;
				};
				Update: {
					id?: number;
					created_at?: string | null;
					value?: string;
				};
			};
			books: {
				Row: {
					id: number;
					created_at: string | null;
					name: string;
					cover: string;
					status: string;
					author: string;
				};
				Insert: {
					id?: number;
					created_at?: string | null;
					name: string;
					cover: string;
					status: string;
					author: string;
				};
				Update: {
					id?: number;
					created_at?: string | null;
					name?: string;
					cover?: string;
					status?: string;
					author?: string;
				};
			};
			page_details: {
				Row: {
					id: number;
					slug: string;
					created_at: string;
					updated_at: string;
					view_count: number;
					likes: number;
				};
				Insert: {
					id?: number;
					slug: string;
					created_at?: string;
					updated_at?: string;
					view_count?: number;
					likes?: number;
				};
				Update: {
					id?: number;
					slug?: string;
					created_at?: string;
					updated_at?: string;
					view_count?: number;
					likes?: number;
				};
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			upsert_page_view: {
				Args: { page_slug: string };
				Returns: number;
			};
		};
		Enums: {
			[_ in never]: never;
		};
	};
}
