const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const binaryChars = "01";
const fontSize = 16;
const columns = Math.floor(canvas.width / fontSize);
const drops = Array(columns).fill(1);

function drawMatrix() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.075)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#0F0";
    ctx.font = fontSize + "px monospace";
    for (let i = 0; i < drops.length; i++) {
        const text = binaryChars[Math.floor(Math.random() * binaryChars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i]++;
    }
}

const introCountdown = ["3", "2", "1"];
const messages = [
    "HELLO TEAM CỪU NON!",
    "TUY KHÔNG SINH CÙNG NGÀY",
    "TUY KHÔNG CÓ SỐ MÁ",
    "NHƯNG CHÚNG TA CÓ 2 THÁNG VUI VẺ",
    "ĐI LẢM CŨNH CHỈ THẾ LÀ CÙNG!",
    "CUỐI CÙNG",
    "CHÚC ANH EM THÀNH CÔNG NHÉ!",
    "MÃI IU"
];
const allMessages = [...introCountdown, ...messages];
const introFontSizes = { "3": 200, "2": 240, "1": 280 };
const lastMessageIndex = allMessages.length - 1;

const endingImage = document.getElementById("endingImage");
const endingAudio = document.getElementById("endingAudio");

let messageIndex = 0;
let particles = [];

function createParticlesFromText(text) {
    particles = [];

    const offCanvas = document.createElement("canvas");
    const offCtx = offCanvas.getContext("2d");
    offCanvas.width = canvas.width;
    offCanvas.height = canvas.height;

    const isIntro = introCountdown.includes(text);
    const fontSize = isIntro ? introFontSizes[text] : 100;
    offCtx.fillStyle = "white";
    offCtx.font = `bold ${fontSize}px sans-serif`;
    offCtx.textAlign = "center";
    offCtx.textBaseline = "middle";
    offCtx.fillText(text, canvas.width / 2, canvas.height / 2);

    const imageData = offCtx.getImageData(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < canvas.height; y += 6) {
        for (let x = 0; x < canvas.width; x += 6) {
            const i = (y * canvas.width + x) * 4;
            if (imageData.data[i + 3] > 128) {
                particles.push({
                    x: isIntro ? canvas.width / 2 + (Math.random() - 0.5) * 100 : Math.random() * canvas.width,
                    y: isIntro ? canvas.height / 2 + (Math.random() - 0.5) * 100 : Math.random() * canvas.height,
                    tx: x,
                    ty: y,
                    size: 3,
                    vx: 0,
                    vy: 0,
                    alpha: 1,
                    arrived: false,
                    exploded: false
                });
            }
        }
    }

    const showTime = isIntro ? 1000 : 3500;
    const explodeTime = isIntro ? 1500 : 2000;

    setTimeout(() => {
        particles.forEach((p) => {
            p.vx = (Math.random() - 0.5) * 2;
            p.vy = (Math.random() - 0.5) * 2;
            p.exploded = true;
        });

        setTimeout(() => {
            messageIndex++;

            if (messageIndex === lastMessageIndex - 1) {
                endingAudio.volume = 0.1;
                endingAudio.play().catch((e) => {
                    console.log("Không phát được nhạc:", e);
                });

                let volume = 0.1;
                const fadeInterval = setInterval(() => {
                    if (volume < 1.0) {
                        volume += 0.02;
                        endingAudio.volume = Math.min(volume, 1.0);
                    } else {
                        clearInterval(fadeInterval);
                    }
                }, 200);
            }

            if (messageIndex === allMessages.length) {
                endingImage.style.opacity = 1;
                endingImage.style.transform = "translate(-50%, -50%) scale(1.05)";
                return;
            }

            createParticlesFromText(allMessages[messageIndex]);
        }, explodeTime);
    }, showTime);
}

function animate() {
    drawMatrix();
    ctx.shadowBlur = 0;
    ctx.shadowColor = "#ff99ff";

    particles.forEach((p) => {
        if (!p.arrived) {
            const dx = p.tx - p.x;
            const dy = p.ty - p.y;
            p.vx = dx * 0.05;
            p.vy = dy * 0.05;
            p.x += p.vx;
            p.y += p.vy;
            if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
                p.arrived = true;
                p.x = p.tx;
                p.y = p.ty;
            }
        } else if (p.exploded) {
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= 0.005;
            if (p.alpha < 0) p.alpha = 0;
        }

        ctx.fillStyle = `rgba(255, 0, 0, ${p.alpha})`;
        ctx.fillRect(p.x, p.y, p.size, p.size);
    });

    requestAnimationFrame(animate);
}

const startButton = document.getElementById("startButton");
startButton.addEventListener("click", () => {
    startButton.style.display = "none";
    createParticlesFromText(allMessages[messageIndex]);
    animate();
});
