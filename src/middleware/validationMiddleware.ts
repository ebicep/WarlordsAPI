import {z} from 'zod';
import type {NextFunction, Request, Response} from 'express';

export const validate = (schema: {
    params?: z.ZodSchema;
    query?: z.ZodSchema;
    body?: z.ZodSchema;
}) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            if (schema.params) {
                const parsed = schema.params.parse(req.params);
                Object.assign(req.params, parsed);
            }
            if (schema.query) {
                const parsed = schema.query.parse(req.query);
                Object.assign(req.query, parsed);
            }
            if (schema.body) {
                req.body = schema.body.parse(req.body);
            }
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({error: z.treeifyError(error)});
            } else {
                next(error);
            }
        }
    };
};
