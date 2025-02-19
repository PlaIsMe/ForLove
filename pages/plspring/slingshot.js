// Matter.js - http://brm.io/matter-js/

var Example = Example || {};

function isMobile() {
    return /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
}

var hardcode = 0;
var hurt = 0;

if (isMobile()) {
    console.log("Mobile detected");
    hardcode = 200;
} else {
    console.log("Desktop detected");
    hardcode = 100;
}

function playRandomSound() {
    console.log(hurt);
    if (hurt == 5) {
        var audio = new Audio("sounds/toohurt.m4a");
        hurt = 0;
        audio.play();
    } else {
        var audio = new Audio("sounds/hurt.m4a");
        audio.play();
    }
}


Example.slingshot = function () {
    var Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Composites = Matter.Composites,
        Events = Matter.Events,
        Constraint = Matter.Constraint,
        MouseConstraint = Matter.MouseConstraint,
        Mouse = Matter.Mouse,
        World = Matter.World,
        Bodies = Matter.Bodies;

    // create engine
    var engine = Engine.create(),
        world = engine.world;

    // create renderer
    var gameContainer = document.getElementById("game-container");
    var width = gameContainer.clientWidth;
    var height = gameContainer.clientHeight;
    var render = Render.create({
        element: document.getElementById("game-container"),
        engine: engine,
        options: {
            width: width,
            height: height,
            wireframes: false
        }
    });

    Render.run(render);

    // create runner
    var runner = Runner.create();
    Runner.run(runner, engine);

    var maxRopeLength = 450;

    // add bodies
    var rockOptions = { density: 0.004 },
        rock1 = Bodies.polygon(width / 2 + hardcode, 0, 8, 20, rockOptions),
        rock2 = Bodies.rectangle (100, 0, 8, 20, {
            density: 0.004,
            render: {
                sprite: {
                    texture: 'images/normal.png',
                    xScale: 0.2,
                    yScale: 0.2,
                }
            }
        });
        anchor = { x: width / 2 + hardcode, y: 0 },
        elastic = Constraint.create({
            pointA: anchor,
            bodyB: rock1,
            stiffness: 1
        }),
        rope = Constraint.create({
            bodyA: rock1,
            bodyB: rock2,
            length: maxRopeLength,
            stiffness: 0.000001
        });
    rope.sqrLength = maxRopeLength * maxRopeLength;
    
    World.add(engine.world, [rock1, elastic]);
    World.add(engine.world, [rope]);
    World.add(engine.world, [rock2]);

    // add mouse control
    var mouse = Mouse.create(render.canvas),
        mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0,
                render: { visible: false }
            }
        });

    World.add(world, mouseConstraint);

    Events.on(mouseConstraint, "mousedown", function(event) {
        var mousePos = event.mouse.position;
        var rock2Pos = rock2.position;

        var mouseX = Math.floor(mousePos.x);
        var mouseY = Math.floor(mousePos.y);
        var rock2X = Math.floor(rock2Pos.x);
        var rock2Y = Math.floor(rock2Pos.y);

        rock2.render.sprite.texture = "images/cry.png";
        hurt++;
        playRandomSound();

        setTimeout(() => {
            rock2.render.sprite.texture = "images/normal.png";
        }, 800);

        // Check if touch/click is inside rock2
        // var isTouchingRock2 = Matter.Bounds.contains(rock2.bounds, mousePos);
    
        Matter.Body.applyForce(rock2, rock2.position, { 
            x: Math.random() * 0.05,
            y: Math.random() * 0.05
        });
    });

    Events.on(runner, "afterUpdate", () => {
        let sqrDistance = (rock2.position.x - rock1.position.x) * (rock2.position.x - rock1.position.x) + (rock2.position.y - rock1.position.y) * (rock2.position.y - rock1.position.y);
        if (sqrDistance > rope.sqrLength) rope.stiffness = 1;
        else rope.stiffness = 0.000001;
    })

    Render.lookAt(render, {
        min: { x: 0, y: 0 },
        max: { x: 800, y: 600 }
    });

    // context for MatterTools.Demo
    return {
        engine: engine,
        runner: runner,
        render: render,
        canvas: render.canvas,
        stop: function () {
            Matter.Render.stop(render);
            Matter.Runner.stop(runner);
        }
    };
};

// create demo interface
// not required to use Matter.js

MatterTools.Demo.create({
    toolbar: {
        title: 'matter-js',
        url: 'https://github.com/liabru/matter-js',
        reset: true,
        source: false,
        fullscreen: false,
        exampleSelect: false
    },
    preventZoom: true,
    resetOnOrientation: true,
    examples: [
        {
            name: 'Slingshot',
            id: 'slingshot',
            init: Example.slingshot,
            sourceLink: 'https://github.com/liabru/matter-js/blob/master/examples/slingshot.js'
        }
    ]
});