"use client";

import { useState } from "react";
import styles from "./TaskBoard.module.css";

type ColumnId = "todo" | "doing" | "done";
type Task = { id: number; title: string; column: ColumnId };

const columns: { id: ColumnId; label: string }[] = [
  { id: "todo", label: "To do" },
  { id: "doing", label: "In progress" },
  { id: "done", label: "Done" },
];

export default function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([{ id: 1, title: "Write brief", column: "todo" }]);
  const [draft, setDraft] = useState("");
  const [nextId, setNextId] = useState(2);

  function add(event: React.FormEvent) {
    event.preventDefault();
    const title = draft.trim();
    if (!title) return;
    setTasks((all) => [...all, { id: nextId, title, column: "todo" }]);
    setNextId((n) => n + 1);
    setDraft("");
  }

  function move(id: number, direction: 1 | -1) {
    setTasks((all) =>
      all.map((task) => {
        if (task.id !== id) return task;
        const target = columns[columns.findIndex((c) => c.id === task.column) + direction];
        return target ? { ...task, column: target.id } : task;
      }),
    );
  }

  return (
    <div className={styles.board}>
      <form onSubmit={add} className={styles.form}>
        <label htmlFor="new-task" className="visually-hidden">New task</label>
        <input id="new-task" className={styles.input} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="New task" />
        <button type="submit" className="btn btn--primary">Add task</button>
      </form>
      <div className={styles.columns}>
        {columns.map((column, index) => (
          <section key={column.id} aria-label={column.label} className={styles.column}>
            <h3 className={styles.heading} aria-hidden="true">{column.label}</h3>
            <ul className={styles.list}>
              {tasks.filter((t) => t.column === column.id).map((task) => (
                <li key={task.id} className={styles.card}>
                  <span>{task.title}</span>
                  <span className={styles.moves}>
                    <button type="button" className={styles.move} aria-label={`Move ${task.title} left`} disabled={index === 0} onClick={() => move(task.id, -1)}>←</button>
                    <button type="button" className={styles.move} aria-label={`Move ${task.title} right`} disabled={index === columns.length - 1} onClick={() => move(task.id, 1)}>→</button>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
