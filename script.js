// Конфигурация аутентификации
const AUTH_CONFIG = {
    username: 'admin',
    password: 'photo123'
};

// Глобальные переменные
let currentStream = null;
let isAuthenticated = false;
let photos = JSON.parse(localStorage.getItem('photos') || '[]');
let currentLocation = null;
let editorCanvas = null;
let editorCtx = null;
let isDrawing = false;
let currentTool = 'draw';
let brushSize = 3;
let brushColor = '#ff0000';
let history = [];
let historyIndex = -1;

// DOM элементы
const loginContainer = document.getElementById('login-container');
const mainContainer = document.getElementById('main-container');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');
const cameraBtn = document.getElementById('camera-btn');
const galleryBtn = document.getElementById('gallery-btn');
const cameraSection = document.getElementById('camera-section');
const gallerySection = document.getElementById('gallery-section');
const previewSection = document.getElementById('preview-section');
const editorSection = document.getElementById('editor-section');
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const captureBtn = document.getElementById('capture-btn');
const closeCameraBtn = document.getElementById('close-camera-btn');
const previewImage = document.getElementById('preview-image');
const editBtn = document.getElementById('edit-btn');
const saveBtn = document.getElementById('save-btn');
const retakeBtn = document.getElementById('retake-btn');
const photoGrid = document.getElementById('photo-grid');

// Editor elements
const editorCanvasElement = document.getElementById('editor-canvas');
const drawTool = document.getElementById('draw-tool');
const arrowTool = document.getElementById('arrow-tool');
const textTool = document.getElementById('text-tool');
const eraserTool = document.getElementById('eraser-tool');
const colorPicker = document.getElementById('color-picker');
const brushSizeSlider = document.getElementById('brush-size');
const brushSizeLabel = document.getElementById('brush-size-label');
const undoBtn = document.getElementById('undo-btn');
const redoBtn = document.getElementById('redo-btn');
const clearBtn = document.getElementById('clear-btn');
const saveEditedBtn = document.getElementById('save-edited-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    setupEventListeners();
    loadGallery();
    getCurrentLocation();
    initEditor();
});

// Получение текущей геолокации
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                currentLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: new Date().toISOString()
                };
                console.log('Геолокация получена:', currentLocation);
            },
            function(error) {
                console.warn('Ошибка получения геолокации:', error.message);
                currentLocation = null;
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000
            }
        );
    } else {
        console.warn('Геолокация не поддерживается браузером');
    }
}

// Проверка статуса аутентификации
function checkAuthStatus() {
    const authStatus = localStorage.getItem('isAuthenticated');
    if (authStatus === 'true') {
        isAuthenticated = true;
        showMainInterface();
    } else {
        showLoginInterface();
    }
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Аутентификация
    loginForm.addEventListener('submit', handleLogin);
    logoutBtn.addEventListener('click', handleLogout);
    
    // Навигация
    cameraBtn.addEventListener('click', showCameraSection);
    galleryBtn.addEventListener('click', showGallerySection);
    
    // Камера
    captureBtn.addEventListener('click', capturePhoto);
    closeCameraBtn.addEventListener('click', closeCamera);
    
    // Предварительный просмотр
    editBtn.addEventListener('click', showEditor);
    saveBtn.addEventListener('click', savePhoto);
    retakeBtn.addEventListener('click', retakePhoto);
    
    // Редактор
    setupEditorEventListeners();
}

// Настройка обработчиков редактора
function setupEditorEventListeners() {
    // Инструменты
    drawTool.addEventListener('click', () => setTool('draw'));
    arrowTool.addEventListener('click', () => setTool('arrow'));
    textTool.addEventListener('click', () => setTool('text'));
    eraserTool.addEventListener('click', () => setTool('eraser'));
    
    // Настройки
    colorPicker.addEventListener('change', (e) => {
        brushColor = e.target.value;
    });
    
    brushSizeSlider.addEventListener('input', (e) => {
        brushSize = parseInt(e.target.value);
        brushSizeLabel.textContent = brushSize + 'px';
    });
    
    // Действия
    undoBtn.addEventListener('click', undo);
    redoBtn.addEventListener('click', redo);
    clearBtn.addEventListener('click', clearCanvas);
    saveEditedBtn.addEventListener('click', saveEditedPhoto);
    cancelEditBtn.addEventListener('click', cancelEdit);
    
    // Canvas события
    editorCanvasElement.addEventListener('mousedown', startDrawing);
    editorCanvasElement.addEventListener('mousemove', draw);
    editorCanvasElement.addEventListener('mouseup', stopDrawing);
    editorCanvasElement.addEventListener('mouseout', stopDrawing);
    
    // Touch события для мобильных
    editorCanvasElement.addEventListener('touchstart', handleTouch);
    editorCanvasElement.addEventListener('touchmove', handleTouch);
    editorCanvasElement.addEventListener('touchend', stopDrawing);
}

// Инициализация редактора
function initEditor() {
    editorCanvas = editorCanvasElement;
    editorCtx = editorCanvas.getContext('2d');
    
    // Настройки canvas
    editorCtx.lineCap = 'round';
    editorCtx.lineJoin = 'round';
}

// Обработка входа
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username === AUTH_CONFIG.username && password === AUTH_CONFIG.password) {
        isAuthenticated = true;
        localStorage.setItem('isAuthenticated', 'true');
        showMainInterface();
        clearLoginForm();
    } else {
        showLoginError('Неверное имя пользователя или пароль');
    }
}

// Обработка выхода
function handleLogout() {
    isAuthenticated = false;
    localStorage.removeItem('isAuthenticated');
    showLoginInterface();
    closeCamera();
}

// Показать интерфейс входа
function showLoginInterface() {
    loginContainer.classList.remove('hidden');
    mainContainer.classList.add('hidden');
}

// Показать основной интерфейс
function showMainInterface() {
    loginContainer.classList.add('hidden');
    mainContainer.classList.remove('hidden');
}

// Очистить форму входа
function clearLoginForm() {
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    loginError.textContent = '';
}

// Показать ошибку входа
function showLoginError(message) {
    loginError.textContent = message;
    setTimeout(() => {
        loginError.textContent = '';
    }, 3000);
}

// Показать секцию камеры
async function showCameraSection() {
    hideAllSections();
    cameraSection.classList.remove('hidden');
    
    try {
        currentStream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: 'environment'
            } 
        });
        video.srcObject = currentStream;
    } catch (error) {
        alert('Не удалось получить доступ к камере. Проверьте разрешения.');
        console.error('Camera error:', error);
    }
}

// Показать секцию галереи
function showGallerySection() {
    hideAllSections();
    gallerySection.classList.remove('hidden');
    loadGallery();
}

// Скрыть все секции
function hideAllSections() {
    cameraSection.classList.add('hidden');
    gallerySection.classList.add('hidden');
    previewSection.classList.add('hidden');
    editorSection.classList.add('hidden');
}

// Закрыть камеру
function closeCamera() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
        currentStream = null;
    }
    hideAllSections();
}

// Сделать фотографию
function capturePhoto() {
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Отразить изображение по горизонтали для естественного вида
    context.scale(-1, 1);
    context.drawImage(video, -canvas.width, 0);
    
    // Сбросить трансформацию
    context.setTransform(1, 0, 0, 1, 0, 0);
    
    showPreview();
}

// Показать предварительный просмотр
function showPreview() {
    hideAllSections();
    previewSection.classList.remove('hidden');
    
    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    previewImage.src = imageData;
    
    // Показать информацию о геолокации
    showLocationInfo();
}

// Показать информацию о геолокации
function showLocationInfo() {
    let locationInfo = document.querySelector('.location-info');
    if (!locationInfo) {
        locationInfo = document.createElement('div');
        locationInfo.className = 'location-info';
        previewImage.parentNode.insertBefore(locationInfo, previewImage.nextSibling);
    }
    
    if (currentLocation) {
        locationInfo.innerHTML = `
            <span class="location-icon">📍</span>
            Координаты: ${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}
            <br>Точность: ±${Math.round(currentLocation.accuracy)}м
        `;
        locationInfo.className = 'location-info';
    } else {
        locationInfo.innerHTML = `
            <span class="location-icon">⚠️</span>
            Геолокация недоступна
        `;
        locationInfo.className = 'location-info error';
    }
}

// Показать редактор
function showEditor() {
    hideAllSections();
    editorSection.classList.remove('hidden');
    
    // Загрузить изображение в редактор
    const img = new Image();
    img.onload = function() {
        // Установить размеры canvas
        const maxWidth = 800;
        const maxHeight = 600;
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
        }
        
        editorCanvas.width = width;
        editorCanvas.height = height;
        
        // Нарисовать изображение
        editorCtx.drawImage(img, 0, 0, width, height);
        
        // Сохранить в историю
        saveToHistory();
    };
    img.src = canvas.toDataURL('image/jpeg', 0.9);
}

// Установить инструмент
function setTool(tool) {
    currentTool = tool;
    
    // Обновить активную кнопку
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tool="${tool}"]`).classList.add('active');
    
    // Изменить курсор
    switch(tool) {
        case 'draw':
        case 'eraser':
            editorCanvas.style.cursor = 'crosshair';
            break;
        case 'arrow':
            editorCanvas.style.cursor = 'pointer';
            break;
        case 'text':
            editorCanvas.style.cursor = 'text';
            break;
    }
}

// Начать рисование
function startDrawing(e) {
    isDrawing = true;
    const rect = editorCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (currentTool === 'text') {
        addText(x, y);
    } else if (currentTool === 'arrow') {
        addArrow(x, y);
    } else {
        editorCtx.beginPath();
        editorCtx.moveTo(x, y);
    }
}

// Рисование
function draw(e) {
    if (!isDrawing) return;
    
    const rect = editorCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (currentTool === 'draw') {
        editorCtx.strokeStyle = brushColor;
        editorCtx.lineWidth = brushSize;
        editorCtx.lineTo(x, y);
        editorCtx.stroke();
    } else if (currentTool === 'eraser') {
        editorCtx.globalCompositeOperation = 'destination-out';
        editorCtx.lineWidth = brushSize;
        editorCtx.lineTo(x, y);
        editorCtx.stroke();
        editorCtx.globalCompositeOperation = 'source-over';
    }
}

// Остановить рисование
function stopDrawing() {
    if (isDrawing) {
        isDrawing = false;
        saveToHistory();
    }
}

// Обработка touch событий
function handleTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent(e.type === 'touchstart' ? 'mousedown' : 
                                     e.type === 'touchmove' ? 'mousemove' : 'mouseup', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    editorCanvas.dispatchEvent(mouseEvent);
}

// Добавить текст
function addText(x, y) {
    const text = prompt('Введите текст:');
    if (text) {
        editorCtx.font = `${brushSize * 5}px Arial`;
        editorCtx.fillStyle = brushColor;
        editorCtx.fillText(text, x, y);
        saveToHistory();
    }
}

// Добавить стрелку
function addArrow(x, y) {
    const arrowLength = 50;
    const arrowAngle = Math.PI / 6;
    
    editorCtx.strokeStyle = brushColor;
    editorCtx.lineWidth = brushSize;
    editorCtx.beginPath();
    editorCtx.moveTo(x, y);
    editorCtx.lineTo(x + arrowLength, y);
    
    // Наконечник стрелки
    editorCtx.moveTo(x + arrowLength, y);
    editorCtx.lineTo(x + arrowLength - 15, y - 10);
    editorCtx.moveTo(x + arrowLength, y);
    editorCtx.lineTo(x + arrowLength - 15, y + 10);
    
    editorCtx.stroke();
    saveToHistory();
}

// Сохранить в историю
function saveToHistory() {
    historyIndex++;
    if (historyIndex < history.length) {
        history.length = historyIndex;
    }
    history.push(editorCanvas.toDataURL());
}

// Отменить
function undo() {
    if (historyIndex > 0) {
        historyIndex--;
        const img = new Image();
        img.onload = function() {
            editorCtx.clearRect(0, 0, editorCanvas.width, editorCanvas.height);
            editorCtx.drawImage(img, 0, 0);
        };
        img.src = history[historyIndex];
    }
}

// Повторить
function redo() {
    if (historyIndex < history.length - 1) {
        historyIndex++;
        const img = new Image();
        img.onload = function() {
            editorCtx.clearRect(0, 0, editorCanvas.width, editorCanvas.height);
            editorCtx.drawImage(img, 0, 0);
        };
        img.src = history[historyIndex];
    }
}

// Очистить canvas
function clearCanvas() {
    if (confirm('Очистить все изменения?')) {
        editorCtx.clearRect(0, 0, editorCanvas.width, editorCanvas.height);
        saveToHistory();
    }
}

// Сохранить отредактированную фотографию
function saveEditedPhoto() {
    // Обновить canvas с отредактированным изображением
    const editedImageData = editorCanvas.toDataURL('image/jpeg', 0.9);
    
    // Создать новый canvas для финального изображения
    const finalCanvas = document.createElement('canvas');
    const finalCtx = finalCanvas.getContext('2d');
    finalCanvas.width = canvas.width;
    finalCanvas.height = canvas.height;
    
    // Нарисовать оригинальное изображение
    const originalImg = new Image();
    originalImg.onload = function() {
        finalCtx.drawImage(originalImg, 0, 0);
        
        // Нарисовать отредактированное изображение поверх
        const editedImg = new Image();
        editedImg.onload = function() {
            finalCtx.drawImage(editedImg, 0, 0, canvas.width, canvas.height);
            
            // Обновить основной canvas
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            canvas.getContext('2d').drawImage(finalCanvas, 0, 0);
            
            // Вернуться к предварительному просмотру
            showPreview();
        };
        editedImg.src = editedImageData;
    };
    originalImg.src = canvas.toDataURL('image/jpeg', 0.9);
}

// Отменить редактирование
function cancelEdit() {
    showPreview();
}

// Сохранить фотографию
function savePhoto() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `photo_${timestamp}.jpg`;
    
    // Конвертировать canvas в blob
    canvas.toBlob(function(blob) {
        const photoData = {
            id: Date.now(),
            filename: filename,
            data: canvas.toDataURL('image/jpeg', 0.9),
            timestamp: new Date().toISOString(),
            size: blob.size,
            location: currentLocation
        };
        
        photos.unshift(photoData);
        localStorage.setItem('photos', JSON.stringify(photos));
        
        alert('Фотография сохранена!');
        showGallerySection();
    }, 'image/jpeg', 0.9);
}

// Переснять фотографию
function retakePhoto() {
    showCameraSection();
}

// Загрузить галерею
function loadGallery() {
    photoGrid.innerHTML = '';
    
    if (photos.length === 0) {
        photoGrid.innerHTML = '<p style="text-align: center; color: #666; grid-column: 1/-1;">Нет сохраненных фотографий</p>';
        return;
    }
    
    photos.forEach(photo => {
        const photoItem = createPhotoItem(photo);
        photoGrid.appendChild(photoItem);
    });
}

// Создать элемент фотографии
function createPhotoItem(photo) {
    const item = document.createElement('div');
    item.className = 'photo-item';
    
    const img = document.createElement('img');
    img.src = photo.data;
    img.alt = photo.filename;
    
    const info = document.createElement('div');
    info.className = 'photo-info';
    
    const title = document.createElement('h3');
    title.textContent = photo.filename;
    
    const date = document.createElement('p');
    date.textContent = new Date(photo.timestamp).toLocaleString('ru-RU');
    
    const size = document.createElement('p');
    size.textContent = formatFileSize(photo.size);
    
    // Метаданные
    const metadata = document.createElement('div');
    metadata.className = 'photo-metadata';
    
    if (photo.location) {
        const locationItem = document.createElement('div');
        locationItem.className = 'metadata-item';
        locationItem.innerHTML = `
            <span>📍 Координаты:</span>
            <span>${photo.location.latitude.toFixed(4)}, ${photo.location.longitude.toFixed(4)}</span>
        `;
        metadata.appendChild(locationItem);
        
        const accuracyItem = document.createElement('div');
        accuracyItem.className = 'metadata-item';
        accuracyItem.innerHTML = `
            <span>🎯 Точность:</span>
            <span>±${Math.round(photo.location.accuracy)}м</span>
        `;
        metadata.appendChild(accuracyItem);
    }
    
    const actions = document.createElement('div');
    actions.className = 'photo-actions';
    
    const downloadBtn = document.createElement('button');
    downloadBtn.textContent = '📥 Скачать';
    downloadBtn.onclick = () => downloadPhoto(photo);
    
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑️ Удалить';
    deleteBtn.style.background = '#e74c3c';
    deleteBtn.onclick = () => deletePhoto(photo.id);
    
    actions.appendChild(downloadBtn);
    actions.appendChild(deleteBtn);
    
    info.appendChild(title);
    info.appendChild(date);
    info.appendChild(size);
    if (metadata.children.length > 0) {
        info.appendChild(metadata);
    }
    info.appendChild(actions);
    
    item.appendChild(img);
    item.appendChild(info);
    
    return item;
}

// Скачать фотографию
function downloadPhoto(photo) {
    const link = document.createElement('a');
    link.href = photo.data;
    link.download = photo.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Удалить фотографию
function deletePhoto(photoId) {
    if (confirm('Вы уверены, что хотите удалить эту фотографию?')) {
        photos = photos.filter(photo => photo.id !== photoId);
        localStorage.setItem('photos', JSON.stringify(photos));
        loadGallery();
    }
}

// Форматировать размер файла
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
