var isGenerated = false;
var startSelecting = false;
var finishSelecting = false;
var wallBuilder = false;
var delay = 80;
var openList = [];
var closedList = [];

function generate() {
    if (!isGenerated) {
        let size = document.getElementById('size').value;
        let table = document.createElement('table');
        table.className = "table";
        let tbody = document.createElement('tbody');
        table.appendChild(tbody);
        document.getElementById('body').appendChild(table);

        for (let i = 0; i < size; i ++) {
            let row = document.createElement('tr');
            for (let j = 0; j < size; j ++) {
                let cell = document.createElement('td');
                row.appendChild(cell);
                cell.id = i + " " + j;
                cell.setAttribute("xC", i);
                cell.setAttribute("yC", j);
                cell.className = "walkable";
            }

            table.appendChild(row);
        }

        isGenerated = true;
        let cells = document.querySelectorAll('td');

        cells.forEach(function (element) {
            element.onclick = function() {
                if (startSelecting) {
                    element.className = "startik walkable";
                    startSelecting = false;
                }
                else if (finishSelecting) {
                    element.className = "finishik walkable";
                    finishSelecting = false;
                }
                else if (wallBuilder && element.classList.contains("walkable")) {
                    element.className = "unwalkable";
                }
                else if (wallBuilder && element.classList.contains("unwalkable")) {
                    element.className = "walkable";
                }
            }
        });

        console.log("Таблица сгенерирована.")
    }

    else {
        alert('Лабиринт уже сгенерирован!');
    }
}

function selectStart() {
    if (isGenerated) {
        startSelecting = true;
        finishSelecting = false;
        wallBuilder = false;
        console.log("StartSelectingMode is on.");
    }
    else {
        alert('Лабиринт еще не сгенерирован!');
    }
}

function selectFinish() {
    if (isGenerated) {
        startSelecting = false;
        finishSelecting = true;
        wallBuilder = false;
        console.log("FinishSelectingMode is on.");
    }
    else {
        alert('Лабиринт еще не сгенерирован!');
    }
}

function wallBuilder() {
    if (isGenerated) {
        startSelecting = false;
        finishSelecting = false;
        wallBuilder = true;
        console.log("WallBuilderMode is on.");
    }
    else {
        alert('Лабиринт еще не сгенерирован!');
    }
}

// источник алгоритма:https://habr.com/ru/post/262345/
// кусочек реализации https://www.pvsm.ru/algoritmy/360800#begin
function GenerateMaze() {
    let size = document.getElementById('size').value;
    let matrix = new Array(size);
    let visited = new Array(size);

    for (let i = 0; i < size; i ++) {
        matrix[i] = [];
        visited[i] = [];
        for (let j = 0; j < size; j ++) {
            visited[i][j] = false;
            var cur = document.getElementById(i + " " + j);
            if ((i+1) % 2 == 0 && (j+1) % 2 == 0)  {
                cur.className = "walkable";
            }
            else{
                cur.className = "unwalkable";
            }
            matrix[i][j] = cur;
        }
    }

    let x = rand(0, size / 2-1) * 2 + 1 ;
    let y = rand(0, size / 2-1) * 2 + 1;

    function checking(matrix, x, y, size, visited) {
        matrix[x][y].className = "walkable";
        visited[x][y] = true;
        var directions = ["north", "south", "east", "west"];
        while (directions.length > 0) {
            var dindex = rand(0, directions.length-1);
            switch (directions[dindex]) {
                case "north" :
                    if ((y - 2 >= 0) && matrix[x][y-2].classList.contains("walkable") && visited[x][y-2] == false) {
                        matrix[x][y-1].className = "walkable";
                        checking(matrix, x, y - 2, size, visited);
                    }
                    directions.splice(dindex, 1);
                break;
                case "south" :
                    if (y + 2 < size && matrix[x][y+2].classList.contains("walkable") && visited[x][y+2] == false) {
                        matrix[x][y+1].className = "walkable";
                        checking(matrix, x, y + 2, size, visited);
                    }
                    directions.splice(dindex, 1);
                break;
                case "east" :
                    if (x - 2 >= 0 && matrix[x-2][y].classList.contains("walkable") && visited[x - 2][y] == false) {
                        matrix[x-1][y].className = "walkable";
                        checking(matrix, x - 2, y, size, visited);
                    }
                    directions.splice(dindex, 1);
                break;
                case "west" :
                    if (x + 2 < size && matrix[x+2][y].classList.contains("walkable") && visited[x + 2][y] == false) {
                        matrix[x+1][y].className = "walkable";
                        checking(matrix, x + 2, y, size, visited);
                    }
                    directions.splice(dindex, 1);
                break;
            }
            
        }
    }

    checking(matrix, x, y, size, visited);
}

function findPath() {
    let size = document.getElementById('size').value;
    let m = new Array(size);
    let openMas = [];
    let closeMas = [];
    for (let i = 0; i < size; i++) {
        m[i] = [];
        for (let j = 0; j < size; j ++) {
            m[i][j] = new Cell(document.getElementById(i + " " + j), i, j);
            if (m[i][j].element.classList.contains("startik")) {
                var startPoint = m[i][j];
            }
            else if (m[i][j].element.classList.contains("finishik")) {
                var endPoint = m[i][j];
            }
        }
    }

    startPoint.g = 0;
    startPoint.h = manhattanDistance(startPoint, endPoint);
    startPoint.f = startPoint.g + startPoint.h;

    let currentPoint = startPoint;
    closeMas.push(currentPoint);
    openMas.push(currentPoint);

    let count = 1;

    while (currentPoint.h != 0){
        closeMas.push(currentPoint);
        let currentIndex = openMas.indexOf(currentPoint);
        openMas.splice(currentIndex, 1);
        let x = currentPoint.x;
        let y = currentPoint.y;

        let forX = [0, 0, 1, -1, -1, 1, -1, 1];
        let forY = [-1, 1, 0, 0, -1, -1, 1, 1];

        for (let i = 0; i < 8; i ++){
            if ((x + forX[i] > -1) && (y + forY[i] > -1) && (x + forX[i] < size) && (y + forY[i] < size)){
                let newPoint = m[x + forX[i]][y + forY[i]];
                if (!(closeMas.includes(newPoint)) && (newPoint.element.classList.contains('walkable'))){
                    if (!(openMas.includes(newPoint))){
                        newPoint.parent = currentPoint;

                        newPoint.g = newPoint.parent.g + getGvalue(newPoint);
                        newPoint.h = manhattanDistance(newPoint, endPoint);
                        newPoint.f = getFvalue(newPoint);

                        if (!newPoint.element.classList.contains('finishik')) {
                            setTimeout(paintingChild, count * delay, newPoint);
                            count += 1;
                        }
                        openMas.push(newPoint);
                    }

                    else {
                        let oldParent = newPoint.parent;
                        newPoint.parent = currentPoint;

                        if (!newPoint.element.classList.contains('finishik')) {
                            setTimeout(paintingParent, count * delay, newPoint);
                            count+=1;
                        }

                        let newG = currentPoint.g + getGvalue(newPoint);

                        if (newG < newPoint.g) {
                            newPoint.g = newG;
                            newPoint.f = getFvalue(newPoint);
                        }

                        else {
                            newPoint.parent = oldParent;
                        }

                    }
                }
            }
        }

        let points = [];

        if (openMas.length == 0) {
            alert("No path!");
        }
        
        for (let i = 0; i < openMas.length; i ++) {
            points[i] = {
                nucleus: openMas[i],
                f: openMas[i].f,
            }
        }

        points.sort(function (a, b) {
            return a.f - b.f;
        })

        currentPoint = points[0].nucleus;
    }
    
    let finalArray = new Array ();

    while (currentPoint.parent.parent != null){
        finalArray.push(currentPoint);
        setTimeout(paintingPath, count * delay, document.getElementById(currentPoint.parent.x + " " + currentPoint.parent.y));
        count += 1;
        currentPoint = currentPoint.parent;    
    }

}   

function manhattanDistance(a, b){
    let x = Math.abs(a.x - b.x);
    let y = Math.abs(a.y - b.y);
    let summa  = x + y;
    return summa * 10;
}

function getGvalue(current) {
    if ((current.parent.x == current.x + 1 && current.parent.y == current.y)|| (current.parent.x == current.x - 1 && current.parent.y == current.y)|| (current.parent.y == current.y + 1 && current.parent.x == current.x) || (current.parent.y == current.y - 1 && current.parent.x == current.x)) {
        return 10;
    }
    else {
        return 14;
    }
}

function getFvalue(current) {
    return current.g  + current.h;
}

function rand(min, max) {
    let x = min + Math.random() * (max + 1 - min);
    return Math.floor(x);
}

function paintingPath(point){
    point.className = "path";
}

function paintingParent(point){
    point.element.parent.className = "open";
}

function paintingChild(point){
    point.element.className = "open";
}

class Cell {
    constructor(element, x, y, f, g, h) {
        this.element = element;
        this.x = x;
        this.y = y;
        this.parent = null;
        this.f = f;
        this.g = g;
        this.h = h;
    }
}

class Point {
    constructor(element, x, y) {
        this.element = element;
        this.x = x;
        this.y = y;
    }
}


document.getElementById("generate").addEventListener('click', generate);
document.getElementById("selectstart").addEventListener('click', selectStart);
document.getElementById("selectfinish").addEventListener('click', selectFinish);
document.getElementById("walls").addEventListener('click', wallBuilder);
document.getElementById("generatemaze").addEventListener('click', GenerateMaze);
document.getElementById("findpath").addEventListener('click', findPath);
