export interface CachedResult<T> {
    data: T;
    cached: boolean;
    durationMs: number;
}