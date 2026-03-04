const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const METER = 10; // 1 meter = 100 pixels
const GRAVITY = 9.8 * METER; // 9.8 m/s² (Earth's gravity)
const MIDSCREENX = canvas.width / 2;
const MIDSCREENY = canvas.height / 2;
const SOFTMOVEMENTSPEED = 5; // in meters per second
const DOUBLETAPWINDOW = 1; // seconds
const DASHSPEED = 10; // in meters per second
const DASHCOOLDOWN = 0.5; // seconds cooldown when grounded
const FASTFALLCOOLDOWN = 0.1; // seconds cooldown for fast fall
const deltaTimeModifier = 2; // for testing purposes, can be used to slow down or speed up time

let lastLeftTap = -999;
let lastRightTap = -999;
let lastUpTap = -999;
let lastDownTap = -999;
let lastDashTime = -999;
let lastFastFallTime = -999;
let airDashCharged = true;
let wasGrounded = false;

class Actor {
	static all = [];
	
	constructor({
		xPosition,
		yPosition,
		collisionWidth,
		collisionHeight,
		textureSource = null,
		frameWidth = collisionWidth,
		frameHeight = collisionHeight,
		framecount = 0,
		frame = 0,
		frameTime = 0,
		fps = 10,
		backupColor = "#fff",
		velocityX = 0,
		velocityY = 0,
		dynamic = true,
		timescale = 1,
		friction = null,
		mass = 1,
		gravity = GRAVITY
	}) {
		this.xPosition = xPosition;
		this.yPosition = yPosition;
		this.collisionWidth = collisionWidth;
		this.collisionHeight = collisionHeight;
		this.textureSource = textureSource;
		this.texture = new Image();
		if (textureSource) {
			this.texture.src = textureSource;
		}
		this.frameWidth = frameWidth;
		this.frameHeight = frameHeight;
		this.framecount = framecount;
		this.frame = frame;
		this.frameTime = frameTime;
		this.fps = fps;
		this.backupColor = backupColor;
		this.velocityX = velocityX;
		this.velocityY = velocityY;
		this.dynamic = dynamic;
		this.timescale = timescale;
		this.friction = friction;
		this.mass = mass;
		this.gravity = gravity;
		
		Actor.all.push(this);
	}

	update(deltaTime, colliders = []) {
		const scaledDeltaTime = deltaTime * this.timescale;
		this.updateAnimation(scaledDeltaTime);
		if (!this.dynamic) return;
		
		this.applyPhysics(scaledDeltaTime);
		const collision = this.detectCollision(scaledDeltaTime, colliders);
		this.applyMovement(scaledDeltaTime, collision, colliders);
		this.applyFriction(scaledDeltaTime); // Apply friction AFTER movement sets groundedActor
	}

	updateAnimation(deltaTime) {
		
		this.frameTime += deltaTime;
		const frameDuration = 1 / this.fps;
		
		if (!(this.framecount > 0)) return;
		
		while (this.frameTime >= frameDuration) {
			this.frameTime -= frameDuration;
			this.frame = (this.frame + 1) % this.framecount;
		}
	}

	applyPhysics(deltaTime) {
		this.velocityY += this.gravity * deltaTime;
	}

	applyFriction(deltaTime) {
		if (!this.isGrounded || !this.groundedActor) return;
		if (this.friction === null || this.groundedActor.friction === null) return;
		if (this.velocityX === 0) return;

		const combinedFriction = Math.sqrt(this.friction * this.groundedActor.friction);
		const normalForce = this.mass * GRAVITY;
		const frictionForce = combinedFriction * normalForce;
		const frictionAcceleration = frictionForce / this.mass;

		if (this.velocityX > 0) {
			
			this.velocityX -= frictionAcceleration * deltaTime;
			if (this.velocityX < 0) this.velocityX = 0; // prevent overshooting to the other direction
		
		} else {
			
			this.velocityX += frictionAcceleration * deltaTime;	
			if (this.velocityX > 0) this.velocityX = 0; // prevent overshooting to the other direction
		}
	}

	detectCollision(deltaTime, colliders) {
		let earliestHit = null;
		for (const otherActor of colliders) {
			if (otherActor === this) continue; // Skip self
			const hit = this.collisionRaycast(otherActor, deltaTime);
			if (!hit) continue;
			if (!earliestHit || hit.hitTimeInThisFrame < earliestHit.hitTimeInThisFrame) {
				earliestHit = hit;
				earliestHit.otherActor = otherActor;
			}
		}
		return earliestHit;
	}

	applyMovement(deltaTime, collision, colliders) {
		this.isGrounded = false;
		this.groundedActor = null;
		
		let velX = this.velocityX;
		let velY = this.velocityY;
		let remainingTime = deltaTime;
		let iterations = 0;
		const maxIterations = 4;
		
		while (remainingTime > 0.0001 && iterations < maxIterations) {
			if (!collision) {
				this.xPosition += velX * remainingTime;
				this.yPosition += velY * remainingTime;
				break;
			}

			const moveTime = remainingTime * collision.hitTimeInThisFrame;
			this.xPosition += velX * moveTime;
			this.yPosition += velY * moveTime;

			if (collision.collisionNormalX !== 0) {
				velX = 0;
			}
			if (collision.collisionNormalY !== 0) {
				velY = 0;
				if (collision.collisionNormalY < 0) {
					this.isGrounded = true;
					this.groundedActor = collision.otherActor;
				}
			}
			

			remainingTime *= (1 - collision.hitTimeInThisFrame);
			

			const oldVelX = this.velocityX;
			const oldVelY = this.velocityY;
			this.velocityX = velX;
			this.velocityY = velY;
			

			collision = this.detectCollision(remainingTime, colliders);
			

			this.velocityX = oldVelX;
			this.velocityY = oldVelY;
			
			iterations++;
		}
		

		this.velocityX = velX;
		this.velocityY = velY;
	}

	draw(context) {
		const sizeX = this.frame * this.frameWidth;

		if (this.textureSource && this.texture.complete) {
			context.drawImage(
				this.texture,
				sizeX, 0, this.frameWidth, this.frameHeight,
				this.xPosition, this.yPosition, this.collisionWidth, this.collisionHeight
			);
		} else {
			context.fillStyle = this.backupColor;
			context.fillRect(this.xPosition, this.yPosition, this.collisionWidth, this.collisionHeight);
		}
	}
	
	getExpandedBounds(otherActor) {
		return {
			expandedLeftEdge: otherActor.xPosition - this.collisionWidth,
			expandedTopEdge: otherActor.yPosition - this.collisionHeight,
			expandedRightEdge: otherActor.xPosition + otherActor.collisionWidth,
			expandedBottomEdge: otherActor.yPosition + otherActor.collisionHeight
		};
	}


	collisionRaycast(otherActor, deltaTime) {
		const deltaX = this.velocityX * deltaTime;
		const deltaY = this.velocityY * deltaTime;

		if (deltaX === 0 && deltaY === 0) return null;

		const { expandedLeftEdge, expandedTopEdge, expandedRightEdge, expandedBottomEdge } = this.getExpandedBounds(otherActor);
		
		const rayOriginX = this.xPosition;
		const rayOriginY = this.yPosition;

		let timeEnterX, timeExitX;
		if (deltaX !== 0) {
			const inverseMovementX = 1 / deltaX;
			timeEnterX = (expandedLeftEdge - rayOriginX) * inverseMovementX;
			timeExitX = (expandedRightEdge - rayOriginX) * inverseMovementX;
			if (timeEnterX > timeExitX) [timeEnterX, timeExitX] = [timeExitX, timeEnterX];
		} else {
			// Not moving in X, check if we're within X bounds
			if (rayOriginX >= expandedLeftEdge && rayOriginX <= expandedRightEdge) {
				timeEnterX = -Infinity;
				timeExitX = Infinity;
			} else {
				return null; // Not aligned in X and not moving in X
			}
		}

		let timeEnterY, timeExitY;
		if (deltaY !== 0) {
			const inverseMovementY = 1 / deltaY;
			timeEnterY = (expandedTopEdge - rayOriginY) * inverseMovementY;
			timeExitY = (expandedBottomEdge - rayOriginY) * inverseMovementY;
			if (timeEnterY > timeExitY) [timeEnterY, timeExitY] = [timeExitY, timeEnterY];
		} else {

			if (rayOriginY >= expandedTopEdge && rayOriginY <= expandedBottomEdge) {
				timeEnterY = -Infinity;
				timeExitY = Infinity;
			} else {
				return null;
			}
		}

		const earliestGlobalEnterTime = Math.max(timeEnterX, timeEnterY);
		const latestGlobalExitTime = Math.min(timeExitX, timeExitY);

		if (earliestGlobalEnterTime > latestGlobalExitTime) return null;
		if (latestGlobalExitTime < 0) return null;
		if (earliestGlobalEnterTime < 0 || earliestGlobalEnterTime > 1) return null;

		let collisionNormalX = 0;
		let collisionNormalY = 0;

		if (timeEnterX > timeEnterY) {
			collisionNormalX = deltaX < 0 ? 1 : -1;
		} else {
			collisionNormalY = deltaY < 0 ? 1 : -1;
		}

		return {
			hitTimeInThisFrame: earliestGlobalEnterTime,
			collisionNormalX,
			collisionNormalY,
		};
	}

	
	intersects(otherActor) {
		return (
			this.xPosition < otherActor.xPosition + otherActor.collisionWidth &&
			this.xPosition + this.collisionWidth > otherActor.xPosition &&
			this.yPosition < otherActor.yPosition + otherActor.collisionHeight &&
			this.yPosition + this.collisionHeight > otherActor.yPosition
		);
	}
}

const keys = {};

document.addEventListener("keyup", (event) => {
	keys[event.key] = false;
});



const boxActor = new Actor({
	xPosition: MIDSCREENX,
	yPosition: MIDSCREENY,
	collisionWidth: (METER * 2)/3,
	collisionHeight: METER,
	backupColor: "#f59e0b",
	velocityX: 0,
	velocityY: 0,
	dynamic: true,
	friction: 0.5,
	mass: 1
});

const floorActor = new Actor({
	xPosition: 0,
	yPosition: canvas.height - METER / 2,
	collisionWidth: canvas.width * 2,
	collisionHeight: METER/2,
	backupColor: "#334155",
	dynamic: false,
	friction: 0.5,
	mass: 1
});
console.log(canvas.width - METER /2);
const rightWallActor = new Actor({
	xPosition: canvas.width - METER	/ 2,
	yPosition: canvas.height - ((METER * 2) + (floorActor.collisionHeight)),
	collisionWidth: METER,
	collisionHeight: METER * 3,
	backupColor: "#334155",
	dynamic: false,
	friction: 0.5,
	mass: 1
});
const leftWallActor = new Actor({
	xPosition: 0,
	yPosition: canvas.height - ((METER * 2) + (floorActor.collisionHeight)),
	collisionWidth: METER / 2,
	collisionHeight: METER * 3,
	backupColor: "#334155",
	dynamic: false,
	friction: 0.5,
	mass: 1
});

const scene = {
	backgroundColor: "#1e293b",
};

function draw() {
	ctx.fillStyle = scene.backgroundColor;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	
	for (const actor of Actor.all) {
		actor.draw(ctx);
	}
	
	if (showDebug) {
		ctx.fillStyle = "white";
		ctx.font = "16px monospace";
		ctx.fillText(`Position: ${boxActor.xPosition.toFixed(1)}, ${boxActor.yPosition.toFixed(1)}`, 10, 20);
		ctx.fillText(`Velocity: ${boxActor.velocityX.toFixed(1)}, ${boxActor.velocityY.toFixed(1)}`, 10, 40);
		ctx.fillText(`Grounded: ${boxActor.isGrounded}`, 10, 60);
		ctx.fillText(`DashCharge: ${airDashCharged}`, 10, 80);
	}
}

let lastTime = performance.now();
let showDebug = false;

document.addEventListener("keydown", (event) => {
    const currentTime = performance.now() / 1000;
    
    // Right
    if (event.key === "d" || event.key === "D" || event.key === "ArrowRight") {
		if (!keys[event.key] && currentTime - lastRightTap < DOUBLETAPWINDOW) {
			if (boxActor.isGrounded) {
				// Ground dash - check cooldown
				if (currentTime - lastDashTime < DASHCOOLDOWN) return;
			} else {
				// Air dash - check if charged
				if (!airDashCharged) return;
				airDashCharged = false;
			}
			
			if (boxActor.velocityX < 0) boxActor.velocityX = 0;
			boxActor.velocityX += METER * DASHSPEED; 
			lastDashTime = currentTime;
        }
        if (!keys[event.key]) lastRightTap = currentTime;
		
		if (boxActor.velocityX > METER * SOFTMOVEMENTSPEED) return; // prevent reducing speed
		boxActor.velocityX = METER * SOFTMOVEMENTSPEED;
	}
    
    if (event.key === "a" || event.key === "A" || event.key === "ArrowLeft") {
		if (!keys[event.key] && currentTime - lastLeftTap < DOUBLETAPWINDOW) {
			if (boxActor.isGrounded) {
				// Ground dash - check cooldown
				if (currentTime - lastDashTime < DASHCOOLDOWN) return;
			} else {
				// Air dash - check if charged
				if (!airDashCharged) return;
				airDashCharged = false;
			}
			
			if (boxActor.velocityX > 0) boxActor.velocityX = 0;
			boxActor.velocityX += -METER * DASHSPEED;
			lastDashTime = currentTime;
		}
		
		if (!keys[event.key]) lastLeftTap = currentTime;
		
		if (boxActor.velocityX < -METER * SOFTMOVEMENTSPEED) return; // prevent reducing speed
		boxActor.velocityX = -METER * SOFTMOVEMENTSPEED;
	}
    
    keys[event.key] = true;

	
		if ((keys["w"] || keys["ArrowUp"] || keys[" "])) {
		if (boxActor.isGrounded) boxActor.velocityY = -METER * 5;
	}
	
	if ((keys["s"] || keys["ArrowDown"]) && !boxActor.isGrounded) {
		const currentTime = performance.now() / 1000;
		if (currentTime - lastFastFallTime >= FASTFALLCOOLDOWN) {
			boxActor.gravity = GRAVITY * 2;
			boxActor.velocityY += METER * 10;
			lastFastFallTime = currentTime;
		}
	}
	if (keys["F5"]) {
        showDebug = !showDebug;
    }
});

function gameLoop(currentTime) {
	const deltaTime = ((currentTime - lastTime) / 1000) / deltaTimeModifier;
	lastTime = currentTime;
	const currentTimeInSeconds = currentTime / 1000;

	if (boxActor.isGrounded) {
		boxActor.gravity = GRAVITY;
		
		// Recharge air dash when landing
		if (!wasGrounded) {
			airDashCharged = true;
		}
	}
	
	wasGrounded = boxActor.isGrounded;

	

	boxActor.update(deltaTime, Actor.all);
	draw();

	requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
