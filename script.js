// --- 💫 LOADER ANIMATION --- 
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    if (loader) {
        setTimeout(() => {
            loader.classList.add('hidden');
        }, 1000);
    }
});

// --- 📊 SCROLL PROGRESS BAR ---
window.addEventListener('scroll', () => {
    const scrollProgress = document.getElementById('scroll-progress');
    if (scrollProgress) {
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.scrollY / windowHeight) * 100;
        scrollProgress.style.width = scrolled + '%';
    }

    // Show/Hide Back to Top Button
    const backToTop = document.getElementById('back-to-top');
    if (backToTop) {
        if (window.scrollY > 300) {
            backToTop.classList.add('show');
        } else {
            backToTop.classList.remove('show');
        }
    }
});

// --- ⬆️ BACK TO TOP BUTTON ---
const backToTopButton = document.getElementById('back-to-top');
if (backToTopButton) {
    backToTopButton.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// --- ⏳ COUNTDOWN TIMER SETUP ---
const targetDate = new Date("July 9, 2026 12:30:00").getTime();

function updateCountdown() {
    const countdownContainer = document.querySelector('.countdown-container');
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    if (!countdownContainer || !daysEl || !hoursEl || !minutesEl || !secondsEl) {
        return;
    }

    const now = new Date().getTime();
    const difference = targetDate - now;

    if (difference < 0) {
        countdownContainer.innerHTML = '<h3>The Wedding Celebration has Begun!</h3>';
        return;
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    daysEl.innerText = days.toString().padStart(2, '0');
    hoursEl.innerText = hours.toString().padStart(2, '0');
    minutesEl.innerText = minutes.toString().padStart(2, '0');
    secondsEl.innerText = seconds.toString().padStart(2, '0');
}
if (document.querySelector('.countdown-container')) {
    setInterval(updateCountdown, 1000);
}

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

if (heroSlides.length > 0) {
    updateHeroCarousel();
    setInterval(rotateHeroCarousel, 2000);
}

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

function persistMusicState(isPlaying) {
    localStorage.setItem('musicPlaying', isPlaying ? 'true' : 'false');
}

function getShouldPlayMusic() {
    return localStorage.getItem('musicPlaying') !== 'false';
}

if (audio) {
    const savedVolume = Number(localStorage.getItem('musicVolume') || 50) / 100;
    audio.volume = savedVolume;

    if (musicToggle) {
        musicToggle.classList.remove("hidden");
        setMusicButtonState(audio.paused);
    }

    const startMusic = async (force = false) => {
        if (!audio) {
            return;
        }

        if (!force && !getShouldPlayMusic()) {
            return;
        }

        if (!audio.src) {
            audio.src = 'sangu%20audio.mpeg';
        }

        const savedPlaybackTime = Number(localStorage.getItem('musicCurrentTime') || 0);
        if (savedPlaybackTime > 0 && audio.currentTime < savedPlaybackTime) {
            audio.currentTime = savedPlaybackTime;
        }

        try {
            audio.load();
            await audio.play();
            setMusicButtonState(true);
            persistMusicState(true);
        } catch (error) {
            setMusicButtonState(false);
            persistMusicState(false);
        }
    };

    const resumeMusicIfEnabled = () => {
        if (getShouldPlayMusic()) {
            startMusic(true);
        }
    };

    document.addEventListener('pointerdown', () => startMusic(true), { capture: true });
    document.addEventListener('touchstart', () => startMusic(true), { capture: true });
    document.addEventListener('keydown', () => startMusic(true), { capture: true });
    document.addEventListener('click', (event) => {
        const clickedLink = event.target.closest('a');
        if (clickedLink) {
            startMusic(true);
        }
    }, { capture: true });

    window.addEventListener('pageshow', resumeMusicIfEnabled);
    window.addEventListener('beforeunload', () => {
        if (!audio.paused) {
            localStorage.setItem('musicCurrentTime', audio.currentTime.toString());
        }
    });
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            resumeMusicIfEnabled();
        }
    });

    if (musicToggle) {
        musicToggle.addEventListener("click", (event) => {
            event.stopPropagation();
            if (audio.paused) {
                startMusic(true);
            } else {
                audio.pause();
                setMusicButtonState(false);
                persistMusicState(false);
            }
        });
    }

    audio.addEventListener('play', () => {
        setMusicButtonState(true);
        persistMusicState(true);
    });
    audio.addEventListener('pause', () => {
        setMusicButtonState(false);
        persistMusicState(false);
    });
    audio.addEventListener('timeupdate', () => {
        if (audio.currentTime > 0) {
            localStorage.setItem('musicCurrentTime', audio.currentTime.toString());
        }
    });
    audio.addEventListener('ended', () => {
        persistMusicState(false);
    });

    resumeMusicIfEnabled();
}

const petalsContainer = document.getElementById("petals-container");
const heartsContainer = document.getElementById("hearts-container");

// --- 💕 FLOATING HEARTS ---
function createHeart() {
    if (!heartsContainer) {
        return;
    }

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
if (heartsContainer) {
    setInterval(createHeart, 500);
}

function createPetal() {
    if (!petalsContainer) {
        return;
    }

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
if (petalsContainer) {
    setInterval(createPetal, 300);
}