// First we get the viewport height and we multiple it by 1% to get a value for a vh unit
let vh = window.innerHeight * 0.01;
// Then we set the value in the --vh custom property to the root of the document
document.documentElement.style.setProperty('--vh', `${vh}px`);
// We listen to the resize event
window.addEventListener('resize', () => {
  // We execute the same script as before
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
});
//Code from https://stackoverflow.com/a/60229913/17977603

let draggingPiece = false;
//#region Board
const board = document.createElement('div');
board.id = 'board';
let up = null;

const placementSound = new Audio('./assets/place.wav');

for (let i = Board.size; i > 0; i--) {
  for (let j = 1; j <= Board.size; j++) {
    const cell = document.createElement('div');
    cell.id = `${j},${i}`;
    cell.classList = 'cell ';
    cell.classList +=
      i % 2 == 0 ? (j % 2 == 0 ? 'black' : 'white') : j % 2 == 0 ? 'white' : 'black';
    board.append(cell);
  }
}

const Speaker = (sound) => {
  const s = sound;
  let playing = false;
  const playSound = async (sound, delay = 0) => {
    playing = true;
    setTimeout(() => {
      sound.play();
    }, delay);
  };
  const play = () => {
    playing = true;
    s.play();
  };
  const pause = () => {
    playing = false;
    s.pause();
  };
  const setVolume = (volume) => {
    s.volume = volume;
  };

  const isPlaying = () => {
    return playing;
  };

  return { playSound, play, pause, setVolume, isPlaying };
};

const soundEffects = Speaker();
const music = Speaker(new Audio('./assets/music.mp3'));
music.setVolume(0.05);

let animationInterval = null;

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

let path = undefined;

const musicButton = document.getElementById('toggleMusic');
musicButton.addEventListener('click', () => {
  if (music.isPlaying()) {
    music.pause();
    musicButton.src = './assets/musicOff.png';
  } else {
    music.play();
    musicButton.src = './assets/musicOn.png';
  }
});
let stepCount = 0;

//#region playBar
const showControls = (p) => {
  let currentPosition = 0;
  path = p;
  stepCount = path.getEnd();
  playBar.id = 'playBar';

  stepBackward.src = './assets/chevronRight.png';
  stepForward.src = './assets/chevronLeft.png';
  play.src = './assets/play.png';
  stepBackward.className = 'icon';
  stepForward.className = 'icon';
  play.className = 'icon';

  playBar.append(stepBackward, play, stepForward, stepMap);
  //#endregion

  //#region append

  //#endregion

  const updateStepCounter = () => {
    stepMap.textContent = `${currentPosition}/${stepCount}`;
  };

  const stepBackwardHandler = () => {
    stopAnimation();
    if (path.getCurrent() == 0) return;

    currentPosition = path.stepBackward();
    updateStepCounter();

    updateMarkerPosition(knight, path.getCurrentMove());
    soundEffects.playSound(placementSound, 150);
  };
  const stepForwardHandler = () => {
    if (path.getCurrent() == path.getEnd()) return;

    currentPosition = path.stepForward();
    updateStepCounter();

    updateMarkerPosition(knight, path.getCurrentMove());
    soundEffects.playSound(placementSound, 150);
  };

  stepForward.addEventListener('click', stepForwardHandler);

  stepBackward.addEventListener('click', stepBackwardHandler);

  updateStepCounter();

  const playAnimation = async () => {
    stopAnimation();
    await updateMarkerPosition(target, path.getEndMove());
    await updateMarkerPosition(knight, path.getStart());

    if (!path.isAtStart()) {
      soundEffects.playSound(placementSound, 150);
      path.reset();
    } else stepForwardHandler();

    animationInterval = setInterval(() => {
      if (path.getCurrent() == path.getEnd()) stopAnimation();
      stepForwardHandler();
    }, 950);
  };

  play.addEventListener('click', playAnimation);
};

const stopAnimation = () => {
  clearInterval(animationInterval);
};

const spreader = document.createElement('div');
spreader.className = 'spreader';

pawnShelf.append(knight);
pawnShelf.append(target);

document.body.append(pawnShelf);
document.body.append(board);
document.body.append(playBar);

//#region update pawns width to match cell size

//#endregion

const rescaleItems = () => {
  const cellWidth = document.querySelector('.cell').offsetWidth / 1.5;
  knight.style.width = cellWidth + 'px';
  target.style.width = cellWidth + 'px';
  if (path == undefined) return;
  updateMarkerPosition(knight, path.getCurrentMove());
  updateMarkerPosition(target, path.getEndMove());
};

setTimeout(() => {
  rescaleItems();
}, 10);

window.addEventListener('resize', () => {
  rescaleItems();
});

const getCellPosition = (coords) => {
  const id = coords.toString();
  const cell = document.getElementById(id);
  const cellOffset = cell.offsetWidth / 2;
  const rect = cell.getBoundingClientRect();
  const widthOffset = cellOffset - knight.offsetWidth / 2;
  const heightOffset = cellOffset - knight.height * 1.2;

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
  setTimeout(() => {
    return; //wait for our 0.3s animation
  }, 300);
};

let markerToMove = knight;

const dragKnight = (e) => {
  markerToMove = knight;

  startDrag(e);
};
const dragTarget = (e) => {
  markerToMove = target;

  startDrag(e);
};

knight.addEventListener('pointerdown', dragKnight);
target.addEventListener('pointerdown', dragTarget);

const startDrag = (e) => {
  stopAnimation();
  e.preventDefault();
  draggingPiece = true;
  markerToMove.style.position = 'absolute';
  markerToMove.style.transition = 'all 0s';
  knight.style.pointerEvents = 'none';
  target.style.pointerEvents = 'none';
  target.style.touchAction = 'none';
  knight.style.touchAction = 'none';
  document.addEventListener('pointerup', endDrag);
  document.addEventListener('pointermove', dragMarker);
};
const endDrag = (e) => {
  e.preventDefault();
  markerToMove.style.position = 'absolute';
  markerToMove.style.transition = 'all 0.3s ease-in-out 0s';
  knight.style.pointerEvents = 'all';
  target.style.pointerEvents = 'all';
  target.style.touchAction = 'all';
  knight.style.touchAction = 'all';
  soundEffects.playSound(placementSound, 0);

  let cell = getCellAtEventPoint(e);

  if (cell != null) dropMarkerOnCell(cell.id);

  document.removeEventListener('pointermove', dragMarker);
  document.removeEventListener('pointerup', endDrag);
  draggingPiece = false;
};

const getCellAtEventPoint = (e) => {
  const elementStack = document.elementsFromPoint(e.pageX, e.pageY);
  const cell = elementStack.filter((element) => element.classList.contains('cell'));
  return cell[0];
};

const dropMarkerOnCell = (id) => {
  if (!draggingPiece) return;
  const x = parseInt(id.split(',')[0]);
  const y = parseInt(id.split(',')[1]);
  updateMarkerPosition(markerToMove, id);

  if (path != undefined && markerToMove == target) {
    let newStart = path.getCurrentMove().split(',');
    newStart = [parseInt(newStart[0]), parseInt(newStart[1])];
    updateTreePositions(newStart, 'start');
  }

  updateTreePositions([x, y], markerToMove == knight ? 'start' : 'end');
};

const dragMarker = (e) => {
  e.preventDefault();
  const xPos = e.clientX;
  const yPos = e.clientY;
  const offset = { x: markerToMove.offsetWidth / 2, y: markerToMove.height * 1.2 };
  markerToMove.style.left = xPos - offset.x + 'px';
  markerToMove.style.top = yPos - offset.y + 'px';
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

  const getEndMove = () => {
    return path.at(-1);
  };

  const getStart = () => {
    return path[0];
  };

  const isAtStart = () => {
    return position == 0;
  };

  const getCurrent = () => {
    return position;
  };

  const getCurrentMove = () => {
    return currentMove;
  };
  const setToStart = () => {
    reset();
    return path[0];
  };

  return {
    stepBackward,
    stepForward,
    getEnd,
    getCurrent,
    getCurrentMove,
    reset,
    setToStart,
    getStart,
    isAtStart,
    getEndMove,
  };
};

let start = undefined;
let end = undefined;

const updateTreePositions = (p, marker, runIfValid = true) => {
  const newStart = marker == 'start' ? p : start;
  const newEnd = marker == 'end' ? p : end;
  if (
    JSON.stringify(newStart) == JSON.stringify(start) &&
    JSON.stringify(newEnd) == JSON.stringify(end)
  )
    return;
  start = newStart;
  end = newEnd;
  if (start == undefined || end == undefined) return;

  if (runIfValid) runEvaluation(start, end);
};

const runEvaluation = async (start, end) => {
  let tree = null;
  tree = MovesTree(start, end);
  tree.buildTree();
  let paths = tree.getPaths();
  paths = paths.sort((a, b) => a.length - b.length);

  const newPath = PathNavigator(paths[0]);
  if (path == undefined) showControls(newPath);
  path = newPath;
  stepMap.textContent = `0/${newPath.getEnd()}`;
};
