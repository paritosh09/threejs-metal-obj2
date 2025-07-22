# AI-Powered Three.js Storytelling Application

An interactive 3D visualization that combines advanced Three.js rendering with AI-powered storytelling capabilities using OpenRouter's Claude-3-Sonnet API.

## 🌟 Features

### 🎭 AI Storytelling
- **Dynamic Story Generation**: Real-time narrative creation using OpenRouter API
- **Cinematic Camera Control**: AI-driven camera movements synchronized with story beats
- **Multiple Story Types**: Adventure, Mystery, Action, Sci-Fi, Drama
- **Voice Recognition**: Natural language story direction input
- **Custom Story Input**: User-directed narrative paths
- **Lighting Moods**: Automatic lighting adjustments (bright, dark, mysterious, heroic)

### 🎬 Advanced 3D Rendering
- **HDRI Environment Mapping**: Realistic lighting and reflections
- **PBR Materials**: Physically-based rendering with metalness/roughness workflow
- **Shadow Mapping**: Real-time shadow casting and receiving
- **Post-Processing Pipeline**: Bloom effects and tone mapping
- **Model Animation**: GLTF model support with animation mixer

### 🎮 Interactive Controls
- **Comprehensive GUI**: Complete control over all scene parameters
- **Keyboard Shortcuts**: Quick camera transitions (O, C, S, D, M keys)
- **Camera Transitions**: Smooth GSAP-powered camera movements
- **Material Editor**: Real-time material property adjustments
- **Lighting Studio**: Professional lighting setup with multiple light types

## 🚀 Getting Started

### Prerequisites

### Required Assets
Place these files in your `textures/` directory:
- `AnyConv.com__IronMan.glb` - Iron Man 3D model
- `moon_lab_4k.hdr` - HDRI environment map
- `002.svg` - SVG graphics file

## 📖 Usage

### Basic Operation
1. **Launch**: Open the application in your browser
2. **Load**: Wait for 3D models and environment to load
3. **Explore**: Use mouse to orbit, zoom, and pan the camera
4. **Story Mode**: Click "🎭 Start AI Story" or use GUI controls

### AI Storytelling
- **Auto Story**: Click "Start AI Story" for automatic narrative generation
- **Custom Story**: Use "Custom Story" to provide specific story directions
- **Voice Commands**: Click "Voice Command" to speak your story ideas
- **Story Types**: Select from Adventure, Mystery, Action, Sci-Fi, Drama in GUI

### Camera Controls
- **O Key**: Overview camera position
- **C Key**: Close-up view of scene
- **S Key**: Side view perspective  
- **D Key**: Dramatic angle
- **M Key**: Model-focused view
- **Space**: Toggle auto-rotation
- **R Key**: Reset scene to defaults

## 🔧 Configuration

### API Setup
Replace the API key in `main.js`:

### Customization Options
- **Camera Positions**: Modify `cameraPositions` object
- **Animation Settings**: Adjust in GUI or `animationSettings`
- **Light Setup**: Configure in `lightSettings` object
- **Material Properties**: Edit via GUI or `materialSettings`

## 📁 Project Structure

## 🎨 Key Components

### AIStorytellerIntegration
Handles communication with OpenRouter API for story generation
- Story prompt building
- Response parsing
- Error handling with fallbacks
- Progress indication

### StoryAnimationController
Manages story-driven animations and camera movements
- Camera action execution
- Object animation synchronization
- Lighting mood transitions
- Voice recognition integration

### CameraTransition
Advanced camera movement system with smooth transitions
- Position validation
- Orbit animations
- Material updates during transitions
- GSAP-powered smooth movement

## 🛠️ Dependencies
- **Three.js**: 3D rendering engine
- **GSAP**: Animation library
- **dat.GUI**: Debug interface
- **OpenRouter API**: AI story generation

## 🎯 Story Types
- **Adventure**: Hero's journey with exploration themes
- **Mystery**: Suspenseful investigations and discoveries
- **Action**: High-energy sequences with dynamic camera work
- **Sci-Fi**: Futuristic technology and space themes
- **Drama**: Character-focused emotional narratives

## 🔍 Troubleshooting

### Common Issues
- **Model not loading**: Check file paths in `textures/` directory
- **API errors**: Verify OpenRouter API key is valid
- **Performance issues**: Reduce bloom strength or disable auto-rotation
- **Voice recognition**: Ensure HTTPS and microphone permissions

### Browser Compatibility
- Chrome/Edge: Full feature support
- Firefox: Limited voice recognition
- Safari: WebGL required, some limitations

## 🤝 Contributing
1. Fork the repository
2. Create feature branch
3. Make changes preserving existing functionality
4. Test thoroughly with different story types
5. Submit pull request

## 📄 License
This project is licensed under the MIT License.

## 🙏 Acknowledgments
- Three.js community for excellent documentation
- OpenRouter for AI API access
- GSAP for smooth animations
- Original lighting setup inspiration from 3D visualization community

---
*Built with ❤️ using Three.js and AI-powered storytelling*
