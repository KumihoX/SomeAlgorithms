//Константы
var
    delay = 200,
    counter = 1,
    key = 1680,
    numOfAnts = 5,
    alfa = 1,
    beta = 1,
    cSupplement = 4,
    cDistance = 200,
    dif = 10,
    cEvaporation = 0.64;

var
    canv = document.getElementById('canvas'),
    ctx = canv.getContext('2d'),
    bReset = document.getElementById('resetAera'),
    bStart = document.getElementById('startAnt'),
    masDistance = [],
    masPheromones = [],
    masTown = [];

canv.width = 500;
canv.height = 500;   

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

//События
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
    StartAnts();
});

bReset.addEventListener('click', function(e){
    ClearAera();
});

//Функции
function GetRandomInt(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function CreateTable(){
    masDistance = [];
    masPheromones = [];
    let 
        distance = 0,
        n = masTown.length,
        x_1,
        x_2,
        y_1,
        y_2; 

    for (let i = 0; i < n; i++){
        masDistance.push(new Array);
        masPheromones.push(new Array);
    } 

    for (let i = 0; i < n; i++){
        for (let j = 0; j < n; j++){
            if (j==i){
                masDistance[i][i] = 0;
                masPheromones[i][i] = 0;
            }
            else{
                x_1 = masTown[i].cordX;
                x_2 = masTown[j].cordX;
                y_1 = masTown[i].cordY;
                y_2 = masTown[j].cordY;
                distance = cDistance / Math.sqrt((x_1 - x_2)**2 + (y_1 - y_2)**2 );
                masPheromones[i].push(0.2);
                masDistance[i].push(distance);
            }
        }
    }
    console.log(masDistance);
    console.log(masPheromones);
}

function GenerateVertex(n, availbleVertices){
    let 
        res = -1,
        cur = -1,
        rnd = 0,
        check = 0,
        theProb = 0,
        temp,
        sumProb = 0,
        masProb = new Array(masTown.length).fill(0);
    for (let i = 0; i < availbleVertices.length; i++){
        temp = availbleVertices[i];
        theProb = masDistance[n][temp]**alfa * masPheromones[n][temp]**beta;
        sumProb += theProb;
        masProb[temp] = theProb;
    }

    for (let i = 0; i < availbleVertices.length; i++){
        temp = availbleVertices[i];
        masProb[temp] = masProb[temp] / sumProb;
        check += masProb[temp];
    }

    rnd = Math.random();
    let max = Math.max.apply(null, masProb);
    if (rnd > Math.max.apply(null, masProb)){
        for (let i = 0; i < availbleVertices.length; i++){
            temp = availbleVertices[i];
            if (cur < masProb[temp]){
                cur = masProb[temp];
                res = temp;
            }
        }
    }
    else{
        cur = 1000;
        for (let i = 0; i < availbleVertices.length; i++){
            temp = availbleVertices[i];
            let xas = masProb[temp];
            if (rnd < masProb[temp] && cur > (masProb[temp] - rnd) * 1000){
                cur = (masProb[temp] - rnd) * 1000;
                res = temp;
            }
        }
    }
    return res;
}

function GoAnts(){
    if (numOfAnts > masTown.length)
        numOfAnts = masTown.length - 1;
    let
        temp,
        startVertices = [],
        availbleVertices = [],
        ways = new Array(numOfAnts);
    
    for (let i = 0; i < masTown.length; i++)
        startVertices.push(i);

    for (let i = 0; i < numOfAnts; i++){
        availbleVertices = [];
        for (let j = 0; j < masTown.length; j++)
            availbleVertices.push(j);
        ways[i] = new Array();

        temp = GetRandomInt(0, startVertices.length - 1);
        temp = startVertices[temp];
        startVertices.splice(startVertices.indexOf(temp), 1);
        availbleVertices.splice(availbleVertices.indexOf(temp), 1);
        ways[i].push(temp);

        for (let j = 0; j < masTown.length - 1; j++){
            temp = GenerateVertex(temp, availbleVertices)
            availbleVertices.splice(availbleVertices.indexOf(temp), 1);
            ways[i].push(temp);
        }

        ways[i].push(ways[i][0]);
    }
    console.log("Пути")
    console.log(ways);
    return ways
}

function CountPheromones(ways){
    let 
        t_1,
        t_2,
        temp,
        deltaPheromones = [];
    for (let i = 0; i < masTown.length; i++){
        deltaPheromones.push(new Array);
        for (let j = 0; j < masTown.length; j++)
            deltaPheromones[i].push(0);
    }
    for (let i = 0; i < ways.length; i++){
        temp = 0;
        for (let j = i + 1; j < ways[i].length; j++){
            t_1 = ways[i][temp];
            t_2 = ways[i][j];
            deltaPheromones[t_1][t_2] += cSupplement / (cDistance / masDistance[t_1][t_2]);
            deltaPheromones[t_2][t_1] += cSupplement / (cDistance / masDistance[t_1][t_2]);
            temp = j
        }
    }
    for (let i = 0; i < masTown.length; i++){
        for (let j = i + 1; j < masTown.length; j++){
            masPheromones[i][j] *= cEvaporation;
            masPheromones[i][j] += deltaPheromones[i][j];
            masPheromones[j][i] *= cEvaporation;
            masPheromones[j][i] += deltaPheromones[j][i];
        }
    }
}

function DrawBestRoad(ways){
    let 
        sum = 0,
        best,
        bestSum = 10**10;
    for (let i = 0; i < ways.length; i++){
        sum = 0
        for (let j = 0; j < ways[i].length - 1; j++){
            x_1 = masTown[ways[i][j]].cordX;
            x_2 = masTown[ways[i][j+1]].cordX;
            y_1 = masTown[ways[i][j]].cordY;
            y_2 = masTown[ways[i][j+1]].cordY;
            sum += Math.sqrt((x_1 - x_2)**2 + (y_1 - y_2)**2 ); 
        }
        if (sum < bestSum){
            bestSum = sum;
            best = i;
        }
    }
    let res = [bestSum,best];
    return res;
}

function DrawRoad(ways, best){
    let 
        x_1,
        x_2,
        y_1,
        y_2;
    ctx.clearRect(0, 0, canv.width, canv.height)
    ctx.beginPath();
    let 
        curOne = ways[best][0],
        curTwo;
    for (let i = 1; i < ways[best].length; i++){
        curTwo = ways[best][i];
        x_1 = masTown[curOne].cordX;
        x_2 = masTown[curTwo].cordX;
        y_1 = masTown[curOne].cordY;
        y_2 = masTown[curTwo].cordY;
        ctx.moveTo(x_1, y_1);
        ctx.lineTo(x_2, y_2);
        curOne = curTwo;
    }
    curOne = ways[best][0];
    x_1 = masTown[curOne].cordX;
    x_2 = masTown[curTwo].cordX;
    y_1 = masTown[curOne].cordY;
    y_2 = masTown[curTwo].cordY;
    ctx.moveTo(x_1, y_1);
    ctx.lineTo(x_2, y_2);
    ctx.stroke();
    console.log("Отрисовал");
}

function StartAnts(){
    let
        resBest = [],
        quan = 0,
        n_1 = 0,
        temp,
        count,
        ways;
    CreateTable();
    GetUserData();
    for (i = 0; i < key; i++){
        quan = i;
        ways = GoAnts();
        CountPheromones(ways);
        resBest = DrawBestRoad(ways);
        temp = resBest[0];
        var timeoutId = setTimeout(DrawRoad, i * delay, ways, resBest[1]);
        if (temp != count){
            count = temp;
            n_1 = 0;
        }
        else{
            n_1 += 1;
            if (n_1 = dif){
                break;
            }
        }
        console.log("Феромоны " + masPheromones);
    }
    timeoutId = setTimeout(alert, (quan + 1) * delay, 'Алгоритм закончил свою работу');
}

function ClearAera(){
    cDistance = 200;
    masTown = [];
    masPheromones = [];
    masTown = [];
    ctx.clearRect(0, 0, canv.width, canv. height);
    clearTimeout(timeoutId);



}

function GetUserData(){
    let
        userKey = document.getElementById('inp_1').value,
        userNumOfAnts = document.getElementById('inp_2').value,
        userAlfa = document.getElementById('inp_3').value,
        userBeta = document.getElementById('inp_4').value,
        userSupplement = document.getElementById('inp_5').value,
        userDif = document.getElementById('inp_6').value,
        userEvaporation = document.getElementById('inp_7').value;
    if (userKey > 0 | userKey == null){
        key = userKey;
    }
    else{
        alert("Колличество итераций должно быть больше нуля! Установленно стандартное значение 1000")
    }
    if (userNumOfAnts > 0 | userKey == null){
        numOfAnts = userNumOfAnts;
    }
    else{
        alert("Колличество муравьев должно быть больше нуля! Установленно стандартное значение 10")
    }
    if (userAlfa > 0 | userKey == null){
        alfa = userAlfa;
    }
    else{
        alert("Коэффициент альфа должен быть больше нуля! Установленно стандартное значение 1")
    }
    if (userBeta > 0 | userKey == null){
        beta = userBeta;
    }
    else{
        alert("Коэффициент бета должен быть больше нуля! Установленно стандартное значение 1")
    }
    if (userSupplement > 0 | userKey == null){
        cSupplement = userSupplement;
    }
    else{
        alert("Колличество добавочного феромона должно быть больше нуля! Установленно стандартное значение 4")
    }
    if (userDif > 0 | userKey == null){
        dif = userDif;
    }
    else{
        alert("Колличество итераций для завершения должно быть больше нуля! Установленно стандартное значение 10")
    }
    if ((userEvaporation > 0 && userEvaporation < 100) || userKey == null){
        cEvaporation = userEvaporation / 100;
    }
    else{
        alert("Процент испарения должен быть в промежутке от 1 до 99! Установленно стандартное значение 1000")
    }
}

function CheckTown(){
    if (masTown.length < 1){
        alert("Вы не расставили точки");
        return true;
    }
    return false;
}
