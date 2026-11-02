import { useRef, useState, type FormEvent } from 'react'
import './App.css'

type Task = {
  id: number
  text: string
  completed: boolean
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [taskText, setTaskText] = useState('')
  const nextTaskId = useRef(1)
  const completedTaskCount = tasks.filter((task) => task.completed).length

  function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const text = taskText.trim()
    if (!text) {
      return
    }

    const task: Task = {
      id: nextTaskId.current,
      text,
      completed: false,
    }

    nextTaskId.current += 1
    setTasks((currentTasks) => [...currentTasks, task])
    setTaskText('')
  }

  function toggleTask(taskId: number) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    )
  }

  function deleteTask(taskId: number) {
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId))
  }

  return (
    <main className="page-shell">
      <section className="todo-sheet" aria-labelledby="page-title">
        <header className="page-header">
          <div className="heading-copy">
            <p className="eyebrow">A LITTLE SPACE TO THINK</p>
            <h1 id="page-title">Today’s list</h1>
            <p className="page-intro">One thing at a time.</p>
          </div>
          <div className="task-counts" aria-live="polite">
            <p className="task-count is-total">
              <span className="count-number">{tasks.length}</span>
              <span className="count-label">total</span>
            </p>
            <p className="task-count">
              <span className="count-number">{completedTaskCount}</span>
              <span className="count-label">completed</span>
            </p>
          </div>
        </header>

        <form className="task-form" onSubmit={addTask}>
          <label className="form-label" htmlFor="new-task">
            Add a task
          </label>
          <div className="form-controls">
            <input
              autoComplete="off"
              id="new-task"
              onChange={(event) => setTaskText(event.target.value)}
              placeholder="What’s on your mind?"
              value={taskText}
            />
            <button className="add-button" disabled={!taskText.trim()} type="submit">
              <span className="add-icon" aria-hidden="true">
                +
              </span>
              Add task
            </button>
          </div>
        </form>

        <section className="task-section" aria-labelledby="tasks-heading">
          <div className="section-heading">
            <h2 id="tasks-heading">Your tasks</h2>
            <p>{tasks.length === 0 ? 'A fresh start' : `${tasks.length} total`}</p>
          </div>

          {tasks.length === 0 ? (
            <div className="empty-state">
              <span className="empty-mark" aria-hidden="true">
                ✓
              </span>
              <p className="empty-title">Nothing on the list yet</p>
              <p className="empty-copy">
                Add your first task and make a little room in your head.
              </p>
            </div>
          ) : (
            <ul className="task-list" aria-label="Your tasks">
              {tasks.map((task) => (
                <li
                  className={`task-row${task.completed ? ' is-completed' : ''}`}
                  key={task.id}
                >
                  <label className="task-label">
                    <input
                      aria-label={`Mark ${task.text} as completed`}
                      checked={task.completed}
                      className="task-checkbox"
                      onChange={() => toggleTask(task.id)}
                      type="checkbox"
                    />
                    <span className="task-text">{task.text}</span>
                  </label>
                  <button
                    aria-label={`Delete ${task.text}`}
                    className="delete-button"
                    onClick={() => deleteTask(task.id)}
                    type="button"
                  >
                    <svg aria-hidden="true" viewBox="0 0 20 20" focusable="false">
                      <path d="M4.5 6.5h11m-9.5 0 .6 9h7l.6-9M8 6.5V4h4v2.5m-3 2.2v4.8m2-4.8v4.8" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {tasks.length > 0 && (
          <p className="completion-note" aria-live="polite">
            {completedTaskCount === tasks.length
              ? 'Everything on your list is done.'
              : `${completedTaskCount} completed so far`}
          </p>
        )}
      </section>
      <p className="page-footnote">A clear list, a lighter mind.</p>
    </main>
  )
}

export default App
