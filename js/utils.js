import { doneSvg, pinnedSvg, delSvg, editSvg } from "./svg.js";


//LOCAL STORAGE//
//ПОЛУЧАЕМ ДАННЫЕ ЕСЛИ ЕСТЬ ПАРСИМ В МАССИВ
export function getTasksLocalStorage() {
    const tasksJSON = localStorage.getItem('tasks');
    return tasksJSON ? JSON.parse(tasksJSON) : [];
}
//СОХРАНЯЕМ МАССИВ
export function setTasksLocalStorage(tasks) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}
//ГЕНЕРИРУЕМ ID
export function generateUniqueId() {
    const timestamp = Date.now();
    const randomPart = Math.floor(Math.random() * 10000);
    const randomPartTwo = Math.floor(Math.random() * 10000);
    return timestamp + randomPart + randomPartTwo;
}
//ОБНОВЛЕНИЕ РАЗМЕТКИ
export function updateListTasks() {
    document.querySelector('.output').textContent = ''
    const arrayTasksLS = getTasksLocalStorage();
    renderTasks(arrayTasksLS);
}



// Добавляем обработчики для кнопок фильтрации
const filterButtons = document.querySelectorAll('.filter-btn');
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Убираем активный класс у всех кнопок
        filterButtons.forEach(btn => btn.classList.remove('active'));
        // Добавляем активный класс к выбранной кнопке
        button.classList.add('active');
        // Получаем тип фильтра
        const filter = button.dataset.filter;
        // Фильтруем задачи
        filterTasks(filter);
    });
});

// Функция для фильтрации задач
function filterTasks(filter) {
    const tasks = getTasksLocalStorage();
    let filteredTasks = [];

    if (filter === 'all') {
        filteredTasks = tasks;
    } else if (filter === 'active') {
        filteredTasks = tasks.filter(task => !task.done);
    } else if (filter === 'completed') {
        filteredTasks = tasks.filter(task => task.done);
    } else {
        filteredTasks = tasks;
    }

    // Очищаем текущий список задач
    document.querySelector('.output').innerHTML = '';
    // Отображаем отфильтрованные задачи
    renderTasks(filteredTasks);
}

//ОТОБРОЖЕНИЕ ЗАДАЧ//
function renderTasks(tasks) {
    //Если не ложное или путое
    if (!tasks || !tasks.length) return;
    // То сортируем, сперва идут по заполнению, потом по закреплению
    tasks.sort((a, b) => {
        if (a.done !== b.done) {
            return a.done ? 1 : -1;
        }
        if (a.pinned !== b.pinned) {
            return a.pinned ? -1 : 1;
        }
        return a.position - b.position;
    })
    // Отображаем задачи подряд
    .forEach((value, i) => {
        const { id, task, pinned, done } = value;
        const item = `
            <div class="task ${done ? 'done' : ''} ${pinned ? 'pinned' : ''}" data-task-id="${id}" draggable="true">
                <p class="task_text">${task}</p>
                <span class="task_index ${done ? 'none' : ''}">${i + 1}</span>
                <div class="task_btns">
                    <button class="task_done ${done ? 'active' : ''}">${doneSvg}</button>
                    <button class="task_pinned ${pinned ? 'active' : ''}">${pinnedSvg}</button>
                    <button class="task_edit">${editSvg}</button>
                    <button class="task_del">${delSvg}</button>
                </div>
            </div>
        `;
        document.querySelector('.output').insertAdjacentHTML('beforeend', item);
    });

    activationDrag();
}

// ФУНКЦИЯ ТАСКАНИЯ
function activationDrag() {
    // Преабразуем в массив
    const tasks = [...document.querySelectorAll('.task')];
    // Какой-то пиздец со статусами таскания
    tasks.forEach(item => {
        item.addEventListener("dragstart", () =>{
            setTimeout(() => item.classList.add("dragging"),0);
        });
        item.addEventListener("dragend", () => {
            item.classList.remove("dragging");
            if (tasks.length > 1) {
                savePositionTask();
            }
        });
    });
}

// ФУНКЦИЯ СОХРАНЕНИЯ ПОЗИЦИЙ ПРИ ТАСКАНИИ
function savePositionTask() {
    //
    const arrayTasksLS = getTasksLocalStorage();
    const tasks = [...document,querySelectorAll('.task')];
    //
    tasks.forEach((item, i) => {
        const id = Number(item.dataset.taskId);
        const index = arrayTasksLS.findIndex(value => value.id === id);
        if (index !== -1) {
            arrayTasksLS[index].position = i;
        }
    });
    //
    setTasksLocalStorage(arrayTasksLS);
    updateListTasks();
}

export function initSortableList(event) {
    event.preventDefault();
    //
    const output = document.querySelector('.output');
    const draggingItem = document.querySelector(".dragging");
    let siblings = [...output.querySelectorAll(".task:not(.dragging)")];
    //
    let nextSibling = siblings.find(sibling => {
        return event.clientY <= sibling.offsetTop + sibling.offsetHeight / 2;
    });
    //
    output.insertBefore(draggingItem, nextSibling);
}