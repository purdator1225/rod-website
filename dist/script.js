import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import {gsap} from 'gsap'

/**
 * loader
 */

const loadingBarElement = document.querySelector('.loading-bar')

const loadingManager= new THREE.LoadingManager(
    //Loaded
    ()=>
    {   
        gsap.delayedCall(0.1,()=>{
            gsap.to(overlayMaterial.uniforms.uAlpha, {duration:3, value:0})
            loadingBarElement.classList.add('ended')
            loadingBarElement.style.transform=''
        })
    },

    //Progress
    (itemUrl,itemsLoaded,itemsTotal) => 
    {
        const progressRatio=  itemsLoaded / itemsTotal 
        loadingBarElement.style.transform = `scaleX(${progressRatio})`
        console.log(progressRatio)
    }
)
const gltfLoader= new GLTFLoader(loadingManager)
const cubeTextureLoader = new THREE.CubeTextureLoader(loadingManager)

let mixer = null 
/**
 * Models
 */
// gltfLoader.load('/models/FlightHelmet/glTF/gumball machine.gltf',
// (gltf)=>{
//     console.log(gltf)
//     // gltf.scene.scale(1,1,1)
//     // gltf.scene.position.set(0,-4,0)
//     gltf.scene.rotation.x = -1.5
//     scene.add(gltf.scene)

//     gui.add(gltf.scene.setRotationFromAxisAngle,'x').min()(-Math.PI).min(Math.PI).step(0.001).name('setrotation')
// })



/**
 * helmet 
 */
 gltfLoader.load('/models/Rod.gltf',
 (gltf)=>{
     gltf.scene.scale.set(5.0,5.0,5.0)
     gltf.scene.position.set(0,-4,0)
     gltf.scene.rotation.y= Math.PI * 0.5
     mixer = new THREE.AnimationMixer(gltf.scene)
     const action1 = mixer.clipAction(gltf.animations[0])
     const action2 = mixer.clipAction(gltf.animations[1])
     const action3 = mixer.clipAction(gltf.animations[2])
     action1.play()
     action2.play()
     action3.play()
     scene.add(gltf.scene)
 
     gui.add(gltf.scene.rotation,'y')
     .min(-Math.PI)
     .max(Math.PI)
     .step(0.001)
     .name('rotation')

     updateAllMaterials()
 })
 
 console.log(gltfLoader)
/**
 * points of interest
 */
const raycaster = new THREE.Raycaster()




/**
 * Base
 */
// Debug
const gui = new dat.GUI()

const debugObject ={}



// Canvas
const canvas = document.querySelector('canvas.webgl')


// Scene
const scene = new THREE.Scene()

/**
 * Overlay
 */
const overlayGeometry= new THREE.PlaneBufferGeometry(2,2,1,1)
const overlayMaterial = new THREE.ShaderMaterial({
    transparent : true,
    uniforms:
    {
        uAlpha:{value : 1}
    },
    vertexShader:`
        void main()
        {
            gl_Position = vec4(position,1.0);
        }
     `,

    fragmentShader:`
        uniform float uAlpha;
        void main()
        {
            gl_FragColor= vec4(0.0,0.0,0.0,uAlpha);
        }`

})
const overlay = new THREE.Mesh(overlayGeometry,overlayMaterial)
scene.add(overlay)


/**
 * Update all materials 
 */
const updateAllMaterials= ()=>
    {
    scene.traverse((child)=>
    {   if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial)
        {
        child.material.envMapIntensity= debugObject.envMapIntensity
        child.material.needsUpdate= true
        child.castShadow= true 
        child.receiveShadow= true 
    }

    })
}

/**
 * Test sphere
 */
// const testSphere = new THREE.Mesh(
//     new THREE.SphereBufferGeometry(1, 32, 32),
//     new THREE.MeshStandardMaterial()
// )
// scene.add(testSphere)

/**
 * enviroment map 
 */

const envMap = cubeTextureLoader.load([
'/textures/environmentMaps/3/px.jpg',
'/textures/environmentMaps/3/nx.jpg',
'/textures/environmentMaps/3/py.jpg',
'/textures/environmentMaps/3/ny.jpg',
'/textures/environmentMaps/3/pz.jpg',
'/textures/environmentMaps/3/nz.jpg'])

scene.environment= envMap
envMap.encoding= THREE.sRGBEncoding
debugObject.envMapIntensity = 5 
gui.add(debugObject,'envMapIntensity').min(0).max(10).step(0.001).onChange(updateAllMaterials())

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1))
    renderer.physicallyCorrectLights= true
})

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight('#ffffff',1)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight('#ffffff',1)

directionalLight.position.set(0.25,3,-2.25)
directionalLight.castShadow= true
directionalLight.shadow.camera.far= 15
directionalLight.shadow.mapSize.set(1024,1024)
directionalLight.shadow.normalBias= 0.05
scene.add(directionalLight)

// const directionLightCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
// scene.add(directionLightCameraHelper)


gui.add(directionalLight,'intensity').min(0).max(10).step(0.001).name('lightIntensity')
gui.add(directionalLight.position,'x').min(-5).max(5).step(0.001).name('lightX')
gui.add(directionalLight.position,'y').min(-5).max(5).step(0.001).name('lightY')
gui.add(directionalLight.position,'z').min(-5).max(5).step(0.001).name('lightZ')


/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(4, 1, - 4)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true 
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.physicallyCorrectLights= true 
renderer.outputEncoding= THREE.sRGBEncoding
renderer.toneMapping= THREE.ACESFilmicToneMapping
renderer.toneMappingExposure= 3 
renderer.shadowMap.type= THREE.PCFSoftShadowMap

gui.add(renderer,'toneMapping', {
    No: THREE.NoToneMapping,
    Linear:THREE.LinearToneMapping,
    Reinhard:THREE.ReinhardToneMapping,
    Cineon: THREE.CineonToneMapping,
    ACESFilmic:THREE.ACESFilmicToneMapping
})

.onFinishChange(()=>{
    renderer.toneMapping = Number(renderer.toneMapping)
})

gui.add(renderer,'toneMappingExposure').min(0).max(10).step(0.001)
/**
 * Animate
 */
 let setposition1={
    x:3.4,
    y:-1.15,
    z:2.689
}

let setposition2={
    x:-1.59,
    y:-1.8,
    z:3.231
}

function updatePoints(position1,position2) {

    
    let points = [
        {
        position: new THREE.Vector3(position1.x,position1.y,position1.z),
        element: document.querySelector('.point-0')
        },
    
        {position : new THREE.Vector3(position2.x,position2.y,position2.z),
        element: document.querySelector('.point-1')}
    ]
    


 for (const _point of points ){
       

    const screenPosition = _point.position.clone()
    screenPosition.project(camera)

    raycaster.setFromCamera(screenPosition, camera)

    const intersects = raycaster.intersectObjects(scene.children, true)

    if(intersects.length===0){
        _point.element.classList.add('visible')
    }

    else{
        const intersectionDistance = intersects[0].distance
        const pointDistance= _point.position.distanceTo(camera.position)

        if (intersectionDistance < pointDistance)
        {
            _point.element.classList.remove('visible')
            console.log(_point.element)
        }

        else
        {
            _point.element.classList.add('visible')

        }

    }

    const translateX = screenPosition.x * sizes.width * 0.5
    const translateY = -screenPosition.y * sizes.height * 0.5
    _point.element.style.transform = `translateX(${translateX}px) translateY(${translateY}px)`

    }
}

//Add GUI for setting position
// gui.add(setposition1, 'x')
// .min(-10)
// .max(10)
// .step(0.01)
// .name('pos1.x')
// .onFinishChange(()=>{
// updatePoints(setposition1,setposition2)
// console.log(setposition1)})

// gui.add(setposition1, 'y')
// .min(-10)
// .max(10)
// .step(0.01)
// .name('pos1y')
// .onFinishChange(()=>{
// updatePoints(setposition1,setposition2)
// console.log(setposition1)})

// gui.add(setposition1, 'z')
// .min(0)
// .max(10)
// .step(0.001)
// .name('pos1.z')
// .onFinishChange(()=>{
// updatePoints(setposition1,setposition2)
// console.log(setposition1)})

// gui.add(setposition2, 'x')
// .min(-10)
// .max(10)
// .step(0.01)
// .name('pos2.x')
// .onFinishChange(()=>{
// updatePoints(setposition1,setposition2)
// console.log(setposition2)})

// gui.add(setposition2, 'y')
// .min(-10)
// .max(10)
// .step(0.01)
// .name('pos2y')
// .onFinishChange(()=>{
// updatePoints(setposition1,setposition2)
// console.log(setposition2)})

// gui.add(setposition2, 'z')
// .min(0)
// .max(10)
// .step(0.001)
// .name('pos2.z')
// .onFinishChange(()=>{
// updatePoints(setposition1,setposition2)
// console.log(setposition2)})

//Create clock
 const clock = new THREE.Clock()
 let oldElapsedTime = 0 

const tick = () =>
{
   
    //Get current time at the current frame
     const elapsedTime = clock.getElapsedTime()
    
    //Find difference between current time and old time 
    const deltaTime= elapsedTime-oldElapsedTime
        
    //Make old time become current time
    oldElapsedTime= elapsedTime
    
    if(mixer !== null)
        {
          mixer.update(deltaTime)
        }
    // Update controls
    controls.update()

    //Go through each point 
   
   updatePoints(setposition1,setposition2)
    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}
tick()



