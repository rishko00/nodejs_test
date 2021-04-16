import express from 'express';
import hbs from 'hbs';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

const app = express();
const PORT = 8000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.set('view engine', hbs);

interface ITask {
  id: number,
  name: string,
  delay: number
};

interface IRuntimeTask extends ITask {
  timeOfRunning: number,
  currentTime: number
};

const tasks: ITask[] = [];

let runtimeTasks: IRuntimeTask[] = [];

app.get('/', (req, res) => {
  if(runtimeTasks){
    runtimeTasks.forEach(task => {
      task.currentTime = Math.floor(task.delay - (Date.now() - task.timeOfRunning) / 1000);
    });
  }
  res.render('main.hbs', {tasks: tasks, runtime: runtimeTasks});
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
  fs.createReadStream('table.csv')
    .pipe(csv())
    .on('data', (data) => tasks.push({id: data.ID, name: data.name, delay: data.delay}))
    .on('end', () => {
        console.log('Tasks loaded');
    });
});
