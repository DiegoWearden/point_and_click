const canvas = document.getElementById('renderCanvas');
const engine = new BABYLON.Engine(canvas, true);

const scene = new BABYLON.Scene(engine);
scene.clearColor = new BABYLON.Color3(0.05, 0.05, 0.1);

const camera = new BABYLON.ArcRotateCamera(
    "camera",
    -Math.PI / 2,
    Math.PI / 2.5,
    8,
    BABYLON.Vector3.Zero(),
    scene
);
camera.attachControl(canvas, true);
camera.setTarget(BABYLON.Vector3.Zero());

const light = new BABYLON.HemisphericLight(
    "light",
    new BABYLON.Vector3(0, 1, 0),
    scene
);
light.intensity = 0.3;

const ambientLight = new BABYLON.HemisphericLight(
    "ambient",
    new BABYLON.Vector3(0, -1, 0),
    scene
);
ambientLight.intensity = 0.2;

let lightBulbState = 'off';
let flickerInterval = null;
let bulbLight = null;

function createLightBulb() {
    const bulb = BABYLON.MeshBuilder.CreateSphere("bulb", { diameter: 1.5, segments: 32 }, scene);
    bulb.position = new BABYLON.Vector3(0, 2, 0);
    
    const bulbMaterial = new BABYLON.StandardMaterial("bulbMaterial", scene);
    bulbMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.2);
    bulbMaterial.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.05);
    bulbMaterial.specularColor = new BABYLON.Color3(1, 1, 1);
    bulbMaterial.roughness = 0.1;
    bulb.material = bulbMaterial;
    
    const socket = BABYLON.MeshBuilder.CreateCylinder("socket", { height: 0.3, diameter: 1.2 }, scene);
    socket.position = new BABYLON.Vector3(0, 1.2, 0);
    const socketMaterial = new BABYLON.StandardMaterial("socketMaterial", scene);
    socketMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    socketMaterial.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    socket.material = socketMaterial;
    
    bulbLight = new BABYLON.PointLight("bulbLight", new BABYLON.Vector3(0, 2, 0), scene);
    bulbLight.intensity = 0;
    bulbLight.range = 10;
    bulbLight.diffuse = new BABYLON.Color3(1, 0.95, 0.8);
    bulbLight.specular = new BABYLON.Color3(1, 0.95, 0.8);
    
    bulb.actionManager = new BABYLON.ActionManager(scene);
    
    bulb.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
            BABYLON.ActionManager.OnPointerOverTrigger,
            function() {
                if (lightBulbState === 'off') {
                    bulbMaterial.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.1);
                }
                canvas.style.cursor = 'pointer';
            }
        )
    );
    
    bulb.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
            BABYLON.ActionManager.OnPointerOutTrigger,
            function() {
                if (lightBulbState === 'off') {
                    bulbMaterial.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.05);
                }
                canvas.style.cursor = 'default';
            }
        )
    );
    
    bulb.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
            BABYLON.ActionManager.OnPickTrigger,
            function() {
                handleLightBulbClick(bulb, bulbMaterial);
            }
        )
    );
    
    return { bulb, bulbMaterial, socket };
}

function handleLightBulbClick(bulb, material) {
    if (lightBulbState === 'off' || lightBulbState === 'on') {
        if (lightBulbState === 'off') {
            turnOnLight(bulb, material);
        } else {
            turnOffLight(bulb, material);
        }
    }
}

function turnOnLight(bulb, material) {
    lightBulbState = 'turningOn';
    
    let flickerCount = 0;
    const maxFlickers = 8;
    const flickerSpeed = 50;
    
    const flickerStep = () => {
        if (flickerCount >= maxFlickers) {
            lightBulbState = 'on';
            material.diffuseColor = new BABYLON.Color3(1, 0.95, 0.7);
            material.emissiveColor = new BABYLON.Color3(0.8, 0.75, 0.5);
            bulbLight.intensity = 2;
            
            startOccasionalFlickers(bulb, material);
            return;
        }
        
        flickerCount++;
        
        material.diffuseColor = new BABYLON.Color3(1, 0.95, 0.7);
        material.emissiveColor = new BABYLON.Color3(0.8, 0.75, 0.5);
        bulbLight.intensity = 2;
        
        setTimeout(() => {
            material.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.2);
            material.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.05);
            bulbLight.intensity = 0;
            
            setTimeout(flickerStep, flickerSpeed);
        }, flickerSpeed);
    };
    
    flickerStep();
}

function turnOffLight(bulb, material) {
    if (flickerInterval) {
        clearInterval(flickerInterval);
        flickerInterval = null;
    }
    
    lightBulbState = 'turningOff';
    
    let flickerCount = 0;
    const maxFlickers = 6;
    const flickerSpeed = 60;
    
    const flickerStep = () => {
        if (flickerCount >= maxFlickers) {
            lightBulbState = 'off';
            material.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.2);
            material.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.05);
            bulbLight.intensity = 0;
            return;
        }
        
        flickerCount++;
        
        material.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.2);
        material.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.05);
        bulbLight.intensity = 0;
        
        setTimeout(() => {
            material.diffuseColor = new BABYLON.Color3(0.6, 0.6, 0.4);
            material.emissiveColor = new BABYLON.Color3(0.3, 0.3, 0.2);
            bulbLight.intensity = 1;
            
            setTimeout(flickerStep, flickerSpeed);
        }, flickerSpeed);
    };
    
    flickerStep();
}

function startOccasionalFlickers(bulb, material) {
    if (flickerInterval) {
        clearInterval(flickerInterval);
    }
    
    flickerInterval = setInterval(() => {
        if (lightBulbState === 'on') {
            material.emissiveColor = new BABYLON.Color3(0.5, 0.5, 0.3);
            bulbLight.intensity = 1;
            
            setTimeout(() => {
                if (lightBulbState === 'on') {
                    material.emissiveColor = new BABYLON.Color3(0.8, 0.75, 0.5);
                    bulbLight.intensity = 2;
                }
            }, 50);
        } else {
            clearInterval(flickerInterval);
            flickerInterval = null;
        }
    }, Math.random() * 3000 + 2000);
}

function showInteraction(message) {
}

const { bulb, bulbMaterial, socket } = createLightBulb();

const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 20, height: 20 }, scene);
const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
groundMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2);
groundMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
ground.material = groundMaterial;

engine.runRenderLoop(function() {
    scene.render();
});

window.addEventListener('resize', function() {
    engine.resize();
});

window.addEventListener('keydown', function(event) {
    switch(event.key.toLowerCase()) {
        case 'w':
            camera.radius = Math.max(5, camera.radius - 1);
            break;
        case 's':
            camera.radius = Math.min(20, camera.radius + 1);
            break;
        case 'r':
            camera.alpha = -Math.PI / 2;
            camera.beta = Math.PI / 2.5;
            camera.radius = 8;
            break;
    }
});

console.log("💡 Light Bulb Point & Click Game loaded!");
console.log("Controls:");
console.log("  - Click the light bulb to turn it on/off");
console.log("  - W/S: Zoom in/out");
console.log("  - R: Reset camera");
console.log("  - Mouse: Rotate camera");
