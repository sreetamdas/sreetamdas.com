export type SuccessResponse<Type = unknown> = Type;

export type ErrorResponse<Type = unknown> = Type & {
	errorCode?: number;
	error: string;
};

export type GetViewsResponse = SuccessResponse | ErrorResponse;
