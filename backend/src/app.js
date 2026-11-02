import express from "express";
import { completionSchema, createTaskSchema, taskIdSchema } from "./schemas.js";
import { createTaskStore } from "./task-store.js";

const JSON_ERRORS = {
  "entity.parse.failed": [
    400,
    "INVALID_JSON",
    "Request body must be valid JSON.",
  ],
  "entity.too.large": [413, "PAYLOAD_TOO_LARGE", "Request body is too large."],
  "encoding.unsupported": [
    415,
    "UNSUPPORTED_CONTENT_ENCODING",
    "Compressed request bodies are not supported.",
  ],
};

function errorResponse(code, message) {
  return { error: { code, message } };
}

function parseTaskId(value) {
  const result = taskIdSchema.safeParse(value);
  return result.success ? result.data : null;
}

export function createApp({ store = createTaskStore() } = {}) {
  const app = express();

  app.disable("x-powered-by");
  app.use(express.json({ limit: "16kb", inflate: false }));

  app.get("/tasks", (request, response) => {
    response.json(store.listTasks());
  });

  app.post("/tasks", (request, response) => {
    const result = createTaskSchema.safeParse(request.body);

    if (!result.success) {
      return response
        .status(400)
        .json(errorResponse("INVALID_TASK", "text must be 1–500 characters."));
    }

    const task = store.createTask(result.data.text);
    return response.status(201).json(task);
  });

  app.patch("/tasks/:id", (request, response) => {
    const id = parseTaskId(request.params.id);

    if (id === null) {
      return response
        .status(400)
        .json(
          errorResponse("INVALID_ID", "Task ID must be a positive integer."),
        );
    }

    const result = completionSchema.safeParse(request.body);

    if (!result.success) {
      return response
        .status(400)
        .json(
          errorResponse("INVALID_COMPLETION", "completed must be a boolean."),
        );
    }

    const task = store.setTaskCompletion(id, result.data.completed);

    if (!task) {
      return response
        .status(404)
        .json(errorResponse("TASK_NOT_FOUND", "Task not found."));
    }

    return response.json(task);
  });

  app.delete("/tasks/:id", (request, response) => {
    const id = parseTaskId(request.params.id);

    if (id === null) {
      return response
        .status(400)
        .json(
          errorResponse("INVALID_ID", "Task ID must be a positive integer."),
        );
    }

    if (!store.deleteTask(id)) {
      return response
        .status(404)
        .json(errorResponse("TASK_NOT_FOUND", "Task not found."));
    }

    return response.status(204).end();
  });

  app.use((request, response) => {
    response
      .status(404)
      .json(errorResponse("ROUTE_NOT_FOUND", "Route not found."));
  });

  app.use((error, request, response, next) => {
    if (response.headersSent) {
      return next(error);
    }

    const parserError = JSON_ERRORS[error.type];

    if (parserError) {
      const [status, code, message] = parserError;
      return response.status(status).json(errorResponse(code, message));
    }

    console.error("Unhandled API error:", error);
    return response
      .status(500)
      .json(
        errorResponse("INTERNAL_SERVER_ERROR", "An unexpected error occurred."),
      );
  });

  return app;
}
