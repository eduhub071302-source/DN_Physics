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
  { name: "Ambient Focus 4", file: "/DN_Physics/audio/focus-ambient-4.mp3" }
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

  const STORAGE_KEYS = {
    TRACK_INDEX: "dnPhysicsMusicTrackIndex",
    VOLUME: "dnPhysicsMusicVolume",
    PLAYING: "dnPhysicsMusicPlaying",
    CURRENT_TIME: "dnPhysicsMusicCurrentTime"
  };

  let isMusicPlaying = false;
  let currentTrackIndex = 0;
  let fadeInterval = null;
  let saveTimer = null;
  let restoredTimeOnce = false;

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEYS.TRACK_INDEX, String(currentTrackIndex));
      localStorage.setItem(STORAGE_KEYS.VOLUME, String(volumeSlider.value));
      localStorage.setItem(STORAGE_KEYS.PLAYING, String(isMusicPlaying));
      localStorage.setItem(
        STORAGE_KEYS.CURRENT_TIME,
        String(bgMusic.currentTime || 0)
      );
    } catch (error) {
      console.log("Music state save failed:", error);
    }
  }

  function renderTrackOptions() {
    trackSelect.innerHTML = DN_MUSIC_TRACKS.map((track, index) => {
      return `<option value="${index}">${track.name}</option>`;
    }).join("");
  }

  function formatTime(seconds) {
    const total = Math.max(0, Math.floor(Number(seconds) || 0));
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  }

  function updateUI() {
    const currentTrack = DN_MUSIC_TRACKS[currentTrackIndex];
    const timeText = formatTime(bgMusic.currentTime || 0);
    currentTrackLabel.textContent = currentTrack
      ? `Current: ${currentTrack.name} • ${timeText}`
      : "Current: None";
    playPauseBtn.textContent = isMusicPlaying ? "⏸ Pause" : "▶ Play";
  }

  function clearFade() {
    if (fadeInterval) {
      clearInterval(fadeInterval);
      fadeInterval = null;
    }
  }

  function startAutoSaveTime() {
    stopAutoSaveTime();
    saveTimer = setInterval(() => {
      if (!bgMusic.paused && !bgMusic.ended) {
        saveState();
      }
    }, 1000);
  }

  function stopAutoSaveTime() {
    if (saveTimer) {
      clearInterval(saveTimer);
      saveTimer = null;
    }
  }

  function setTrack(index, resetTime = true) {
    const safeIndex =
      Number.isInteger(Number(index)) &&
      Number(index) >= 0 &&
      Number(index) < DN_MUSIC_TRACKS.length
        ? Number(index)
        : 0;

    currentTrackIndex = safeIndex;
    const selected = DN_MUSIC_TRACKS[currentTrackIndex];

    if (!selected) return;

    const currentSrcPath = bgMusic.src
      ? new URL(bgMusic.src, location.href).pathname
      : "";

    if (currentSrcPath !== selected.file) {
      bgMusic.src = selected.file;
      bgMusic.load();
    }

    if (resetTime) {
      bgMusic.currentTime = 0;
      restoredTimeOnce = true;
    } else {
      restoredTimeOnce = false;
    }

    trackSelect.value = String(currentTrackIndex);
    updateUI();
    saveState();
  }

  function fadeIn(targetVolume = Number(volumeSlider.value), duration = 350) {
    clearFade();

    const steps = 15;
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

  function fadeOut(duration = 250) {
    return new Promise((resolve) => {
      clearFade();

      const steps = 12;
      const stepTime = duration / steps;
      const currentVolume = bgMusic.volume;
      const decrement = currentVolume / steps;

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
      startAutoSaveTime();
    } catch (error) {
      isMusicPlaying = false;
      console.log("Music playback blocked:", error);
    }

    updateUI();
    saveState();
  }

  async function pauseTrack() {
    saveState();
    await fadeOut();
    isMusicPlaying = false;
    bgMusic.volume = Number(volumeSlider.value);
    stopAutoSaveTime();
    updateUI();
    saveState();
  }

  async function stopTrack() {
    saveState();
    await fadeOut();
    bgMusic.currentTime = 0;
    isMusicPlaying = false;
    bgMusic.volume = Number(volumeSlider.value);
    stopAutoSaveTime();
    updateUI();
    saveState();
  }

  async function attemptResume() {
    try {
      await bgMusic.play();
      isMusicPlaying = true;
      bgMusic.volume = Number(volumeSlider.value);
      startAutoSaveTime();
    } catch (error) {
      isMusicPlaying = false;
      stopAutoSaveTime();
      console.log("Resume blocked until next user tap:", error);
    }

    updateUI();
    saveState();
  }

  function loadState() {
    let savedTrack = 0;
    let savedVolume = 0.35;
    let savedPlaying = false;

    try {
      const rawTrack = localStorage.getItem(STORAGE_KEYS.TRACK_INDEX);
      const rawVolume = localStorage.getItem(STORAGE_KEYS.VOLUME);
      const rawPlaying = localStorage.getItem(STORAGE_KEYS.PLAYING);

      if (rawTrack !== null) savedTrack = Number(rawTrack) || 0;
      if (rawVolume !== null) savedVolume = Number(rawVolume);
      if (rawPlaying !== null) savedPlaying = rawPlaying === "true";
    } catch (error) {
      console.log("Music state load failed:", error);
    }

    if (!Number.isFinite(savedVolume) || savedVolume < 0 || savedVolume > 1) {
      savedVolume = 0.35;
    }

    volumeSlider.value = String(savedVolume);
    bgMusic.volume = savedVolume;

    renderTrackOptions();
    setTrack(savedTrack, false);

    isMusicPlaying = savedPlaying;
    updateUI();
  }

  musicToggleBtn.addEventListener("click", () => {
    musicPanel.classList.toggle("show");
  });

  trackSelect.addEventListener("change", async () => {
    const newIndex = Number(trackSelect.value) || 0;

    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_TIME, "0");
    } catch (error) {
      console.log("Could not reset saved time:", error);
    }

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
    updateUI();
  });

  bgMusic.addEventListener("loadedmetadata", () => {
    if (!restoredTimeOnce) {
      let savedTime = 0;

      try {
        savedTime = Number(localStorage.getItem(STORAGE_KEYS.CURRENT_TIME)) || 0;
      } catch (error) {
        console.log("Could not read saved time:", error);
      }

      if (
        Number.isFinite(savedTime) &&
        savedTime > 0 &&
        Number.isFinite(bgMusic.duration) &&
        savedTime < bgMusic.duration
      ) {
        bgMusic.currentTime = savedTime;
      }

      restoredTimeOnce = true;
    }

    updateUI();

    if (isMusicPlaying) {
      attemptResume();
    }
  });

  bgMusic.addEventListener("timeupdate", () => {
    updateUI();
  });

  bgMusic.addEventListener("ended", () => {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_TIME, "0");
    } catch (error) {
      console.log("Could not clear saved time:", error);
    }

    stopAutoSaveTime();

    if (bgMusic.loop) {
      isMusicPlaying = true;
      startAutoSaveTime();
    } else {
      isMusicPlaying = false;
    }

    updateUI();
    saveState();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      saveState();
    }
  });

  window.addEventListener("beforeunload", () => {
    saveState();
  });

  loadState();
})();
