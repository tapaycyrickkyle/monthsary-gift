const notes = [
  "You are my calm in the middle of long days.",
  "I love the way ordinary things become special when they include you.",
  "Every month with you gives me another reason to be thankful.",
  "You are loved deeply, gently, and on purpose."
];

const giftModal = document.querySelector("#giftModal");
const closeGift = document.querySelector("#closeGift");
const nextMessage = document.querySelector("#nextMessage");
const giftMessage = document.querySelector("#giftMessage");
const flowerField = document.querySelector(".flower-field");
const openEnvelope = document.querySelector("#openEnvelope");
const heroTitle = document.querySelector("#hero-title");
const heroText = document.querySelector(".hero-text");
const letterTitle = document.querySelector("#letter-title");
const photosTitle = document.querySelector("#photos-title");
const promiseTitle = document.querySelector("#promise-title");
const promiseText = document.querySelector(".promise p:not(.eyebrow)");
const musicToggle = document.querySelector("#musicToggle");
const customMusic = new Audio("music/Libu-Libong_Buwan_(Uuwian)_Kyle_Raphael_(Lyric_Video).mp3");

let noteIndex = 0;
let pageUnlocked = false;
let musicContext;
let musicGain;
let musicTimer;
let musicPlaying = false;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let revealObserver;
let revealItems = [];
let heroWritingStarted = false;
let letterTitleStarted = false;
let photosTitleStarted = false;
let promiseWritingStarted = false;
const heroTitleText = heroTitle?.textContent.trim() || "";
const heroSubtitleText = heroText?.textContent.trim() || "";
const letterTitleText = letterTitle?.textContent.trim() || "";
const photosTitleText = photosTitle?.textContent.trim() || "";
const promiseTitleText = promiseTitle?.textContent.trim() || "";
const promiseBodyText = promiseText?.textContent.trim().replace(/\s+/g, " ") || "";

function prepareHeroWriting() {
  if (heroTitle && heroText) {
    heroTitle.textContent = "";
    heroText.textContent = "";
    heroTitle.setAttribute("aria-label", heroTitleText);
    heroText.setAttribute("aria-label", heroSubtitleText);
  }

  if (letterTitle) {
    letterTitle.textContent = "";
    letterTitle.setAttribute("aria-label", letterTitleText);
  }

  if (photosTitle) {
    photosTitle.textContent = "";
    photosTitle.setAttribute("aria-label", photosTitleText);
  }

  if (promiseTitle && promiseText) {
    promiseTitle.textContent = "";
    promiseText.textContent = "";
    promiseTitle.setAttribute("aria-label", promiseTitleText);
    promiseText.setAttribute("aria-label", promiseBodyText);
  }
}

function pauseForCharacter(character, baseDelay) {
  if (character === " ") {
    return baseDelay * 0.45;
  }

  if (/[,.!]/.test(character)) {
    return baseDelay * 3.2;
  }

  return baseDelay + Math.random() * baseDelay * 1.35;
}

function writeByHand(element, text, baseDelay) {
  return new Promise((resolve) => {
    let index = 0;
    element.textContent = "";
    element.classList.add("handwriting-active");

    function drawCharacter() {
      if (index >= text.length) {
        element.classList.remove("handwriting-active");
        resolve();
        return;
      }

      const character = text[index];

      if (character === " ") {
        element.append(document.createTextNode(" "));
      } else {
        const letter = document.createElement("span");
        letter.className = "ink-letter";
        letter.textContent = character;
        element.append(letter);
      }

      index += 1;
      window.setTimeout(drawCharacter, pauseForCharacter(character, baseDelay));
    }

    drawCharacter();
  });
}

async function playHeroWriting() {
  if (heroWritingStarted || !heroTitle || !heroText) {
    return;
  }

  heroWritingStarted = true;

  if (reduceMotion) {
    heroTitle.textContent = heroTitleText;
    heroText.textContent = heroSubtitleText;
    return;
  }

  await writeByHand(heroTitle, heroTitleText, 58);
  await new Promise((resolve) => window.setTimeout(resolve, 420));
  await writeByHand(heroText, heroSubtitleText, 34);
}

async function playLetterTitleWriting() {
  if (letterTitleStarted || !letterTitle) {
    return;
  }

  letterTitleStarted = true;

  if (reduceMotion) {
    letterTitle.textContent = letterTitleText;
    return;
  }

  await writeByHand(letterTitle, letterTitleText, 48);
}

async function playPhotosTitleWriting() {
  if (photosTitleStarted || !photosTitle) {
    return;
  }

  photosTitleStarted = true;

  if (reduceMotion) {
    photosTitle.textContent = photosTitleText;
    return;
  }

  await writeByHand(photosTitle, photosTitleText, 48);
}

async function playPromiseWriting() {
  if (promiseWritingStarted || !promiseTitle || !promiseText) {
    return;
  }

  promiseWritingStarted = true;

  if (reduceMotion) {
    promiseTitle.textContent = promiseTitleText;
    promiseText.textContent = promiseBodyText;
    return;
  }

  await writeByHand(promiseTitle, promiseTitleText, 48);
  await new Promise((resolve) => window.setTimeout(resolve, 260));
  await writeByHand(promiseText, promiseBodyText, 24);
}

function prepareRevealAnimations() {
  revealItems = document.querySelectorAll(".section-heading, .letter, .booth-photo, .promise");

  revealItems.forEach((item, index) => {
    item.classList.add("reveal");
    item.style.transitionDelay = `${Math.min(index * 60, 360)}ms`;
  });

  if (!("IntersectionObserver" in window)) {
    revealItems.forEach((item) => {
      item.classList.remove("reveal");
      item.style.transitionDelay = "";
    });
    return;
  }

  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
        window.setTimeout(() => {
          entry.target.classList.remove("reveal", "is-visible");
          entry.target.style.transitionDelay = "";
        }, 1200);
      });
    },
    {
      rootMargin: "0px 0px -12% 0px",
      threshold: 0.12
    }
  );
}

function startRevealAnimations() {
  document.body.classList.add("is-ready");

  if (!revealObserver) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    playLetterTitleWriting();
    playPhotosTitleWriting();
    playPromiseWriting();
    return;
  }

  revealItems.forEach((item) => revealObserver.observe(item));

  if (!("IntersectionObserver" in window)) {
    playLetterTitleWriting();
    playPhotosTitleWriting();
    playPromiseWriting();
    return;
  }

  const headingWriteObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        if (entry.target === letterTitle) {
          playLetterTitleWriting();
        }

        if (entry.target === photosTitle) {
          playPhotosTitleWriting();
        }

        if (entry.target === promiseTitle) {
          playPromiseWriting();
        }

        headingWriteObserver.unobserve(entry.target);
      });
    },
    {
      rootMargin: "0px 0px -20% 0px",
      threshold: 0.4
    }
  );

  [letterTitle, photosTitle, promiseTitle].forEach((heading) => {
    if (heading) {
      headingWriteObserver.observe(heading);
    }
  });
}

function preparePhotoPlaceholders() {
  document.querySelectorAll("img").forEach((image) => {
    image.addEventListener("error", () => {
      image.classList.add("missing-photo");
      image.closest("figure")?.classList.add("photo-missing");
    });
  });
}

function createMusicNodes() {
  if (musicContext || (!window.AudioContext && !window.webkitAudioContext)) {
    return;
  }

  const AudioEngine = window.AudioContext || window.webkitAudioContext;
  musicContext = new AudioEngine();
  musicGain = musicContext.createGain();
  musicGain.gain.value = 0.045;
  musicGain.connect(musicContext.destination);
}

function playTone(frequency, startAt, duration, type = "sine") {
  if (!musicContext || !musicGain) {
    return;
  }

  const oscillator = musicContext.createOscillator();
  const noteGain = musicContext.createGain();
  const now = musicContext.currentTime;
  const start = now + startAt;
  const end = start + duration;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  noteGain.gain.setValueAtTime(0, start);
  noteGain.gain.linearRampToValueAtTime(0.8, start + 0.05);
  noteGain.gain.exponentialRampToValueAtTime(0.001, end);
  oscillator.connect(noteGain);
  noteGain.connect(musicGain);
  oscillator.start(start);
  oscillator.stop(end + 0.03);
}

function scheduleMelody() {
  const melody = [
    [392, 0, 0.42],
    [440, 0.42, 0.34],
    [523.25, 0.78, 0.58],
    [659.25, 1.42, 0.36],
    [587.33, 1.86, 0.44],
    [523.25, 2.36, 0.7],
    [440, 3.18, 0.72]
  ];

  melody.forEach(([frequency, start, duration], index) => {
    playTone(frequency, start, duration, index % 2 ? "triangle" : "sine");
    playTone(frequency / 2, start, duration + 0.18, "sine");
  });
}

async function startMusic() {
  if (musicPlaying) {
    return;
  }

  try {
    await customMusic.play();
    musicPlaying = true;
    musicToggle?.classList.add("music-playing");
    return;
  } catch (error) {
    musicPlaying = false;
  }

  createMusicNodes();

  if (!musicContext || !musicGain) {
    return;
  }

  if (musicContext.state === "suspended") {
    await musicContext.resume();
  }

  musicPlaying = true;
  musicToggle?.classList.add("music-playing");
  musicGain.gain.cancelScheduledValues(musicContext.currentTime);
  musicGain.gain.setValueAtTime(0.001, musicContext.currentTime);
  musicGain.gain.linearRampToValueAtTime(0.045, musicContext.currentTime + 0.35);
  scheduleMelody();
  musicTimer = window.setInterval(scheduleMelody, 4400);
}

function releaseHearts(amount = 18) {
  for (let index = 0; index < amount; index += 1) {
    window.setTimeout(() => {
      const heart = document.createElement("span");
      heart.className = "floating-heart";
      heart.textContent = "\u2665";
      heart.style.setProperty("--x", `${Math.random() * 100}vw`);
      heart.style.setProperty("--drift", `${Math.random() * 80 - 40}px`);
      heart.style.animationDuration = `${2.4 + Math.random() * 1.8}s`;
      document.body.appendChild(heart);
      heart.addEventListener("animationend", () => heart.remove());
    }, index * 90);
  }
}

function createPetal() {
  if (reduceMotion || !flowerField) {
    return;
  }

  const petal = document.createElement("span");
  const size = 7 + Math.random() * 10;

  petal.className = "falling-petal";
  petal.style.setProperty("--x", `${Math.random() * 100}vw`);
  petal.style.setProperty("--size", `${size}px`);
  petal.style.setProperty("--wind-a", `${Math.random() * 90 - 45}px`);
  petal.style.setProperty("--wind-b", `${Math.random() * 150 - 75}px`);
  petal.style.setProperty("--wind-c", `${Math.random() * 210 - 105}px`);
  petal.style.setProperty("--drift", `${Math.random() * 260 - 130}px`);
  petal.style.setProperty("--spin", `${Math.random() * 420 - 210}deg`);
  petal.style.setProperty("--start-rotate", `${Math.random() * 70 - 35}deg`);
  petal.style.setProperty("--duration", `${9 + Math.random() * 7}s`);
  flowerField.appendChild(petal);
  petal.addEventListener("animationend", () => petal.remove());
}

function releasePetals(amount = 1) {
  if (reduceMotion) {
    return;
  }

  for (let index = 0; index < amount; index += 1) {
    window.setTimeout(createPetal, index * 180);
  }
}

function flowerBurst(x = window.innerWidth / 2, y = window.innerHeight / 2, amount = 10) {
  if (reduceMotion || !flowerField) {
    return;
  }

  for (let index = 0; index < amount; index += 1) {
    const spark = document.createElement("span");
    const angle = (360 / amount) * index + Math.random() * 18;
    const distance = 42 + Math.random() * 58;
    const radians = (angle * Math.PI) / 180;

    spark.className = "bloom-spark";
    spark.style.setProperty("--burst-x", `${x}px`);
    spark.style.setProperty("--burst-y", `${y}px`);
    spark.style.setProperty("--burst-dx", `${Math.cos(radians) * distance}px`);
    spark.style.setProperty("--burst-dy", `${Math.sin(radians) * distance}px`);
    spark.style.setProperty("--angle", `${angle}deg`);
    spark.style.setProperty("--size", `${6 + Math.random() * 8}px`);
    flowerField.appendChild(spark);
    spark.addEventListener("animationend", () => spark.remove());
  }
}

function releaseSparkles(x = window.innerWidth / 2, y = window.innerHeight / 2, amount = 9) {
  if (reduceMotion) {
    return;
  }

  for (let index = 0; index < amount; index += 1) {
    const sparkle = document.createElement("span");
    const angle = Math.random() * 360;
    const distance = 20 + Math.random() * 52;
    const radians = (angle * Math.PI) / 180;

    sparkle.className = "click-sparkle";
    sparkle.style.setProperty("--sparkle-x", `${x}px`);
    sparkle.style.setProperty("--sparkle-y", `${y}px`);
    sparkle.style.setProperty("--sparkle-dx", `${Math.cos(radians) * distance}px`);
    sparkle.style.setProperty("--sparkle-dy", `${Math.sin(radians) * distance}px`);
    sparkle.style.setProperty("--sparkle-delay", `${Math.random() * 80}ms`);
    document.body.appendChild(sparkle);
    sparkle.addEventListener("animationend", () => sparkle.remove());
  }
}

function openIntroEnvelope() {
  if (pageUnlocked) {
    return;
  }

  pageUnlocked = true;
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  document.body.classList.add("envelope-opening");
  startMusic();
  flowerBurst(window.innerWidth / 2, window.innerHeight / 2, 18);
  releasePetals(12);

  window.setTimeout(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.body.classList.add("envelope-opened");
    document.body.classList.remove("envelope-opening");
    openEnvelope?.setAttribute("tabindex", "-1");
    playHeroWriting();
    startRevealAnimations();
    releasePetals(9);
    window.setInterval(() => releasePetals(1), 1700);
  }, reduceMotion ? 80 : 2260);
}

openEnvelope?.addEventListener("click", openIntroEnvelope);

closeGift.addEventListener("click", () => {
  giftModal.close();
});

nextMessage.addEventListener("click", () => {
  noteIndex = (noteIndex + 1) % notes.length;
  giftMessage.textContent = notes[noteIndex];
  giftMessage.classList.remove("message-swap");
  void giftMessage.offsetWidth;
  giftMessage.classList.add("message-swap");
  releaseHearts(6);
  flowerBurst(window.innerWidth / 2, window.innerHeight / 2, 14);
});

document.addEventListener("click", (event) => {
  if (!pageUnlocked || event.target.closest(".intro-envelope") || event.target.closest("dialog")) {
    return;
  }

  flowerBurst(event.clientX, event.clientY, 8);
  releaseSparkles(event.clientX, event.clientY, 8);
});

function init() {
  prepareHeroWriting();
  preparePhotoPlaceholders();
  customMusic.loop = true;
  customMusic.preload = "auto";
  customMusic.volume = 0.62;
  prepareRevealAnimations();
}

init();
