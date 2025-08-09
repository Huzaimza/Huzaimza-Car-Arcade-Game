// 3D Car Arcade Game - ULTIMATE EDITION
class UltimateCarGame {
    constructor() {
        // Game state
        this.gameState = 'start'; // 'start', 'playing', 'gameOver', 'settings'
        this.score = 0;
        this.distance = 0;
        this.speed = 0;
        this.maxSpeed = 300;
        this.acceleration = 0.8;
        this.deceleration = 0.4;
        this.coins = 0;
        this.combo = 0;
        this.maxCombo = 0;
        
        // Player car position and physics
        this.carX = 0; // -1 to 1 (left to right)
        this.carSpeed = 0;
        this.carTurnSpeed = 0.025;
        this.lanes = [-0.6, -0.2, 0.2, 0.6]; // 4 lanes
        this.currentLane = 1; // Start in second lane
        this.targetLane = 1;
        this.laneTransitionSpeed = 0.08;
        
        // Road and world
        this.roadSpeed = 1;
        this.roadSegments = [];
        this.obstacles = [];
        this.powerups = [];
        this.particles = [];
        this.laneMarkers = [];
        this.environmentElements = {
            clouds: [],
            buildings: [],
            trees: []
        };
        
        // Power-ups and effects
        this.activePowerups = new Map();
        this.shieldActive = false;
        this.speedBoostActive = false;
        this.multiplierActive = false;
        this.multiplierValue = 1;
        
        // Controls
        this.keys = {};
        this.touches = {};
        
        // Game elements
        this.initElements();
        this.initControls();
        this.createRoadSegments();
        this.createEnvironment();
        this.createLaneMarkers();
        
        // Performance and settings
        this.lastTime = 0;
        this.fps = 60;
        this.frameInterval = 1000 / this.fps;
        this.settings = {
            soundEnabled: true,
            musicEnabled: true,
            particleQuality: 'medium'
        };
        
        // Mobile detection
        this.isMobile = this.detectMobile();
        
        // Audio system
        this.audioContext = null;
        this.musicOscillator = null;
        this.initAudio();
        
        // Achievements system
        this.achievements = [
            { id: 'first_100m', name: 'Getting Started', desc: 'Travel 100m', distance: 100, unlocked: false },
            { id: 'speed_demon', name: 'Speed Demon', desc: 'Reach 200 km/h', speed: 200, unlocked: false },
            { id: 'coin_collector', name: 'Coin Collector', desc: 'Collect 50 coins', coins: 50, unlocked: false },
            { id: 'combo_master', name: 'Combo Master', desc: 'Achieve 10x combo', combo: 10, unlocked: false },
            { id: 'survivor', name: 'Survivor', desc: 'Travel 2000m', distance: 2000, unlocked: false },
            { id: 'ultimate_driver', name: 'Ultimate Driver', desc: 'Score 10000 points', score: 10000, unlocked: false }
        ];
        
        // Mini-map
        this.miniObstacles = [];
        
        // Game loop
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    initElements() {
        // Get DOM elements
        this.gameWorld = document.getElementById('gameWorld');
        this.playerCar = document.getElementById('playerCar');
        this.road = document.getElementById('road');
        this.obstaclesContainer = document.getElementById('obstacles');
        this.powerupsContainer = document.getElementById('powerups');
        this.particlesContainer = document.getElementById('particles');
        this.laneMarkersContainer = document.getElementById('laneMarkers');
        this.environmentContainer = document.getElementById('environment');
        
        // Environment elements
        this.cloudsContainer = document.getElementById('clouds');
        this.buildingsLeftContainer = document.getElementById('buildingsLeft');
        this.buildingsRightContainer = document.getElementById('buildingsRight');
        this.treesLeftContainer = document.getElementById('treesLeft');
        this.treesRightContainer = document.getElementById('treesRight');
        this.mountainsContainer = document.getElementById('mountains');
        
        // UI elements
        this.scoreElement = document.getElementById('score');
        this.speedElement = document.getElementById('speed');
        this.distanceElement = document.getElementById('distance');
        this.comboElement = document.getElementById('combo');
        this.coinsElement = document.getElementById('coins');
        this.startScreen = document.getElementById('startScreen');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        this.settingsScreen = document.getElementById('settingsScreen');
        this.finalScore = document.getElementById('finalScore');
        this.finalDistance = document.getElementById('finalDistance');
        this.bestCombo = document.getElementById('bestCombo');
        this.finalCoins = document.getElementById('finalCoins');
        
        // Enhanced elements
        this.miniMap = document.getElementById('miniMap');
        this.miniCar = document.getElementById('miniCar');
        this.miniObstaclesContainer = document.getElementById('miniObstacles');
        this.powerUpBar = document.getElementById('powerUpBar');
        this.activePowerupsContainer = document.getElementById('activePowerups');
        this.achievementPopup = document.getElementById('achievementPopup');
        this.achievementText = document.getElementById('achievementText');
        this.explosionEffect = document.getElementById('explosionEffect');
        this.screenShake = document.getElementById('screenShake');
        this.boostTrail = document.getElementById('boostTrail');
        this.shieldEffect = document.getElementById('shieldEffect');
        
        // Buttons
        this.startBtn = document.getElementById('startBtn');
        this.restartBtn = document.getElementById('restartBtn');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.backBtn = document.getElementById('backBtn');
        
        // Settings
        this.soundToggle = document.getElementById('soundToggle');
        this.musicToggle = document.getElementById('musicToggle');
        this.particleQuality = document.getElementById('particleQuality');
        
        // Mobile controls
        this.mobileControls = document.getElementById('mobileControls');
        this.leftBtn = document.getElementById('leftBtn');
        this.rightBtn = document.getElementById('rightBtn');
        this.brakeBtn = document.getElementById('brakeBtn');
        this.boostBtn = document.getElementById('boostBtn');
        
        // Show/hide mobile controls
        if (this.isMobile) {
            this.mobileControls.style.display = 'flex';
        } else {
            this.mobileControls.style.display = 'none';
        }
    }
    
    initControls() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            // Lane switching with discrete keys
            if (this.gameState === 'playing') {
                if ((e.code === 'ArrowLeft' || e.code === 'KeyA') && this.targetLane > 0) {
                    this.targetLane--;
                    this.playSound(600, 0.1, 'sine');
                }
                if ((e.code === 'ArrowRight' || e.code === 'KeyD') && this.targetLane < this.lanes.length - 1) {
                    this.targetLane++;
                    this.playSound(600, 0.1, 'sine');
                }
            }
            
            e.preventDefault();
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            e.preventDefault();
        });
        
        // Button controls
        this.startBtn.addEventListener('click', () => this.startGame());
        this.restartBtn.addEventListener('click', () => this.restartGame());
        this.settingsBtn.addEventListener('click', () => this.showSettings());
        this.backBtn.addEventListener('click', () => this.hideSettings());
        
        // Settings controls
        this.soundToggle.addEventListener('change', (e) => {
            this.settings.soundEnabled = e.target.checked;
        });
        this.musicToggle.addEventListener('change', (e) => {
            this.settings.musicEnabled = e.target.checked;
            if (e.target.checked) {
                this.startBackgroundMusic();
            } else {
                this.stopBackgroundMusic();
            }
        });
        this.particleQuality.addEventListener('change', (e) => {
            this.settings.particleQuality = e.target.value;
        });
        
        // Mobile touch controls
        if (this.isMobile) {
            this.initTouchControls();
        }
        
        // Prevent context menu and scrolling
        document.addEventListener('contextmenu', (e) => e.preventDefault());
        document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
    }
    
    initTouchControls() {
        // Left button
        this.leftBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.touches.left = true;
            if (this.gameState === 'playing' && this.targetLane > 0) {
                this.targetLane--;
                this.playSound(600, 0.1, 'sine');
            }
        });
        this.leftBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.touches.left = false;
        });
        
        // Right button
        this.rightBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.touches.right = true;
            if (this.gameState === 'playing' && this.targetLane < this.lanes.length - 1) {
                this.targetLane++;
                this.playSound(600, 0.1, 'sine');
            }
        });
        this.rightBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.touches.right = false;
        });
        
        // Brake button
        this.brakeBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.touches.brake = true;
        });
        this.brakeBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.touches.brake = false;
        });
        
        // Boost button
        this.boostBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.touches.boost = true;
        });
        this.boostBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.touches.boost = false;
        });
        
        // Prevent default behaviors
        [this.leftBtn, this.rightBtn, this.brakeBtn, this.boostBtn].forEach(btn => {
            btn.addEventListener('touchstart', (e) => e.preventDefault());
            btn.addEventListener('touchmove', (e) => e.preventDefault());
            btn.addEventListener('touchend', (e) => e.preventDefault());
        });
    }
    
    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API not supported');
        }
    }
    
    playSound(frequency, duration, type = 'sine', volume = 0.1) {
        if (!this.audioContext || !this.settings.soundEnabled) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }
    
    startBackgroundMusic() {
        if (!this.audioContext || !this.settings.musicEnabled || this.musicOscillator) return;
        
        this.musicOscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        this.musicOscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        this.musicOscillator.type = 'sine';
        this.musicOscillator.frequency.setValueAtTime(220, this.audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.02, this.audioContext.currentTime);
        
        // Simple melody pattern
        const melody = [220, 247, 262, 294, 330, 349, 392];
        let noteIndex = 0;
        
        const playNextNote = () => {
            if (this.musicOscillator && this.settings.musicEnabled) {
                this.musicOscillator.frequency.setValueAtTime(melody[noteIndex], this.audioContext.currentTime);
                noteIndex = (noteIndex + 1) % melody.length;
                setTimeout(playNextNote, 800);
            }
        };
        
        this.musicOscillator.start();
        playNextNote();
    }
    
    stopBackgroundMusic() {
        if (this.musicOscillator) {
            this.musicOscillator.stop();
            this.musicOscillator = null;
        }
    }
    
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
    }
    
    createRoadSegments() {
        const segments = document.querySelectorAll('.road-segment');
        this.roadSegments = Array.from(segments).map((segment, index) => ({
            element: segment,
            z: -index * 200
        }));
    }
    
    createLaneMarkers() {
        for (let i = 0; i < 50; i++) {
            const marker = document.createElement('div');
            marker.className = 'lane-marker';
            marker.style.transform = `translateX(-50%) translateZ(${-i * 100}px)`;
            this.laneMarkersContainer.appendChild(marker);
            this.laneMarkers.push({
                element: marker,
                z: -i * 100
            });
        }
    }
    
    createEnvironment() {
        // Create clouds
        for (let i = 0; i < 8; i++) {
            this.createCloud(i);
        }
        
        // Create buildings
        for (let i = 0; i < 20; i++) {
            this.createBuilding(i, 'left');
            this.createBuilding(i, 'right');
        }
        
        // Create trees
        for (let i = 0; i < 30; i++) {
            this.createTree(i, 'left');
            this.createTree(i, 'right');
        }
    }
    
    createCloud(index) {
        const cloud = document.createElement('div');
        cloud.className = 'cloud';
        cloud.style.top = Math.random() * 30 + '%';
        cloud.style.left = -100 + (Math.random() * window.innerWidth * 1.5) + 'px';
        cloud.style.animationDelay = Math.random() * 20 + 's';
        this.cloudsContainer.appendChild(cloud);
        this.environmentElements.clouds.push({ element: cloud, x: -100 });
    }
    
    createBuilding(index, side) {
        const building = document.createElement('div');
        building.className = 'building';
        
        const width = 40 + Math.random() * 60;
        const height = 100 + Math.random() * 200;
        
        building.style.width = width + 'px';
        building.style.height = height + 'px';
        building.style.bottom = '0px';
        
        if (side === 'left') {
            building.style.left = -200 - Math.random() * 300 + 'px';
            building.style.transform = `translateZ(${-index * 150 - 300}px) rotateY(15deg)`;
            this.buildingsLeftContainer.appendChild(building);
        } else {
            building.style.right = -200 - Math.random() * 300 + 'px';
            building.style.transform = `translateZ(${-index * 150 - 300}px) rotateY(-15deg)`;
            this.buildingsRightContainer.appendChild(building);
        }
        
        this.environmentElements.buildings.push({ element: building, z: -index * 150 - 300 });
    }
    
    createTree(index, side) {
        const tree = document.createElement('div');
        tree.className = 'tree';
        tree.style.bottom = '0px';
        
        if (side === 'left') {
            tree.style.left = -100 - Math.random() * 150 + 'px';
            tree.style.transform = `translateZ(${-index * 80 - 200}px)`;
            this.treesLeftContainer.appendChild(tree);
        } else {
            tree.style.right = -100 - Math.random() * 150 + 'px';
            tree.style.transform = `translateZ(${-index * 80 - 200}px)`;
            this.treesRightContainer.appendChild(tree);
        }
        
        this.environmentElements.trees.push({ element: tree, z: -index * 80 - 200 });
    }
    
    showSettings() {
        this.gameState = 'settings';
        this.startScreen.classList.add('hidden');
        this.settingsScreen.classList.remove('hidden');
    }
    
    hideSettings() {
        this.gameState = 'start';
        this.settingsScreen.classList.add('hidden');
        this.startScreen.classList.remove('hidden');
    }
    
    startGame() {
        this.gameState = 'playing';
        this.startScreen.classList.add('hidden');
        this.settingsScreen.classList.add('hidden');
        
        // Reset game state
        this.score = 0;
        this.distance = 0;
        this.speed = 60;
        this.coins = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.carX = 0;
        this.currentLane = 1;
        this.targetLane = 1;
        this.obstacles = [];
        this.powerups = [];
        this.particles = [];
        this.miniObstacles = [];
        this.activePowerups.clear();
        this.shieldActive = false;
        this.speedBoostActive = false;
        this.multiplierActive = false;
        this.multiplierValue = 1;
        
        // Clear containers
        this.obstaclesContainer.innerHTML = '';
        this.powerupsContainer.innerHTML = '';
        this.activePowerupsContainer.innerHTML = '';
        this.miniObstaclesContainer.innerHTML = '';
        
        // Remove effects
        this.boostTrail.classList.remove('active');
        this.shieldEffect.classList.remove('active');
        
        // Resume audio context and start music
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        if (this.settings.musicEnabled) {
            this.startBackgroundMusic();
        }
    }
    
    restartGame() {
        this.gameOverScreen.classList.add('hidden');
        this.startGame();
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        this.gameOverScreen.classList.remove('hidden');
        this.finalScore.textContent = this.score;
        this.finalDistance.textContent = Math.floor(this.distance);
        this.bestCombo.textContent = this.maxCombo;
        this.finalCoins.textContent = this.coins;
        
        // Stop music
        this.stopBackgroundMusic();
        
        // Explosion effect
        this.triggerExplosion();
        
        // Screen shake
        this.triggerScreenShake();
        
        // Play crash sound
        this.playSound(150, 1.0, 'sawtooth', 0.3);
        
        // Disable effects
        this.boostTrail.classList.remove('active');
        this.shieldEffect.classList.remove('active');
    }
    
    triggerExplosion() {
        const carRect = this.playerCar.getBoundingClientRect();
        this.explosionEffect.style.left = carRect.left + carRect.width / 2 - 50 + 'px';
        this.explosionEffect.style.top = carRect.top + carRect.height / 2 - 50 + 'px';
        this.explosionEffect.classList.add('active');
        
        setTimeout(() => {
            this.explosionEffect.classList.remove('active');
        }, 600);
    }
    
    triggerScreenShake() {
        this.screenShake.classList.add('active');
        setTimeout(() => {
            this.screenShake.classList.remove('active');
        }, 500);
    }
    
    updateInput() {
        if (this.gameState !== 'playing') return;
        
        // Speed control
        const isUpPressed = this.keys['ArrowUp'] || this.keys['KeyW'];
        const isDownPressed = this.keys['ArrowDown'] || this.keys['KeyS'];
        const isTouchBoost = this.touches.boost;
        const isTouchBrake = this.touches.brake;
        
        if (isUpPressed || isTouchBoost) {
            const maxSpeedModifier = this.speedBoostActive ? 1.5 : 1;
            this.speed = Math.min(this.maxSpeed * maxSpeedModifier, this.speed + this.acceleration);
            
            if (isTouchBoost || isUpPressed) {
                this.boostTrail.classList.add('active');
            }
        } else if (isDownPressed || isTouchBrake) {
            this.speed = Math.max(30, this.speed - this.deceleration * 2);
            this.boostTrail.classList.remove('active');
        } else {
            // Natural deceleration
            if (this.speed > 80) {
                this.speed = Math.max(80, this.speed - this.deceleration * 0.5);
            }
            this.boostTrail.classList.remove('active');
        }
        
        // Lane switching with smooth transition
        const targetX = this.lanes[this.targetLane];
        if (Math.abs(this.carX - targetX) > 0.01) {
            this.carX += (targetX - this.carX) * this.laneTransitionSpeed;
        } else {
            this.carX = targetX;
            this.currentLane = this.targetLane;
        }
        
        // Update car position and rotation
        const carPosX = this.carX * 150;
        const carTilt = (this.carX - this.lanes[this.currentLane]) * 15;
        const carRotY = this.carX * 5;
        
        this.playerCar.style.transform = `translateX(calc(-50% + ${carPosX}px)) translateZ(0px) rotateZ(${carTilt}deg) rotateY(${carRotY}deg)`;
        
        // Update mini-map car position
        const miniCarX = 50 + (this.carX * 40);
        this.miniCar.style.left = miniCarX + '%';
    }
    
    updateRoad() {
        const roadSpeedMultiplier = this.speed / 60;
        
        // Update road segments
        this.roadSegments.forEach(segment => {
            segment.z += 3 * roadSpeedMultiplier;
            
            if (segment.z > 300) {
                segment.z -= 2000;
            }
            
            segment.element.style.transform = `translateZ(${segment.z}px)`;
        });
        
        // Update lane markers
        this.laneMarkers.forEach(marker => {
            marker.z += 6 * roadSpeedMultiplier;
            
            if (marker.z > 300) {
                marker.z -= 5000;
            }
            
            marker.element.style.transform = `translateX(-50%) translateZ(${marker.z}px)`;
        });
    }
    
    spawnObstacle() {
        const spawnRate = 0.015 + (this.speed / 15000);
        
        if (Math.random() < spawnRate) {
            const laneIndex = Math.floor(Math.random() * this.lanes.length);
            const types = ['car', 'truck', 'cone', 'motorcycle', 'barrier', 'oil', 'ramp'];
            const weights = [0.25, 0.15, 0.2, 0.15, 0.1, 0.1, 0.05];
            
            let obstacleType = this.weightedRandom(types, weights);
            
            const obstacle = {
                x: this.lanes[laneIndex],
                z: -1200,
                lane: laneIndex,
                type: obstacleType,
                element: null,
                passed: false
            };
            
            // Create DOM element
            const obstacleEl = document.createElement('div');
            obstacleEl.className = `obstacle obstacle-${obstacle.type}`;
            const initialScale = Math.max(0.2, 1 - (Math.abs(obstacle.z) / 1200));
            obstacleEl.style.transform = `translateX(${obstacle.x * 150}px) translateZ(${obstacle.z}px) scale(${initialScale})`;
            
            obstacle.element = obstacleEl;
            this.obstaclesContainer.appendChild(obstacleEl);
            this.obstacles.push(obstacle);
            
            // Add to mini-map
            this.addMiniObstacle(obstacle);
        }
    }
    
    spawnPowerup() {
        const spawnRate = 0.008 + (this.distance / 100000);
        
        if (Math.random() < spawnRate) {
            const laneIndex = Math.floor(Math.random() * this.lanes.length);
            const types = ['speed', 'shield', 'coin', 'multiplier'];
            const weights = [0.2, 0.15, 0.5, 0.15];
            
            let powerupType = this.weightedRandom(types, weights);
            
            const powerup = {
                x: this.lanes[laneIndex],
                z: -1200,
                lane: laneIndex,
                type: powerupType,
                element: null,
                collected: false
            };
            
            // Create DOM element
            const powerupEl = document.createElement('div');
            powerupEl.className = `powerup powerup-${powerup.type}`;
            const initialScale = Math.max(0.2, 1 - (Math.abs(powerup.z) / 1200));
            powerupEl.style.transform = `translateX(${powerup.x * 150}px) translateZ(${powerup.z}px) scale(${initialScale})`;
            
            powerup.element = powerupEl;
            this.powerupsContainer.appendChild(powerupEl);
            this.powerups.push(powerup);
        }
    }
    
    weightedRandom(items, weights) {
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * totalWeight;
        
        for (let i = 0; i < items.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return items[i];
            }
        }
        
        return items[items.length - 1];
    }
    
    updateObstacles() {
        const roadSpeedMultiplier = this.speed / 60;
        
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            obstacle.z += 5 * roadSpeedMultiplier;
            
            // Update position with 3D scaling
            const obstacleScale = Math.max(0.2, 1 - (Math.abs(obstacle.z) / 1200));
            obstacle.element.style.transform = `translateX(${obstacle.x * 150}px) translateZ(${obstacle.z}px) scale(${obstacleScale})`;
            
            // Check collision
            if (obstacle.z > -80 && obstacle.z < 80) {
                if (Math.abs(obstacle.x - this.carX) < 0.15 && !this.shieldActive) {
                    // Special handling for different obstacle types
                    if (obstacle.type === 'oil') {
                        this.handleOilCollision();
                    } else if (obstacle.type === 'ramp') {
                        this.handleRampCollision();
                    } else {
                        this.gameOver();
                    }
                    return;
                } else if (Math.abs(obstacle.x - this.carX) < 0.15 && this.shieldActive) {
                    // Shield deflection
                    this.playSound(800, 0.3, 'square', 0.2);
                    this.createShieldDeflectionEffect(obstacle);
                }
            }
            
            // Award points for passing obstacles
            if (obstacle.z > 0 && !obstacle.passed) {
                obstacle.passed = true;
                const basePoints = this.getObstaclePoints(obstacle.type);
                const points = Math.floor(basePoints * this.multiplierValue);
                this.score += points;
                this.combo++;
                this.maxCombo = Math.max(this.maxCombo, this.combo);
                
                this.playSound(900 + this.combo * 50, 0.15, 'sine', 0.1);
                this.createScorePopup(points, obstacle.x);
            }
            
            // Remove off-screen obstacles
            if (obstacle.z > 300) {
                obstacle.element.remove();
                this.obstacles.splice(i, 1);
                this.removeMiniObstacle(obstacle);
            }
        }
    }
    
    updatePowerups() {
        const roadSpeedMultiplier = this.speed / 60;
        
        for (let i = this.powerups.length - 1; i >= 0; i--) {
            const powerup = this.powerups[i];
            powerup.z += 5 * roadSpeedMultiplier;
            
            // Update position with 3D scaling
            const powerupScale = Math.max(0.2, 1 - (Math.abs(powerup.z) / 1200));
            powerup.element.style.transform = `translateX(${powerup.x * 150}px) translateZ(${powerup.z}px) scale(${powerupScale})`;
            
            // Check collection
            if (powerup.z > -50 && powerup.z < 50 && !powerup.collected) {
                if (Math.abs(powerup.x - this.carX) < 0.2) {
                    powerup.collected = true;
                    this.collectPowerup(powerup);
                    powerup.element.remove();
                    this.powerups.splice(i, 1);
                    continue;
                }
            }
            
            // Remove off-screen powerups
            if (powerup.z > 300) {
                powerup.element.remove();
                this.powerups.splice(i, 1);
            }
        }
    }
    
    getObstaclePoints(type) {
        const points = {
            'cone': 10,
            'car': 25,
            'truck': 35,
            'motorcycle': 20,
            'barrier': 30,
            'oil': 15,
            'ramp': 40
        };
        return points[type] || 10;
    }
    
    handleOilCollision() {
        // Oil causes sliding/loss of control but not immediate game over
        this.speed *= 0.7;
        this.combo = 0;
        this.playSound(200, 0.8, 'noise', 0.2);
        this.triggerScreenShake();
    }
    
    handleRampCollision() {
        // Ramp launches the car (visual effect)
        this.playerCar.style.transform += ' translateY(-20px)';
        this.score += 50;
        this.playSound(400, 0.5, 'triangle', 0.15);
        
        setTimeout(() => {
            this.playerCar.style.transform = this.playerCar.style.transform.replace(' translateY(-20px)', '');
        }, 300);
    }
    
    collectPowerup(powerup) {
        const duration = 5000; // 5 seconds
        
        switch (powerup.type) {
            case 'speed':
                this.activatePowerup('speed', duration, '⚡');
                this.speedBoostActive = true;
                this.playSound(1000, 0.3, 'sine', 0.15);
                break;
                
            case 'shield':
                this.activatePowerup('shield', duration, '🛡️');
                this.shieldActive = true;
                this.shieldEffect.classList.add('active');
                this.playSound(600, 0.4, 'triangle', 0.15);
                break;
                
            case 'coin':
                this.coins += 5;
                this.score += 25;
                this.playSound(800, 0.2, 'sine', 0.1);
                this.createScorePopup(25, powerup.x, '🪙');
                break;
                
            case 'multiplier':
                this.activatePowerup('multiplier', duration, '✨');
                this.multiplierActive = true;
                this.multiplierValue = 2;
                this.playSound(1200, 0.3, 'sine', 0.15);
                break;
        }
        
        this.checkAchievements();
    }
    
    activatePowerup(type, duration, icon) {
        // Remove existing powerup of same type
        if (this.activePowerups.has(type)) {
            const existing = this.activePowerups.get(type);
            clearTimeout(existing.timeout);
            existing.element.remove();
        }
        
        // Create visual indicator
        const powerupEl = document.createElement('div');
        powerupEl.className = 'active-powerup';
        powerupEl.textContent = icon;
        powerupEl.style.color = this.getPowerupColor(type);
        powerupEl.style.background = this.getPowerupGradient(type);
        
        this.activePowerupsContainer.appendChild(powerupEl);
        
        // Set timeout to remove powerup
        const timeout = setTimeout(() => {
            this.deactivatePowerup(type);
        }, duration);
        
        this.activePowerups.set(type, {
            element: powerupEl,
            timeout: timeout
        });
    }
    
    deactivatePowerup(type) {
        if (this.activePowerups.has(type)) {
            const powerup = this.activePowerups.get(type);
            powerup.element.remove();
            clearTimeout(powerup.timeout);
            this.activePowerups.delete(type);
        }
        
        switch (type) {
            case 'speed':
                this.speedBoostActive = false;
                break;
            case 'shield':
                this.shieldActive = false;
                this.shieldEffect.classList.remove('active');
                break;
            case 'multiplier':
                this.multiplierActive = false;
                this.multiplierValue = 1;
                break;
        }
    }
    
    getPowerupColor(type) {
        const colors = {
            'speed': '#FFD700',
            'shield': '#00FFFF',
            'multiplier': '#FF69B4'
        };
        return colors[type] || '#FFFFFF';
    }
    
    getPowerupGradient(type) {
        const gradients = {
            'speed': 'radial-gradient(circle, #FFD700, #FFA500)',
            'shield': 'radial-gradient(circle, #00FFFF, #0080FF)',
            'multiplier': 'radial-gradient(circle, #FF69B4, #FF1493)'
        };
        return gradients[type] || 'radial-gradient(circle, #FFFFFF, #CCCCCC)';
    }
    
    createScorePopup(points, x, icon = '') {
        const popup = document.createElement('div');
        popup.textContent = `${icon}+${points}`;
        popup.style.position = 'absolute';
        popup.style.color = '#FFD700';
        popup.style.fontSize = '20px';
        popup.style.fontWeight = 'bold';
        popup.style.pointerEvents = 'none';
        popup.style.zIndex = '1000';
        popup.style.left = (window.innerWidth / 2 + x * 150) + 'px';
        popup.style.top = '60%';
        popup.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
        popup.style.animation = 'scorePopup 1s ease-out forwards';
        
        document.body.appendChild(popup);
        
        setTimeout(() => {
            popup.remove();
        }, 1000);
    }
    
    createShieldDeflectionEffect(obstacle) {
        // Create sparks effect
        for (let i = 0; i < 8; i++) {
            this.createSparkParticle(obstacle.x, obstacle.z);
        }
    }
    
    createSparkParticle(x, z) {
        const spark = document.createElement('div');
        spark.style.position = 'absolute';
        spark.style.width = '4px';
        spark.style.height = '4px';
        spark.style.background = '#FFD700';
        spark.style.borderRadius = '50%';
        spark.style.left = (window.innerWidth / 2 + x * 150) + 'px';
        spark.style.top = '50%';
        spark.style.pointerEvents = 'none';
        spark.style.zIndex = '200';
        
        const angle = Math.random() * Math.PI * 2;
        const velocity = 2 + Math.random() * 3;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        
        let life = 1;
        let posX = 0;
        let posY = 0;
        
        const animate = () => {
            life -= 0.05;
            posX += vx;
            posY += vy;
            
            spark.style.transform = `translate(${posX}px, ${posY}px)`;
            spark.style.opacity = life;
            
            if (life > 0) {
                requestAnimationFrame(animate);
            } else {
                spark.remove();
            }
        };
        
        this.particlesContainer.appendChild(spark);
        animate();
    }
    
    addMiniObstacle(obstacle) {
        const miniObstacle = document.createElement('div');
        miniObstacle.className = 'mini-obstacle';
        miniObstacle.style.left = (20 + obstacle.lane * 20) + '%';
        miniObstacle.style.top = '10px';
        this.miniObstaclesContainer.appendChild(miniObstacle);
        
        this.miniObstacles.push({
            element: miniObstacle,
            obstacle: obstacle
        });
    }
    
    removeMiniObstacle(obstacle) {
        for (let i = this.miniObstacles.length - 1; i >= 0; i--) {
            if (this.miniObstacles[i].obstacle === obstacle) {
                this.miniObstacles[i].element.remove();
                this.miniObstacles.splice(i, 1);
                break;
            }
        }
    }
    
    updateMiniMap() {
        // Update mini obstacles positions
        this.miniObstacles.forEach(miniObs => {
            const distance = miniObs.obstacle.z + 200; // Normalize distance
            const miniMapY = Math.max(10, Math.min(130, 10 + (distance / 10)));
            miniObs.element.style.top = miniMapY + 'px';
        });
    }
    
    updateParticles() {
        // Create environment particles based on quality setting
        const particleRate = {
            'high': 0.4,
            'medium': 0.2,
            'low': 0.1
        }[this.settings.particleQuality];
        
        if (this.speed > 100 && Math.random() < particleRate) {
            this.createSpeedParticle();
        }
        
        if (Math.random() < 0.3) {
            this.createExhaustParticle();
        }
        
        // Update existing particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.life -= 0.02;
            
            if (particle.life <= 0) {
                particle.element.remove();
                this.particles.splice(i, 1);
            } else {
                particle.update();
            }
        }
    }
    
    createSpeedParticle() {
        const particle = {
            x: Math.random() * window.innerWidth,
            y: -10,
            vx: (Math.random() - 0.5) * 2,
            vy: 3 + Math.random() * 4,
            life: 1,
            element: null,
            update: function() {
                this.x += this.vx;
                this.y += this.vy;
                this.element.style.transform = `translateX(${this.x}px) translateY(${this.y}px) scale(${this.life})`;
                this.element.style.opacity = this.life;
            }
        };
        
        const particleEl = document.createElement('div');
        particleEl.className = 'particle';
        particleEl.style.left = '0px';
        particleEl.style.top = '0px';
        particleEl.style.transform = `translateX(${particle.x}px) translateY(${particle.y}px)`;
        
        particle.element = particleEl;
        this.particlesContainer.appendChild(particleEl);
        this.particles.push(particle);
    }
    
    createExhaustParticle() {
        const carRect = this.playerCar.getBoundingClientRect();
        
        const particle = {
            x: carRect.left + carRect.width / 2 + (Math.random() - 0.5) * 30,
            y: carRect.bottom - 10,
            vx: (Math.random() - 0.5) * 2,
            vy: 1 + Math.random() * 3,
            life: 1,
            element: null,
            update: function() {
                this.x += this.vx;
                this.y += this.vy;
                this.vy *= 0.98; // Slow down over time
                this.element.style.transform = `translateX(${this.x}px) translateY(${this.y}px) scale(${this.life})`;
                this.element.style.opacity = this.life * 0.8;
            }
        };
        
        const particleEl = document.createElement('div');
        particleEl.className = 'exhaust-particle';
        particleEl.style.left = '0px';
        particleEl.style.top = '0px';
        particleEl.style.transform = `translateX(${particle.x}px) translateY(${particle.y}px)`;
        
        particle.element = particleEl;
        this.particlesContainer.appendChild(particleEl);
        this.particles.push(particle);
    }
    
    checkAchievements() {
        this.achievements.forEach(achievement => {
            if (achievement.unlocked) return;
            
            let unlocked = false;
            
            if (achievement.distance && this.distance >= achievement.distance) unlocked = true;
            if (achievement.speed && this.speed >= achievement.speed) unlocked = true;
            if (achievement.coins && this.coins >= achievement.coins) unlocked = true;
            if (achievement.combo && this.combo >= achievement.combo) unlocked = true;
            if (achievement.score && this.score >= achievement.score) unlocked = true;
            
            if (unlocked) {
                achievement.unlocked = true;
                this.showAchievement(achievement);
            }
        });
    }
    
    showAchievement(achievement) {
        this.achievementText.textContent = `${achievement.name}: ${achievement.desc}`;
        this.achievementPopup.classList.add('show');
        
        this.playSound(1200, 0.5, 'sine', 0.2);
        
        setTimeout(() => {
            this.achievementPopup.classList.remove('show');
        }, 3000);
    }
    
    updateUI() {
        this.scoreElement.textContent = this.score;
        this.speedElement.textContent = Math.floor(this.speed);
        this.distanceElement.textContent = Math.floor(this.distance);
        this.comboElement.textContent = this.combo;
        this.coinsElement.textContent = this.coins;
        
        // Update combo color based on value
        if (this.combo > 15) {
            this.comboElement.style.color = '#FF69B4';
        } else if (this.combo > 10) {
            this.comboElement.style.color = '#FFD700';
        } else if (this.combo > 5) {
            this.comboElement.style.color = '#00FFFF';
        } else {
            this.comboElement.style.color = '#FFFFFF';
        }
    }
    
    update(deltaTime) {
        if (this.gameState !== 'playing') return;
        
        // Update distance
        this.distance += this.speed * deltaTime * 0.001;
        
        // Update game elements
        this.updateInput();
        this.updateRoad();
        this.spawnObstacle();
        this.spawnPowerup();
        this.updateObstacles();
        this.updatePowerups();
        this.updateParticles();
        this.updateMiniMap();
        this.updateUI();
        this.checkAchievements();
        
        // Reset combo if no obstacles passed recently
        if (this.obstacles.length === 0 || this.obstacles.every(obs => obs.z > 100)) {
            if (this.combo > 0) {
                this.combo = Math.max(0, this.combo - 0.01);
            }
        }
        
        // Increase difficulty over time
        if (this.distance > 0 && this.distance % 1000 < 1) {
            this.maxSpeed = Math.min(350, this.maxSpeed + 8);
        }
    }
    
    gameLoop(currentTime) {
        const deltaTime = currentTime - this.lastTime;
        
        if (deltaTime >= this.frameInterval) {
            this.update(deltaTime);
            this.lastTime = currentTime - (deltaTime % this.frameInterval);
        }
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

// Add CSS animation for score popup
const style = document.createElement('style');
style.textContent = `
@keyframes scorePopup {
    0% { transform: translateY(0) scale(1); opacity: 1; }
    100% { transform: translateY(-50px) scale(1.2); opacity: 0; }
}
`;
document.head.appendChild(style);

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new UltimateCarGame();
    
    // Debug info
    if (window.location.hash === '#debug') {
        window.game = game;
        console.log('🎮 ULTIMATE 3D CAR ARCADE RUSH - Debug mode enabled');
        console.log('🏎️ Access game object via window.game');
        console.log('⚡ Features: Power-ups, Achievements, Mini-map, Advanced 3D, 6 Obstacle Types');
    }
});

// Enhanced mobile optimization
document.addEventListener('gesturestart', function (e) {
    e.preventDefault();
});

document.addEventListener('gesturechange', function (e) {
    e.preventDefault();
});

document.addEventListener('gestureend', function (e) {
    e.preventDefault();
});

// Orientation change handling
window.addEventListener('orientationchange', function() {
    setTimeout(function() {
        window.scrollTo(0, 1);
    }, 500);
});

// Enhanced performance monitoring
let performanceStats = {
    lastPerformanceCheck: 0,
    frameCount: 0,
    avgFPS: 60,
    lowFPSCount: 0
};

function checkPerformance() {
    performanceStats.frameCount++;
    const now = performance.now();
    
    if (now - performanceStats.lastPerformanceCheck >= 1000) {
        const fps = Math.round((performanceStats.frameCount * 1000) / (now - performanceStats.lastPerformanceCheck));
        performanceStats.avgFPS = fps;
        
        // Auto-adjust quality based on performance
        if (fps < 30) {
            performanceStats.lowFPSCount++;
            console.log(`⚠️ Low FPS detected: ${fps} - Performance adjustment #${performanceStats.lowFPSCount}`);
            
            if (window.game && performanceStats.lowFPSCount > 3) {
                window.game.settings.particleQuality = 'low';
                console.log('🔧 Auto-adjusted particle quality to LOW for better performance');
            }
        } else {
            performanceStats.lowFPSCount = Math.max(0, performanceStats.lowFPSCount - 1);
        }
        
        performanceStats.frameCount = 0;
        performanceStats.lastPerformanceCheck = now;
    }
    
    requestAnimationFrame(checkPerformance);
}

// Start performance monitoring
requestAnimationFrame(checkPerformance);

// Global error handling
window.addEventListener('error', function(e) {
    console.error('🚨 Game Error:', e.error);
    // Game continues running even if there are non-critical errors
});

console.log('🏁 3D Car Arcade Rush - ULTIMATE EDITION Loaded Successfully!');
console.log('🎯 Features: Advanced 3D Graphics, Power-ups, Achievements, Mini-map, 6 Obstacle Types, Enhanced Audio');