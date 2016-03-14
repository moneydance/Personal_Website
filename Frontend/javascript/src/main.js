var scene, camera, renderer, pivot_point;
var earth_mesh = null; astronaut_mesh = null;

var WIDTH  = window.innerWidth;
var HEIGHT = window.innerHeight;

var SPEED = 0.001;

function init() {
    scene = new THREE.Scene();

    initMesh();
    initCamera();
    initLights();
    initRenderer();
    makeParticles();

    document.body.appendChild(renderer.domElement);
}

function initCamera()
{
    camera = new THREE.PerspectiveCamera(70, WIDTH / HEIGHT, 1, 1000);
    camera.position.set(25, 26, 23);
    camera.lookAt(scene.position);
}


function initRenderer()
{
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(1.6);
    renderer.setClearColor( 0x000300, 1);
    renderer.setSize(WIDTH, HEIGHT);

}

function initLights()
{
    var hemLight = new THREE.HemisphereLight(0xffe5bb, 0xFFBF00, 0.125);
    scene.add(hemLight);
    //lens flares
    var textureLoader = new THREE.TextureLoader();

    var textureFlare0 = textureLoader.load( "../assets/textures/lensflare0.png" );

    addLight( 0.995, 0.5, 0.9, 40, 4, -10 );

    function addLight( h, s, l, x, y, z )
    {
        var light = new THREE.PointLight( 0xffffff, 3, 2000 );
        light.color.setHSL( h, s, l );
        light.position.set( x, y, z );
        scene.add( light );

        var flareColor = new THREE.Color( 0xffffff );
        flareColor.setHSL( h, s, l + 0.5 );

        var lensFlare = new THREE.LensFlare( textureFlare0, 400, 0.0, THREE.AdditiveBlending, flareColor );

        lensFlare.add( textureFlare0, 50, 0.0, THREE.AdditiveBlending );
        lensFlare.add( textureFlare0, 50, 0.0, THREE.AdditiveBlending );
        lensFlare.add( textureFlare0, 50, 0.0, THREE.AdditiveBlending );

        lensFlare.customUpdateCallback = lensFlareUpdateCallback;
        lensFlare.position.copy( light.position );

        scene.add( lensFlare );
    }

    function lensFlareUpdateCallback( object )
    {
        var f, fl = object.lensFlares.length;
        var flare;
        var vecX = -object.positionScreen.x * 2;
        var vecY = -object.positionScreen.y * 2;
        for( f = 0; f < fl; f++ )
        {
            flare = object.lensFlares[ f ];
            flare.x = object.positionScreen.x + vecX * flare.distance;
            flare.y = object.positionScreen.y + vecY * flare.distance;
            flare.rotation = 0;
        }
        object.lensFlares[ 2 ].y += 0.025;
        object.lensFlares[ 3 ].rotation = object.positionScreen.x * 0.5 + THREE.Math.degToRad( 45 );
    }
}

function initMesh()
{
    pivot_point = new THREE.Object3D();
    pivot_point.rotation.x = 0.4;
    pivot_point.rotation.y = 0.2;
    var loader = new THREE.JSONLoader();
    loader.load('../json/planet_earth.json', function(geometry, materials)
    {
        earth_mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
        earth_mesh.scale.x = earth_mesh.scale.y = earth_mesh.scale.z = 2;
        earth_mesh.translation = geometry.center();
        earth_mesh.position.set(0,0,0);
        scene.add(earth_mesh);
        earth_mesh.add(pivot_point);
    });

    loader.load('../json/astronaut3.json', function(geometry, materials)
    {
        astronaut_mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
        astronaut_mesh.scale.x = astronaut_mesh.scale.y = astronaut_mesh.scale.z = 1.4;
        astronaut_mesh.translation = geometry.center();
        astronaut_mesh.position.set(12,12,4);
        scene.add(astronaut_mesh);
        pivot_point.add(astronaut_mesh);
    });
}


function makeParticles()
{
    var material = new THREE.SpriteMaterial( {
            map: new THREE.CanvasTexture( generateSprite() ),
            blending: THREE.AdditiveBlending });
    // we're gonna move from z position -1000 (far away)
    // to 1000 (where the camera is) and add a random particle at every pos.
    for ( var zpos= -500; zpos < 100; zpos+=10 )
    {
        // make the particle
        particle = new THREE.Particle(material);
        // give it a random x and y position between -500 and 500
        particle.position.x = Math.random() * -300 - 50;
        particle.position.y = Math.random() * -300 - 50;
        //set its z position
        particle.position.z = zpos;
        //scale it up a bit
        particle.scale.x = particle.scale.y = 2;
        //add it to the scene
        scene.add( particle );
        // and to the array of particles.
        scene.add(particle);
    }

    function generateSprite()
    {
        var canvas = document.createElement( 'canvas' );
        canvas.width = 16;
        canvas.height = 16;
        var context = canvas.getContext( '2d' );
        var gradient = context.createRadialGradient( canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2 );
        gradient.addColorStop( 0, 'white' );
        context.fillStyle = gradient;
        context.fillRect( 0, 0, canvas.width, canvas.height );
        return canvas;
    }
}

function rotateMesh(mesh, axis, s, speed)
{
    if (!mesh) {
        return;
    }
    if(axis == "x")
    {
        mesh.rotation.x -= s * speed;
    }
    else if (axis == "y")
    {
        mesh.rotation.y -= s * speed;
    }
    else if (axis == "z")
    {
        mesh.rotation.z -= s * speed;
    }
}

function render()
{
    requestAnimationFrame(render);
    rotateMesh(earth_mesh,'y', 1, SPEED);
    rotateMesh(astronaut_mesh,'x', 0.0005, 9);
    renderer.render(scene, camera);
}

init();
render();
