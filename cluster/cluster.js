//Проверки
function CheckVar(mas){
  if (mas.length == 0){
    alert("Вы не расставили точки");
    return true;
  }
  return false;
}

//Функции общие побочные
function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function getDistanceSQ(a, b) {
  const diffs = [];
  for (let i = 0; i < a.length; i++) {
    diffs.push(a[i] - b[i]);
  }
  return diffs.reduce((r, e) => (r + (e * e)), 0);
}

//Функции для kMeans побочные
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //Максимум не включается, минимум включается
}

function kPlusPlus(dataset, k) {
  const centroids = [];
  const numSamples = dataset.length;
  const randomPoint = getRandomInt(0, numSamples);

  let nextCentroid;
  let distanceBetweenCentoids;
  let numberCentro = 0;

  centroids.push(dataset[randomPoint]);
  let curPoint = randomPoint;

  while (numberCentro < k - 1){
    for (let i = 0; i < numSamples; i ++){
      let dist = getDistanceSQ(dataset[curPoint],dataset[i]);
      if (nextCentroid === undefined){
        distanceBetweenCentoids = dist * dist;
        nextCentroid = i;
      }
      if ((distanceBetweenCentoids < (dist * dist)) && (nextCentroid !== undefined)){
        distanceBetweenCentoids = dist * dist;
        nextCentroid = i;  
      }
    }
    centroids.push(dataset[nextCentroid]);
    curPoint = nextCentroid;
    numberCentro ++;
  }
  return centroids;
}

function getRandomCentroids(dataset, k) {
  const numSamples = dataset.length;
  const centroidsIndex = [];
  let index;
  while (centroidsIndex.length < k) {
    index = randomBetween(0, numSamples);
    if (centroidsIndex.indexOf(index) == -1) {
      centroidsIndex.push(index);
    }
  }
  const centroids = [];
  for (let i = 0; i < centroidsIndex.length; i++) {
    const centroid = [...dataset[centroidsIndex[i]]];
    centroids.push(centroid);
  }
  return centroids;
}

function compareCentroids(a, b) {
  for (let i = 0; i < a.length; i++) {
    if (a[i] != b[i]) {
      return false;
    }
  }
  return true;
}

function shouldStop(oldCentroids, centroids, iterations) {
  if (iterations > MAX_ITERATIONS) {
    return true;
  }
  if (!oldCentroids || !oldCentroids.length) {
    return false;
  }
  let sameCount = true;
  for (let i = 0; i < centroids.length; i++) {
    if (!compareCentroids(centroids[i], oldCentroids[i])) {
      sameCount = false;
    }
  }
  return sameCount;
}

function getLabels(dataSet, centroids) {
  const labels = {};
  for (let c = 0; c < centroids.length; c++) {
    labels[c] = {
      points: [],
      centroid: centroids[c],
    };
  }

  for (let i = 0; i < dataSet.length; i++) {
    const a = dataSet[i];
    let closestCentroid, closestCentroidIndex, prevDistance;
    for (let j = 0; j < centroids.length; j++) {
      let centroid = centroids[j];
      if (j == 0) {
        closestCentroid = centroid;
        closestCentroidIndex = j;
        prevDistance = getDistanceSQ(a, closestCentroid);
      } else {
        const distance = getDistanceSQ(a, centroid);
        if (distance < prevDistance) {
          prevDistance = distance;
          closestCentroid = centroid;
          closestCentroidIndex = j;
        }
      }
    }
    labels[closestCentroidIndex].points.push(a);
  }
  return labels;
}

function getPointsMean(pointList) {
  const totalPoints = pointList.length;
  const means = [];
  for (let j = 0; j < pointList[0].length; j++) {
    means.push(0);
  }
  for (let i = 0; i < pointList.length; i++) {
    const point = pointList[i];
    for (let j = 0; j < point.length; j++) {
      const val = point[j];
      means[j] = means[j] + val / totalPoints;
    }
  }
  return means;
}

function recalculateCentroids(dataSet, labels, k) {
  let newCentroid;
  const newCentroidList = [];
  for (const k in labels) {
    const centroidGroup = labels[k];
    if (centroidGroup.points.length > 0) {
      newCentroid = getPointsMean(centroidGroup.points);
    } else {
      newCentroid = getRandomCentroids(dataSet, 1)[0];
    }
    newCentroidList.push(newCentroid);
  }
  return newCentroidList;
}

//Функции для DBSCAN побочные
function RangeQuery(dataset, point, inputPoint, eps){
  let neighborsPoints = [];
  for (let i = 0; i < dataset.length; i ++){
    if (getDistanceSQ(inputPoint.coords, point[i].coords) <= eps){
      neighborsPoints.push(point[i]);
    }
  }
  return neighborsPoints;
}

//Функции для meanShift побочные
function newCentroid(dataset, lenght){
  let x = 0;
  let y = 1;
  let coordX = 0;
  let coordY = 0;
  let result = [];

  for (let i = 0; i < dataset.length; i ++){
    coordX = coordX + dataset[i][x]; 
    coordY = coordY + dataset[i][y];
  }

  result.push(coordX / lenght);
  result.push(coordY / lenght);

  return result;
}

function entryCheck(mainElem, sideElem, radius){
  if (getDistanceSQ(mainElem.coords, sideElem.coords) <= radius){
    return 1;
  }
  return 0;
}

function checkIncluded(dataset, mainElem, curX, curY){
  let x = 0;
  let y = 1;
  let count = 0;
  const datMainElLen = dataset[mainElem].countPoints;
  for (let i = 0; i < datMainElLen; i++){
    if (dataset[mainElem].points[i][x] == curX){
      if(dataset[mainElem].points[i][y] == curY){
        count ++;
      }
    }
  }
  if (count == 0){
    return 1;
  }
  return 0;
}

function clustering(dataset, datLenght, eps){
  let attendance = [];
  for (let i = 0; i < datLenght; i++){
    attendance.push("False");
  }

  let count = 0;
  let cluster = [];
  while (attendance.includes('False')){
    indexElem = attendance.indexOf('False');
    curCentre = dataset[indexElem];

    cluster[count] = {
      number: count,
      points: curCentre.points,
    }

    for (let i = 0; i < datLenght; i ++){
      if (i != indexElem){
        let elemIncluded = entryCheck(curCentre, dataset[i], eps);
        if (elemIncluded == 1){
          attendance[i] = 'True';
          const datPointLen = dataset[i].countPoints;
          for (let dot = 0; dot < datPointLen; dot ++){
            if (checkIncluded(dataset, indexElem, dataset[i].points[dot][0], dataset[i].points[dot][1]) == 1){
              cluster[count].points.push(dataset[i].points[dot]);
            } 
          }
        }
      }
    }
    attendance[indexElem] = 'True';
    count ++;
  }
  return cluster;
}

function findingNeighbors(dataset, centre, centreMain, eps){
  let neighborsPoints = [];
  for (let i = 0; i < dataset.length; i ++){
    if (getDistanceSQ(centreMain.coords, dataset[i]) <= eps){
      neighborsPoints.push(dataset[i]);
    }
  }
  return neighborsPoints;
}

//Основные функции
function kMeans(dataset, k) {

  if (CheckVar(dataset)){
    return 0;
  }

  let firstIteration = true;
  if (dataset.length && dataset[0].length && dataset.length > k) {
    let iterations = 0;
    let oldCentroids, labels, centroids;

    if (firstIteration) {
      centroids = kPlusPlus(dataset, k);
    } else {
      centroids = getRandomCentroids(dataset, k);
    }

    while (!shouldStop(oldCentroids, centroids, iterations)) {
      oldCentroids = [...centroids];
      iterations++;

      labels = getLabels(dataset, centroids);
      centroids = recalculateCentroids(dataset, labels, k);
    }

    const clusters = [];
    for (let i = 0; i < k; i++) {
      clusters.push(labels[i]);
    }
    return clusters;
  } else {
    throw new Error('Invalid dataset');
  }
}

function DBSCAN(dataset, eps, minPts){

  if (CheckVar(dataset)){
    return 0;
  }

  let point = [];
  for (let i = 0; i < dataset.length; i++){
    point[i] = {
      coords: dataset[i],
      cluster: undefined,
      type: "Not visited",
    }
  }

  let numberOfCluster = 0;
  for (let i = 0; i < dataset.length; i++){
    if (point[i].type == "Not visited"){
      let neighbors = RangeQuery(dataset, point, point[i], eps);
      if (neighbors.length < minPts){
        point[i].type = "Noise";
      }
      else{
        numberOfCluster++;
        point[i].type = "Main";
        point[i].cluster = numberOfCluster;

        let setPoints = neighbors;
        for (let i = 0; i < setPoints.length; i++){
          if (setPoints[i].type == "Noise"){
            setPoints[i].type = "Edge";
            setPoints[i].cluster = numberOfCluster;
          }
          if (setPoints[i].type == "Not visited"){
            setPoints[i].type = "Edge";
            setPoints[i].cluster = numberOfCluster;
          }
          neighbors = RangeQuery(dataset, point, setPoints[i], eps);
          if (neighbors.length >= minPts){
            setPoints[i].type = "Main";
            for (let i = 0; i < neighbors.length; i ++){
              if(!(setPoints.includes(neighbors[i]))){
                setPoints.push(neighbors[i]);
              }
            }
          }
        }
      }
    }
  }

  
  point.sort(function (a, b) {
    return a.cluster - b.cluster;
  })

  let number = 1;
  let busy = [];

  for (let i = 0; i < point.length; i ++){
    if ((point[i].cluster != undefined) && !(busy.includes(point[i].cluster))){
      busy.push(point[i].cluster);
  }

  for (let i = 0; i < point.length; i ++){
    if (number < point.length + 1){
      if (point[i].cluster == number){
        number = point[i].cluster + 1;
        while (busy.includes(number)){
          number ++;
        }
      }
      if (point[i].cluster === undefined){
        while (busy.includes(number)){
          number ++;
        }
        point[i].cluster = number;
        number = number + 1;
      }
    }
    
  }

  point.sort(function (a, b) {
    return a.cluster - b.cluster;
  })

  let countOfClusters = point[point.length - 1].cluster;

  let cluster = [];
  for (let i = 0; i < countOfClusters; i++) {
    cluster[i] = {
      points: [],
    }
  }

  let counter = point.length;
  let indexPoint = 0;
  while ((counter > 0) && (indexPoint < point.length)){
    cluster[point[indexPoint].cluster - 1].points.push(point[indexPoint].coords);
    counter --;
    indexPoint ++;
  }
  return cluster;

}
}

function meanShift(dataset, eps){
  if (CheckVar(dataset)){
    return 0;
  }
  let centre = [];

  for (let i = 0; i < dataset.length; i++){
    centre[i] = {
      coords: dataset[i],
      points: [],
      countPoints: 0,
    }
  }

  
  for (let i = 0; i < dataset.length; i ++){
    let oldCentre = centre[i].coords;
    let newCentre = [undefined, undefined];
    while ((oldCentre[0] != newCentre[0]) && (oldCentre[1] != newCentre[1])){
      let neighbors = findingNeighbors(dataset, centre, centre[i], eps);
      centre[i].points = neighbors;
      centre[i].countPoints = centre[i].points.length;
      oldCentre = centre[i].coords;
      centre[i].coords = newCentroid(centre[i].points, centre[i].points.length);
      newCentre = centre[i].coords;
    }
  }

  centre.sort(function (a,b) {
    return b.countPoints - a.countPoints;
  }) 

  let cluster = clustering(centre, centre.length, eps);

  return cluster;
}

//Переменные
var
  canv = document.getElementById('canvas'),
  ctx = canv.getContext('2d'),
  bStart = document.getElementById('start'),
  bReset = document.getElementById('reset'); 
  mas = [];

let
  count = 0;

canv.width = 500;
canv.height = 500;

canv.addEventListener('mousedown', function (e) {
  let
    x = e.pageX - e.target.offsetLeft,
    y = e.pageY - e.target.offsetTop;
  mas[count] = [];
  ctx.beginPath();
  ctx.arc(x, y, 7, 0, Math.PI * 2);
  ctx.fill();
  mas[count][0] = x;
  mas[count][1] = y;
  count++;
  console.log('coordsPoint x:', x,' y:', y);
});

const MAX_ITERATIONS = 50;


//События
bStart.addEventListener('mousedown', function (e) {

  let
    k = +document.getElementById('field').value,
    eps = +document.getElementById('eps').value,
    minPts = +document.getElementById('minPts').value,
    count_point = 0,
    algorithm = document.getElementById('algorithm_selection').value;

  if (algorithm == 'kmeans' | algorithm == 'DBSCAN' | algorithm == "meanShift"){

    if (algorithm == 'kmeans'){
      answer = kMeans(mas, k);
    }
    if (algorithm == 'DBSCAN'){
      answer = DBSCAN(mas, eps, minPts);
      k = answer.length;
    }
    if (algorithm == 'meanShift'){
      answer = meanShift(mas, eps);
      k = answer.length;
    }

    if (answer != 0){
      while (count_point < k) {
        let mas_point = [...answer[count_point].points];
        let choose_color = '#' + (Math.random().toString(16) + '000000').substring(2, 8).toUpperCase();
        for (let i = 0; i < mas_point.length; i++) {
          ctx.beginPath();
          ctx.fillStyle = choose_color;
          ctx.arc(mas_point[i][0], mas_point[i][1], 8, 0, Math.PI * 2);
          ctx.fill();
        }
        count_point++;
      }
      ctx.fillStyle = 'black';
    }
  }
  else{
    count_point = 0;
    answer_kMeans = kMeans(mas, k);
    answer_DBSCAN = DBSCAN(mas, eps, minPts);
    answer_meanShift = meanShift(mas, eps);
    if (answer_kMeans != 0){
      countOfClustersDBSCAN = answer_DBSCAN.length;

      while (count_point < k) {
        let mas_point_KMeans = [...answer_kMeans[count_point].points];
        var choose_color_KMeans = '#' + (Math.random().toString(16) + '000000').substring(2, 8).toUpperCase();
        for (let i = 0; i < mas_point_KMeans.length; i++) {
          ctx.beginPath();
          ctx.fillStyle = choose_color_KMeans;
          ctx.arc(mas_point_KMeans[i][0], mas_point_KMeans[i][1], 8, 0, Math.PI * 2);
          ctx.fill();
        }
        count_point++;
      }

      count_point = 0;
      k = answer_DBSCAN.length;

      while (count_point < k) {
        let mas_point_DBSCAN = [...answer_DBSCAN[count_point].points];
        var choose_color_DBSCAN = '#' + (Math.random().toString(16) + '000000').substring(2, 8).toUpperCase();
        while (choose_color_DBSCAN == choose_color_KMeans){
          choose_color_DBSCAN = '#' + (Math.random().toString(16) + '000000').substring(2, 8).toUpperCase();
        }
        for (let i = 0; i < mas_point_DBSCAN.length; i++) {
          ctx.beginPath();
          ctx.fillStyle = choose_color_DBSCAN;
          ctx.arc(mas_point_DBSCAN[i][0], mas_point_DBSCAN[i][1], 8, Math.PI/ 3, (Math.PI * 5)/3);
          ctx.fill();
        }
        count_point ++;
      }

      count_point = 0;
      k = answer_meanShift.length;

      while (count_point < k) {
        let mas_point_meanShift = [...answer_meanShift[count_point].points];
        var choose_color_meanShift = '#' + (Math.random().toString(16) + '000000').substring(2, 8).toUpperCase();
        while ((choose_color_meanShift == choose_color_DBSCAN) && (choose_color_meanShift === choose_color_KMeans)){
          choose_color_meanShift = '#' + (Math.random().toString(16) + '000000').substring(2, 8).toUpperCase();
        }
        for (let i = 0; i < mas_point_meanShift.length; i++) {
          ctx.beginPath();
          ctx.fillStyle = choose_color_meanShift;
          ctx.arc(mas_point_meanShift[i][0], mas_point_meanShift[i][1], 8, (Math.PI * 2)/ 3, (Math.PI * 4)/3);
          ctx.fill();
        }
        count_point ++;
      }
    }
    ctx.fillStyle = 'black';
  }
});

bReset.addEventListener('mousedown', function (e) {
  mas = [];
  count = 0;
  ctx.clearRect(0, 0, 500, 500);
  ctx.fillStyle = 'black';
  console.clear();
});

