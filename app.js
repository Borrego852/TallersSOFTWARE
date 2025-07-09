document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('todo-form');
    const input = document.getElementById('todo-input');
    const list = document.getElementById('todo-list');

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const text = input.value.trim();
        if (text !== '') {
            addTodo(text);
            input.value = '';
        }
    });

    function addTodo(text) {
        const li = document.createElement('li');
        li.textContent = text;
        const delBtn = document.createElement('button');
        delBtn.textContent = 'Eliminar';
        delBtn.className = 'delete-btn';
        delBtn.onclick = function() {
            list.removeChild(li);
        };
        li.appendChild(delBtn);
        list.appendChild(li);
    }
});
