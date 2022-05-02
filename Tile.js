class Tile extends Phaser.GameObjects.Sprite {
  constructor(scene, t, x, y) {
    super(scene, x*32, y*32, "tdtiles", tileFrameNames[0]);
    this.setOrigin(0.5, 0.5);
    this.setScale(0.5, 0.5);
    this.type = t;
    this.tileX = x;
    this.tileY = y;
    this.tower;
    this.decorations = [];
    this.occupied = false;
    this.image_type = "";
    this.ghost_tower;
    this.ghost_tower_base;

    this.discovered  = false;
    this.prev = false;
  }

  isOccupied() {
    return this.occupied;
  }

  getPos() {
    return [this.x, this.y];
  }

  getType() {
    return this.type;
  }
  
  toString() {
    return "Tile, Type: "+this.type+", Position: ["+this.tileX+", "+this.tileY+"], Image: "+this.frame.name+", Towers: []";
  }

  addTower(scene, t, x, y, base, im, radius) {
    this.tower = new Tower(scene, t, x, y, im, base, radius);
    this.scene.towerLayer.add(this.tower);
    this.occupied = true;
  }

  addDecoration(im) {
    this.scene.decorationLayer.add(im);
    this.decorations.push(im);
    this.occupied = true;
  }

  setImageType(image_num) {
    let im_type = getKeyByValue(THEME_KEY[theme], image_num);
    if(im_type) {
      this.image_type = im_type;
      return;
    }
    this.image_type = "ground";
  }

  clearDecorations() {
    for(let decoration of this.decorations) {
      this.decorations.splice(this.decorations.indexOf(decoration), 1);
      decoration.destroy();
    }
    if(!this.tower) {
      this.occupied = false;
    }
  }

  setGhostTower(ghost_tower_base, ghost_tower) {
    this.ghost_tower = ghost_tower;
    this.ghost_tower_base = ghost_tower_base;
    this.scene.towerLayer.add([this.ghost_tower_base, this.ghost_tower]);
  }

  removeGhostTower() {
    if(this.ghost_tower) {
      this.ghost_tower.destroy();
      this.ghost_tower = null;
      this.ghost_tower_base.destroy();
      this.ghost_tower_base = null;
      this.scene.towerLayer.remove([this.ghost_tower, this.ghost_tower_base]);
    }
  }

}