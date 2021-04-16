"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const hbs_1 = __importDefault(require("hbs"));
const fs_1 = __importDefault(require("fs"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const app = express_1.default();
const PORT = 8000;
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.static(__dirname + '/public'));
app.set('view engine', hbs_1.default);
;
;
const tasks = [];
let runtimeTasks = [];
app.get('/', (req, res) => {
    if (runtimeTasks) {
        runtimeTasks.forEach(task => {
            task.currentTime = Math.floor(task.delay - (Date.now() - task.timeOfRunning) / 1000);
        });
    }
    res.render('main.hbs', { tasks: tasks, runtime: runtimeTasks });
});
app.post('/:id', (req, res) => {
    let id = Number(req.params.id) - 1;
    let runTask = {
        id: tasks[id].id,
        name: tasks[id].name,
        delay: tasks[id].delay,
        timeOfRunning: Date.now(),
        currentTime: tasks[id].delay
    };
    runtimeTasks.push(runTask);
    setTimeout(() => {
        let index = runtimeTasks.findIndex(el => el.id == runTask.id);
        runtimeTasks.splice(index, 1);
    }, tasks[id].delay * 1000);
    res.redirect('/');
});
app.listen(PORT, () => {
    console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
    fs_1.default.createReadStream('table.csv')
        .pipe(csv_parser_1.default())
        .on('data', (data) => tasks.push({ id: data.ID, name: data.name, delay: data.delay }))
        .on('end', () => {
        console.log('Tasks loaded');
    });
});
//# sourceMappingURL=index.js.map