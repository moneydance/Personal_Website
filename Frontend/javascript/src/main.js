var scene, camera, renderer;

var WIDTH  = window.innerWidth;
var HEIGHT = window.innerHeight;

var SPEED = 0.01;

function init() {
    scene = new THREE.Scene();

    initMesh();
    initCamera();
    initLights();
    initRenderer();

    document.body.appendChild(renderer.domElement);
}

function initCamera()
{
    camera = new THREE.PerspectiveCamera(70, WIDTH / HEIGHT, 1, 10);
    camera.position.set(0, 3.5, 5);
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
    var hemLight = new THREE.HemisphereLight(0xffe5bb, 0xFFBF00, 0.08);
    scene.add(hemLight);
    //lens flares
    var textureLoader = new THREE.TextureLoader();

    var textureFlare0 = textureLoader.load( "../assets/textures/lensflare0.png" );
    var textureFlare2 = textureLoader.load( "../assets/textures/lensflare2.png" );
    var textureFlare3 = textureLoader.load( "../assets/textures/lensflare3.png" );

    addLight( 0.995, 0.5, 0.9, 5, 2, -6 );

    function addLight( h, s, l, x, y, z )
    {
        var light = new THREE.PointLight( 0xffffff, 3, 2000 );
        light.color.setHSL( h, s, l );
        light.position.set( x, y, z );
        scene.add( light );

        var flareColor = new THREE.Color( 0xffffff );
        flareColor.setHSL( h, s, l + 0.5 );

        var lensFlare = new THREE.LensFlare( textureFlare0, 400, 0.0, THREE.AdditiveBlending, flareColor );

        lensFlare.add( textureFlare2, 50, 0.0, THREE.AdditiveBlending );
        lensFlare.add( textureFlare2, 50, 5, THREE.AdditiveBlending );
        lensFlare.add( textureFlare2, 80, 0.0, THREE.AdditiveBlending );


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

var mesh = null;
function initMesh()
{
    var loader = new THREE.JSONLoader();
    loader.load('../json/astronaut3.json', function(geometry, materials) {
        mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
        mesh.scale.x = mesh.scale.y = mesh.scale.z = 2;
        mesh.translation = geometry.center();
        scene.add(mesh);
    });
}

function rotateMesh()
{
    if (!mesh) {
        return;
    }

    mesh.rotation.x -= SPEED * 0.2;
    mesh.rotation.y -= SPEED;
    mesh.rotation.z -= SPEED * 0.5;
}

function render()
{
    requestAnimationFrame(render);
    rotateMesh();
    renderer.render(scene, camera);
}

init();
render();
