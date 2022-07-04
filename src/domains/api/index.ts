export type SuccessResponse<Type = unknown> = Type;

export type ErrorResponse<Type = unknown> = {
	errorCode?: number;
	error: string | Type;
};
