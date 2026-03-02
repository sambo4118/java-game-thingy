const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

class Actor {
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
		dynamic = true 
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
	}

	update(deltaTime, colliders = []) {
		this.frameTime += deltaTime;

		const frameDuration = 1 / this.fps;
		
		if (this.framecount > 0) {
			while (this.frameTime >= frameDuration) {
				this.frameTime -= frameDuration;
				this.frame = (this.frame + 1) % this.framecount;
			}
		}

		if (!this.dynamic) {
			return;
		}

		this.velocityY += 9.81 * deltaTime;

		let earliestHit = null;

		for (const otherActor of colliders) {
			const hit = this.collisionRaycast(otherActor, deltaTime);
			if (!hit) {
				continue;
			}

			if (!earliestHit || hit.hitTimeInThisFrame < earliestHit.hitTimeInThisFrame) {
				earliestHit = hit;
			}
		}

		const moveFraction = earliestHit ? earliestHit.hitTimeInThisFrame : 1;
		this.xPosition += this.velocityX * deltaTime * moveFraction;
		this.yPosition += this.velocityY * deltaTime * moveFraction;

		if (!earliestHit) return;
		
		const remainingFraction = 1 - earliestHit.hitTimeInThisFrame;

		if (earliestHit.collisionNormalX !== 0) {
			this.velocityX = 0;
		}

		if (earliestHit.collisionNormalY !== 0) {
			this.velocityY = 0;
		}
			
		this.xPosition += this.velocityX * deltaTime * remainingFraction;
		this.yPosition += this.velocityY * deltaTime * remainingFraction;
		
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

		const inverseMovementX = deltaX !== 0 ? 1 / deltaX: Infinity;
		const inverseMovementY = deltaY !== 0 ? 1 / deltaY: Infinity;

		let timeEnterX = (expandedLeftEdge - rayOriginX) * inverseMovementX;
		let timeExitX = (expandedRightEdge - rayOriginX) * inverseMovementX;

		let timeEnterY = (expandedTopEdge - rayOriginY) * inverseMovementY;
		let timeExitY = (expandedBottomEdge - rayOriginY) * inverseMovementY;

		if (timeEnterX > timeExitX) [timeEnterX, timeExitX] = [timeExitX, timeEnterX];
  		if (timeEnterY > timeExitY) [timeEnterY, timeExitY] = [timeExitY, timeEnterY];

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
			hitTimeInThisFrame: earliestGlobalEnterTime, // same meaning as tNear
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
};

const boxActor = new Actor({
	xPosition: 320,
	yPosition: 180,
	collisionWidth: 60,
	collisionHeight: 60,
	backupColor: "#f59e0b",
	velocityX: 50,
	velocityY: 120,
	dynamic: true,
});

const floorActor = new Actor({
	xPosition: 0,
	yPosition: canvas.height - 50,
	collisionWidth: canvas.width,
	collisionHeight: 50,
	backupColor: "#334155",
	dynamic: false,
});

const colliders = [floorActor];

const scene = {
	backgroundColor: "#1e293b",
};

function update(deltaTime) {
	boxActor.update(deltaTime, colliders);
}

function draw() {
	ctx.fillStyle = scene.backgroundColor;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	floorActor.draw(ctx);
	boxActor.draw(ctx);
}

let lastTime = performance.now();

function gameLoop(currentTime) {
	const deltaTime = (currentTime - lastTime) / 1000;
	lastTime = currentTime;

	update(deltaTime);
	draw();

	requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
