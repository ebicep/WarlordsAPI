export interface CachedResult<T> {
    data: T;
    cached: boolean;
    durationMs: number;
}

export type Success = {
    success: true;
    data: Record<string, number>;
    cached: boolean;
    durationMs: number;
};

export type Error = {
    success: false;
    error: string;
};

export type Result = Success | Error;