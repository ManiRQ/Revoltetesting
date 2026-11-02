export function createTaskStore() {
  const tasks = [];
  let nextId = 1;

  return {
    listTasks() {
      return tasks.map((task) => ({ ...task }));
    },

    createTask(text) {
      const task = {
        id: nextId,
        text,
        completed: false,
      };

      nextId += 1;
      tasks.push(task);

      return { ...task };
    },

    setTaskCompletion(id, completed) {
      const task = tasks.find((item) => item.id === id);

      if (!task) {
        return null;
      }

      task.completed = completed;
      return { ...task };
    },

    deleteTask(id) {
      const index = tasks.findIndex((task) => task.id === id);

      if (index === -1) {
        return false;
      }

      tasks.splice(index, 1);
      return true;
    },
  };
}
