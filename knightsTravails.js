//Update algorithm to Dijkstra's algorithm. Reference: https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm

const Knight = { position: [] };

const Board = { size: 8 };

const Move = (position = [], parent = undefined, path = [], posString = position.toString()) => {
  return { position, parent, path, posString };
};

const MovesTree = (startCoords, endCoords) => {
  const start = Move(startCoords);
  const end = Move(endCoords);
  const paths = [];
  let shortest = 12;
  let count = 0;
  const directions = [
    [2, 1],
    [2, -1],
    [-2, -1],
    [-2, 1],
    [1, 2],
    [-1, 2],
    [-1, -2],
    [1, -2],
  ];

  function buildTree(move = start, path = move.path) {
    const newPath = [...path]; //create duplicate history for children
    newPath.push(move.position.toString()); //push this position into that history
    count++;
    if (newPath.length >= shortest) return;

    //For each position on the board,try all 8 moves.
    for (const element of directions) {
      const newMove = Move(addDirection(move.position, element), move, newPath);

      if (newMove.posString == end.posString) {
        newPath.push(newMove.position.toString()); //push this position into that history
        paths.push(newPath);
        shortest = newPath.length;
        break; // if the move is the target, Stop
      } else if (inBoard(newMove.position) && !moveInPath(newMove, newPath))
        buildTree(newMove, newPath);
    }
  }

  function addDirection(move, direction) {
    return [move[0] + direction[0], move[1] + direction[1]];
  }

  function inBoard(coord) {
    return coord[0] <= Board.size && coord[1] <= Board.size && coord[0] > 0 && coord[1] > 0;
  }

  function moveInPath(move, path) {
    const element = path.find((element) => element === move.posString);

    return element == undefined ? false : true;
  }

  function getCount() {
    return count;
  }
  function getPaths() {
    return paths;
  }

  return { buildTree, getCount, getPaths };
};
