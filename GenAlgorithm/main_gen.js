//Константы
var
    canv = document.getElementById('canvas'),
    ctx = canv.getContext('2d'),
    bStart = document.getElementById('startGA'),
    bReset = document.getElementById('resetAera'),
    masTown = [];

canv.width = 500;
canv.height = 500;

var
    quanity = 50,
    delay = 200,
    key = 1000,
    dif = 50;

// Классы
class Town{
    cordX = null;
    cordY = null;
    constructor(cordX, cordY){
        this.cordX = cordX;
        this.cordY = cordY;
        console.log('Новый город: ' + this.cordX + " " + this.cordY);
    }
}

class Individ{
    fitness = 0;
    gen = [];
    n = 0;
    DetFitness() {
        let 
            cur = this.gen[0],
            res = 0,
            curTwo,
            x_1,
            x_2,
            y_1,
            y_2;
        for (let i = 1; i < this.gen.length; i++){
            curTwo = this.gen[i];
            x_1 = masTown[cur].cordX;
            x_2 = masTown[curTwo].cordX;
            y_1 = masTown[cur].cordY;
            y_2 = masTown[curTwo].cordY;
            res += Math.sqrt((x_1 - x_2)**2 + (y_1 - y_2)**2 );
            cur = curTwo;
        }
        cur = this.gen[0];
        x_1 = masTown[cur].cordX;
        x_2 = masTown[curTwo].cordX;
        y_1 = masTown[cur].cordY;
        y_2 = masTown[curTwo].cordY;
        res += Math.sqrt((x_1 - x_2)**2 + (y_1 - y_2)**2 );
        this.fitness = res;
    }
}

// Обработка событий
canv.addEventListener('mousedown', function(e) {
    let 
        x = e.pageX - e.target.offsetLeft,
        y = e.pageY - e.target.offsetTop;
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();

    masTown[masTown.length] = new Town(x, y);
});

bStart.addEventListener('click', function(e){
    let 
        population = CreatePopulation(masTown);
    StartEvolution(population)
});

bReset.addEventListener('click', function(e){
    ClearAera();
});

// Функции

function GetRandomInt(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function CreateIndivid(){
    let 
        indiv = new Individ(),
        way = [],
        res = [],
        temp;
    for (let i = 0; i < masTown.length; i++){
        way[i] = i;
    }
    for (let i = 0; i < masTown.length; i ++){
        temp = GetRandomInt(0, way.length - 1);
        res[i] = way[temp];
        way.splice(temp, 1);
    }
    indiv.gen = res;
    indiv.DetFitness()
    console.log("Cоздан новый индивид");
    console.log("Ген: " + indiv.gen);
    console.log("Приспособленность: " + indiv.fitness);
    return indiv;
}

function CreatePopulation(){
    let 
        population = [];
    for (let i = 0; i < quanity; i++)
        population[i] = CreateIndivid();
    console.log("Популяция создана!")
    return population;
}

function Selection(population){
    let
        temp = 0,
        tempArr = [],
        newPopulation = [],
        maxTemp = new Individ(),
        arr = [];
    for (let i = 0; i < population.length; i++)
        arr[i] = i;
    while (arr.length > 0){
        maxTemp = new Individ();
        tempArr = [];
        if (arr.length > 2){
            for (let i = 0; i < 3; i++){
                temp = GetRandomInt(0, arr.length - 1);
                tempArr.push(population[arr[temp]]);
                arr.splice(temp, 1);
            }
            if (tempArr[0].fitness < tempArr[1].fitness && tempArr[0].fitness < tempArr[2].fitness)
                maxTemp = tempArr[0];
            else
                if (tempArr[1].fitness < tempArr[0].fitness && tempArr[1].fitness < tempArr[2].fitness)
                    maxTemp = tempArr[1];
            else
                maxTemp = tempArr[2];
            newPopulation.push(maxTemp);
        }
        else if (arr.length == 2){
            if (population[arr[0]].fitness < population[arr[1]].fitness)
                newPopulation.push(population[arr[0]]);
            else
                newPopulation.push(population[arr[1]]);
            arr.splice(0, 2);
        }
        else if (arr.length == 1){
            newPopulation.push(population[arr[0]]);
            arr.splice(0,1);
        }
    }
    
    console.log("Отобранно " + newPopulation.length + " индивидов")
    for (let i = 0; i < newPopulation.length; i++){
        console.log(newPopulation[i].fitness);
    }
    
    return newPopulation;
}

function Crossing(population){
    let 
        newPopulation = [],
        n = 0,
        t_1 = 0,
        t_2 = 0,
        arr = [],
        parentOne = new Individ(),
        parentTwo = new Individ(),
        childOne = new Individ(),
        childTwo = new Individ();
    
    let
        sepOne = 1,
        sepTwo = Math.round(masTown.length / 2);

    for (let i = 0; i < population.length; i++)
        arr[i] = i;

    while (arr.length >= 2){
        parentOne = new Individ();
        parentTwo = new Individ();
        childOne = new Individ();
        childTwo = new Individ();
        t_1 = GetRandomInt(0, arr.length - 1);
        arr.splice(t_1, 1);
        t_2 = GetRandomInt(0, arr.length - 1);
        arr.splice(t_2, 1);
        
        parentOne = population[t_1];
        parentTwo = population[t_2];

        for (let i = sepOne; i < sepTwo; i++){
            childOne.gen[i] = parentTwo.gen[i];
            childTwo.gen[i] = parentOne.gen[i];
        }

        t_1 = 0;
        t_2 = 0;
        for (let i = 0; i < masTown.length; i++){
            if (t_1 == 0 && !childOne.gen.includes(parentOne.gen[i])){
                childOne.gen[0] = parentOne.gen[i];
                t_1++;
            }
            if (t_2 == 0 && !childTwo.gen.includes(parentTwo.gen[i])){
                childTwo.gen[0] = parentTwo.gen[i];
                t_2++
            }
        }

        for (let i = 0; i < masTown.length; i++){
            if (!childOne.gen.includes(parentOne.gen[i]))
                childOne.gen.push(parentOne.gen[i]);
            
            if (!childTwo.gen.includes(parentTwo.gen[i]))
                childTwo.gen.push(parentTwo.gen[i]);
            
        }

        childOne.DetFitness();
        childTwo.DetFitness();
        newPopulation[n++] = childOne;
        newPopulation[n++] = childTwo;
    }
    //console.log("Скрещивание завершенно, новых индивидов: " + newPopulation.length)
    return newPopulation;
}

function Mutation(population){
    //Генерация двух рандомных чисел
    let 
        tempTwo,
        tempOne,
        temp,
        cur,
        indiv,
        newPopulation = []
        arr = [];
    for (let i = 0; i < population.length; i++){
        indiv = new Individ();
        indiv.gen = population[i].gen.slice();
        indiv.DetFitness();
        for (let i = 0; i < masTown.length; i++)
            arr[i] = i;
        cur = GetRandomInt(0, arr.length - 1);
        tempOne = arr[cur];
        arr.splice(cur, 1);
        cur = GetRandomInt(0, arr.length - 1);
        tempTwo = arr[cur];

        //Смена генов местами
        temp = indiv.gen[tempOne];
        indiv.gen[tempOne] = indiv.gen[tempTwo];
        indiv.gen[tempTwo] = temp;

        indiv.DetFitness();

        newPopulation[i] = indiv;
    }
    //console.log("Мутация проведена, сгенерированно новых индивидов: " + newPopulation.length)
    return newPopulation;
}

function ConnectPopulation(pOne, pTwo, pThree){
    let 
        population = [];
    for (let i = 0; i < pOne.length; i++)
        population.push(pOne[i]);
    for (let i = 0; i < pTwo.length; i++)
        population.push(pTwo[i]);
    for (let i = 0; i < pThree.length; i++)
        population.push(pThree[i]);
    //console.log("Популяции соедененны, индивидов в популяции " + population.length);
    return population;
}

function DrawRoad(indiv){
    ctx.clearRect(0, 0, canv.width, canv.height)
    ctx.beginPath();
    let 
        curOne = indiv.gen[0],
        curTwo, x_1, x_2, y_1, y_2;
    for (let i = 1; i < indiv.gen.length; i++){
        curTwo = indiv.gen[i];
        x_1 = masTown[curOne].cordX;
        x_2 = masTown[curTwo].cordX;
        y_1 = masTown[curOne].cordY;
        y_2 = masTown[curTwo].cordY;
        ctx.moveTo(x_1, y_1);
        ctx.lineTo(x_2, y_2);
        ctx.stroke();
        curOne = curTwo;
    }
    curOne = indiv.gen[0];
    x_1 = masTown[curOne].cordX;
    x_2 = masTown[curTwo].cordX;
    y_1 = masTown[curOne].cordY;
    y_2 = masTown[curTwo].cordY;
    ctx.moveTo(x_1, y_1);
    ctx.lineTo(x_2, y_2);
    ctx.stroke();
    console.log("Отрисовал")
}
 
function BestIndivid(population){
    let 
        low = 0;
    for (let i = 0; i < population.length; i++){
        if (population[i].fitness <= population[low].fitness)
            low = i;
    }
    console.log("Самый приспособленный: " + population[low].fitness)
    //DrawRoad(population[low])
    return population[low]
}

function StartEvolution(population){
    let
        lowest,
        mas = [],
        n = 0,
        newPopulationOne = [],
        newPopulationTwo = [],
        newPopulationThree = [];
    if (CheckTown()){
        return 0;
    }
    GetUserData();
    DrawRoad(BestIndivid(population));
    for ( let i = 0; i < key; i++){
        console.log("========== Новый этап эволюции ==========" + i);
        newPopulationOne = Selection(population);
        newPopulationTwo = Mutation(newPopulationOne);
        newPopulationThree = Crossing(newPopulationOne);
        population = ConnectPopulation(newPopulationOne, newPopulationTwo, newPopulationThree);
        lowest = BestIndivid(population);
        mas.push(lowest.fitness);
        var timeoutID = setTimeout(DrawRoad, i * delay, lowest);
        n = i;
        if (mas.length > dif && mas[i] == mas[i - dif])
            break;
    }
    timeoutID = setTimeout(alert, n * delay, 'Алгоритм закончил свою работу')
}

function ClearAera(){
    ctx.clearRect(0, 0, canv.width, canv.height);
    masTown = [];
    quanity = 50;
    delay = 200;
    key = 15000;
    dif = 150;
    clearTimeout(timeoutId);
}

function GetUserData(){
    let
        userKey = document.getElementById('inp_1').value,
        userQuanity = document.getElementById('inp_2').value,
        userDif = document.getElementById('inp_3').value;
    if (userKey > 0 | userKey == null){
        key = userKey;
    }
    else{
        alert("Колличество итераций должно быть больше нуля! Установленно стандартное значение 1000")
    }
    if (userQuanity > 0 | userKey == null){
        quanity = userQuanity;
    }
    else{
        alert("Размер популяции должен быть больше нуля! Установленно стандартное значение 50")
    }
    if (userDif > 0 | userKey == null){
        dif = userDif;
    }
    else{
        alert("Колличество итераций для завершения должно быть больше нуля! Установленно стандартное значение 50")
    }
}

function CheckTown(){
    if (masTown.length < 1){
        alert("Вы не расставили точки");
        return true;
    }
    return false;
}