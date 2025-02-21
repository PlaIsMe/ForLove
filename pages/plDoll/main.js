var Main = Main || {};

var isHurt = false;
var hurt = 0;

function playRandomSound() {
    var normalAudio = new Audio("sounds/normal.m4a");
    var hurtAudio = new Audio("sounds/hurt.m4a");
    if (!isHurt) {
        isHurt = true;
        if (hurt >= 5) {
            hurtAudio.play();
            hurt = 0;
        } else {
            normalAudio.play();
            hurt++;
        }
    }
    setTimeout(() => {
        isHurt = false;
    }, 500);
}

Main.render = function () {
    const { Engine, Render, Runner, Bodies, Composite, Constraint, World, Mouse, MouseConstraint, Events } = Matter;

    // create engine
    const engine = Engine.create();
    const { world } = engine;

    // create renderer
    const gameContainer = document.getElementById("game-container");
    const width = gameContainer.clientWidth;
    const height = gameContainer.clientHeight;
    const render = Render.create({
        element: gameContainer,
        engine: engine,
        options: {
            width: width,
            height: height,
            wireframes: false,
            background: 'transparent'
        }
    })
    
    Render.run(render);
    const runner = Runner.create();
    Runner.run(runner, engine);

    const head = Bodies.circle(width / 2, height / 2, 80, { 
        restitution: 0.5,
        render: {
            sprite: {
                texture: 'images/normal.png',
                xScale: 0.1,
                yScale: 0.1,
            }
        }
    });
    const body = Bodies.rectangle(width / 2, height / 2 + 80, 50, 80, { 
        restitution: 0.5,
        render: {
            sprite: {
                texture: 'images/body.png',
                xScale: 0.3,
                yScale: 0.3,
            }
        }
    });
    const leftArm = Bodies.rectangle(width / 2 - 30, height / 2 + 80, 60, 15, { 
        restitution: 0.5,
        render: {
            sprite: {
                texture: 'images/arm.png',
                xScale: 0.3,
                yScale: 0.3,
            }
        }
    });
    const rightArm = Bodies.rectangle(width / 2 + 30, height / 2 + 80, 60, 15, { 
        restitution: 0.5,
        render: {
            sprite: {
                texture: 'images/arm.png',
                xScale: 0.3,
                yScale: 0.3,
            }
        }
    });
    const leftLeg = Bodies.rectangle(width / 2 - 10, height / 2 + 160, 20, 80, { 
        restitution: 0.5,
        render: {
            sprite: {
                texture: 'images/leg-pant.png',
                xScale: 0.3,
                yScale: 0.3,
            }
        }
    });
    const rightLeg = Bodies.rectangle(width / 2 + 10, height / 2 + 160, 20, 80, { 
        restitution: 0.5,
        render: {
            sprite: {
                texture: 'images/leg-pant.png',
                xScale: 0.3,
                yScale: 0.3,
            }
        }
    });

    const neck = Constraint.create({ 
        bodyA: head, 
        bodyB: body, 
        pointA: { x: 0, y: 90 }, 
        pointB: { x: 0, y: -30 },
        length: 5, 
        stiffness: 1.0, 
        render: { visible: false } 
    });
    
    const leftShoulder = Constraint.create({ 
        bodyA: body, 
        bodyB: leftArm, 
        pointA: { x: -25, y: -25 }, 
        pointB: { x: 25, y: 0 }, 
        length: 5, 
        stiffness: 1.0, 
        render: { visible: false } 
    });
    
    const rightShoulder = Constraint.create({ 
        bodyA: body, 
        bodyB: rightArm, 
        pointA: { x: 25, y: -25 }, 
        pointB: { x: -25, y: 0 }, 
        length: 5, 
        stiffness: 1.0, 
        render: { visible: false } 
    });
    
    const leftHip = Constraint.create({ 
        bodyA: body, 
        bodyB: leftLeg, 
        pointA: { x: -15, y: 50 }, 
        pointB: { x: 0, y: -25 }, 
        length: 5, 
        stiffness: 1.0, 
        render: { visible: false } 
    });
    
    const rightHip = Constraint.create({ 
        bodyA: body, 
        bodyB: rightLeg, 
        pointA: { x: 15, y: 50 }, 
        pointB: { x: 0, y: -25 }, 
        length: 5, 
        stiffness: 1.0, 
        render: { visible: false } 
    });
    
    // Add everything to the world
    Composite.add(world, [leftArm, rightArm, leftLeg, rightLeg, body, head, neck, leftShoulder, rightShoulder, leftHip, rightHip]);

    const leftWall = Bodies.rectangle(0, height / 2, 10, height, { 
        isStatic: true, 
        render: { fillStyle: "transparent" }
    });
    
    const rightWall = Bodies.rectangle(width, height / 2, 10, height, { 
        isStatic: true, 
        render: { fillStyle: "transparent" }
    });

    World.add(world, [leftWall, rightWall]);

    const ground = Bodies.rectangle(width/2, height, width, 100, { 
        isStatic: true,
        render: {
            sprite: {
                texture: 'images/grass.png'
            }
        }
    });

    const top = Bodies.rectangle(width/2, 0, width, 100, { 
        isStatic: true,
        render: {
            sprite: {
                texture: 'images/top.png'
            }
        }
    });
    
        
    World.add(world, [ground, top]);

    // Enable Mouse Interaction
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0,
            render: { visible: false }
        }
    });
    World.add(world, mouseConstraint);

    function addParticle(x, y) {
        var particle = Matter.Bodies.circle(x, y, 5, {
            isSensor: true,
            isStatic: true,
            render: { 
                sprite: {
                    texture: 'images/punch.png',
                    xScale: 0.1,
                    yScale: 0.1
                }
            }
        });
    
        Matter.World.add(engine.world, particle);
    
        setTimeout(() => {
            Matter.World.remove(engine.world, particle);
        }, 500);
    }

    var hitByMouse = false;
    var hitTheGround = false;
    var hitTheTop = false;
    var hitTheLeft = false;
    var hitTheRight = false;

    Matter.Events.on(mouseConstraint, "mousedown", function (event) {
        var mousePos = event.mouse.position;
        addParticle(mousePos.x, mousePos.y);

        var bodyParts = [
            { part: head, name: "Head" },
            { part: body, name: "Body" },
            { part: leftArm, name: "Left Arm" },
            { part: rightArm, name: "Right Arm" },
            { part: leftLeg, name: "Left Leg" },
            { part: rightLeg, name: "Right Leg" }
        ];
    
        bodyParts.forEach(({ part, name }) => {
            if (Matter.Bounds.contains(part.bounds, mousePos)) {
                hitByMouse = true;
                head.render.sprite.texture = "images/cry.png";
                Matter.Body.applyForce(part, part.position, {
                    x: (Math.random() - 0.5) * 5,
                    y: (Math.random() - 0.5) * 5
                });
                playRandomSound();
                setTimeout(() => {
                    head.render.sprite.texture = "images/normal.png";
                }, 200);
                setTimeout(() => {
                    hitByMouse = false;
                }, 2000);
            }
        });
    });

    Events.on(engine, "collisionStart", (event) => {
        event.pairs.forEach((pair) => {
            if (pair.bodyB === top && !hitTheTop && hitByMouse) {
                hitTheTop = true;
                head.render.sprite.texture = "images/cry.png";
                playRandomSound();
                setTimeout(() => {
                    hitTheTop = false;
                    head.render.sprite.texture = "images/normal.png";
                }, 1000);
            }
            if (pair.bodyB === ground && !hitTheGround && hitByMouse) {
                hitTheGround = true;
                head.render.sprite.texture = "images/cry.png";
                playRandomSound();
                setTimeout(() => {
                    hitTheGround = false;
                    head.render.sprite.texture = "images/normal.png";
                }, 1000);
            }
            if (pair.bodyB === leftWall && !hitTheLeft && hitByMouse) {
                hitTheLeft = true;
                head.render.sprite.texture = "images/cry.png";
                playRandomSound();
                setTimeout(() => {
                    hitTheLeft = false;
                    head.render.sprite.texture = "images/normal.png";
                }, 1000);
            }
            if (pair.bodyB === rightWall && !hitTheRight && hitByMouse) {
                hitTheRight = true;
                head.render.sprite.texture = "images/cry.png";
                playRandomSound();
                setTimeout(() => {
                    hitTheRight = false;
                    head.render.sprite.texture = "images/normal.png";
                }, 1000);
            }
        });
    });
};