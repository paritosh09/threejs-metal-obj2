import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { gsap } from 'gsap'

// Postprocessing imports (removed BokehPass to prevent blur)
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

// AI Storyteller Integration Class
class AIStorytellerIntegration {
    constructor() {
        this.apiKey = 'your api key';
        this.apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
        this.currentStoryState = {};
        this.storyHistory = [];
        this.isGenerating = false;
    }

    async generateStorySegment(sceneContext, userInput = null, storyType = 'adventure') {
        if (this.isGenerating) {
            console.log('Story generation already in progress...');
            return null;
        }

        this.isGenerating = true;
        this.showProgress(0);

        const prompt = this.buildStoryPrompt(sceneContext, userInput, storyType);
        
        try {
            this.showProgress(25);
            
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                    'HTTP-Referer': window.location.origin,
                    'X-Title': 'AI-Powered ThreeJS Storytelling'
                },
                body: JSON.stringify({
                    model: "anthropic/claude-3-sonnet-20240229",
                    messages: [{
                        role: "user",
                        content: prompt
                    }],
                    temperature: 0.8,
                    max_tokens: 600
                })
            });

            this.showProgress(75);

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            this.showProgress(100);
            
            const storyData = this.parseStoryResponse(data.choices[0].message.content);
            this.storyHistory.push(storyData);
            
            setTimeout(() => this.hideProgress(), 500);
            return storyData;
        } catch (error) {
            console.error('AI Story Generation Error:', error);
            this.hideProgress();
            this.showError(`Failed to generate story: ${error.message}`);
            return this.getFallbackStory();
        } finally {
            this.isGenerating = false;
        }
    }

    buildStoryPrompt(sceneContext, userInput, storyType) {
        const historyContext = this.storyHistory.length > 0 
            ? `Previous story: ${this.storyHistory[this.storyHistory.length - 1].narrative}` 
            : '';

        return `You are an AI storyteller controlling a cinematic 3D scene with Iron Man. 

Scene Details:
- Iron Man model at position (${sceneContext.modelPosition.x}, ${sceneContext.modelPosition.y}, ${sceneContext.modelPosition.z})
- Glowing red sphere (emissive: ${sceneContext.sphereEmissive})
- Glowing blue cube (emissive: ${sceneContext.cubeEmissive})
- Current camera: ${sceneContext.cameraView}
- Story type: ${storyType}

${historyContext}
${userInput ? `User direction: ${userInput}` : ''}

Create a short, engaging story segment (2-3 sentences) that continues the narrative and specify cinematic camera movements and object animations. Be creative and dramatic!

Respond ONLY in valid JSON format:
{
    "narrative": "Your story text here with dialogue and action",
    "cameraAction": "overview|closeup|focusOnModel|orbit|dramatic|sideView",
    "objectAnimations": ["rotateModel", "glowSphere", "pulseCube", "spinIronMan"],
    "lightingMood": "bright|dark|mysterious|heroic",
    "duration": 4000
}`;
    }

    parseStoryResponse(response) {
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const storyData = JSON.parse(jsonMatch[0]);
                return {
                    narrative: storyData.narrative || "The scene continues with mysterious energy...",
                    cameraAction: storyData.cameraAction || "overview",
                    objectAnimations: storyData.objectAnimations || ["rotateModel"],
                    lightingMood: storyData.lightingMood || "bright",
                    duration: storyData.duration || 4000
                };
            }
        } catch (error) {
            console.warn('JSON parsing failed, using text response');
        }

        return {
            narrative: response.substring(0, 200) + "...",
            cameraAction: "overview",
            objectAnimations: ["rotateModel", "glowSphere"],
            lightingMood: "bright",
            duration: 4000
        };
    }

    getFallbackStory() {
        const fallbackStories = [
            {
                narrative: "Iron Man's arc reactor pulses with renewed energy as he surveys the mysterious glowing objects around him.",
                cameraAction: "focusOnModel",
                objectAnimations: ["rotateModel", "glowSphere"],
                lightingMood: "heroic",
                duration: 3000
            },
            {
                narrative: "The crimson sphere begins to resonate, its energy synchronizing with Iron Man's suit systems.",
                cameraAction: "closeup",
                objectAnimations: ["glowSphere", "pulseCube"],
                lightingMood: "mysterious",
                duration: 3500
            }
        ];

        return fallbackStories[Math.floor(Math.random() * fallbackStories.length)];
    }

    showProgress(percent) {
        let progressContainer = document.getElementById('story-progress');
        if (!progressContainer) {
            progressContainer = document.createElement('div');
            progressContainer.id = 'story-progress';
            progressContainer.className = 'story-progress';
            progressContainer.innerHTML = '<div class="story-progress-bar"></div>';
            document.body.appendChild(progressContainer);
        }
        
        const progressBar = progressContainer.querySelector('.story-progress-bar');
        progressBar.style.width = `${percent}%`;
        progressContainer.style.opacity = '1';
    }

    hideProgress() {
        const progressContainer = document.getElementById('story-progress');
        if (progressContainer) {
            progressContainer.style.opacity = '0';
            setTimeout(() => {
                if (progressContainer.parentNode) {
                    progressContainer.parentNode.removeChild(progressContainer);
                }
            }, 300);
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <button class="error-close">&times;</button>
            <h3>Story Generation Error</h3>
            <p>${message}</p>
            <small>Using fallback story instead.</small>
        `;
        
        document.body.appendChild(errorDiv);
        
        const closeBtn = errorDiv.querySelector('.error-close');
        closeBtn.onclick = () => {
            errorDiv.remove();
        };
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }
}

// Story Animation Controller
class StoryAnimationController {
    constructor(cameraTransition, scene, loadedModel, glowSphere, glowBox, lights) {
        this.cameraTransition = cameraTransition;
        this.scene = scene;
        this.loadedModel = loadedModel;
        this.glowSphere = glowSphere;
        this.glowBox = glowBox;
        this.lights = lights;
        this.storyteller = new AIStorytellerIntegration();
        this.isPlayingStory = false;
        this.currentStoryType = 'adventure';
        this.voiceRecognition = null;
        
        this.initializeVoiceRecognition();
    }

    initializeVoiceRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.voiceRecognition = new SpeechRecognition();
            this.voiceRecognition.continuous = false;
            this.voiceRecognition.interimResults = false;
            this.voiceRecognition.lang = 'en-US';
            
            this.voiceRecognition.onstart = () => {
                this.showVoiceIndicator();
            };
            
            this.voiceRecognition.onresult = (event) => {
                const command = event.results[0][0].transcript;
                console.log('Voice command:', command);
                this.hideVoiceIndicator();
                this.playAIStory(command);
            };
            
            this.voiceRecognition.onerror = (event) => {
                console.error('Voice recognition error:', event.error);
                this.hideVoiceIndicator();
            };
            
            this.voiceRecognition.onend = () => {
                this.hideVoiceIndicator();
            };
        }
    }

    showVoiceIndicator() {
        let indicator = document.getElementById('voice-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'voice-indicator';
            indicator.className = 'voice-indicator';
            indicator.innerHTML = '🎤 Listening... Speak your story direction';
            document.body.appendChild(indicator);
        }
        indicator.style.display = 'block';
    }

    hideVoiceIndicator() {
        const indicator = document.getElementById('voice-indicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
    }

    async playAIStory(userInput = null, storyType = null) {
        if (this.isPlayingStory) {
            console.log('Story already playing...');
            return;
        }
        
        this.isPlayingStory = true;
        const currentStoryType = storyType || this.currentStoryType;
        
        const sceneContext = this.getSceneContext();
        const storySegment = await this.storyteller.generateStorySegment(
            sceneContext, 
            userInput, 
            currentStoryType
        );
        
        if (!storySegment) {
            this.isPlayingStory = false;
            return;
        }
        
        this.displayNarrative(storySegment.narrative);
        this.setLightingMood(storySegment.lightingMood);
        this.executeCameraAction(storySegment.cameraAction);
        this.executeObjectAnimations(storySegment.objectAnimations);
        
        setTimeout(() => {
            this.isPlayingStory = false;
        }, storySegment.duration || 4000);
    }

    getSceneContext() {
        return {
            modelPosition: this.loadedModel?.position || {x: 0, y: 0, z: 0},
            sphereEmissive: this.glowSphere.material.emissiveIntensity,
            cubeEmissive: this.glowBox.material.emissiveIntensity,
            cameraView: this.getCurrentCameraView()
        };
    }

    getCurrentCameraView() {
        const pos = camera.position;
        const distance = pos.distanceTo(controls.target);
        
        if (distance < 15) return "closeup";
        if (distance > 40) return "overview";
        if (Math.abs(pos.x) > Math.abs(pos.z)) return "sideView";
        return "standard";
    }

    executeCameraAction(action) {
        switch(action) {
            case 'overview':
                this.cameraTransition.transitionTo(cameraPositions.overview.position, cameraPositions.overview.target, 2);
                break;
            case 'closeup':
                this.cameraTransition.transitionTo(cameraPositions.closeup.position, cameraPositions.closeup.target, 1.5);
                break;
            case 'focusOnModel':
                if (this.loadedModel) {
                    const modelPos = this.loadedModel.position.clone();
                    const offset = new THREE.Vector3(8, 12, 15);
                    const cameraPos = modelPos.clone().add(offset);
                    this.cameraTransition.transitionTo(cameraPos, modelPos, 2);
                }
                break;
            case 'orbit':
                this.cameraTransition.orbitAround(new THREE.Vector3(0, 0, 0), 25, 0, Math.PI * 2, 6, 15);
                break;
            case 'dramatic':
                this.cameraTransition.transitionTo(cameraPositions.dramatic.position, cameraPositions.dramatic.target, 1.8);
                break;
            case 'sideView':
                this.cameraTransition.transitionTo(cameraPositions.sideView.position, cameraPositions.sideView.target, 2);
                break;
        }
    }

    executeObjectAnimations(animations) {
        animations.forEach(animation => {
            switch(animation) {
                case 'rotateModel':
                    if (this.loadedModel) {
                        gsap.to(this.loadedModel.rotation, {
                            y: this.loadedModel.rotation.y + Math.PI * 2,
                            duration: 3,
                            ease: "power2.inOut"
                        });
                    }
                    break;
                case 'glowSphere':
                    gsap.to(this.glowSphere.material, {
                        emissiveIntensity: 2,
                        duration: 1,
                        yoyo: true,
                        repeat: 1
                    });
                    break;
                case 'pulseCube':
                    gsap.to(this.glowBox.scale, {
                        x: 1.5, y: 1.5, z: 1.5,
                        duration: 0.8,
                        yoyo: true,
                        repeat: 2,
                        ease: "power2.inOut"
                    });
                    break;
                case 'spinIronMan':
                    if (this.loadedModel) {
                        gsap.to(this.loadedModel.rotation, {
                            x: Math.PI * 2,
                            duration: 2,
                            ease: "power1.inOut"
                        });
                    }
                    break;
            }
        });
    }

    setLightingMood(mood) {
        switch(mood) {
            case 'dark':
                gsap.to(this.lights.main, { intensity: 0.3, duration: 1 });
                gsap.to(this.lights.key, { intensity: 0.1, duration: 1 });
                gsap.to(this.lights.fill, { intensity: 0.05, duration: 1 });
                gsap.to(this.lights.ambient, { intensity: 0.05, duration: 1 });
                break;
            case 'mysterious':
                gsap.to(this.lights.main, { intensity: 0.5, duration: 1 });
                gsap.to(this.lights.key, { intensity: 0.3, duration: 1 });
                gsap.to(this.lights.fill, { intensity: 0.1, duration: 1 });
                gsap.to(this.lights.ambient, { intensity: 0.08, duration: 1 });
                break;
            case 'heroic':
                gsap.to(this.lights.main, { intensity: 1.5, duration: 1 });
                gsap.to(this.lights.key, { intensity: 0.4, duration: 1 });
                gsap.to(this.lights.fill, { intensity: 0.3, duration: 1 });
                gsap.to(this.lights.ambient, { intensity: 0.2, duration: 1 });
                break;
            case 'bright':
            default:
                gsap.to(this.lights.main, { intensity: 1, duration: 1 });
                gsap.to(this.lights.key, { intensity: 0.2, duration: 1 });
                gsap.to(this.lights.fill, { intensity: 0.15, duration: 1 });
                gsap.to(this.lights.ambient, { intensity: 0.15, duration: 1 });
                break;
        }
    }

    displayNarrative(text) {
        let narrativeElement = document.getElementById('story-narrative');
        if (!narrativeElement) {
            narrativeElement = document.createElement('div');
            narrativeElement.id = 'story-narrative';
            document.body.appendChild(narrativeElement);
        }
        
        narrativeElement.innerHTML = '';
        narrativeElement.className = 'show';
        
        let i = 0;
        const typeWriter = () => {
            if (i < text.length) {
                narrativeElement.innerHTML += text.charAt(i);
                i++;
                setTimeout(typeWriter, 50);
            }
        };
        
        typeWriter();
        
        const readingTime = Math.max(4000, text.length * 60);
        setTimeout(() => {
            narrativeElement.classList.remove('show');
        }, readingTime);
    }

    setStoryType(type) {
        this.currentStoryType = type;
        console.log(`Story type set to: ${type}`);
    }

    startVoiceCommand() {
        if (this.voiceRecognition) {
            this.voiceRecognition.start();
        } else {
            alert('Voice recognition not supported in this browser');
        }
    }

    stopStory() {
        this.isPlayingStory = false;
        this.storyteller.isGenerating = false;
        this.cameraTransition.stopTransition();
        
        const narrative = document.getElementById('story-narrative');
        if (narrative) {
            narrative.classList.remove('show');
        }
        
        console.log('Story stopped');
    }
}

// Initialize your original Three.js scene (ALL YOUR ORIGINAL CODE PRESERVED)
const gui = new dat.GUI()
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 30;
camera.position.y = 25;

const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('.webgl') });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = true;

// Enhanced Camera Transition System (YOUR ORIGINAL CODE)
class CameraTransition {
    constructor(camera, controls) {
        this.camera = camera;
        this.controls = controls;
        this.isTransitioning = false;
        this.currentAnimation = null;
        this.minDistance = 5;
        this.maxDistance = 100;
    }

    validateCameraPosition(position, target) {
        const distance = position.distanceTo(target);
        
        if (distance < this.minDistance) {
            const direction = position.clone().sub(target).normalize();
            return target.clone().add(direction.multiplyScalar(this.minDistance));
        }
        
        if (distance > this.maxDistance) {
            const direction = position.clone().sub(target).normalize();
            return target.clone().add(direction.multiplyScalar(this.maxDistance));
        }
        
        return position;
    }

    transitionTo(targetPosition, targetLookAt = null, duration = 2, easing = 'power2.inOut') {
        if (this.isTransitioning) {
            this.currentAnimation?.kill();
        }

        this.isTransitioning = true;
        
        const startPosition = this.camera.position.clone();
        const startTarget = this.controls.target.clone();
        const endTarget = targetLookAt || this.controls.target.clone();
        const validatedTargetPosition = this.validateCameraPosition(targetPosition, endTarget);
        
        console.log(`Camera transition: From ${startPosition.x.toFixed(2)}, ${startPosition.y.toFixed(2)}, ${startPosition.z.toFixed(2)} to ${validatedTargetPosition.x.toFixed(2)}, ${validatedTargetPosition.y.toFixed(2)}, ${validatedTargetPosition.z.toFixed(2)}`);
        console.log(`Target: ${endTarget.x.toFixed(2)}, ${endTarget.y.toFixed(2)}, ${endTarget.z.toFixed(2)}`);

        const positionProxy = { x: startPosition.x, y: startPosition.y, z: startPosition.z };
        const targetProxy = { x: startTarget.x, y: startTarget.y, z: startTarget.z };

        this.controls.enabled = false;

        gsap.to(positionProxy, {
            x: validatedTargetPosition.x,
            y: validatedTargetPosition.y,
            z: validatedTargetPosition.z,
            duration: duration,
            ease: easing,
            onUpdate: () => {
                this.camera.position.set(positionProxy.x, positionProxy.y, positionProxy.z);
                this.updateMaterials();
            }
        });

        this.currentAnimation = gsap.to(targetProxy, {
            x: endTarget.x,
            y: endTarget.y,
            z: endTarget.z,
            duration: duration,
            ease: easing,
            onUpdate: () => {
                this.controls.target.set(targetProxy.x, targetProxy.y, targetProxy.z);
                this.controls.update();
                this.updateMaterials();
            },
            onComplete: () => {
                this.isTransitioning = false;
                this.currentAnimation = null;
                this.controls.enabled = true;
                this.updateMaterials();
                console.log('Camera transition completed');
            }
        });

        return this.currentAnimation;
    }

    updateMaterials() {
        scene.traverse((object) => {
            if (object.isMesh && object.material) {
                if (object.material.isMeshStandardMaterial || object.material.isMeshPhysicalMaterial) {
                    object.material.needsUpdate = true;
                    if (scene.environment) {
                        object.material.envMap = scene.environment;
                        object.material.envMapIntensity = object.material.envMapIntensity || 1;
                    }
                }
            }
        });
    }

    orbitAround(center, radius, startAngle = 0, endAngle = Math.PI * 2, duration = 3, height = null) {
        if (this.isTransitioning) {
            this.currentAnimation?.kill();
        }

        this.isTransitioning = true;
        const currentHeight = height !== null ? height : Math.max(this.camera.position.y, 10);
        const angleProgress = { angle: startAngle };
        const validRadius = Math.max(radius, this.minDistance);
        
        console.log(`Orbit animation: center(${center.x}, ${center.y}, ${center.z}), radius: ${validRadius}, height: ${currentHeight}`);

        this.controls.enabled = false;

        this.currentAnimation = gsap.to(angleProgress, {
            angle: endAngle,
            duration: duration,
            ease: "power2.inOut",
            onUpdate: () => {
                const x = center.x + Math.cos(angleProgress.angle) * validRadius;
                const z = center.z + Math.sin(angleProgress.angle) * validRadius;
                
                this.camera.position.set(x, currentHeight, z);
                this.controls.target.copy(center);
                this.camera.lookAt(center);
                this.updateMaterials();
            },
            onComplete: () => {
                this.isTransitioning = false;
                this.currentAnimation = null;
                this.controls.enabled = true;
                this.updateMaterials();
                console.log('Orbit animation completed');
            }
        });

        return this.currentAnimation;
    }

    stopTransition() {
        if (this.currentAnimation) {
            this.currentAnimation.kill();
            this.isTransitioning = false;
            this.controls.enabled = true;
            console.log('Camera transition stopped');
        }
    }
}

const cameraTransition = new CameraTransition(camera, controls);

// Predefined Camera Positions (YOUR ORIGINAL CODE)
const cameraPositions = {
    overview: { 
        position: new THREE.Vector3(0, 40, 40), 
        target: new THREE.Vector3(0, 0, 0) 
    },
    closeup: { 
        position: new THREE.Vector3(8, 8, 15),
        target: new THREE.Vector3(0, 0, 0) 
    },
    sideView: { 
        position: new THREE.Vector3(30, 15, 0), 
        target: new THREE.Vector3(0, 0, 0) 
    },
    dramatic: { 
        position: new THREE.Vector3(-25, 10, 25),
        target: new THREE.Vector3(0, 0, 0) 
    },
    modelView: {
        position: new THREE.Vector3(15, 12, 20), 
        target: new THREE.Vector3(0, 0, 0) 
    }
};

// Postprocessing setup (REMOVED BOKEH TO PREVENT BLUR)
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,    // strength
    0.4,    // radius
    0.85    // threshold
);
composer.addPass(bloomPass);

// Environment setup (YOUR ORIGINAL CODE)
function createFallbackEnvironment() {
    console.log('Creating fallback environment...');
    
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    
    // Create a simple sky gradient
    const gradient = context.createLinearGradient(0, 0, 0, 256);
    gradient.addColorStop(0, '#87CEEB'); // Sky blue
    gradient.addColorStop(0.5, '#98D8E8');
    gradient.addColorStop(1, '#B0E0E6'); // Light blue
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, 512, 256);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.mapping = THREE.EquirectangularReflectionMapping;
    
    scene.background = texture;
    scene.environment = texture;
    
    // Update materials to use the new environment
    scene.traverse((object) => {
        if (object.isMesh && object.material) {
            if (object.material.isMeshStandardMaterial || object.material.isMeshPhysicalMaterial) {
                object.material.envMap = texture;
                object.material.needsUpdate = true;
            }
        }
    });
    
    console.log('Fallback environment created successfully');
}

const rgbeLoader = new RGBELoader();
const hdriUrls = [
    'textures/moon_lab_4k.hdr'
];

function loadHDRI(urls, index = 0) {
    if (index >= urls.length) {
        console.log('All HDRI URLs failed, creating fallback environment');
        createFallbackEnvironment();
        return;
    }

    console.log(`Attempting to load HDRI: ${urls[index]}`);
    rgbeLoader.load(
        urls[index],
        function(texture) {
            console.log(`Successfully loaded HDRI: ${urls[index]}`);
            texture.mapping = THREE.EquirectangularReflectionMapping;
            scene.background = texture;
            scene.environment = texture;
            
            // Update all materials in the scene to use the new environment map
            scene.traverse((object) => {
                if (object.isMesh && object.material) {
                    if (object.material.isMeshStandardMaterial || object.material.isMeshPhysicalMaterial) {
                        object.material.envMap = texture;
                        object.material.envMapIntensity = object.material.envMapIntensity || 1;
                        object.material.needsUpdate = true;
                    }
                }
            });
            
            console.log('Environment map applied to scene');
        },
        undefined, // onProgress callback
        function(error) {
            console.error(`Failed to load HDRI ${urls[index]}:`, error);
            loadHDRI(urls, index + 1); // Try next URL
        }
    );
}

loadHDRI(hdriUrls);

// Ground and shadows (YOUR ORIGINAL CODE)
const groundGeometry = new THREE.PlaneGeometry(100, 100);
const groundShadowMaterial = new THREE.ShadowMaterial({ opacity: 0.3 });
const groundPlane = new THREE.Mesh(groundGeometry, groundShadowMaterial);
groundPlane.rotation.x = -Math.PI / 2;
groundPlane.position.y = -10;
groundPlane.receiveShadow = true;
scene.add(groundPlane);

const contactShadowGeometry = new THREE.PlaneGeometry(50, 50);
const contactShadowMaterial = new THREE.ShadowMaterial({ opacity: 0.5, transparent: true });
const contactShadowPlane = new THREE.Mesh(contactShadowGeometry, contactShadowMaterial);
contactShadowPlane.rotation.x = -Math.PI / 2;
contactShadowPlane.position.y = -9.9;
contactShadowPlane.receiveShadow = true;
scene.add(contactShadowPlane);

// Lighting (YOUR ORIGINAL CODE)
const mainLight = new THREE.DirectionalLight(0xffffff, 1);
mainLight.position.set(20, 30, 10);
mainLight.castShadow = true;
mainLight.shadow.mapSize.width = 2048;
mainLight.shadow.mapSize.height = 2048;
mainLight.shadow.camera.near = 0.5;
mainLight.shadow.camera.far = 100;
mainLight.shadow.camera.left = -50;
mainLight.shadow.camera.right = 50;
mainLight.shadow.camera.top = 50;
mainLight.shadow.camera.bottom = -50;
mainLight.shadow.bias = -0.0001;
scene.add(mainLight);

const keyLight = new THREE.DirectionalLight(new THREE.Color('hsl(30, 100%, 75%)'), 0.2);
keyLight.position.set(-100, 0, 100);
const fillLight = new THREE.DirectionalLight(new THREE.Color('hsl(240, 100%, 75%)'), 0.15);
fillLight.position.set(100, 0, 100);
const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
backLight.position.set(100, 0, -100).normalize();
const equalLight = new THREE.AmbientLight(0x404040, 0.15);

scene.add(equalLight);
scene.add(keyLight);
scene.add(fillLight);
scene.add(backLight);

// Lights object for story controller
const lightsRef = {
    main: mainLight,
    key: keyLight,
    fill: fillLight,
    back: backLight,
    ambient: equalLight
};

// Glowing objects (YOUR ORIGINAL CODE)
const glowSphere = new THREE.Mesh(
    new THREE.SphereGeometry(2, 32, 32),
    new THREE.MeshStandardMaterial({
        color: 0xff6b6b,
        emissive: 0xff0000,
        emissiveIntensity: 0.5,
        metalness: 0.8,
        roughness: 0.1,
        envMapIntensity: 1.5
    })
);
glowSphere.position.set(10, 5, 0);
glowSphere.castShadow = true;
scene.add(glowSphere);

const glowBox = new THREE.Mesh(
    new THREE.BoxGeometry(3, 3, 3),
    new THREE.MeshStandardMaterial({
        color: 0x6b6bff,
        emissive: 0x0000ff,
        emissiveIntensity: 0.3,
        metalness: 0.9,
        roughness: 0.1,
        envMapIntensity: 1.5
    })
);
glowBox.position.set(-10, 3, 5);
glowBox.castShadow = true;
scene.add(glowBox);

// Model loading (YOUR ORIGINAL CODE)
let loadedModel = null;
let modelAnimations = [];
let mixer = null;
let storyController = null;

const gltfLoader = new GLTFLoader();

function loadGLTFModels() {
    const modelPaths = [
        'textures/AnyConv.com__IronMan.glb'
    ];

    modelPaths.forEach((modelPath, index) => {
        console.log(`Loading GLTF model: ${modelPath}`);
        gltfLoader.load(
            modelPath,
            (gltf) => {
                console.log(`Successfully loaded model: ${modelPath}`, gltf);
                const model = gltf.scene;
                
                // Configure shadows and materials
                model.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                        
                        if (child.material) {
                            child.material.envMapIntensity = 1.5;
                            if (scene.environment) {
                                child.material.envMap = scene.environment;
                            }
                            child.material.needsUpdate = true;
                        }
                    }
                });

                if (index === 0) {
                    loadedModel = model;
                    console.log('Loaded model assigned as primary model');
                    
                    // Handle animations if present
                    if (gltf.animations && gltf.animations.length > 0) {
                        mixer = new THREE.AnimationMixer(model);
                        modelAnimations = gltf.animations;
                        console.log(`Found ${gltf.animations.length} animations`);
                        
                        const action = mixer.clipAction(gltf.animations[0]);
                        action.play();
                    }
                    
                    // Initialize story controller after first model loads
                    initializeStoryController();
                }

                model.position.set(index * 10, 0, 0);
                scene.add(model);
                
                console.log(`Model ${index} added to scene at position:`, model.position);
            },
            (progress) => {
                console.log(`Loading progress for ${modelPath}:`, (progress.loaded / progress.total * 100) + '%');
            },
            (error) => {
                console.error(`Error loading GLTF model ${modelPath}:`, error);
                // Initialize story controller even if model fails to load
                if (index === 0) {
                    setTimeout(initializeStoryController, 1000);
                }
            }
        );
    });
}

function initializeStoryController() {
    if (storyController) return; // Prevent multiple initializations
    
    storyController = new StoryAnimationController(
        cameraTransition,
        scene,
        loadedModel,
        glowSphere,
        glowBox,
        lightsRef
    );
    
    setupStoryControls();
    setupHTMLControls();
    console.log('🎭 AI Story Controller initialized successfully!');
}

function setupStoryControls() {
    // Add AI story controls to your existing GUI WITHOUT changing other controls
    const storyFolder = gui.addFolder('🎭 AI Storytelling');
    
    const storySettings = {
        storyType: 'adventure',
        startStory: () => storyController.playAIStory(),
        customStory: () => {
            const input = prompt('Enter your story direction:');
            if (input) storyController.playAIStory(input);
        },
        voiceCommand: () => storyController.startVoiceCommand(),
        stopStory: () => storyController.stopStory()
    };
    
    storyFolder.add(storySettings, 'storyType', {
        'Adventure': 'adventure',
        'Mystery': 'mystery', 
        'Action': 'action',
        'Sci-Fi': 'scifi',
        'Drama': 'drama'
    }).onChange((value) => {
        storyController.setStoryType(value);
    });
    
    storyFolder.add(storySettings, 'startStory').name('▶️ Start AI Story');
    storyFolder.add(storySettings, 'customStory').name('✍️ Custom Story');
    storyFolder.add(storySettings, 'voiceCommand').name('🎤 Voice Command');
    storyFolder.add(storySettings, 'stopStory').name('⏹️ Stop Story');
}

function setupHTMLControls() {
    const startBtn = document.getElementById('start-story');
    const customBtn = document.getElementById('custom-story');
    const voiceBtn = document.getElementById('voice-story');
    const stopBtn = document.getElementById('stop-story');
    
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            storyController.playAIStory();
        });
    }
    
    if (customBtn) {
        customBtn.addEventListener('click', () => {
            const input = prompt('Enter your story direction:');
            if (input) storyController.playAIStory(input);
        });
    }
    
    if (voiceBtn) {
        voiceBtn.addEventListener('click', () => {
            storyController.startVoiceCommand();
        });
    }
    
    if (stopBtn) {
        stopBtn.addEventListener('click', () => {
            storyController.stopStory();
        });
    }
}

loadGLTFModels();

// SVG Loading (YOUR ORIGINAL CODE)
let svgGroup = null;
const loader = new SVGLoader();

loader.load(
    'textures/002.svg',
    function(data) {
        console.log('SVG loaded successfully');
        const paths = data.paths;
        const group = new THREE.Group();

        for (let i = 0; i < paths.length; i++) {
            const path = paths[i];
            const material = new THREE.MeshStandardMaterial({
                color: path.color,
                side: THREE.DoubleSide,
                metalness: 0.3,
                roughness: 0.6,
                envMapIntensity: 1.0,
                depthWrite: false
            });

            const shapes = SVGLoader.createShapes(path);
            for (let j = 0; j < shapes.length; j++) {
                const shape = shapes[j];
                const geometry = new THREE.ShapeGeometry(shape);
                const mesh = new THREE.Mesh(geometry, material);
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                group.add(mesh);
            }
        }

        svgGroup = group;
        scene.add(group);
        console.log('SVG group added to scene');
    },
    undefined,
    function(error) {
        console.error('Error loading SVG:', error);
    }
);

// Animation controls and settings (YOUR ORIGINAL CODE - PRESERVED ALL)
const animationSettings = {
    // Glow Sphere Animation
    glowSphereRotationSpeed: 0.01,
    enableGlowSphereRotation: true,
    glowSphereEmissiveIntensity: 0.5,
    
    // Glow Box Animation  
    glowBoxRotationSpeedX: 0.005,
    glowBoxRotationSpeedZ: 0.008,
    enableGlowBoxRotation: true,
    glowBoxEmissiveIntensity: 0.3,
    
    // General animation controls
    enableAutoRotation: true,
    animationSpeed: 1.0,
    
    // Model animation controls
    enableModelAnimation: true,
    modelAnimationSpeed: 1.0,
    
    // Camera animation controls
    enableCameraAnimation: false,
    cameraOrbitSpeed: 0.01
};

// Material settings (YOUR ORIGINAL CODE)
const materialSettings = {
    // Sphere material
    sphereColor: '#ff6b6b',
    sphereMetalness: 0.8,
    sphereRoughness: 0.1,
    sphereEmissive: '#ff0000',
    sphereEmissiveIntensity: 0.5,
    
    // Box material
    boxColor: '#6b6bff',
    boxMetalness: 0.9,
    boxRoughness: 0.1, 
    boxEmissive: '#0000ff',
    boxEmissiveIntensity: 0.3,
    
    // Environment intensity
    envMapIntensity: 1.5
};

// Light settings (YOUR ORIGINAL CODE)
const lightSettings = {
    // Main directional light
    mainLightIntensity: 1,
    mainLightColor: '#ffffff',
    mainLightPositionX: 20,
    mainLightPositionY: 30,
    mainLightPositionZ: 10,
    
    // Key light
    keyLightIntensity: 0.2,
    keyLightColor: '#ffb366',
    
    // Fill light  
    fillLightIntensity: 0.15,
    fillLightColor: '#6666ff',
    
    // Back light
    backLightIntensity: 0.3,
    backLightColor: '#ffffff',
    
    // Ambient light
    ambientLightIntensity: 0.15,
    ambientLightColor: '#404040'
};

// Post-processing settings (YOUR ORIGINAL CODE)
const postProcessingSettings = {
    // Bloom settings
    bloomStrength: 1.5,
    bloomRadius: 0.4,
    bloomThreshold: 0.85,
    
    // Tone mapping
    toneMappingExposure: 1,
    
    // Enable/disable effects
    enableBloom: true
};

// Keyboard shortcuts (YOUR ORIGINAL CODE)
const keyboardShortcuts = {
    enableKeyboardControls: true,
    
    // Camera shortcuts
    cameraOverview: 'KeyO',      // 'O' key
    cameraCloseup: 'KeyC',       // 'C' key  
    cameraSideView: 'KeyS',      // 'S' key
    cameraDramatic: 'KeyD',      // 'D' key
    cameraModelView: 'KeyM',     // 'M' key
    
    // Animation shortcuts
    toggleAutoRotation: 'Space', // Spacebar
    resetScene: 'KeyR',          // 'R' key
    
    // Lighting shortcuts
    toggleMainLight: 'KeyL',     // 'L' key
};

// PRESERVE ALL YOUR ORIGINAL GUI CONTROLS
const animationFolder = gui.addFolder('🎬 Animation Controls');

// Glow Sphere Controls
const sphereFolder = animationFolder.addFolder('🔴 Glow Sphere');
sphereFolder.add(animationSettings, 'enableGlowSphereRotation').name('Enable Rotation');
sphereFolder.add(animationSettings, 'glowSphereRotationSpeed', 0, 0.05).name('Rotation Speed');
sphereFolder.add(materialSettings, 'sphereEmissiveIntensity', 0, 2).name('Emissive Intensity').onChange(value => {
    glowSphere.material.emissiveIntensity = value;
});

// Glow Box Controls
const boxFolder = animationFolder.addFolder('🔵 Glow Box');  
boxFolder.add(animationSettings, 'enableGlowBoxRotation').name('Enable Rotation');
boxFolder.add(animationSettings, 'glowBoxRotationSpeedX', 0, 0.02).name('X Rotation Speed');
boxFolder.add(animationSettings, 'glowBoxRotationSpeedZ', 0, 0.02).name('Z Rotation Speed');
boxFolder.add(materialSettings, 'boxEmissiveIntensity', 0, 2).name('Emissive Intensity').onChange(value => {
    glowBox.material.emissiveIntensity = value;
});

// General Animation Controls
animationFolder.add(animationSettings, 'enableAutoRotation').name('🔄 Enable All Rotations');
animationFolder.add(animationSettings, 'animationSpeed', 0.1, 3.0).name('🏃 Overall Speed');

// Camera Controls (YOUR ORIGINAL CODE)
const cameraFolder = gui.addFolder('📹 Camera Controls');

const cameraControls = {
    overview: () => cameraTransition.transitionTo(cameraPositions.overview.position, cameraPositions.overview.target),
    closeup: () => cameraTransition.transitionTo(cameraPositions.closeup.position, cameraPositions.closeup.target),  
    sideView: () => cameraTransition.transitionTo(cameraPositions.sideView.position, cameraPositions.sideView.target),
    dramatic: () => cameraTransition.transitionTo(cameraPositions.dramatic.position, cameraPositions.dramatic.target),
    modelView: () => cameraTransition.transitionTo(cameraPositions.modelView.position, cameraPositions.modelView.target),
    orbitAnimation: () => cameraTransition.orbitAround(new THREE.Vector3(0, 0, 0), 25, 0, Math.PI * 2, 8),
    stopTransition: () => cameraTransition.stopTransition()
};

cameraFolder.add(cameraControls, 'overview').name('🌅 Overview');
cameraFolder.add(cameraControls, 'closeup').name('🔍 Closeup');
cameraFolder.add(cameraControls, 'sideView').name('👁️ Side View');
cameraFolder.add(cameraControls, 'dramatic').name('🎭 Dramatic');
cameraFolder.add(cameraControls, 'modelView').name('🤖 Model View');
cameraFolder.add(cameraControls, 'orbitAnimation').name('🌍 Orbit Animation');
cameraFolder.add(cameraControls, 'stopTransition').name('⏹️ Stop Camera');

// Lighting Controls (YOUR ORIGINAL CODE)
const lightingFolder = gui.addFolder('💡 Lighting Controls');

lightingFolder.add(lightSettings, 'mainLightIntensity', 0, 3).name('Main Light').onChange(value => {
    mainLight.intensity = value;
});
lightingFolder.addColor(lightSettings, 'mainLightColor').name('Main Color').onChange(value => {
    mainLight.color.setStyle(value);
});

lightingFolder.add(lightSettings, 'keyLightIntensity', 0, 1).name('Key Light').onChange(value => {
    keyLight.intensity = value;
});
lightingFolder.addColor(lightSettings, 'keyLightColor').name('Key Color').onChange(value => {
    keyLight.color.setStyle(value);
});

lightingFolder.add(lightSettings, 'fillLightIntensity', 0, 1).name('Fill Light').onChange(value => {
    fillLight.intensity = value;
});
lightingFolder.addColor(lightSettings, 'fillLightColor').name('Fill Color').onChange(value => {
    fillLight.color.setStyle(value);
});

lightingFolder.add(lightSettings, 'ambientLightIntensity', 0, 0.5).name('Ambient Light').onChange(value => {
    equalLight.intensity = value;
});

// Material Controls (YOUR ORIGINAL CODE)
const materialFolder = gui.addFolder('🎨 Material Controls');

// Sphere Material Controls
const sphereMaterialFolder = materialFolder.addFolder('🔴 Sphere Material');
sphereMaterialFolder.addColor(materialSettings, 'sphereColor').name('Color').onChange(value => {
    glowSphere.material.color.setStyle(value);
});
sphereMaterialFolder.addColor(materialSettings, 'sphereEmissive').name('Emissive Color').onChange(value => {
    glowSphere.material.emissive.setStyle(value);
});
sphereMaterialFolder.add(materialSettings, 'sphereMetalness', 0, 1).name('Metalness').onChange(value => {
    glowSphere.material.metalness = value;
});
sphereMaterialFolder.add(materialSettings, 'sphereRoughness', 0, 1).name('Roughness').onChange(value => {
    glowSphere.material.roughness = value;
});

// Box Material Controls  
const boxMaterialFolder = materialFolder.addFolder('🔵 Box Material');
boxMaterialFolder.addColor(materialSettings, 'boxColor').name('Color').onChange(value => {
    glowBox.material.color.setStyle(value);
});
boxMaterialFolder.addColor(materialSettings, 'boxEmissive').name('Emissive Color').onChange(value => {
    glowBox.material.emissive.setStyle(value);
});
boxMaterialFolder.add(materialSettings, 'boxMetalness', 0, 1).name('Metalness').onChange(value => {
    glowBox.material.metalness = value;
});
boxMaterialFolder.add(materialSettings, 'boxRoughness', 0, 1).name('Roughness').onChange(value => {
    glowBox.material.roughness = value;
});

// Environment Controls
materialFolder.add(materialSettings, 'envMapIntensity', 0, 3).name('Environment Intensity').onChange(value => {
    scene.traverse((object) => {
        if (object.isMesh && object.material && (object.material.isMeshStandardMaterial || object.material.isMeshPhysicalMaterial)) {
            object.material.envMapIntensity = value;
            object.material.needsUpdate = true;
        }
    });
});

// Post-processing Controls (YOUR ORIGINAL CODE)
const postProcessingFolder = gui.addFolder('✨ Post-Processing');

postProcessingFolder.add(postProcessingSettings, 'enableBloom').name('Enable Bloom').onChange(value => {
    if (value) {
        if (!composer.passes.includes(bloomPass)) {
            composer.addPass(bloomPass);
        }
    } else {
        composer.removePass(bloomPass);
    }
});

postProcessingFolder.add(postProcessingSettings, 'bloomStrength', 0, 3).name('Bloom Strength').onChange(value => {
    bloomPass.strength = value;
});

postProcessingFolder.add(postProcessingSettings, 'bloomRadius', 0, 1).name('Bloom Radius').onChange(value => {
    bloomPass.radius = value;
});

postProcessingFolder.add(postProcessingSettings, 'bloomThreshold', 0, 1).name('Bloom Threshold').onChange(value => {
    bloomPass.threshold = value;
});

postProcessingFolder.add(postProcessingSettings, 'toneMappingExposure', 0.1, 2).name('Exposure').onChange(value => {
    renderer.toneMappingExposure = value;
});

// Scene Controls (YOUR ORIGINAL CODE)
const sceneFolder = gui.addFolder('🌍 Scene Controls');

const sceneControls = {
    resetCamera: () => {
        camera.position.set(0, 25, 30);
        controls.target.set(0, 0, 0);
        controls.update();
    },
    resetMaterials: () => {
        // Reset sphere material
        glowSphere.material.color.setStyle(materialSettings.sphereColor);
        glowSphere.material.emissive.setStyle(materialSettings.sphereEmissive);
        glowSphere.material.emissiveIntensity = materialSettings.sphereEmissiveIntensity;
        glowSphere.material.metalness = materialSettings.sphereMetalness;
        glowSphere.material.roughness = materialSettings.sphereRoughness;
        
        // Reset box material
        glowBox.material.color.setStyle(materialSettings.boxColor);
        glowBox.material.emissive.setStyle(materialSettings.boxEmissive);
        glowBox.material.emissiveIntensity = materialSettings.boxEmissiveIntensity;
        glowBox.material.metalness = materialSettings.boxMetalness;
        glowBox.material.roughness = materialSettings.boxRoughness;
        
        console.log('Materials reset to default values');
    },
    resetLighting: () => {
        mainLight.intensity = lightSettings.mainLightIntensity;
        keyLight.intensity = lightSettings.keyLightIntensity;
        fillLight.intensity = lightSettings.fillLightIntensity;
        backLight.intensity = lightSettings.backLightIntensity;
        equalLight.intensity = lightSettings.ambientLightIntensity;
        console.log('Lighting reset to default values');
    },
    resetScene: () => {
        sceneControls.resetCamera();
        sceneControls.resetMaterials();
        sceneControls.resetLighting();
        console.log('Scene reset to default state');
    }
};

sceneFolder.add(sceneControls, 'resetCamera').name('📹 Reset Camera');
sceneFolder.add(sceneControls, 'resetMaterials').name('🎨 Reset Materials');
sceneFolder.add(sceneControls, 'resetLighting').name('💡 Reset Lighting');
sceneFolder.add(sceneControls, 'resetScene').name('🔄 Reset Everything');

// Keyboard event listeners (YOUR ORIGINAL CODE)
document.addEventListener('keydown', (event) => {
    if (!keyboardShortcuts.enableKeyboardControls) return;
    
    switch(event.code) {
        case keyboardShortcuts.cameraOverview:
            cameraControls.overview();
            console.log('Camera: Overview (O key)');
            break;
        case keyboardShortcuts.cameraCloseup:
            cameraControls.closeup();
            console.log('Camera: Closeup (C key)');
            break;
        case keyboardShortcuts.cameraSideView:
            cameraControls.sideView();
            console.log('Camera: Side View (S key)');
            break;
        case keyboardShortcuts.cameraDramatic:
            cameraControls.dramatic();
            console.log('Camera: Dramatic (D key)');
            break;
        case keyboardShortcuts.cameraModelView:
            cameraControls.modelView();
            console.log('Camera: Model View (M key)');
            break;
        case keyboardShortcuts.toggleAutoRotation:
            animationSettings.enableAutoRotation = !animationSettings.enableAutoRotation;
            console.log('Auto rotation toggled:', animationSettings.enableAutoRotation);
            break;
        case keyboardShortcuts.resetScene:
            sceneControls.resetScene();
            console.log('Scene reset (R key)');
            break;
        case keyboardShortcuts.toggleMainLight:
            lightSettings.mainLightIntensity = lightSettings.mainLightIntensity > 0 ? 0 : 1;
            mainLight.intensity = lightSettings.mainLightIntensity;
            console.log('Main light toggled:', lightSettings.mainLightIntensity);
            break;
    }
});

// Handle window resize (YOUR ORIGINAL CODE)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
    
    // Update bloom pass size
    bloomPass.setSize(window.innerWidth, window.innerHeight);
    
    console.log('Window resized to:', window.innerWidth, 'x', window.innerHeight);
}

window.addEventListener('resize', onWindowResize);

// Animation loop (YOUR ORIGINAL CODE WITH IMPROVEMENTS)
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    
    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();
    
    // Update model animations
    if (mixer) {
        mixer.update(delta * animationSettings.modelAnimationSpeed);
    }
    
    // Auto-rotation animations (respecting speed multiplier)
    if (animationSettings.enableAutoRotation) {
        const speedMultiplier = animationSettings.animationSpeed;
        
        // Glow Sphere rotation
        if (animationSettings.enableGlowSphereRotation) {
            glowSphere.rotation.y += animationSettings.glowSphereRotationSpeed * speedMultiplier;
        }
        
        // Glow Box rotation
        if (animationSettings.enableGlowBoxRotation) {
            glowBox.rotation.x += animationSettings.glowBoxRotationSpeedX * speedMultiplier;
            glowBox.rotation.z += animationSettings.glowBoxRotationSpeedZ * speedMultiplier;
        }
    }
    
    // Camera animation (if enabled)
    if (animationSettings.enableCameraAnimation && !cameraTransition.isTransitioning) {
        const radius = 35;
        const speed = animationSettings.cameraOrbitSpeed;
        camera.position.x = Math.cos(elapsedTime * speed) * radius;
        camera.position.z = Math.sin(elapsedTime * speed) * radius;
        camera.lookAt(scene.position);
    }
    
    // Update controls only if camera is not transitioning
    if (!cameraTransition.isTransitioning) {
        controls.update();
    }
    
    // Render the scene
    composer.render();
}

animate();

// Initialize everything once loaded
setTimeout(() => {
    if (!storyController) {
        initializeStoryController();
    }
}, 3000);

console.log('🎭 Enhanced AI-Powered ThreeJS Application Loaded!');
console.log('✅ All original GUI controls preserved');  
console.log('✅ AI storytelling added as separate folder');
console.log('✅ No blur effects - model stays sharp');
console.log('✅ Original functionality maintained');
console.log('🎮 Use keyboard shortcuts: O, C, S, D, M for camera views');
console.log('🎭 Use GUI or buttons to start AI story adventures!');
