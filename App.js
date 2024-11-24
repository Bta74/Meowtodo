import React, { useState, useEffect } from "react";
import "./styles.css";

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [color, setColor] = useState("#e0e0e0");
  const [dateTime, setDateTime] = useState("");
  const [completedTasks, setCompletedTasks] = useState([]);
  const [deletedTasks, setDeletedTasks] = useState([]);
  const [isTrashOpen, setIsTrashOpen] = useState(false);
  const [showSubtasks, setShowSubtasks] = useState({});

  // Add a new task
  const addTask = () => {
    if (newTask.trim() === "") return;
    const task = {
      id: Date.now(),
      title: newTask,
      color: color,
      dateTime: dateTime,
      completed: false,
      subtasks: [],
    };
    setTasks([...tasks, task]);
    setNewTask("");
    setDateTime("");
  };

  // Add a subtask to a specific task
  const addSubtask = (taskId, subtaskTitle) => {
    if (subtaskTitle.trim() === "") return;
    const updatedTasks = tasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            subtasks: [
              ...task.subtasks,
              { id: Date.now(), title: subtaskTitle, completed: false },
            ],
          }
        : task
    );
    setTasks(updatedTasks);
  };

  // Toggle task completion
  const toggleComplete = (taskId) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
  };

  // Toggle subtask completion
  const toggleSubtaskComplete = (taskId, subtaskId) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === taskId) {
        return {
          ...task,
          subtasks: task.subtasks.map((subtask) =>
            subtask.id === subtaskId
              ? { ...subtask, completed: !subtask.completed }
              : subtask
          ),
        };
      }
      return task;
    });
    setTasks(updatedTasks);
  };

  // Toggle visibility of subtasks
  const toggleSubtaskVisibility = (taskId) => {
    setShowSubtasks({
      ...showSubtasks,
      [taskId]: !showSubtasks[taskId],
    });
  };

  // Delete a task and move it to trash
  const deleteTask = (taskId) => {
    const taskToDelete = tasks.find((task) => task.id === taskId);
    if (taskToDelete) {
      setDeletedTasks([...deletedTasks, taskToDelete]);
      setTasks(tasks.filter((task) => task.id !== taskId));
    }
  };

  // Restore a task from trash
  const restoreTask = (taskId) => {
    const taskToRestore = deletedTasks.find((task) => task.id === taskId);
    if (taskToRestore) {
      setTasks([...tasks, taskToRestore]);
      setDeletedTasks(
        deletedTasks.filter((task) => task.id !== taskToRestore.id)
      );
    }
  };

  // Permanently delete a task from trash
  const permanentlyDeleteTask = (taskId) => {
    setDeletedTasks(deletedTasks.filter((task) => task.id !== taskId));
  };

  // Empty the trash
  const emptyTrash = () => {
    setDeletedTasks([]);
  };

  // Check for reminders
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      tasks.forEach((task) => {
        if (
          task.dateTime &&
          new Date(task.dateTime).getTime() <= now.getTime() &&
          !task.completed
        ) {
          alert(`Reminder: ${task.title}`);
        }
      });
    }, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [tasks]);

  return (
    <div className="App">
      <header>
        <h1 className="app-title">Meowtodo</h1>
        <div className="input-container">
          <input
            type="text"
            placeholder="Add a new task..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
          />
          <div className="color-picker">
            <label htmlFor="color">🎨</label>
            <input
              type="color"
              id="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </div>
          <div className="date-time-picker">
            <label htmlFor="datetime">🕰️📆</label>
            <input
              type="datetime-local"
              id="datetime"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
            />
          </div>
          <button onClick={addTask}>Add</button>
        </div>
        <div
          className="trash-icon"
          onClick={() => setIsTrashOpen(!isTrashOpen)}
        >
          🗑️
        </div>
      </header>

      <main>
        {!isTrashOpen && (
          <div className="tasks">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`task ${task.completed ? "completed" : ""}`}
                style={{ backgroundColor: task.color }}
              >
                <div
                  onClick={() => toggleComplete(task.id)}
                  className="task-title"
                >
                  {task.title}
                </div>
                {task.dateTime && (
                  <span
                    className="task-datetime"
                    onClick={() =>
                      alert(`Due: ${new Date(task.dateTime).toLocaleString()}`)
                    }
                  >
                    🕰️
                  </span>
                )}
                <button onClick={() => deleteTask(task.id)}>🗑️</button>
                <button
                  className="toggle-subtasks"
                  onClick={() => toggleSubtaskVisibility(task.id)}
                >
                  {showSubtasks[task.id] ? "Hide Subtasks" : "Show Subtasks"}
                </button>
                {showSubtasks[task.id] && (
                  <div className="subtasks">
                    {task.subtasks.map((subtask) => (
                      <div
                        key={subtask.id}
                        className={`subtask ${
                          subtask.completed ? "completed" : ""
                        }`}
                        onClick={() =>
                          toggleSubtaskComplete(task.id, subtask.id)
                        }
                      >
                        {subtask.title}
                      </div>
                    ))}
                    <input
                      type="text"
                      placeholder="Add subtask..."
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          addSubtask(task.id, e.target.value);
                          e.target.value = "";
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {isTrashOpen && (
          <div className="trash-bin">
            {deletedTasks.length > 0 ? (
              <>
                {deletedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="deleted-task"
                    style={{ backgroundColor: task.color }}
                  >
                    <span>{task.title}</span>
                    <button onClick={() => restoreTask(task.id)}>
                      ♻️ Restore
                    </button>
                    <button onClick={() => permanentlyDeleteTask(task.id)}>
                      ❌ Delete
                    </button>
                  </div>
                ))}
                <button className="empty-trash" onClick={emptyTrash}>
                  Empty Trash
                </button>
              </>
            ) : (
              <p className="trash-empty">Trash is empty</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
