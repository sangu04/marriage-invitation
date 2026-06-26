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

// --- 🧭 IN-PLACE PAGE ROUTING ---
function getRouteContainer() {
    return document.getElementById('page-content') || document.getElementById('main-content');
}

function loadRoute(targetPath, { pushState = true } = {}) {
    if (!targetPath || targetPath === window.location.pathname) {
        return Promise.resolve();
    }

    return fetch(targetPath, { cache: 'no-store' })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Route fetch failed');
            }
            return response.text();
        })
        .then((html) => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const routeContainer = getRouteContainer();
            const incomingContent = doc.getElementById('page-content') || doc.getElementById('main-content') || doc.body;

            if (routeContainer && incomingContent) {
                routeContainer.innerHTML = incomingContent.innerHTML;
            }

            document.title = doc.title || document.title;

            const existingStyles = Array.from(document.head.querySelectorAll('style[data-route-style]'));
            const existingStyleTexts = existingStyles.map((style) => style.textContent);
            const routeStyles = Array.from(doc.head.querySelectorAll('style'));
            routeStyles.forEach((style) => {
                if (!existingStyleTexts.includes(style.textContent)) {
                    const clonedStyle = style.cloneNode(true);
                    clonedStyle.setAttribute('data-route-style', 'true');
                    document.head.appendChild(clonedStyle);
                }
            });

            if (pushState) {
                history.pushState({ path: targetPath }, '', targetPath);
            }

            window.scrollTo({ top: 0, behavior: 'smooth' });
        })
        .catch(() => {
            window.location.href = targetPath;
        });
}

document.addEventListener('click', (event) => {
    const clickedLink = event.target.closest('a');
    if (!clickedLink) {
        return;
    }

    const href = clickedLink.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return;
    }

    const targetUrl = new URL(href, window.location.href);
    if (targetUrl.origin !== window.location.origin || !targetUrl.pathname.endsWith('.html')) {
        return;
    }

    event.preventDefault();
    loadRoute(targetUrl.pathname);
});

window.addEventListener('popstate', () => {
    loadRoute(window.location.pathname, { pushState: false });
});

// --- 🎵 AUDIO PLAYER ---
const audio = document.getElementById("bg-music");
const musicToggle = document.getElementById("music-toggle");
let audioInitialized = false;
let userPaused = false;
let resumeRetryTimer = null;

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

function saveMusicProgress() {
    if (!audio || Number.isNaN(audio.currentTime)) {
        return;
    }

    const safeTime = Math.max(0, Math.floor(audio.currentTime));
    localStorage.setItem('musicCurrentTime', safeTime.toString());
    if (!audio.paused && !userPaused) {
        persistMusicState(true);
    }
}

function restoreMusicProgress() {
    if (!audio) {
        return;
    }

    const savedPlaybackTime = Number(localStorage.getItem('musicCurrentTime') || 0);
    if (savedPlaybackTime > 0 && (audio.currentTime < savedPlaybackTime || audio.currentTime === 0)) {
        audio.currentTime = savedPlaybackTime;
    }
}

function tryResumeMusic() {
    if (!audio || !getShouldPlayMusic() || userPaused || !audio.paused) {
        return;
    }

    restoreMusicProgress();

    if (resumeRetryTimer) {
        clearTimeout(resumeRetryTimer);
    }

    audio.play().then(() => {
        setMusicButtonState(true);
        persistMusicState(true);
    }).catch(() => {
        resumeRetryTimer = setTimeout(tryResumeMusic, 400);
    });
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

        if (!audioInitialized) {
            if (!audio.src) {
                audio.src = 'sangu%20audio.mpeg';
            }
            audio.load();
            audioInitialized = true;
        }

        restoreMusicProgress();
        userPaused = false;

        if (audio.paused) {
            try {
                await audio.play();
                setMusicButtonState(true);
                persistMusicState(true);
            } catch (error) {
                setMusicButtonState(false);
                persistMusicState(false);
            }
        } else {
            setMusicButtonState(true);
            persistMusicState(true);
        }
    };

    const resumeMusicIfEnabled = () => {
        if (getShouldPlayMusic()) {
            startMusic(true);
        }
    };

    document.addEventListener('click', (event) => {
        const target = event.target;
        const clickedMusicButton = target && target.closest && target.closest('#music-toggle');
        const clickedLink = target && target.closest && target.closest('a');

        if (clickedMusicButton) {
            return;
        }

        if (clickedLink && getShouldPlayMusic()) {
            saveMusicProgress();
            startMusic(true);
        }
    }, { capture: true });

    window.addEventListener('pageshow', resumeMusicIfEnabled);
    window.addEventListener('focus', () => {
        if (getShouldPlayMusic()) {
            tryResumeMusic();
        }
    });
    window.addEventListener('beforeunload', saveMusicProgress);
    window.addEventListener('pagehide', saveMusicProgress);
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && getShouldPlayMusic()) {
            tryResumeMusic();
        }
    });

    if (musicToggle) {
        musicToggle.addEventListener("click", (event) => {
            event.stopPropagation();
            if (audio.paused) {
                userPaused = false;
                startMusic(true);
            } else {
                userPaused = true;
                audio.pause();
                setMusicButtonState(false);
                persistMusicState(false);
            }
        });
    }

    audio.addEventListener('play', () => {
        userPaused = false;
        setMusicButtonState(true);
        persistMusicState(true);
    });
    audio.addEventListener('canplay', () => {
        if (getShouldPlayMusic() && !userPaused && audio.paused) {
            tryResumeMusic();
        }
    });
    audio.addEventListener('pause', () => {
        if (userPaused || audio.ended) {
            setMusicButtonState(false);
            persistMusicState(false);
        } else {
            setMusicButtonState(true);
            persistMusicState(true);
        }
    });
    audio.addEventListener('timeupdate', () => {
        if (audio.currentTime > 0) {
            saveMusicProgress();
        }
    });
    audio.addEventListener('ended', () => {
        userPaused = true;
        persistMusicState(false);
    });

    setInterval(() => {
        if (!audio.paused && !userPaused) {
            saveMusicProgress();
        }
    }, 1000);

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