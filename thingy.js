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
		this.texture = new Image();
		this.texture.src = textureSource;
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
		this.frameTime += deltaTime;
		const frameDuration = 1 / this.fps;
		
	}

	update(deltaTime) {
		this.frameTime += deltaTime;

		const frameDuration = 1 / this.fps;
		
		if (this.framecount > 0) {
			while (this.frameTime >= frameDuration) {
				this.frameTime -= frameDuration;
				this.frame = (this.frame + 1) % this.framecount;
			}
		}

		if (this.dynamic) {
			this.xPosition += this.velocityX * deltaTime;
			this.yPosition += this.velocityY * deltaTime;
		}
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

	intersects(otherActor) {
		return (
			this.xPosition < otherActor.xPosition + otherActor.collisionWidth &&
			this.xPosition + this.collisionWidth > otherActor.xPosition &&
			this.yPosition < otherActor.yPosition + otherActor.collisionHeight &&
			this.yPosition + this.collisionHeight > otherActor.yPosition
		);
	}
};


const scene = {
	backgroundColor: "#1e293b",
	box: {
		x: 320,
		y: 180,
		width: 160,
		height: 120,
		color: "#f59e0b",
	},
};

function draw() {
	ctx.fillStyle = scene.backgroundColor;
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	ctx.fillStyle = scene.box.color;
	ctx.fillRect(scene.box.x, scene.box.y, scene.box.width, scene.box.height);

	requestAnimationFrame(draw);
}

draw();
