import { Context } from 'hono';
export declare const getAllTasks: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    id: number;
    text: string;
    completed: boolean;
    order: number;
    duration_days: number | null;
    locked: boolean;
    locked_at: string | null;
    deadline: string | null;
    created_at: string;
    updated_at: string;
}[], import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    error: string;
}, 500, "json">)>;
export declare const getCompletedTasks: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    id: number;
    text: string;
    completed: boolean;
    order: number;
    duration_days: number | null;
    locked: boolean;
    locked_at: string | null;
    deadline: string | null;
    created_at: string;
    updated_at: string;
}[], import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    error: string;
}, 500, "json">)>;
export declare const getTaskById: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    error: string;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    error: string;
}, 404, "json">) | (Response & import("hono").TypedResponse<{
    id: number;
    text: string;
    completed: boolean;
    order: number;
    duration_days: number | null;
    locked: boolean;
    locked_at: string | null;
    deadline: string | null;
    created_at: string;
    updated_at: string;
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    error: string;
}, 500, "json">)>;
export declare const createTask: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    error: string;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    id: number;
    text: string;
    completed: boolean;
    order: number;
    duration_days: number | null;
    locked: boolean;
    locked_at: string | null;
    deadline: string | null;
    created_at: string;
    updated_at: string;
}, 201, "json">) | (Response & import("hono").TypedResponse<{
    error: string;
}, 500, "json">)>;
export declare const updateTask: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    id: number;
    text: string;
    completed: boolean;
    order: number;
    duration_days: number | null;
    locked: boolean;
    locked_at: string | null;
    deadline: string | null;
    created_at: string;
    updated_at: string;
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    error: string;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    error: string;
}, 404, "json">) | (Response & import("hono").TypedResponse<{
    error: string;
}, 500, "json">)>;
export declare const reorderTasks: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    error: string;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    message: string;
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    error: string;
}, 500, "json">)>;
export declare const deleteTask: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    error: string;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    error: string;
}, 404, "json">) | (Response & import("hono").TypedResponse<{
    message: string;
    task: {
        id: number;
        text: string;
        completed: boolean;
        order: number;
        duration_days: number | null;
        locked: boolean;
        locked_at: string | null;
        deadline: string | null;
        created_at: string;
        updated_at: string;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    error: string;
}, 500, "json">)>;
//# sourceMappingURL=taskController.d.ts.map