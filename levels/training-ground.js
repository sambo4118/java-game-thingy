(() => {
  window.LEVEL_FILES = window.LEVEL_FILES || {};
  window.GAME_CONSTANTS = window.GAME_CONSTANTS || { METER: 25 };

  const METER = window.GAME_CONSTANTS.METER;
  const WORLD_WIDTH = 800;
  const WORLD_HEIGHT = 500;
  const px = (meters) => meters * METER;

  window.LEVEL_FILES["training-ground"] = {
    version: 1,
    backgroundColor: "#1e293b",
    playerSpawn: { x: px(16), y: px(10) },
    solids: [
      {
        xPosition: 0,
        yPosition: WORLD_HEIGHT - px(0.5),
        collisionWidth: WORLD_WIDTH * 2,
        collisionHeight: px(0.5),
        backupColor: "#334155",
        friction: 0.5,
        mass: 10
      },
      {
        xPosition: px(16),
        yPosition: WORLD_HEIGHT - px(3),
        collisionWidth: px(2),
        collisionHeight: px(0.5),
        backupColor: "#334155",
        friction: 0.5,
        mass: 10
      },
      {
        xPosition: WORLD_WIDTH - px(0.5),
        yPosition: WORLD_HEIGHT - px(10.5),
        collisionWidth: px(1),
        collisionHeight: px(10),
        backupColor: "#334155",
        friction: 0.5,
        mass: 1
      },
      {
        xPosition: 0,
        yPosition: WORLD_HEIGHT - px(10.5),
        collisionWidth: px(0.5),
        collisionHeight: px(10),
        backupColor: "#334155",
        friction: 0.5,
        mass: 10
      }
    ]
  };
})();
