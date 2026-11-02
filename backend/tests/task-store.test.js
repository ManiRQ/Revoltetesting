import assert from "node:assert/strict";
import test from "node:test";
import {
  completionSchema,
  createTaskSchema,
  taskIdSchema,
} from "../src/schemas.js";
import { createTaskStore } from "../src/task-store.js";

test("creates tasks with increasing IDs and lists copies", () => {
  const store = createTaskStore();
  const first = store.createTask("Send the proposal");
  const second = store.createTask("Review the notes");

  assert.deepEqual(first, {
    id: 1,
    text: "Send the proposal",
    completed: false,
  });
  assert.equal(second.id, 2);
  assert.deepEqual(store.listTasks(), [first, second]);

  const listedTask = store.listTasks()[0];
  listedTask.text = "Changed outside the store";
  assert.equal(store.listTasks()[0].text, "Send the proposal");
});

test("sets and clears completion state", () => {
  const store = createTaskStore();
  const task = store.createTask("Prepare the agenda");

  assert.deepEqual(store.setTaskCompletion(task.id, true), {
    ...task,
    completed: true,
  });
  assert.deepEqual(store.setTaskCompletion(task.id, false), task);
  assert.equal(store.setTaskCompletion(999, true), null);
});

test("deletes only an existing task", () => {
  const store = createTaskStore();
  const first = store.createTask("Book a room");
  const second = store.createTask("Share the invite");

  assert.equal(store.deleteTask(first.id), true);
  assert.equal(store.deleteTask(first.id), false);
  assert.deepEqual(store.listTasks(), [second]);
});

test("rejects invalid task text and completion payloads", () => {
  assert.equal(createTaskSchema.safeParse({ text: "  " }).success, false);
  assert.equal(createTaskSchema.safeParse({ text: 42 }).success, false);
  assert.equal(
    createTaskSchema.safeParse({ text: "x".repeat(501) }).success,
    false,
  );
  assert.equal(
    createTaskSchema.safeParse({ text: " Plan the release " }).data.text,
    "Plan the release",
  );

  assert.equal(
    completionSchema.safeParse({ completed: "true" }).success,
    false,
  );
  assert.equal(completionSchema.safeParse({ completed: true }).success, true);
});

test("accepts only positive safe integer task IDs", () => {
  assert.equal(taskIdSchema.safeParse("12").data, 12);
  assert.equal(taskIdSchema.safeParse("0").success, false);
  assert.equal(taskIdSchema.safeParse("1.5").success, false);
  assert.equal(taskIdSchema.safeParse("9007199254740992").success, false);
});
