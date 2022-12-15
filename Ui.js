let draggingPiece = false;
//#region Board
const board = document.createElement('div');
board.id = 'board';

for (let i = Board.size; i > 0; i--) {
  for (let j = 1; j <= Board.size; j++) {
    const cell = document.createElement('div');
    cell.id = `${j},${i}`;
    cell.addEventListener('mouseup', () => {
      if (!draggingPiece) return;
      updateMarkerPosition(markerToMove, cell.id);
      updateTreePositions([j, i], markerToMove == knight ? 'start' : 'end');
    });
    cell.classList = 'cell ';
    cell.classList +=
      i % 2 == 0 ? (j % 2 == 0 ? 'black' : 'white') : j % 2 == 0 ? 'white' : 'black';
    board.append(cell);
  }
}

//#endregion

//#region  Knight
const knight = document.createElement('img');
knight.src = './assets/knight.png';
knight.id = 'knight';
//#endregion

//#region  Target
const target = document.createElement('img');
target.src = './assets/end.png';
target.id = 'knight';
//#endregion

//#region PawnShelf
const knightLabel = document.createElement('p');
const targetLabel = document.createElement('p');
const pawnShelf = document.createElement('div');

pawnShelf.id = 'pawnShelf';
knightLabel.textContent = 'Start';
targetLabel.textContent = 'End';

//#endregion
const stepBackward = document.createElement('img');
const stepForward = document.createElement('img');
const playBar = document.createElement('div');
const play = document.createElement('img');
const stepMap = document.createElement('p');

//#region playBar
const showControls = (p) => {
  let currentPosition = 0;
  const path = p;
  let stepCount = path.getEnd();

  playBar.id = 'playBar';

  stepBackward.src = './assets/chevronRight.png';
  stepForward.src = './assets/chevronleft.png';
  play.src = './assets/play.png';

  playBar.append(stepBackward, play, stepForward, stepMap);
  //#endregion

  //#region append

  //#endregion

  const updateStepCounter = () => {
    stepMap.textContent = `${currentPosition}/${stepCount}`;
  };
  stepForward.addEventListener('click', () => {
    currentPosition = path.stepForward();
    updateStepCounter();

    updateMarkerPosition(knight, path.getCurrentMove());
  });

  stepBackward.addEventListener('click', () => {
    currentPosition = path.stepBackward();
    updateStepCounter();

    updateMarkerPosition(knight, path.getCurrentMove());
  });
  updateStepCounter();

  const playAnimation = () => {
    path.reset();
    play.classList.toggle('disabled');
    updateMarkerPosition(knight, path.getCurrentMove());

    const playInterval = setInterval(() => {
      if (path.getCurrent() == path.getEnd()) {
        clearInterval(playInterval);
        play.classList.toggle('disabled');
      }
      currentPosition = path.stepForward();
      updateStepCounter();
      updateMarkerPosition(knight, path.getCurrentMove());
    }, 900);
  };
  play.addEventListener('click', playAnimation);
};

pawnShelf.append(knight);
pawnShelf.append(target);
document.body.append(pawnShelf);
document.body.append(board);
document.body.append(playBar);

//#region update pawns width to match cell size
const cellWidth = document.querySelector('.cell').offsetWidth / 1.5;
knight.style.width = cellWidth + 'px';
target.style.width = cellWidth + 'px';
pawnShelf.style.minHeight = pawnShelf.offsetHeight + 'px';
//#endregion

const getCellPosition = (coords) => {
  const id = coords.toString();
  const cell = document.getElementById(id);
  const cellOffset = cell.offsetWidth / 2;
  const rect = cell.getBoundingClientRect();
  const widthOffset = cellOffset - knight.offsetWidth / 2;
  const heightOffset = cellOffset - knight.offsetHeight / 1.5;

  // const cellMid = cell.offsetWidth / 2;
  const position = {
    x: rect.left + widthOffset,
    y: rect.top + heightOffset,
  };
  return position;
};

const updateMarkerPosition = (marker, position) => {
  const screenLocation = getCellPosition(position);
  marker.style.top = screenLocation.y + 'px';
  marker.style.left = screenLocation.x + 'px';
};

let markerToMove = knight;

const dragKnight = (e) => {
  markerToMove = knight;
  knight.style.pointerEvents = 'none';
  target.style.pointerEvents = 'none';
  startDrag(e);
};
const dragTarget = (e) => {
  markerToMove = target;
  knight.style.pointerEvents = 'none';
  target.style.pointerEvents = 'none';
  startDrag(e);
};

knight.addEventListener('mousedown', dragKnight);
target.addEventListener('mousedown', dragTarget);

const startDrag = (e, ele) => {
  draggingPiece = true;
  markerToMove.style.position = 'absolute';
  markerToMove.style.transition = 'all 0s';
  e.preventDefault();
  document.addEventListener('mouseup', endDrag);
  document.addEventListener('mousemove', dragMarker);
};
const endDrag = () => {
  markerToMove.style.position = 'absolute';
  markerToMove.style.transition = 'all 0.3s ease';
  knight.style.pointerEvents = 'all';
  target.style.pointerEvents = 'all';
  document.removeEventListener('mousemove', dragMarker);
  document.removeEventListener('mouseup', endDrag);
  draggingPiece = false;
};

const dragMarker = (e) => {
  e.preventDefault();
  const offset = { x: markerToMove.offsetWidth / 2, y: markerToMove.offsetHeight / 1.5 };
  markerToMove.style.left = e.clientX - offset.x + 'px';
  markerToMove.style.top = e.clientY - offset.y + 'px';
};

const PathNavigator = (inPath) => {
  const path = inPath;
  let position = 0;
  const end = path.length - 1;
  let currentMove = path[0];

  const reset = () => {
    position = 0;
    currentMove = path[0];
  };

  const stepForward = () => {
    if (position + 1 > end) return position;
    position++;
    currentMove = path[position];
    return position;
  };

  const stepBackward = () => {
    if (position - 1 < 0) return position;
    position--;
    currentMove = path[position];
    return position;
  };

  const getEnd = () => {
    return end;
  };

  const getCurrent = () => {
    return position;
  };

  const getCurrentMove = () => {
    return currentMove;
  };

  return {
    stepBackward,
    stepForward,
    getEnd,
    getCurrent,
    getCurrentMove,
    reset,
  };
};

let start = undefined;
let end = undefined;
const updateTreePositions = (p, marker) => {
  start = marker == 'start' ? p : start;
  end = marker == 'end' ? p : end;
  console.log({ start, end });

  if (start != undefined && end != undefined) runEvaluation(start, end);
};

const runEvaluation = (start, end) => {
  let tree = null;
  tree = MovesTree(start, end);
  tree.buildTree();
  let paths = tree.getPaths();
  paths = paths.sort((a, b) => a.length - b.length);

  console.log(`\n\n\nStart: [${start}]\nEnd: [${end}]`);

  console.log(`Total paths checked ${paths.length}`);

  console.log(`\nYou made it in ${paths[0].length} moves! Here's how:`);
  paths[0].forEach((move) => {
    console.log(`   [${move}]`);
  });

  console.log(`\nYou could have taken up to ${paths.at(-1).length} moves! Here's how:`);
  paths.at(-1).forEach((move) => {
    console.log(`   [${move}]`);
  });

  const path = PathNavigator(paths[0]);
  showControls(path);
};
