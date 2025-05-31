import { useEffect, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

dayjs.extend(relativeTime);

export function CreateTodo() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.body.style.backgroundColor = darkMode ? "#121212" : "#fff";
    document.body.style.color = darkMode ? "#fff" : "#000";
  }, [darkMode]);

  const fetchTodos = async () => {
    const res = await fetch("http://localhost:3000/todos");
    const data = await res.json();
    setTodos(data.todos || []);
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const createTodo = async () => {
    if (!title || !description) return toast.warn("Please fill all fields");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/todo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      if (res.ok) {
        toast.success("✅ Todo created");
        setTitle("");
        setDescription("");
        fetchTodos();
      } else {
        toast.error("❌ Failed to create todo");
      }
    } catch (err) {
      toast.error("❌ Error: " + err.message);
    }
    setLoading(false);
  };

  const updateTodo = async () => {
    if (!title || !description) return toast.warn("Please fill all fields");
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/todos/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      if (res.ok) {
        toast.success("✅ Todo updated");
        setTitle("");
        setDescription("");
        setIsEditing(false);
        setEditId(null);
        fetchTodos();
      } else {
        toast.error("❌ Failed to update todo");
      }
    } catch (err) {
      toast.error("❌ " + err.message);
    }
    setLoading(false);
  };

  const handleEdit = (todo) => {
    setIsEditing(true);
    setEditId(todo._id);
    setTitle(todo.title);
    setDescription(todo.description);
  };

  const markAsDone = async (id) => {
    await fetch("http://localhost:3000/completed", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    toast.success("✅ Marked as done");
    fetchTodos();
  };

  const handleDelete = async (id) => {
  
    if (!confirm) return;
    try {
      const res = await fetch(`http://localhost:3000/todos/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("🗑️ Todo deleted");
      setTodos((prev) => prev.filter((todo) => todo._id !== id));
    } catch (err) {
      toast.error("❌ " + err.message);
    }
  };

  const formatTime = (date) => dayjs(date).fromNow();

  const filteredTodos = todos.filter((todo) => {
    if (filter === "all") return true;
    if (filter === "completed") return todo.completed;
    if (filter === "pending") return !todo.completed;
  });

  return (
    <div style={{ padding: 20, maxWidth: 700, margin: "auto", fontSize: "18px" }}>
      <ToastContainer position="top-right" />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>{isEditing ? "Edit Todo" : "Create Todo"}</h2>
        <button onClick={() => setDarkMode(!darkMode)} style={{ fontSize: 18 }}>
          {darkMode ? "☀️ Light" : "🌙 Dark"}
        </button>
      </div>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        style={{ margin: 8, padding: 12, width: "100%", fontSize: 16 }}
      />
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        style={{ margin: 8, padding: 12, width: "100%", fontSize: 16 }}
      />
      <button
        onClick={isEditing ? updateTodo : createTodo}
        disabled={loading}
        style={{ padding: 12, fontSize: 16 }}
      >
        {loading ? (isEditing ? "Updating..." : "Creating...") : isEditing ? "Update Todo" : "Add Todo"}
      </button>

      <div style={{ marginTop: 20, marginBottom: 20 }}>
        <button onClick={() => setFilter("all")} style={{ marginRight: 8 }}>All</button>
        <button onClick={() => setFilter("pending")} style={{ marginRight: 8 }}>Pending</button>
        <button onClick={() => setFilter("completed")}>Completed</button>
      </div>

      <h2>Todos</h2>
      {filteredTodos.length === 0 && (
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <img
            src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
            alt="Empty"
            style={{ width: 120, opacity: 0.6 }}
          />
          <p>No todos found</p>
        </div>
      )}

      {filteredTodos.map((todo) => (
        <div
          key={todo._id}
          style={{
            padding: 16,
            margin: "12px 0",
            border: "1px solid #ccc",
            borderRadius: 8,
            backgroundColor: todo.completed ? "#e0ffe0" : "#fff",
            color: darkMode ? "#000" : undefined,
          }}
        >
          <h3 style={{ fontSize: 20 }}>{todo.title}</h3>
          <p>{todo.description}</p>
          <small>Added {formatTime(todo.createdAt)}</small>
          <p>Status: {todo.completed ? "✅ Done" : "🕒 Pending"}</p>
          {!todo.completed && (
            <button onClick={() => markAsDone(todo._id)} style={{ marginRight: 10 }}>
              Mark as Done ✅
            </button>
          )}
          <button onClick={() => handleEdit(todo)} style={{ marginRight: 10 }}>
            Edit ✏️
          </button>
          <button onClick={() => handleDelete(todo._id)}>Delete ❌</button>
        </div>
      ))}
    </div>
  );
}
