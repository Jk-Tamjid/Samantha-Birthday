let currentPasscode = "";
const CORRECT_PASSCODE = "1003";

function pressKey(num) {
    if (currentPasscode.length < 4) {
        currentPasscode += num;
        updatePasscodeDisplay();
    }
}

function clearPasscode() {
    currentPasscode = "";
    updatePasscodeDisplay();
}

function updatePasscodeDisplay() {
    document.getElementById("passcode-display").innerText = "*".repeat(currentPasscode.length);
}

function playAudio() {
    const audio = document.getElementById("bg-music");
    if (audio) {
        audio.currentTime = 0;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log("Autoplay prevented. Music will start on the next click:", error);
                // Fallback: start music on next user interaction if browser blocks autoplay
                const enableAudioOnInteraction = () => {
                    audio.play();
                    document.removeEventListener("click", enableAudioOnInteraction);
                    document.removeEventListener("keydown", enableAudioOnInteraction);
                };
                document.addEventListener("click", enableAudioOnInteraction);
                document.addEventListener("keydown", enableAudioOnInteraction);
            });
        }
    }
}

function checkPasscode() {
    if (currentPasscode === CORRECT_PASSCODE) {
        document.getElementById("passcode-screen").classList.remove("active");
        document.getElementById("loading-screen").classList.add("active");
        
        // Trigger background audio playback
        playAudio();

        let progress = 0;
        const progressBar = document.getElementById("progress-bar");
        const interval = setInterval(() => {
            progress += 5;
            progressBar.style.width = progress + "%";
            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    document.getElementById("loading-screen").classList.remove("active");
                    document.getElementById("surprise-screen").classList.add("active");
                }, 300);
            }
        }, 100);
    } else {
        alert("Incorrect passcode! Try again.");
        clearPasscode();
    }
}

/* CAKE CLICK & SCREEN TRANSITION */
function blowCandles() {
    const flames = document.querySelectorAll(".flame");
    flames.forEach(flame => flame.style.display = "none");

    document.getElementById("cake-instruction").innerText = "Make a wish! ✨";

    setTimeout(() => {
        const surpriseScreen = document.getElementById("surprise-screen");
        surpriseScreen.classList.remove("active");
        surpriseScreen.style.display = "none";

        const fireworksScreen = document.getElementById("fireworks-screen");
        fireworksScreen.classList.add("active");
        
        startFireworks();
    }, 600);
}

/* FIREWORKS CANVAS ENGINE */
function startFireworks() {
    const canvas = document.getElementById("fireworks-canvas");
    const ctx = canvas.getContext("2d");
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    let particles = [];
    let fireworks = [];

    class Firework {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = canvas.height;
            this.targetY = Math.random() * (canvas.height * 0.5) + 50;
            this.speed = Math.random() * 3 + 5;
            this.color = `hsl(${Math.random() * 360}, 100%, 60%)`;
        }

        update() {
            this.y -= this.speed;
            if (this.y <= this.targetY) {
                this.explode();
                return true;
            }
            return false;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }

        explode() {
            const particleCount = 80;
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle(this.x, this.y, this.color));
            }
        }
    }

    class Particle {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.color = color;
            this.angle = Math.random() * Math.PI * 2;
            this.speed = Math.random() * 7 + 1;
            this.friction = 0.95;
            this.gravity = 0.12;
            this.alpha = 1;
            this.decay = Math.random() * 0.02 + 0.015;
        }

        update() {
            this.speed *= this.friction;
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed + this.gravity;
            this.alpha -= this.decay;
            return this.alpha <= 0;
        }

        draw() {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.restore();
        }
    }

    function loop() {
        ctx.fillStyle = "rgba(13, 13, 26, 0.25)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (Math.random() < 0.12) {
            fireworks.push(new Firework());
        }

        fireworks = fireworks.filter(fw => {
            fw.draw();
            return !fw.update();
        });

        particles = particles.filter(p => {
            p.draw();
            return !p.update();
        });

        requestAnimationFrame(loop);
    }

    loop();
}