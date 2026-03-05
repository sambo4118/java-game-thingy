(() => {
  window.LEVEL_FILES = window.LEVEL_FILES || {};
  window.GAME_CONSTANTS = window.GAME_CONSTANTS || { METER: 25 };

  const METER = window.GAME_CONSTANTS.METER;
  const WORLD_WIDTH = 800;
  const WORLD_HEIGHT = 500;
  const toPixels = (meters) => meters * METER;

  window.LEVEL_FILES["stair-climb"] = {
    version: 1,
    backgroundColor: "#0f172a",
    playerSpawn: { x: toPixels(3), y: toPixels(10) },
    solids: [
      {
        xPosition: 0,
        yPosition: WORLD_HEIGHT - toPixels(0.5),
        collisionWidth: WORLD_WIDTH,
        collisionHeight: toPixels(0.5),
        backupColor: "#334155",
        friction: 0.5,
        mass: 10
      },
      {
        xPosition: toPixels(4),
        yPosition: toPixels(17),
        collisionWidth: toPixels(3),
        collisionHeight: toPixels(3),
        backupColor: "#475569",
        friction: 0.5,
        mass: 10
      },
      {
        xPosition: toPixels(7),
        yPosition: toPixels(14),
        collisionWidth: toPixels(3),
        collisionHeight: toPixels(3),
        backupColor: "#475569",
        friction: 0.5,
        mass: 10
      },
      {
        xPosition: toPixels(10),
        yPosition: toPixels(11),
        collisionWidth: toPixels(3),
        collisionHeight: toPixels(3),
        backupColor: "#475569",
        friction: 0.5,
        mass: 10
      },
      {
        xPosition: toPixels(13),
        yPosition: toPixels(8),
        collisionWidth: toPixels(3),
        collisionHeight: toPixels(3),
        backupColor: "#475569",
        friction: 0.5,
        mass: 10
      },
      {
        xPosition: toPixels(16),
        yPosition: toPixels(5),
        collisionWidth: toPixels(3),
        collisionHeight: toPixels(3),
        backupColor: "#475569",
        friction: 0.5,
        mass: 10
      },
      {
        xPosition: toPixels(19),
        yPosition: toPixels(2),
        collisionWidth: toPixels(3),
        collisionHeight: toPixels(3),
        backupColor: "#475569",
        friction: 0.5,
        mass: 10
      },
      {
        xPosition: toPixels(22),
        yPosition: toPixels(0),
        collisionWidth: toPixels(3),
        collisionHeight: toPixels(3),
        backupColor: "#475569",
        friction: 0.5,
        mass: 10
      },
      {
        xPosition: WORLD_WIDTH - toPixels(0.5),
        yPosition: WORLD_HEIGHT - toPixels(10.5),
        collisionWidth: toPixels(1),
        collisionHeight: toPixels(10),
        backupColor: "#334155",
        friction: 0.5,
        mass: 1
      },
      {
        xPosition: 0,
        yPosition: WORLD_HEIGHT - toPixels(10.5),
        collisionWidth: toPixels(0.5),
        collisionHeight: toPixels(10),
        backupColor: "#334155",
        friction: 0.5,
        mass: 10
      }
    ]
  };
})();
