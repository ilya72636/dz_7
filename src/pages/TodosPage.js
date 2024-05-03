import React, { useEffect, useState, useRef } from 'react';

function TodosPage(props) {
    const [todos, setTodos] = useState([]);
    const [input, setInput] = useState('');
    const [selectedTodo, setSelectedTodo] = useState(null);
    const inputRef = useRef(null); // Реф для поля ввода

    async function getTodos() {
        const response = await fetch('http://localhost:8000/todos');
        const data = await response.json();
        setTodos(data);
    }

    async function createOrUpdateTodo() {
        let response;
        if (selectedTodo) {
            // Обновление существующей задачи
            const updatedTodo = {
                ...selectedTodo,
                title: input,
            };
            response = await fetch(`http://localhost:8000/todos/${selectedTodo.id}`, {
                method: "PATCH",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedTodo)
            });
        } else {
            // Создание новой задачи
            const newTodo = {
                title: input,
                status: false
            };
            response = await fetch('http://localhost:8000/todos', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newTodo)
            });
        }

        if (response.ok) {
            getTodos();
            setSelectedTodo(null); // Сброс выбранной задачи
            setInput(""); // Сброс Input после создания/обновления задачи
        }
    }

    async function deleteTodo(id) {
        const response = await fetch(`http://localhost:8000/todos/${id}`, {
            method: "DELETE"
        });

        if (response.ok) {
            getTodos();
        }
    }

    async function changeStatus(id, status) {
        const todo = {
            status: status
        };

        const response = await fetch(`http://localhost:8000/todos/${id}`, {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(todo)
        });

        if (response.ok) {
            getTodos();
        }
    }

    function handleUpdateClick(todo) {
        setSelectedTodo(todo);
        setInput(todo.title); // Устанавливаем текущий заголовок задачи в Input
        // Устанавливаем фокус на поле ввода при нажатии на кнопку "Update"
        inputRef.current.focus();
    }

    useEffect(() => {
        getTodos();
    }, []);

    return (
        <div style={{ padding: '30px' }}>
            <h1>Todos</h1>
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    createOrUpdateTodo();
                }}
            >
                <input
                    ref={inputRef} // Привязываем реф к полю ввода
                    value={input}
                    type="text"
                    onChange={(event) => setInput(event.target.value)}
                />
                <button type="submit">{selectedTodo ? "Update" : "Create Todo"}</button>
            </form>
            {todos.map((todo) => (
                <p key={todo.id} className={todo.status ? 'line' : ''}>
                    <input
                        type="checkbox"
                        checked={todo.status}
                        onChange={(event) => changeStatus(todo.id, event.target.checked)}
                    />
                    {selectedTodo && selectedTodo.id === todo.id ? (
                        // Поле ввода только для выбранной задачи
                        <input
                            ref={inputRef} // Привязываем реф к полю ввода
                            value={input}
                            type="text"
                            onChange={(event) => setInput(event.target.value)}
                        />
                    ) : (
                        todo.title
                    )}
                    <button onClick={() => deleteTodo(todo.id)}>Delete</button>
                    <button onClick={() => handleUpdateClick(todo)}>Update</button>
                </p>
            ))}
        </div>
    );
}

export default TodosPage;
