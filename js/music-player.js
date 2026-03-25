const DN_MUSIC_TRACKS = [
  { name: "Calm Piano 1", file: "/DN_Physics/audio/focus-piano-1.mp3" },
  { name: "Calm Piano 2", file: "/DN_Physics/audio/focus-piano-2.mp3" },
  { name: "Calm Piano 3", file: "/DN_Physics/audio/focus-piano-3.mp3" },
  { name: "Calm Piano 4", file: "/DN_Physics/audio/focus-piano-4.mp3" },
  { name: "Calm Piano 5", file: "/DN_Physics/audio/focus-piano-5.mp3" },

  { name: "Rain Focus 1", file: "/DN_Physics/audio/focus-rain-1.mp3" },
  { name: "Rain Focus 2", file: "/DN_Physics/audio/focus-rain-2.mp3" },
  { name: "Rain Focus 3", file: "/DN_Physics/audio/focus-rain-3.mp3" },

  { name: "Ambient Focus 1", file: "/DN_Physics/audio/focus-ambient-1.mp3" },
  { name: "Ambient Focus 2", file: "/DN_Physics/audio/focus-ambient-2.mp3" },
  { name: "Ambient Focus 3", file: "/DN_Physics/audio/focus-ambient-3.mp3" },
  { name: "Ambient Focus 4", file: "/DN_Physics/audio/focus-ambinet-4.mp3" }
];

(function () {
  const bgMusic = document.getElementById("bgMusic");
  const musicToggleBtn = document.getElementById("musicToggleBtn");
  const musicPanel = document.getElementById("musicPanel");
  const trackSelect = document.getElementById("trackSelect");
  const playPauseBtn = document.getElementById("playPauseBtn");
  const stopMusicBtn = document.getElementById("stopMusicBtn");
  const volumeSlider = document.getElementById("volumeSlider");
  const currentTrackLabel = document.getElementById("currentTrackLabel");

  if (
    !bgMusic ||
    !musicToggleBtn ||
    !musicPanel ||
    !trackSelect ||
    !playPauseBtn ||
    !stopMusicBtn ||
    !volumeSlider ||
    !currentTrackLabel
  ) {
    return;
  }

  let isMusicPlaying = false;
  let currentTrackIndex = 0;
  let fadeInterval = null;

  function saveState() {
    localStorage.setItem("dnPhysicsMusicTrackIndex", String(currentTrackIndex));
    localStorage.setItem("dnPhysicsMusicVolume", String(volumeSlider.value));
    localStorage.setItem("dnPhysicsMusicPlaying", String(isMusicPlaying));
    localStorage.setItem("dnPhysicsMusicCurrentTime", String(bgMusic.currentTime || 0));
  }

  function loadState() {
    const savedTrack = localStorage.getItem("dnPhysicsMusicTrackIndex");
    const savedVolume = localStorage.getItem("dnPhysicsMusicVolume");
    const savedPlaying = localStorage.getItem("dnPhysicsMusicPlaying");
    const savedTime = localStorage.getItem("dnPhysicsMusicCurrentTime");

    if (savedTrack !== null) currentTrackIndex = Number(savedTrack);
    if (savedVolume !== null) {
      volumeSlider.value = savedVolume;
      bgMusic.volume = Number(savedVolume);
    } else {
      bgMusic.volume = 0.35;
      volumeSlider.value = 0.35;
    }

    renderTrackOptions();
    trackSelect.value = String(currentTrackIndex);
    setTrack(currentTrackIndex, false);

    if (savedTime !== null) {
      bgMusic.currentTime = Number(savedTime) || 0;
    }

    isMusicPlaying = savedPlaying === "true";
    updateUI();

    if (isMusicPlaying) {
      attemptResume();
    }
  }

  function renderTrackOptions() {
    trackSelect.innerHTML = DN_MUSIC_TRACKS.map((track, index) => {
      return `<option value="${index}">${track.name}</option>`;
    }).join("");
  }

  function updateUI() {
    currentTrackLabel.textContent = `Current: ${DN_MUSIC_TRACKS[currentTrackIndex].name}`;
    playPauseBtn.textContent = isMusicPlaying ? "⏸ Pause" : "▶ Play";
  }

  function clearFade() {
    if (fadeInterval) {
      clearInterval(fadeInterval);
      fadeInterval = null;
    }
  }

  function setTrack(index, resetTime = true) {
    currentTrackIndex = index;
    const selected = DN_MUSIC_TRACKS[currentTrackIndex];
    if (bgMusic.src !== location.origin + selected.file) {
      bgMusic.src = selected.file;
    }
    if (resetTime) bgMusic.currentTime = 0;
    updateUI();
    saveState();
  }

  function fadeIn(targetVolume = Number(volumeSlider.value), duration = 500) {
    clearFade();
    const steps = 20;
    const stepTime = duration / steps;
    const increment = targetVolume / steps;
    bgMusic.volume = 0;

    fadeInterval = setInterval(() => {
      if (bgMusic.volume + increment >= targetVolume) {
        bgMusic.volume = targetVolume;
        clearFade();
      } else {
        bgMusic.volume += increment;
      }
    }, stepTime);
  }

  function fadeOut(duration = 400) {
    return new Promise((resolve) => {
      clearFade();
      const steps = 20;
      const stepTime = duration / steps;
      const decrement = bgMusic.volume / steps;

      fadeInterval = setInterval(() => {
        if (bgMusic.volume - decrement <= 0.01) {
          bgMusic.volume = 0;
          bgMusic.pause();
          clearFade();
          resolve();
        } else {
          bgMusic.volume -= decrement;
        }
      }, stepTime);
    });
  }

  async function playTrack(index, resetTime = false) {
    setTrack(index, resetTime);
    try {
      await bgMusic.play();
      isMusicPlaying = true;
      fadeIn(Number(volumeSlider.value));
    } catch (error) {
      isMusicPlaying = false;
      console.log("Music playback blocked:", error);
    }
    updateUI();
    saveState();
  }

  async function pauseTrack() {
    await fadeOut();
    isMusicPlaying = false;
    bgMusic.volume = Number(volumeSlider.value);
    updateUI();
    saveState();
  }

  async function stopTrack() {
    await fadeOut();
    bgMusic.currentTime = 0;
    isMusicPlaying = false;
    bgMusic.volume = Number(volumeSlider.value);
    updateUI();
    saveState();
  }

  async function attemptResume() {
    try {
      await bgMusic.play();
      isMusicPlaying = true;
      bgMusic.volume = Number(volumeSlider.value);
    } catch (error) {
      isMusicPlaying = false;
      console.log("Resume blocked until next user tap:", error);
    }
    updateUI();
    saveState();
  }

  musicToggleBtn.addEventListener("click", () => {
    musicPanel.classList.toggle("show");
  });

  trackSelect.addEventListener("change", async () => {
    const newIndex = Number(trackSelect.value);
    if (isMusicPlaying) {
      await playTrack(newIndex, true);
    } else {
      setTrack(newIndex, true);
    }
  });

  playPauseBtn.addEventListener("click", async () => {
    if (isMusicPlaying) {
      await pauseTrack();
    } else {
      await playTrack(currentTrackIndex, false);
    }
  });

  stopMusicBtn.addEventListener("click", async () => {
    await stopTrack();
  });

  volumeSlider.addEventListener("input", () => {
    bgMusic.volume = Number(volumeSlider.value);
    saveState();
  });

  bgMusic.addEventListener("timeupdate", () => {
    saveState();
  });

  window.addEventListener("beforeunload", () => {
    saveState();
  });

  loadState();
})();
