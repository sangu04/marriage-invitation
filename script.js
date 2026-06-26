// --- 💫 LOADER ANIMATION --- 
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    setTimeout(() => {
        loader.classList.add('hidden');
    }, 1000);
});

// --- 📊 SCROLL PROGRESS BAR ---
window.addEventListener('scroll', () => {
    const scrollProgress = document.getElementById('scroll-progress');
    const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (window.scrollY / windowHeight) * 100;
    scrollProgress.style.width = scrolled + '%';

    // Show/Hide Back to Top Button
    const backToTop = document.getElementById('back-to-top');
    if (window.scrollY > 300) {
        backToTop.classList.add('show');
    } else {
        backToTop.classList.remove('show');
    }
});

// --- ⬆️ BACK TO TOP BUTTON ---
document.getElementById('back-to-top').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// --- ⏳ COUNTDOWN TIMER SETUP ---
const targetDate = new Date("July 9, 2026 12:30:00").getTime();

function updateCountdown() {
    const now = new Date().getTime();
    const difference = targetDate - now;

    if (difference < 0) {
        document.querySelector(".countdown-container").innerHTML = "<h3>The Wedding Celebration has Begun!</h3>";
        return;
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    document.getElementById("days").innerText = days.toString().padStart(2, '0');
    document.getElementById("hours").innerText = hours.toString().padStart(2, '0');
    document.getElementById("minutes").innerText = minutes.toString().padStart(2, '0');
    document.getElementById("seconds").innerText = seconds.toString().padStart(2, '0');
}
setInterval(updateCountdown, 1000);

// --- 📸 HERO BACKGROUND ROTATION ---
const heroSlides = document.querySelectorAll('.hero-carousel-slide');
let heroSlideIndex = 0;

function updateHeroCarousel() {
    heroSlides.forEach((slide) => slide.classList.remove('active'));
    if (heroSlides.length > 0) {
        heroSlides[heroSlideIndex].classList.add('active');
    }
}

function rotateHeroCarousel() {
    if (heroSlides.length === 0) {
        return;
    }

    heroSlideIndex = (heroSlideIndex + 1) % heroSlides.length;
    updateHeroCarousel();
}

updateHeroCarousel();
setInterval(rotateHeroCarousel, 2000);

// --- 🎵 AUDIO PLAYER ---
const audio = document.getElementById("bg-music");
const musicToggle = document.getElementById("music-toggle");

function setMusicButtonState(isPlaying) {
    if (!musicToggle) {
        return;
    }

    musicToggle.innerHTML = isPlaying
        ? '<i class="fa-solid fa-compact-disc fa-spin"></i>'
        : '<i class="fa-solid fa-play"></i>';
}

if (audio) {
    audio.volume = Number(localStorage.getItem('musicVolume') || 50) / 100;

    if (musicToggle) {
        musicToggle.classList.remove("hidden");
        setMusicButtonState(audio.paused);
    }

    const startMusic = () => {
        if (!audio.src) {
            audio.src = 'sangu%20audio.mpeg';
        }
        audio.load();
        if (audio.paused) {
            audio.play().then(() => {
                setMusicButtonState(true);
            }).catch(() => {
                setMusicButtonState(false);
            });
        }
    };

    document.addEventListener('pointerdown', startMusic, { once: true });
    document.addEventListener('keydown', startMusic, { once: true });

    if (musicToggle) {
        musicToggle.addEventListener("click", (event) => {
            event.stopPropagation();
            if (audio.paused) {
                startMusic();
            } else {
                audio.pause();
                setMusicButtonState(false);
            }
        });
    }

    audio.addEventListener('play', () => setMusicButtonState(true));
    audio.addEventListener('pause', () => setMusicButtonState(false));
}

const petalsContainer = document.getElementById("petals-container");
const heartsContainer = document.getElementById("hearts-container");

// --- 💕 FLOATING HEARTS ---
function createHeart() {
    const heart = document.createElement("div");
    heart.classList.add("heart");
    heart.textContent = "❤️";
    
    heart.style.left = `${Math.random() * 100}vw`;
    heart.style.bottom = `${Math.random() * 10 - 10}vh`;
    
    const duration = Math.random() * 4 + 5;
    heart.style.animationDuration = `${duration}s`;
    const delay = Math.random() * 0.5;
    heart.style.animationDelay = `${delay}s`;
    
    heartsContainer.appendChild(heart);
    
    setTimeout(() => {
        heart.remove();
    }, (duration + delay) * 1000);
}

// Create hearts periodically
setInterval(createHeart, 500);

function createPetal() {
    const petal = document.createElement("div");
    petal.classList.add("petal");
    
    // Vary the size and horizontal configuration randomly
    const size = Math.random() * 12 + 8;
    petal.style.width = `${size}px`;
    petal.style.height = `${size}px`;
    petal.style.left = `${Math.random() * 100}vw`;
    
    // Dynamic drifting delay variants
    const duration = Math.random() * 3 + 4;
    petal.style.animationDuration = `${duration}s`;
    
    petalsContainer.appendChild(petal);
    
    // Clear elements safely post cycle run
    setTimeout(() => {
        petal.remove();
    }, duration * 1000);
}

// Generate fluid continuous rendering loop
setInterval(createPetal, 300);