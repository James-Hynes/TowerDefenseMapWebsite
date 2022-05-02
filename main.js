let url = window.location.href.split("#");
let m = atob(url[1]).split(',');
let dimensions = atob(url[2]).split(',');
let theme = atob(url[3]);
console.log(theme);

let map = [];
for(let i = 0; i < parseInt(dimensions[1]); i++) {
  map.push([]);
  for(let j = 0; j < parseInt(dimensions[0]); j++) {
    map[i].push(m[(i * parseInt(dimensions[0])) + j]);
  }
}

let ratings = {layoutrating: -1, visualbugs: -1};


function layoutClick(rating) {
  let layoutButtons = document.getElementsByClassName("layoutrating");
  unCheckGroup(layoutButtons);
  layoutButtons[rating-1].classList.add("checked");
  console.log(layoutButtons);
  ratings['layoutrating']=rating;
}

function visualBugClick(rating) {
  let bugButtons = document.getElementsByClassName("visualbugs");
  unCheckGroup(bugButtons);
  bugButtons[rating-1].classList.add("checked");
  console.log(bugButtons);
  ratings['visualbugs']= ((rating === 1) ? true : false);
}

function submitAnswers() {
  document.body.innerHTML="";
  let n = document.createElement("h1");
  n.innerHTML = "Thank you";
  let m = document.createElement("h2");
  document.body.appendChild(n);
  m.innerHTML="You can close this window now!";
  document.body.appendChild(m);
}

function unCheckGroup(group) {
  for(let object of group) {
    object.classList.remove("checked");
  }
}

let tileFrameNames;
let tileLayer;

let config = {
  type: Phaser.AUTO,
  width: 620,
  height: 350,
  scene: {
    create: create,
    preload: preload,
    update: update
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: true,
      gravity: { y: 0 },
    }
  }
}

function preload() {
  this.load.atlas('tdtiles', './res/tdtilesheet.png', './res/tdtilesheet.json');
}

function create() {
  let texture = this.textures.get('tdtiles');
  tileLayer = this.add.layer();
  tileFrameNames = texture.getFrameNames();
  this.tileMap = createTileMap(this, map);
  for(let i = 0 ; i < map.length; i++) {
    for(let j = 0; j < map[i].length; j++) {
      let im = getRoadImageType(this.tileMap, j, i);
      let t = getTile(this.tileMap, j, i);
      t.setTexture('tdtiles', im);
    }
  }
}

function update() {
}


function createTileMap(scene, map) {
  let tmap = [];
  for(let i = 0; i < map.length; i++) {
    tmap.push([]);
    for(let j = 0; j < map[i].length; j++) {
      let t = getTile(map, j, i);
      let tile = new Tile(scene, t, j, i);
      tmap[i].push(tile);
      tileLayer.add(tile);
    }
  }
  return tmap;
}

function getTile(map, x, y) {
  if(map[y] !== undefined && map[y][x] !== undefined) {
    return map[y][x];
  }
  return -1;
}

function getRoadImageType(map, x, y) {
  let tile = getTileType(map, x, y);
  if(tile === "S" || tile === "E") {
    let vertical_connections = getVerticalConnections(map, x, y);
    let horizontal_connections = getHorizontalConnections(map, x, y);
    // let t = getTile(map, horizontal_connections[1][0], horizontal_connections[1][1]);
    let sameTileConnection = getSameTileConnections2(map, x, y)[0];

    if(sameTileConnection[0] === x) {
      if(getTileType(map, x-1, y) === "P") {
        if(sameTileConnection[1] > y) {
          return tileFrameNames[THEME_KEY[theme]["startRight"]];
        } else {
          return tileFrameNames[THEME_KEY[theme]["endRight"]];
        }
      } else {
        if(sameTileConnection[1] > y) {
          return tileFrameNames[THEME_KEY[theme]["startLeft"]];
        } else {
          return tileFrameNames[THEME_KEY[theme]["endLeft"]];
        }
      }
    } else if (sameTileConnection[1] === y) {
      if(getTileType(map, x, y-1) === "P") {
        if(sameTileConnection[0] > x) {
          return tileFrameNames[THEME_KEY[theme]["endLeft"]];
        } else {
          return tileFrameNames[THEME_KEY[theme]["endRight"]];
        }
      } else {
        if(sameTileConnection[0] > x) {
          return tileFrameNames[THEME_KEY[theme]["startLeft"]];
        } else {
          return tileFrameNames[THEME_KEY[theme]["startRight"]];
        }
      }
    }
    // if(getTile(map, horizontal_connections[0][0], horizontal_connections[0][1]) > )


    if(getTileType(map, x+1, y) === tile) {
      return tileFrameNames[THEME_KEY[theme][i + "Left"]];
    } else if(getTileType(map, x-1, y) === tile) {
      return tileFrameNames[THEME_KEY[theme][i + "Right"]];
    }
  }

  if(tile === "P") {
    let vertical_connections = getVerticalConnections(map, x, y);
    let horizontal_connections = getHorizontalConnections(map, x, y);

    // Vertical Roads have 2 vertically adjacent path tiles and 1 horizontally adjacent path tile, whereas horizontal roads have the inverse
    // Turns have either 1 or 2 of each, depending on whether they're inside or outside turns.
    // to determine which direction an inside turn is the we find its diagonally adjacent non-path tile
    // the location of that tile shows which kind of turn tile is needed.
    if(vertical_connections.length === 2 && horizontal_connections.length === 1) {
      return tileFrameNames[((horizontal_connections[0][0] > x) ? THEME_KEY[theme]["verticalLeft"] :THEME_KEY[theme]["verticalRight"])]
    } else if(vertical_connections.length === 1 && horizontal_connections.length === 2) {
      return tileFrameNames[((vertical_connections[0][1] > y) ? THEME_KEY[theme]["horizontalTop"] : THEME_KEY[theme]["horizontalBottom"])]
    } else {
      if(vertical_connections.length === 2 && horizontal_connections.length === 2) {
        if(vertical_connections[1][1] > y) {
          let turnType = getAdjacentEmptyTileRelative(map, x, y);
          if(turnType[0] === 1 && turnType[1] === -1) {
            return tileFrameNames[THEME_KEY[theme]["insideTopRight"]]
          } else if (turnType[0] === -1 && turnType[1] === 1) {
            return tileFrameNames[THEME_KEY[theme]["insideBottomLeft"]];
          } else if(turnType[0] === -1 && turnType[1] === -1) {
            return tileFrameNames[THEME_KEY[theme]["insideTopLeft"]];
          } else if(turnType[0] === 1 && turnType[1] === 1) {
            return tileFrameNames[THEME_KEY[theme]["insideBottomRight"]];
          }
        }
      } else {
        if(horizontal_connections[0][0] < x) {
          if(vertical_connections[0][1] < y) {
            return tileFrameNames[THEME_KEY[theme]["outsideBottomRight"]];
          }
          return tileFrameNames[THEME_KEY[theme]["outsideTopRight"]];
        } else {
          if(vertical_connections[0][1] > y) {
            return tileFrameNames[THEME_KEY[theme]["outsideTopLeft"]];
          }
        }
        return tileFrameNames[THEME_KEY[theme]["outsideBottomLeft"]];
      }
    }
  }
  return tileFrameNames[THEME_KEY[theme]["ground"][Math.floor(Math.random() * THEME_KEY[theme]["ground"].length)]];
}

function getTileType(map, x, y) {
  if(map[y] !== undefined && map[y][x] !== undefined) {
    return map[y][x].type;
  }
  return -1;
}


function getSameTileConnections(map, x, y) {
  let startX = (x > 0) ? x-1 : x;
  let startY = (y > 0) ? y-1 : y;
  let endX = (x < map[0].length) ? x+1 : x;
  let endY = (y < map[0].length) ? y+1 : y;

  let connections = [];
  let tile = getTileType(map, x, y);
  if(tile === "E" || tile === "S") {
    tile="P";
  }
  for(let i = startY; i <= endY; i++) {
    for(let j = startX; j <= endX; j++) {
      if(getTileType(map, j, i) == tile && !(x === j && y === i)) {
        connections.push([j, i]);
      } else if(tile === "P") {
        if(getTileType(map, j, i) == "E" || getTileType(map, j, i) == "S") {
          connections.push([j, i]);
        }
      }
    }
  }
  return connections;
}

function getSameTileConnections2(map, x, y) {
  let startX = (x > 0) ? x-1 : x;
  let startY = (y > 0) ? y-1 : y;
  let endX = (x < map[0].length) ? x+1 : x;
  let endY = (y < map[0].length) ? y+1 : y;

  let connections = [];
  let tile = getTileType(map, x, y);

  for(let i = startY; i <= endY; i++) {
    for(let j = startX; j <= endX; j++) {
      if(getTileType(map, j, i) == tile && !(x === j && y === i)) {
        connections.push([j, i]);
      }
    }
  }
  return connections;
}

function getNeighboringPathTiles(map, x, y) {
  let w = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  let tmpArr = [];
  for(let a of w) {
    let t = getTile(map, x+a[0], y+a[1]);
    if(["P", "E"].indexOf(t.type) > -1) {
      tmpArr.push(t);
    }
  }
  return tmpArr;
}

function getVerticalConnections(map, x, y) {
  let connections = getSameTileConnections(map, x, y);
  let vert_connections = [];
  for(let i = 0; i < connections.length; i++) {
    if(x === connections[i][0]) {
      vert_connections.push(connections[i])
    }
  }
  return vert_connections;
}

function getHorizontalConnections(map, x, y) {
  let connections = getSameTileConnections(map, x, y);
  let horizontal_connections = [];
  for(let i = 0; i < connections.length; i++) {
    if(y === connections[i][1]) {
      horizontal_connections.push(connections[i])
    }
  }
  return horizontal_connections;
}

function getAdjacentEmptyTile(map, x, y) {
  let startX = (x > 0) ? x-1 : x;
  let startY = (y > 0) ? y-1 : y;
  let endX = (x < map[0].length) ? x+1 : x;
  let endY = (y < map[0].length) ? y+1 : y;

  for(let i = startY; i <= endY; i++) {
    for(let j = startX; j <= endX; j++) {
      if(getTileType(map, j, i) === "G") {
        return [j, i];
      }
    }
  }
}

function getAdjacentEmptyTileRelative(map, x, y) {
  let startX = (x > 0) ? x-1 : x;
  let startY = (y > 0) ? y-1 : y;
  let endX = (x < map[0].length) ? x+1 : x;
  let endY = (y < map[0].length) ? y+1 : y;

  for(let i = startY; i <= endY; i++) {
    for(let j = startX; j <= endX; j++) {
      if(getTileType(map, j, i) === "G") {
        return [j-x, i-y];
      }
    }
  }
}

function getTilesOfType(map, t) {
  let tiles = [];
  for(let i = 0; i < map.length; i++) {
    for(let j = 0; j < map[i].length; j++) {
      if(getTile(map, j, i).type === t) {
        tiles.push(getTile(map, j, i));
      }
    }
  }
  return tiles;
}

const THEME_KEY = {
  "dirt/grass": {"startLeft": 2, "startRight": 3, "endLeft": 25, "endRight": 26, "verticalLeft": 24, "verticalRight": 22, "horizontalTop": 46, "horizontalBottom": 0, "ground": [23, 161, 156], "insideTopRight": 45, "insideBottomLeft": 1, "insideBottomRight": 298, "insideTopLeft": 47, "outsideBottomRight": 26, "outsideBottomLeft": 25, "outsideTopLeft": 2, "outsideTopRight": 3},
  "dirt/sand": {"startLeft": 7, "startRight": 8, "endLeft": 30, "endRight": 31, "verticalLeft": 29, "verticalRight": 27, "horizontalTop": 51, "horizontalBottom": 5, "ground": [28, 97, 159, 240], "insideTopRight": 50, "insideBottomLeft": 6, "insideBottomRight": 4, "insideTopLeft": 52, "outsideBottomRight": 31, "outsideBottomLeft": 30, "outsideTopLeft": 7, "outsideTopRight": 8},
  "dirt/stone": {"startLeft": 12, "startRight": 13, "endLeft": 35, "endRight": 36, "verticalLeft": 34, "verticalRight": 32, "horizontalTop": 56, "horizontalBottom": 10, "ground": [102, 158, 171], "insideTopRight": 55, "insideBottomLeft": 11, "insideBottomRight": 9, "insideTopLeft": 57, "outsideBottomRight": 36, "outsideBottomLeft": 35, "outsideTopLeft": 12, "outsideTopRight": 13},
  "grass/dirt": {"startLeft": 71, "startRight": 72, "endLeft": 94, "endRight": 95, "verticalLeft": 93, "verticalRight": 91, "horizontalTop": 115, "horizontalBottom": 69, "ground": [92, 235, 166, 157], "insideTopRight": 114, "insideBottomLeft": 70, "insideBottomRight": 68, "insideTopLeft": 116, "outsideBottomRight": 95, "outsideBottomLeft": 94, "outsideTopLeft": 71, "outsideTopRight": 72},
  "grass/sand": {"startLeft": 76, "startRight": 77, "endLeft": 99, "endRight": 100, "verticalLeft": 98, "verticalRight": 96, "horizontalTop": 120, "horizontalBottom": 74, "ground": [28, 97, 159, 240], "insideTopRight": 119, "insideBottomLeft": 75, "insideBottomRight": 73, "insideTopLeft": 121, "outsideBottomRight": 100, "outsideBottomLeft": 99, "outsideTopLeft": 76, "outsideTopRight": 77},
  "grass/stone": {"startLeft": 81, "startRight": 82, "endLeft": 104, "endRight": 105, "verticalLeft": 103, "verticalRight": 101, "horizontalTop": 125, "horizontalBottom": 79, "ground": [102, 158, 171], "insideTopRight": 124, "insideBottomLeft": 80, "insideBottomRight": 78, "insideTopLeft": 126, "outsideBottomRight": 105, "outsideBottomLeft": 104, "outsideTopLeft": 81, "outsideTopRight": 82},
  "sand/grass": {"startLeft": 140, "startRight": 141, "endLeft": 163, "endRight": 164, "verticalLeft": 162, "verticalRight": 160, "horizontalTop": 184, "horizontalBottom": 138, "ground": [23, 161, 156], "insideTopRight": 183, "insideBottomLeft": 139, "insideBottomRight": 137, "insideTopLeft": 185, "outsideBottomRight": 164, "outsideBottomLeft": 163, "outsideTopLeft": 140, "outsideTopRight": 141},
  "sand/dirt": {"startLeft": 145, "startRight": 146, "endLeft": 168, "endRight": 169, "verticalLeft": 167, "verticalRight": 165, "horizontalTop": 189, "horizontalBottom": 143, "ground": [92, 235, 166, 157], "insideTopRight": 188, "insideBottomLeft": 144, "insideBottomRight": 142, "insideTopLeft": 190, "outsideBottomRight": 169, "outsideBottomLeft": 168, "outsideTopLeft": 145, "outsideTopRight": 146},
  "sand/stone": {"startLeft": 150, "startRight": 151, "endLeft": 173, "endRight": 174, "verticalLeft": 172, "verticalRight": 170, "horizontalTop": 194, "horizontalBottom": 148, "ground": [102, 158, 171], "insideTopRight": 193, "insideBottomLeft": 149, "insideBottomRight": 147, "insideTopLeft": 195, "outsideBottomRight": 174, "outsideBottomLeft": 173, "outsideTopLeft": 150, "outsideTopRight": 151},
  "stone/grass": {"startLeft": 209, "startRight": 210, "endLeft": 232, "endRight": 233, "verticalLeft": 231, "verticalRight": 229, "horizontalTop": 253, "horizontalBottom": 207, "ground": [23, 161, 156], "insideTopRight": 252, "insideBottomLeft": 208, "insideBottomRight": 206, "insideTopLeft": 254, "outsideBottomRight": 233, "outsideBottomLeft": 232, "outsideTopLeft": 209, "outsideTopRight": 210},
  "stone/dirt": {"startLeft": 214, "startRight": 215, "endLeft": 237, "endRight": 238, "verticalLeft": 236, "verticalRight": 234, "horizontalTop": 258, "horizontalBottom": 212, "ground": [92, 235, 166, 157], "insideTopRight": 257, "insideBottomLeft": 213, "insideBottomRight": 211, "insideTopLeft": 259, "outsideBottomRight": 238, "outsideBottomLeft": 237, "outsideTopLeft": 214, "outsideTopRight": 215},
  "stone/sand": {"startLeft": 219, "startRight": 220, "endLeft": 242, "endRight": 243, "verticalLeft": 241, "verticalRight": 239, "horizontalTop": 263, "horizontalBottom": 217, "ground": [28, 97, 159, 240], "insideTopRight": 262, "insideBottomLeft": 218, "insideBottomRight": 216, "insideTopLeft": 264, "outsideBottomRight": 243, "outsideBottomLeft": 242, "outsideTopLeft": 219, "outsideTopRight": 220},
}

// let theme = "dirt/grass";

let game = new Phaser.Game(config);
