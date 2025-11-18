export interface Task {
    id: number;
    text: string;
    completed: boolean;
    created_at: Date;
    updated_at: Date;
}
export interface CreateTaskDTO {
    text: string;
    completed?: boolean;
}
export interface UpdateTaskDTO {
    text?: string;
    completed?: boolean;
}
export interface TaskResponse {
    id: number;
    text: string;
    completed: boolean;
    created_at: Date;
    updated_at: Date;
}
export interface DeleteTaskResponse {
    message: string;
    task: Task;
}
export interface ErrorResponse {
    error: string;
}
//# sourceMappingURL=task.types.d.ts.map