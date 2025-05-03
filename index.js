import express from "express";
import { writeFile, readFile } from "node:fs/promises";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express()

app.use(express.json());
app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TODOS_FILE_PATH = path.resolve(__dirname, "./assets/todos.json");


const getTodos = async () => {
    try {
        const fsResponse = await readFile(TODOS_FILE_PATH, "utf-8");
        const todos = JSON.parse(fsResponse);
        return todos;
    } catch (error) {
        console.error("Error reading todos.json:", error.message);
        return [];
    }
};
app.get('/api/', async (req, res) => {
    const todos = await getTodos();
    res.json(todos)
});

app.listen(3000, console.log('Listening on port 3000'))

app.get('/api/:id', async (req, res) => {

    try {
        const id = req.params.id;
        const todos = await getTodos();
        const todo = todos.find((todo) => todo.id == id);

        if (!todo) {
            return res.status(404).json({ message: "Todo not found" })
        }
        res.json(todo);
    } catch (error) {
        res.status(500).json({ message: "Error reading todo", error: error.message });
    }
})


app.post('/api/', async (req, res) => {
    try {
        const { title } = req.body;
        if (!title) {
            return res.status(400).json({ message: "Title is required" });
        }
        const id = Date.now();
        const newTodo = { id: Date.now(), title, done: false };

        let todos = await getTodos();
        todos.push(newTodo);
        await writeFile(TODOS_FILE_PATH, JSON.stringify(todos));

        res.status(201).json(newTodo);
    } catch (error) {
        res.status(500).json({ message: "Error creating todo", error: error.message });
    }
});


app.put('/api/:id', async (req, res) => {
    try {
        const id = req.params.id;

        let todos = await getTodos();
        const todo = todos.find((todo) => todo.id == id);

        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }

        todos = todos.map((todo) => {
            if (todo.id == id) {
                return { ...todo, done: !todo.done };
            }
            return todo;
        })

        await writeFile(TODOS_FILE_PATH, JSON.stringify(todos));

        
        res.status(200).json(todos);
    } catch (error) {
        res.status(500).json({ message: "Error updating todo", error: error.message });
    }
});

app.delete('/api/clear-completed', async (req, res) => {
    try {
      let todos = await getTodos();
      todos = todos.filter((todo) => !todo.done);
  
      await writeFile(TODOS_FILE_PATH, JSON.stringify(todos));
  
      res.status(200).json({ message: "Completed todos cleared", todos });
    } catch (error) {
      res.status(500).json({ message: "Error clearing completed todos", error: error.message });
    }
  });

app.delete('/api/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        let todos = await getTodos();

        const todo = todos.find((todo) => todo.id == id);

        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' })
        }
        todos = todos.filter((todo) => todo.id !== id);

        await writeFile(TODOS_FILE_PATH, JSON.stringify(todos));

        res.status(200).json({ message: "Todo deleted", todos });
    } catch (error) {

        res.status(500).json({ message: "Error deleting todo", error: error.message });
    }

})

