"use strict"
//==========================================

import { 
     getTasksLocalStorage,
     setTasksLocalStorage,
     generateUniqueId,
     initSortableList,
     updateListTasks
} from "./utils.js";

const form = document.querySelector('.form');
const textareaForm = document.querySelector('.form_textarea');
const buttonSendForm = document.querySelector('.form_send-btn');
const buttonCancel = document.querySelector('.form_cancel-btn');
const output = document.querySelector('.output');

const clearCompletedButton = document.querySelector('.clear-completed-btn');

let editId = null;
let isEditTask = false;

// Отображение задач при первой загрузке страницы
updateListTasks();

// ALL EVENTLISTENERS //
form.addEventListener('submit', sendTask);

buttonCancel.addEventListener('click', resetSendForm);

clearCompletedButton.addEventListener('click', clearCompletedTasks);

output.addEventListener("dragover", initSortableList);
output.addEventListener("dragenter", event => event.preventDefault());

output.addEventListener('click', event => {
    const taskElement = event.target.closest('.task_btns');
    if (!taskElement) return;

    if (event.target.closest('.task_pinned')) {
        pinnedTask(event);
    } else if (event.target.closest('.task_edit')) {
        editTask(event);
    } else if (event.target.closest('.task_del')) {
        delTask(event);
    } else if (event.target.closest('.task_done')) {
        doneTask(event);
    }
});

// ALL FUNCTIONS //

// ОТПРАВИТЬ ЗАДАЧУ
function sendTask(event) {
    event.preventDefault();
    //Защита от пустого поля и пробелов
    const task = textareaForm.value.trim().replace(/\s+/g, ' ');
    if (!task) {
        return alert('Поле не должно быть пустым');
    }

    // 
    if(isEditTask) {
        saveEditedTask(task);
        return;
    }
    // 

    //Объект задачи
    const arrayTasksLS = getTasksLocalStorage();
    arrayTasksLS.push({
        id: generateUniqueId(),
        task,
        done: false,
        pinned: false,
        position: 1000,
    })
    //Сохранить объект
    setTasksLocalStorage(arrayTasksLS);
    updateListTasks();
    //В конце нужно очистить форму
    form.reset();
}

// ВЫПОЛНИТЬ ЗАДАЧУ
function doneTask(event) {
    //Находим нужное задание
    const task = event.target.closest('.task');
    const id = Number(task.dataset.taskId);
    //Получаем массив и находим что нужно
    const arrayTasksLS = getTasksLocalStorage();
    const index = arrayTasksLS.findIndex(task => task.id === id);
    if (index === -1) {
        return alert('Такая задача не найдена!');
    }
    // Проверка на снятие закрепа
    if (!arrayTasksLS[index].done && arrayTasksLS[index].pinned){
        arrayTasksLS[index].pinned = false;
    }
    //Проверка на выполнение
    if (arrayTasksLS[index].done) {
        arrayTasksLS[index].done = false;
    } else {
        arrayTasksLS[index].done = true;
    }
    //Сохраняем, обновляем
    setTasksLocalStorage(arrayTasksLS);
    updateListTasks();
}

// ЗАКРЕПИТЬ ЗАДАЧУ
function pinnedTask(event) {
    //Находим нужное задание
    const task = event.target.closest('.task');
    const id = Number(task.dataset.taskId);
    //Получаем массив и находим что нужно
    const arrayTasksLS = getTasksLocalStorage();
     const index = arrayTasksLS.findIndex(task => task.id === id);
     if (index === -1) {
        return alert('Такая задача не найдена!');
    }
    //Защита от выполнения
    if (!arrayTasksLS[index].pinned && arrayTasksLS[index].done) {
        return alert('Чтобы закрепить задачу, сначало уберите отметку о выполении!');
    }
    //Проверка на прикрепление
    if (arrayTasksLS[index].pinned) {
        arrayTasksLS[index].pinned = false;
    } else {
        arrayTasksLS[index].pinned = true;
    }
    //Сохраняем, обновляем
    setTasksLocalStorage(arrayTasksLS);
    updateListTasks();
}

// УДАЛИТЬ ЗАДАЧУ
function delTask(event) {
    //Находим нужное задание
    const task = event.target.closest('.task');
    const id = Number(task.dataset.taskId);
    // Сохряем в массиве все кроме того что удаляем
    const arrayTasksLS = getTasksLocalStorage();
    const newTasksArr = arrayTasksLS.filter(task => task.id !== id);
    setTasksLocalStorage(newTasksArr);
    updateListTasks();
}

// ИЗМЕНИТЬ ЗАДАЧУ
function editTask(event) {
    //Находим нужное задание и ображаемся к данным
    const task = event.target.closest('.task');
    const text = task.querySelector('.task_text');
    editId = Number(task.dataset.taskId);
    //Возвращаем текстовую форму
    textareaForm.value = text.textContent;
    isEditTask = true;
    buttonSendForm.textContent = 'Сохранить';
    buttonCancel.classList.remove('none');
    form.scrollIntoView({behavior: 'smooth'});
}

function saveEditedTask(task) {
    // Получаем массив и находим положение задачи
    const arrayTasksLS = getTasksLocalStorage();
    const editTaskIndex = arrayTasksLS.findIndex(task => task.id === editId);
    //Проверка на истиность и перезапись
    if (editTaskIndex !== -1) {
        arrayTasksLS[editTaskIndex].task = task;
        setTasksLocalStorage(arrayTasksLS);
        updateListTasks();
    } else {
        alert ('Такая задача не найдема!')
    }
    // Ресет формы
    resetSendForm();
}

// Ресет формы
function resetSendForm() {
    editId = null;
    isEditTask = false;
    buttonCancel.classList.add('none');
    buttonSendForm.textContent = 'Отправить';
    // Ресет в ресете
    form.reset();
}

// Функция для удаления всех завершенных задач
function clearCompletedTasks() {
    // Получаем текущий список задач
    const tasks = getTasksLocalStorage();
    // Фильтруем задачи, оставляя только активные
    const activeTasks = tasks.filter(task => !task.done);
    // Сохраняем обновленный список задач
    setTasksLocalStorage(activeTasks);
    // Обновляем отображение списка задач
    updateListTasks();
}