# Village Builder - Полная техническая документация

## Обзор проекта

Village Builder - это градостроительная симуляция, разработанная на Phaser.js 3. Игра реализует автоматизированную систему производства ресурсов, где рабочие самостоятельно управляют производственным циклом: производят ресурсы в зданиях, транспортируют их на склад и возвращаются для нового цикла. Все движение рабочих основано на алгоритме A* (через библиотеку EasyStar.js) с автоматическим обходом препятствий.

**Жанр:** Idle/Incremental city builder
**Платформа:** Web (HTML5)
**Движок:** Phaser.js 3.90.0
**Язык:** JavaScript (ES6+)
**Размер карты:** 200x200 клеток (5000x5000 пикселей)
**Размер клетки:** 25x25 пикселей
**Управление:** WASD для перемещения камеры

## Что реализовано

### Основной функционал
- ✅ **Большая карта:** 200x200 клеток (5000x5000 пикселей)
- ✅ **Управление камерой:** WASD для свободного перемещения по карте
- ✅ **Полноэкранный режим:** Игра занимает весь экран браузера, адаптируется под размер окна
- ✅ **Техническая разметка:** Сетка секторов 20x20 клеток с метками "Ряд:Колонка" для ориентации
- ✅ **Интерактивное размещение зданий:** Клик по кнопке → полупрозрачный призрак под курсором → выбор места на карте
- ✅ **Валидация размещения:** Зеленый = можно поставить, красный = занято
- ✅ **Pathfinding через EasyStar.js:** Рабочие обходят здания по оптимальному пути
- ✅ **Визуализация пути:** Полупрозрачные линии показывают маршрут рабочего
- ✅ **State machine для рабочих:** 4 состояния (IDLE, PRODUCING, CARRYING, RETURNING)
- ✅ **Автоматическое назначение:** Рабочие привязываются к новым зданиям автоматически
- ✅ **Управление скоростью игры:** x1, x2, x3, x5, x7 (влияет на производство и движение)
- ✅ **Фиксированный UI:** Панели ресурсов и строительства прикреплены к краям экрана

### Стартовая сцена
- **Замок 3x3** по центру карты (100:100)
- **Склад 2x2** справа от замка
- **Очаг 1x1** слева от замка
- **5 рабочих** появляются около очага
- **Камера автоматически центрируется** на замок при запуске

### Здания
- **Замок** (3x3) - центр деревни, коричневый
- **Склад** (2x2) - хранилище ресурсов, темно-коричневый
- **Очаг** (1x1) - место появления рабочих, оранжевый
- **Теплица** (3x1) - производит помидоры за 2 секунды, зеленый

## Архитектура

Проект построен по паттерну **Manager + Entity** с четким разделением ответственности:

```
src/
├── config/
│   ├── Constants.js      # Константы игры
│   └── GameConfig.js     # Конфигурация Phaser
├── managers/             # Менеджеры игровых систем
│   ├── GridManager.js
│   ├── PathfindingManager.js
│   ├── ResourceManager.js
│   ├── BuildingManager.js
│   ├── WorkerManager.js
│   ├── PlacementManager.js
│   └── UIManager.js
├── entities/             # Игровые объекты
│   ├── Building.js       # Базовый класс зданий
│   ├── BuildingGhost.js  # Призрак здания при размещении
│   ├── Worker.js         # Рабочий с state machine
│   └── buildings/        # Конкретные типы зданий
│       ├── Castle.js
│       ├── Storage.js
│       ├── Campfire.js
│       └── Greenhouse.js
├── scenes/
│   └── GameScene.js      # Главная игровая сцена
└── main.js               # Точка входа
```

### Менеджеры - подробное описание

Менеджеры - это singleton-объекты, которые управляют различными аспектами игры. Каждый менеджер имеет одну четкую ответственность (Single Responsibility Principle) и взаимодействует с другими менеджерами через публичные методы.

#### GridManager - Система сеточной навигации

**Назначение:**
Управляет игровой сеткой размером 40x40 клеток. Каждая клетка имеет размер 25x25 пикселей. GridManager отвечает за отслеживание того, какие клетки заняты зданиями, а какие доступны для прохода рабочих.

**Внутреннее устройство:**
```javascript
this.grid = [
  [0, 0, 0, 1, 1, ...],  // 0 = проходимо, 1 = занято
  [0, 0, 0, 1, 1, ...],
  ...
]
```

**Ключевые методы:**

1. `occupyArea(gridX, gridY, width, height)`
   - **Когда вызывается:** При создании нового здания в конструкторе Building
   - **Что делает:** Проходит циклом по всем клеткам в прямоугольной области и устанавливает значение `1` (занято)
   - **Пример:** Здание 3x2 на позиции (10,10) пометит клетки (10,10), (11,10), (12,10), (10,11), (11,11), (12,11) как занятые
   - **Код:**
   ```javascript
   for (let y = gridY; y < gridY + height; y++) {
       for (let x = gridX; x < gridX + width; x++) {
           this.grid[y][x] = 1;
       }
   }
   ```

2. `freeArea(gridX, gridY, width, height)`
   - **Когда вызывается:** При удалении здания (метод `destroy()`)
   - **Что делает:** Обратная операция - устанавливает все клетки в `0`
   - **Важно:** После освобождения нужно вызвать `pathfindingManager.updateGrid()`

3. `isWalkable(gridX, gridY)`
   - **Когда вызывается:** PathfindingManager использует для поиска проходимых клеток вокруг зданий
   - **Что делает:** Проверяет границы сетки и значение клетки
   - **Возвращает:** `true` если клетка в границах и значение = 0
   - **Код:**
   ```javascript
   if (gridX < 0 || gridY < 0 || gridX >= 40 || gridY >= 40) return false;
   return this.grid[gridY][gridX] === 0;
   ```

4. `worldToGrid(x, y)`
   - **Когда вызывается:** При конвертации позиции рабочего или клика мыши в grid-координаты
   - **Формула:** `gridX = Math.floor(worldX / 25)`, `gridY = Math.floor(worldY / 25)`
   - **Пример:** worldX=127 → gridX=5 (потому что 127/25 = 5.08, floor = 5)

5. `gridToWorld(gridX, gridY)`
   - **Когда вызывается:** При конвертации grid обратно в world для позиционирования объектов
   - **Формула:** `worldX = gridX * 25 + 12.5` (центр клетки)
   - **Пример:** gridX=5 → worldX=137.5 (5*25 + 12.5)
   - **Важно:** Возвращает ЦЕНТР клетки, не левый верхний угол

6. `drawGrid()`
   - **Когда вызывается:** Один раз при инициализации в конструкторе
   - **Что делает:** Рисует визуальную сетку линиями серого цвета
   - **Depth:** -1 (под всеми объектами)

**Взаимодействие с другими системами:**
- **Building:** Вызывает `occupyArea()` при создании
- **PathfindingManager:** Читает `grid` для построения пути
- **Worker:** Использует `worldToGrid()` и `gridToWorld()` для навигации

6. `drawSectorGrid()`
   - **Когда вызывается:** Один раз при инициализации после `drawGrid()`
   - **Что делает:** Рисует техническую разметку для ориентации
   - **Размер сектора:** 20x20 клеток (500x500 пикселей)
   - **Линии:** Темно-серые `0x505050`, толщина 2px
   - **Метки:** Текст "Ряд:Колонка" (например "0:0", "5:3") в центре каждого сектора
   - **Цвет текста:** `#404040`
   - **Назначение:** Помогает ориентироваться на большой карте 200x200
   - **Пример:** При карте 200x200 будет 10x10 секторов (от "0:0" до "9:9")

**Файл:** `src/managers/GridManager.js`

#### PathfindingManager - Система навигации и поиска пути

**Назначение:**
Интегрирует библиотеку EasyStar.js для поиска оптимального пути между точками с учетом препятствий (зданий). Использует алгоритм A* с эвристикой Manhattan distance.

**Инициализация:**
```javascript
this.easystar = new EasyStar.js();
this.easystar.setAcceptableTiles([0]);      // Можно ходить только по 0
this.easystar.enableDiagonals();            // Диагональное движение разрешено
this.easystar.enableCornerCutting();        // Можно срезать углы
this.easystar.setGrid(grid);                // Передаем grid из GridManager
```

**Ключевые методы:**

1. `findPath(startX, startY, endX, endY, callback)`
   - **Параметры:** world координаты (пиксели)
   - **Процесс:**
     1. Конвертирует world → grid через `gridManager.worldToGrid()`
     2. Вызывает `easystar.findPath()` с grid координатами
     3. Вызывает `easystar.calculate()` для запуска поиска
     4. В callback конвертирует путь обратно grid → world
   - **Результат:** Массив waypoints `[{x, y}, {x, y}, ...]` в world координатах
   - **Асинхронность:** Callback вызывается после calculate()
   - **Пример использования:**
   ```javascript
   pathfindingManager.findPath(100, 100, 500, 300, (path) => {
       if (path) {
           // path = [{x:112, y:112}, {x:137, y:137}, ...]
           this.currentPath = path;
       } else {
           console.log('Путь не найден');
       }
   });
   ```

2. `findPathToBuilding(startX, startY, building, callback)`
   - **Зачем нужен:** Worker не может войти внутрь здания - нужна клетка РЯДОМ с ним
   - **Процесс:**
     1. Вызывает `findNearestWalkablePointAroundBuilding(building)`
     2. Получает проходимую точку рядом со зданием
     3. Вызывает обычный `findPath()` к этой точке
   - **Использование:** Все движения Worker к зданиям

3. `findNearestWalkablePointAroundBuilding(building)`
   - **Алгоритм:**
     ```
     Для здания на (gridX=10, gridY=10) размером 3x2:

     Проверяемые клетки (периметр):
     ? ? ? ? ?     9,9  10,9  11,9  12,9  13,9  (верх)
     ? ■ ■ ■ ?     9,10 [здание]      13,10 (бока)
     ? ■ ■ ■ ?     9,11 [здание]      13,11 (бока)
     ? ? ? ? ?     9,12 10,12 11,12 12,12 13,12 (низ)

     ? = проверяемые клетки
     ■ = здание
     ```
   - **Код:**
   ```javascript
   // Верх и низ
   for (let x = gridX - 1; x <= gridX + width; x++) {
       checks.push({ x, y: gridY - 1 });        // Верхняя линия
       checks.push({ x, y: gridY + height });   // Нижняя линия
   }
   // Левая и правая стороны
   for (let y = gridY; y < gridY + height; y++) {
       checks.push({ x: gridX - 1, y });        // Левая линия
       checks.push({ x: gridX + width, y });    // Правая линия
   }
   ```
   - **Порядок проверки:** Слева направо, сверху вниз
   - **Результат:** Первая найденная проходимая клетка в world координатах
   - **Если не найдено:** Возвращает `null` (здание окружено другими зданиями)

4. `updateGrid()`
   - **Когда вызывается:**
     - После создания здания (конструктор Building)
     - После удаления здания (Building.destroy)
   - **Что делает:** `this.easystar.setGrid(this.gridManager.getGrid())`
   - **Важность:** БЕЗ вызова этого метода EasyStar будет использовать старую сетку!

**Оптимизация:**
- EasyStar вычисляет путь асинхронно (не блокирует рендеринг)
- Диагональное движение сокращает длину пути на ~30%
- Corner cutting делает путь более естественным

**Визуализация пути:**
Worker хранит полученный путь и рисует его полупрозрачной линией в `drawPath()`.

**Файл:** `src/managers/PathfindingManager.js`

#### ResourceManager - Система учета ресурсов

**Назначение:**
Централизованное хранилище всех ресурсов игры. Реализует паттерн Observer для уведомления UI об изменениях.

**Внутренняя структура:**
```javascript
this.resources = {
    TOMATO: 0,
    // При добавлении новых ресурсов они автоматически инициализируются
}

this.listeners = [];  // Массив callback-функций для уведомлений
```

**Ключевые методы:**

1. `addResource(resourceType, amount = 1)`
   - **Когда вызывается:** `Storage.receiveResource()` при доставке ресурса рабочим
   - **Процесс:**
     1. Проверяет, существует ли тип ресурса
     2. Увеличивает счетчик: `this.resources[resourceType] += amount`
     3. Вызывает `notifyListeners()` для обновления UI
   - **Пример:**
   ```javascript
   resourceManager.addResource('TOMATO', 1);  // +1 помидор
   // → UI автоматически обновится
   ```

2. `getResource(resourceType)`
   - **Возвращает:** Текущее количество ресурса
   - **Использование:** UI читает для отображения
   - **Default:** Возвращает 0 если тип не найден

3. `getAllResources()`
   - **Возвращает:** Копию объекта `{ TOMATO: 42, ... }`
   - **Использование:** UI читает все ресурсы для отображения
   - **Важно:** Возвращает копию через spread `{...this.resources}` для предотвращения мутаций

4. `onResourceChange(callback)`
   - **Паттерн:** Observer/PubSub
   - **Использование:** UIManager подписывается при инициализации
   - **Пример:**
   ```javascript
   // UIManager.constructor
   this.scene.resourceManager.onResourceChange((resources) => {
       this.updateResourceDisplay();
   });
   ```

5. `notifyListeners()`
   - **Приватный метод:** Вызывается после `addResource()`
   - **Процесс:** Проходит по всем listeners и вызывает их с текущими ресурсами
   - **Код:**
   ```javascript
   notifyListeners() {
       this.listeners.forEach(callback => callback(this.resources));
   }
   ```

**Расширение:**
Для добавления нового ресурса:
1. Добавить в `CONSTANTS.RESOURCE_TYPES: { NEW_RESOURCE: 'NEW_RESOURCE' }`
2. ResourceManager автоматически инициализирует его в `0` при старте
3. Указать `resourceType: 'NEW_RESOURCE'` в конфиге производственного здания

**Файл:** `src/managers/ResourceManager.js`

#### PlacementManager - Система интерактивного размещения зданий

**Назначение:**
Управляет режимом интерактивного размещения зданий. Позволяет игроку выбирать место для строительства, показывая полупрозрачный призрак здания под курсором с валидацией размещения.

**Внутренняя структура:**
```javascript
this.isPlacing = false;           // Флаг активного режима размещения
this.currentBuildingType = null;  // Тип размещаемого здания
this.ghost = null;                // Экземпляр BuildingGhost
```

**Ключевые методы:**

1. `setupInputEvents()`
   - **Когда вызывается:** Один раз в конструкторе
   - **Что делает:** Настраивает обработчики событий мыши и клавиатуры
   - **События:**
     - `pointermove` - обновляет позицию призрака
     - `pointerdown` - размещает здание (левый клик) или отменяет (правый клик)
     - `keydown-ESC` - отменяет размещение
   - **Важно:** Конвертирует screen координаты в world с учетом камеры:
   ```javascript
   const worldX = pointer.x + this.scene.cameras.main.scrollX;
   const worldY = pointer.y + this.scene.cameras.main.scrollY;
   ```

2. `startPlacement(buildingType)`
   - **Когда вызывается:** При клике на кнопку строительства в UIManager
   - **Процесс:**
     1. Отменяет предыдущее размещение если активно
     2. Устанавливает флаг `isPlacing = true`
     3. Создает `BuildingGhost` для выбранного типа здания
     4. Позиционирует призрак на текущей позиции курсора
   - **Пример:**
   ```javascript
   this.scene.placementManager.startPlacement(CONSTANTS.BUILDING_TYPES.GREENHOUSE);
   ```

3. `tryPlaceBuilding()`
   - **Когда вызывается:** При левом клике мыши в режиме размещения
   - **Процесс:**
     1. Проверяет `ghost.canPlace()` - можно ли разместить здание
     2. Получает grid координаты через `ghost.getGridPosition()`
     3. Создает здание через соответствующий метод BuildingManager
     4. Очищает режим размещения через `cancelPlacement()`
   - **Валидация:** Не размещает если место занято или клик по UI
   - **Возвращает:** `true` если размещение успешно, `false` если нет

4. `cancelPlacement()`
   - **Когда вызывается:**
     - Правый клик мыши
     - Клавиша ESC
     - После успешного размещения здания
     - При начале нового размещения
   - **Что делает:**
     1. Уничтожает призрак: `ghost.destroy()`
     2. Сбрасывает флаги: `isPlacing = false`, `currentBuildingType = null`

5. `isInPlacementMode()`
   - **Возвращает:** `true` если активен режим размещения
   - **Использование:** Проверка текущего состояния менеджера

**Взаимодействие с другими системами:**
- **UIManager:** Вызывает `startPlacement()` при клике на кнопку здания
- **BuildingGhost:** Создает и управляет призраком здания
- **BuildingManager:** Вызывает методы создания зданий после подтверждения размещения
- **GridManager:** Ghost использует для валидации через `isAreaFree()`

**Особенности реализации:**
- Игнорирует клики по UI панелям (top 40px, bottom 60px)
- Учитывает положение камеры при конвертации координат
- Поддерживает отмену через ESC или правый клик
- Один активный режим размещения за раз

**Файл:** `src/managers/PlacementManager.js`

#### BuildingManager
**Ответственность:** Управление зданиями

**Ключевые методы:**
- `createCastle/Storage/Campfire/Greenhouse(gridX, gridY)` - создает здания
- `update(deltaTime)` - обновляет все здания
- `getStorage/Castle/Campfire()` - получает специальные здания

**Особенности:**
- При создании теплицы автоматически назначает свободного рабочего

#### WorkerManager
**Ответственность:** Управление рабочими

**Ключевые методы:**
- `createWorker(x, y)` - создает рабочего
- `createWorkers(count, x, y)` - создает группу рабочих по кругу
- `assignWorkerToBuilding(building)` - назначает свободного рабочего на здание
- `getFreeWorker()` - находит свободного рабочего
- `update(deltaTime)` - обновляет всех рабочих

#### UIManager
**Ответственность:** Пользовательский интерфейс

**Компоненты:**
- **Top Bar:** Отображение ресурсов
- **Bottom Bar:** Кнопки строительства зданий
- **Speed Controls:** Кнопки управления скоростью (x1-x7)

**Ключевые методы:**
- `setGameSpeed(speed)` - изменяет скорость игры
- `updateResourceDisplay()` - обновляет отображение ресурсов
- `onBuildButtonClick(buildingType)` - активирует режим размещения через PlacementManager
- `handleResize(gameSize)` - пересоздает UI при изменении размера окна

**Особенности:**
- При клике на кнопку здания вызывает `placementManager.startPlacement()` вместо автоматического размещения
- Все UI элементы имеют `setScrollFactor(0)` и не скроллятся с камерой
- Адаптивный дизайн: пересоздается при изменении размера окна

### Сущности (Entities) - подробное описание

Entities - это игровые объекты, которые имеют визуальное представление на сцене и собственную логику. В отличие от менеджеров, entities могут существовать в множественном числе.

#### Building (базовый класс)

**Назначение:**
Абстрактный базовый класс для всех зданий. Инкапсулирует общую логику: занятие клеток, отрисовку, позиционирование.

**Конструктор:**
```javascript
constructor(scene, gridX, gridY, config)
```
- `scene` - ссылка на GameScene
- `gridX, gridY` - позиция на сетке (не world!)
- `config` - объект с параметрами:
  ```javascript
  {
      width: 3,           // ширина в клетках
      height: 2,          // высота в клетках
      color: 0x228B22,    // hex цвет заливки
      type: 'GREENHOUSE', // тип здания из CONSTANTS
      name: 'Теплица'     // русское название
  }
  ```

**Инициализация (порядок операций):**
1. Сохраняет параметры в свойства
2. **СНАЧАЛА** занимает клетки: `gridManager.occupyArea()`
3. Конвертирует grid → world координаты
4. Создает графику (Phaser.Graphics)
5. Рисует прямоугольник заливкой
6. Позиционирует графику (важно: относительно левого верхнего угла)
7. Обновляет pathfinding: `pathfindingManager.updateGrid()`

**Важный момент с координатами:**
```javascript
// gridToWorld возвращает ЦЕНТР клетки:
const topLeftWorld = gridManager.gridToWorld(gridX, gridY);
// topLeftWorld = { x: gridX*25+12.5, y: gridY*25+12.5 }

// Но Building нужен левый верхний УГОЛ, поэтому:
this.graphics.x = topLeftWorld.x - CELL_SIZE / 2;  // -12.5
this.graphics.y = topLeftWorld.y - CELL_SIZE / 2;  // -12.5
```

**Методы:**

1. `getCenter()`
   - Возвращает центр здания в world координатах
   - Используется PathfindingManager для поиска пути к зданию
   - Формула: центр = (gridX + width/2, gridY + height/2) в grid → world

2. `destroy()`
   - Удаляет графику: `this.graphics.destroy()`
   - Освобождает клетки: `gridManager.freeArea()`
   - Обновляет pathfinding: `pathfindingManager.updateGrid()`

3. `update(deltaTime)`
   - Пустой метод по умолчанию
   - Переопределяется в производственных зданиях (Greenhouse)

**Файл:** `src/entities/Building.js`

#### BuildingGhost - Призрак здания при размещении

**Назначение:**
Временный визуальный объект, который отображается под курсором при интерактивном размещении зданий. Показывает размер здания и валидирует возможность размещения.

**Конструктор:**
```javascript
constructor(scene, buildingType)
```
- `scene` - ссылка на GameScene
- `buildingType` - тип здания из `CONSTANTS.BUILDING_TYPES`

**Свойства:**
```javascript
this.width = config.width;        // Ширина в клетках
this.height = config.height;      // Высота в клетках
this.color = config.color;        // Цвет здания (для reference)
this.gridX = 0;                   // Текущая grid позиция X
this.gridY = 0;                   // Текущая grid позиция Y
this.isValid = false;             // Можно ли разместить в текущей позиции
this.graphics = Graphics();       // Phaser графика
```

**Ключевые методы:**

1. `updatePosition(worldX, worldY)`
   - **Когда вызывается:** Каждый раз при движении мыши в режиме размещения
   - **Процесс:**
     1. Конвертирует world координаты в grid: `gridManager.worldToGrid()`
     2. Проверяет валидность через `gridManager.isAreaFree()`
     3. Обновляет визуал: зеленый (alpha 0.5) если можно, красный если нет
     4. Рисует заливку и границу (2px)
   - **Snap to grid:** Автоматическая привязка к сетке через floor в worldToGrid
   - **Код отрисовки:**
   ```javascript
   // Выбор цвета
   if (this.isValid) {
       this.graphics.fillStyle(0x00FF00, 0.5);  // Зеленый
       this.graphics.lineStyle(2, 0x00FF00, 1);
   } else {
       this.graphics.fillStyle(0xFF0000, 0.5);  // Красный
       this.graphics.lineStyle(2, 0xFF0000, 1);
   }

   // Прямоугольник здания
   const topLeft = gridManager.gridToWorld(gridX, gridY);
   this.graphics.fillRect(
       topLeft.x - CELL_SIZE/2,
       topLeft.y - CELL_SIZE/2,
       width * CELL_SIZE,
       height * CELL_SIZE
   );
   this.graphics.strokeRect(...); // Та же область
   ```

2. `getGridPosition()`
   - **Возвращает:** Объект `{ x: gridX, y: gridY }`
   - **Использование:** PlacementManager читает для создания настоящего здания

3. `canPlace()`
   - **Возвращает:** `this.isValid` (true/false)
   - **Использование:** PlacementManager проверяет перед размещением

4. `destroy()`
   - **Когда вызывается:** При выходе из режима размещения
   - **Что делает:** Уничтожает графику: `this.graphics.destroy()`

**Визуальные особенности:**
- **Depth:** 100 (поверх всех игровых объектов, но под UI)
- **Alpha:** 0.5 (полупрозрачный)
- **Цвета:**
  - Зеленый `0x00FF00` = можно поставить
  - Красный `0xFF0000` = занято/невалидно
- **Граница:** 2px для четкости

**Взаимодействие:**
- **PlacementManager:** Создает, обновляет позицию, читает состояние, уничтожает
- **GridManager:** Использует для конвертации координат и валидации
- **Отличие от Building:** Не занимает клетки, не обновляет pathfinding, чисто визуальный

**Файл:** `src/entities/BuildingGhost.js`

#### Greenhouse (производственное здание)
**Дополнительная логика:**
- `startProduction()` - запускает производство
- `update(deltaTime)` - обновляет таймер производства
- `hasResourceReady()` - проверяет готовность ресурса
- `collectResource()` - забирает готовый ресурс

**Состояния:**
- `isProducing` - производство идет
- `resourceReady` - ресурс готов к сбору

#### Worker - Рабочий с State Machine

**Назначение:**
Автономный агент, который выполняет производственный цикл: производит → доставляет → возвращается. Использует Finite State Machine для управления поведением.

**Конструктор:**
```javascript
constructor(scene, x, y)  // x, y - world координаты
```

**Свойства:**
```javascript
this.state = 'IDLE';              // Текущее состояние
this.assignedBuilding = null;     // Здание, к которому привязан
this.carryingResource = null;     // Тип ресурса, если несет
this.currentPath = null;          // Массив waypoints от PathfindingManager
this.currentPathIndex = 0;        // Индекс текущей точки пути
this.speed = 50;                  // Пикселей в секунду
this.graphics = Graphics();       // Визуализация рабочего
this.pathGraphics = Graphics();   // Визуализация пути
```

**State Machine - 4 состояния:**

### 1. IDLE (свободен)
**Вход:** При создании worker или если потерял здание
**Что делает:** Ничего, стоит на месте
**Выход:** `assignToBuilding()` → PRODUCING

### 2. PRODUCING (производство)
**Вход:** После назначения или возврата в здание
**Что делает:**
- Вызывает `building.startProduction()`
- В каждом `update()` проверяет `building.hasResourceReady()`
- Когда ресурс готов:
  ```javascript
  this.carryingResource = this.assignedBuilding.collectResource();
  this.changeState(CONSTANTS.WORKER_STATES.CARRYING_TO_STORAGE);
  ```
**Выход:** Ресурс готов → CARRYING_TO_STORAGE

### 3. CARRYING_TO_STORAGE (несет на склад)
**Вход:** Собрал готовый ресурс
**Что делает:**
- При входе: запрашивает путь к складу через `moveToStorage()`
- В `update()`: следует по пути через `followPath(deltaTime)`
- При прибытии (`onPathComplete()`):
  ```javascript
  storage.receiveResource(this.carryingResource);
  this.carryingResource = null;
  this.changeState(CONSTANTS.WORKER_STATES.RETURNING_TO_BUILDING);
  ```
**Выход:** Прибыл на склад → RETURNING_TO_BUILDING

### 4. RETURNING_TO_BUILDING (возврат)
**Вход:** Доставил ресурс на склад
**Что делает:**
- При входе: запрашивает путь к зданию через `moveToBuilding()`
- В `update()`: следует по пути через `followPath(deltaTime)`
- При прибытии: `changeState(PRODUCING)`
**Выход:** Прибыл в здание → PRODUCING (цикл замкнулся)

**Диаграмма состояний:**
```
    ┌─────────────────────────────────────────┐
    │                                         │
    ▼                                         │
 [IDLE]                                       │
    │                                         │
    │ assignToBuilding()                      │
    ▼                                         │
 [PRODUCING] ─────────────┐                   │
    ▲                     │                   │
    │                     │ resource ready    │
    │                     ▼                   │
    │              [CARRYING_TO_STORAGE]      │
    │                     │                   │
    │                     │ arrived at        │
    │                     │ storage           │
    │                     ▼                   │
    │              [RETURNING_TO_BUILDING] ───┘
    │                     │
    └─────────────────────┘
         arrived at building
```

**Ключевые методы:**

1. `assignToBuilding(building)`
   - Вызывается WorkerManager при создании здания
   - Сохраняет ссылку: `this.assignedBuilding = building`
   - Вызывает `building.assignWorker(this)` (обратная ссылка)
   - Запускает state machine: `changeState(RETURNING_TO_BUILDING)`

2. `changeState(newState)`
   - **Главный метод state machine**
   - При смене состояния выполняет side-effects:
   ```javascript
   switch (newState) {
       case IDLE:
           this.currentPath = null;
           break;
       case PRODUCING:
           this.currentPath = null;
           this.assignedBuilding.startProduction();
           break;
       case CARRYING_TO_STORAGE:
           this.moveToStorage();
           break;
       case RETURNING_TO_BUILDING:
           this.moveToBuilding();
           break;
   }
   ```

3. `moveToStorage()` и `moveToBuilding()`
   - Запрашивают путь через `pathfindingManager.findPathToBuilding()`
   - Callback сохраняет путь:
   ```javascript
   this.currentPath = path;
   this.currentPathIndex = 0;
   ```

4. `followPath(deltaTime)`
   - **Основная логика движения**
   - Алгоритм:
   ```javascript
   const target = this.currentPath[this.currentPathIndex];
   const distance = Math.sqrt(dx*dx + dy*dy);

   if (distance < 2) {
       // Достигли waypoint
       this.currentPathIndex++;
       if (this.currentPathIndex >= this.currentPath.length) {
           this.onPathComplete();
       }
   } else {
       // Движемся к waypoint
       const moveDistance = this.speed * (deltaTime / 1000);
       const ratio = moveDistance / distance;
       this.x += dx * ratio;
       this.y += dy * ratio;
   }
   ```
   - **Важно:** deltaTime в миллисекундах, поэтому делим на 1000

5. `onPathComplete()`
   - Вызывается когда прошли весь путь
   - Определяет действие в зависимости от текущего состояния:
   ```javascript
   if (state === CARRYING_TO_STORAGE) {
       storage.receiveResource(this.carryingResource);
       this.carryingResource = null;
       changeState(RETURNING_TO_BUILDING);
   } else if (state === RETURNING_TO_BUILDING) {
       changeState(PRODUCING);
   }
   ```

6. `updateGraphics()` и `drawPath()`
   - **Визуализация:**
     - Основной круг (синий, радиус 3)
     - Желтая точка сверху если `carryingResource !== null`
     - Полупрозрачная линия пути (opacity 0.3)
   - `drawPath()` рисует линию от текущей позиции через все оставшиеся waypoints
   - Обновляется каждый кадр в `update()`

**Оптимизация:**
- Worker не пересчитывает путь каждый кадр - только при смене состояния
- Путь хранится как массив точек, не нужно повторно вызывать EasyStar
- Визуализация пути рисуется только активной части (от текущей позиции)

**Файл:** `src/entities/Worker.js`

### Игровой цикл

**GameScene.update(time, delta):**
1. Умножает `delta` на `gameSpeed` для управления скоростью
2. Вызывает `buildingManager.update(adjustedDelta)`
   - Обновляет производство в теплицах
3. Вызывает `workerManager.update(adjustedDelta)`
   - Обновляет state machine каждого рабочего
   - Движение по пути
   - Переходы между состояниями

## Интерактивное размещение зданий

**Процесс размещения здания:**

1. **Клик по кнопке:** Игрок нажимает кнопку "Теплица" в UI
2. **Активация режима:** UIManager вызывает `placementManager.startPlacement(GREENHOUSE)`
3. **Создание призрака:** PlacementManager создает BuildingGhost
4. **Движение курсора:**
   - Событие `pointermove` → обновление позиции призрака
   - Конвертация screen → world (с учетом камеры)
   - Snap to grid через `worldToGrid()`
   - Валидация через `gridManager.isAreaFree()`
   - Отрисовка: зеленый/красный в зависимости от валидности
5. **Размещение:**
   - **Левый клик** → `tryPlaceBuilding()`
   - Проверка `ghost.canPlace()`
   - Создание здания через `buildingManager.createGreenhouse(gridX, gridY)`
   - Очистка призрака через `cancelPlacement()`
6. **Отмена:**
   - **Правый клик или ESC** → `cancelPlacement()`
   - Уничтожение призрака, выход из режима

**Контроль:**
- **Левый клик** - подтвердить размещение
- **Правый клик** - отменить
- **ESC** - отменить
- **Игнорирует клики по UI** (top 40px, bottom 60px)

## Цикл работы рабочего

Пример полного цикла после строительства теплицы:

1. **Интерактивное размещение:** Игрок выбирает место → создается теплица
2. **Назначение:** BuildingManager автоматически назначает свободного рабочего
3. **Путь к зданию:** Worker получает путь через PathfindingManager
4. **PRODUCING:** Рабочий прибывает → Greenhouse.startProduction()
5. **Ожидание:** Worker ждет 2 секунды (производство помидора)
6. **Сбор:** Greenhouse устанавливает `resourceReady=true`
7. **CARRYING:** Worker собирает ресурс → ищет путь к Storage
8. **Доставка:** Worker прибывает на склад → Storage.receiveResource()
9. **RETURNING:** Worker ищет путь обратно к теплице
10. **Цикл повторяется** с шага 4

## Pathfinding

**Как работает обход зданий:**

1. **Занятие клеток:** При создании здания `Building` вызывает `gridManager.occupyArea()`
   - Все клетки под зданием помечаются как `1` (непроходимо)

2. **Обновление EasyStar:** После изменения grid вызывается `pathfindingManager.updateGrid()`

3. **Поиск точки назначения:** `findPathToBuilding()` использует `findNearestWalkablePointAroundBuilding()`
   - Проверяет все клетки вокруг периметра здания
   - Возвращает первую проходимую клетку

4. **Расчет пути:** EasyStar.js строит путь, обходя занятые клетки

5. **Движение:** Worker следует по waypoints, обновляя визуализацию пути

## Технические детали

### Координаты
- **Grid координаты:** целые числа (0-199 для сетки 200x200)
- **World координаты:** пиксели (0-4999 для карты 5000x5000)
- **Конвертация:**
  - grid → world: `worldX = gridX * 25 + 12.5` (центр клетки)
  - world → grid: `gridX = Math.floor(worldX / 25)`
- **Важно:** Building занимает клетки по grid-координатам, визуал выравнивается по world

### Управление камерой
- **Клавиши:** W (вверх), A (влево), S (вниз), D (вправо)
- **Скорость:** 300 пикселей/секунду (настраивается в `CONSTANTS.CAMERA_SPEED`)
- **Границы:** Камера ограничена размерами карты (0-5000 по X и Y)
- **Стартовая позиция:** Центр на замке (примерно 2500:2500)
- **Реализация:** В `GameScene.update()` проверяются клавиши и обновляется `camera.scrollX/Y`

### Phaser конфигурация
```javascript
{
  type: Phaser.AUTO,
  width: window.innerWidth,         // Динамический размер
  height: window.innerHeight,
  scale: {
    mode: Phaser.Scale.RESIZE,      // Подстраивается под окно
    autoCenter: Phaser.Scale.NO_CENTER
  },
  render: {
    pixelArt: true,                 // Четкая графика без размытия
    antialias: false,
    roundPixels: true
  }
}
```

### Адаптивный UI
- **Проблема:** При изменении размера окна UI должен пересоздаваться
- **Решение:** UIManager подписывается на событие `scale.on('resize')`
- **Метод `handleResize()`:**
  1. Вызывает `destroyUI()` - удаляет все старые элементы
  2. Пересоздает панели с новыми размерами через `scene.scale.width/height`
  3. Восстанавливает состояние (ресурсы, выбранная скорость)
- **ScrollFactor:** Все UI элементы имеют `setScrollFactor(0)` - не двигаются с камерой

### Управление скоростью
Реализовано через умножение `delta`:
```javascript
// GameScene.update
const adjustedDelta = delta * this.gameSpeed;
this.buildingManager.update(adjustedDelta);
```

## Расширение

### Добавление нового здания

1. Создать класс в `src/entities/buildings/`:
```javascript
class NewBuilding extends Building {
    constructor(scene, gridX, gridY) {
        const config = {
            width: 2,
            height: 2,
            color: 0xFF0000,
            type: CONSTANTS.BUILDING_TYPES.NEW_BUILDING,
            name: 'Новое здание'
        };
        super(scene, gridX, gridY, config);
    }
}
```

2. Добавить константы в `Constants.js`:
```javascript
BUILDING_TYPES: {
    // ...existing types
    NEW_BUILDING: 'NEW_BUILDING'
},
BUILDINGS: {
    // ...existing buildings
    NEW_BUILDING: {
        width: 2,
        height: 2,
        color: 0xFF0000,
        name: 'Новое здание'
    }
}
```

3. Добавить метод создания в `BuildingManager`:
```javascript
createNewBuilding(gridX, gridY) {
    const building = new NewBuilding(this.scene, gridX, gridY);
    return this.addBuilding(building);
}
```

4. Добавить обработку в `PlacementManager.tryPlaceBuilding()`:
```javascript
switch (this.currentBuildingType) {
    case CONSTANTS.BUILDING_TYPES.NEW_BUILDING:
        this.scene.buildingManager.createNewBuilding(gridPos.x, gridPos.y);
        break;
    // ...other cases
}
```

5. Добавить кнопку в `UIManager.createBottomBar()`:
```javascript
this.createBuildButton(120, height - 50, 'Новое', CONSTANTS.BUILDING_TYPES.NEW_BUILDING);
```

### Добавление нового ресурса

1. Добавить в `CONSTANTS.RESOURCE_TYPES`
2. ResourceManager автоматически инициализирует его в `0`
3. Указать в здании: `resourceType: 'NEW_RESOURCE'`

### Добавление состояния рабочему

1. Добавить в `CONSTANTS.WORKER_STATES`
2. Добавить обработку в `Worker.changeState()`
3. Добавить логику в `Worker.update()`

## Запуск проекта

```bash
# Установка зависимостей
npm install

# Запуск dev сервера
npm start

# Открыть браузер
http://localhost:8000
```

## Зависимости

- **Phaser.js 3.90.0** - игровой движок
- **EasyStar.js 0.4.4** - A* pathfinding

## Git

Файл `.gitignore` настроен для исключения:
- `node_modules/`
- `package-lock.json`
- `.idea/`, `.vscode/`
- OS файлы (`.DS_Store`, `Thumbs.db`)
- Логи

## Известные ограничения

- Размер сетки фиксированный (200x200, изменяется в Constants)
- Один тип производственного здания (теплица)
- Нет системы стоимости строительства
- Нельзя удалять здания
- Нельзя увольнять рабочих
- UI создается для конкретных размеров экрана при запуске (но адаптируется при resize)
- Большое количество секторов (100 текстовых элементов) может влиять на производительность

## Следующие шаги для расширения

### Игровая механика
- [ ] Добавить стоимость строительства (дерево, камень)
- [ ] Добавить лесопилку и каменоломню
- [ ] Добавить дома для увеличения лимита рабочих
- [ ] Добавить возможность удаления зданий (с возвратом ресурсов)
- [ ] Добавить апгрейды зданий (скорость производства, вместимость)

### UI/UX улучшения
- [x] ~~Интерактивное размещение зданий~~ ✅ **Реализовано**
- [ ] Миникарта в углу экрана
- [ ] Клик по зданию - показать информацию
- [ ] Hotkeys для строительства (Q - теплица, и т.д.)
- [ ] Индикатор производства над зданием (прогресс-бар)
- [ ] Счетчик свободных рабочих в UI
- [ ] Поворот зданий при размещении (R для поворота)
- [ ] Предпросмотр радиуса действия здания при размещении

### Технические улучшения
- [ ] Оптимизация: не рисовать объекты вне видимой области камеры
- [ ] Сохранение/загрузку игры (LocalStorage)
- [ ] Звуки (строительство, сбор ресурсов)
- [ ] Спрайты вместо примитивов
- [ ] Zoom камеры (колесико мыши)
- [ ] Перемещение камеры мышью (клик + перетаскивание)
