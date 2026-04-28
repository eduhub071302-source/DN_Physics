const DN_MUSIC_TRACKS = [
  { name: "Calm Piano 1", file: "/audio/focus-piano-1.mp3" },
  { name: "Calm Piano 2", file: "/audio/focus-piano-2.mp3" },
  { name: "Calm Piano 3", file: "/audio/focus-piano-3.mp3" },
  { name: "Calm Piano 4", file: "/audio/focus-piano-4.mp3" },
  { name: "Calm Piano 5", file: "/audio/focus-piano-5.mp3" },

  { name: "Rain Focus 1", file: "/audio/focus-rain-1.mp3" },
  { name: "Rain Focus 2", file: "/audio/focus-rain-2.mp3" },
  { name: "Rain Focus 3", file: "/audio/focus-rain-3.mp3" },

  { name: "Ambient Focus 1", file: "/audio/focus-ambient-1.mp3" },
  { name: "Ambient Focus 2", file: "/audio/focus-ambient-2.mp3" },
  { name: "Ambient Focus 3", file: "/audio/focus-ambient-3.mp3" },
  { name: "Ambient Focus 4", file: "/audio/focus-ambient-4.mp3" }
];

(function () {
  "use strict";

  if (window.__DN_MUSIC_PLAYER_INITIALIZED) {
    return;
  }

  window.__DN_MUSIC_PLAYER_INITIALIZED = true;

  const pageAudio = document.getElementById("bgMusic");
  if (pageAudio) {
    pageAudio.pause();
    pageAudio.removeAttribute("src");
    pageAudio.load();
  }

  const STORAGE_KEYS = {
    TRACK_INDEX: "dnMusicTrack",
    VOLUME: "dnMusicVolume",
    PLAYING: "dnMusicPlaying",
    CURRENT_TIME: "dnMusicCurrentTime",
    PANEL_OPEN: "dnMusicPanelOpen"
  };

  if (!window.DN_GLOBAL_AUDIO) {
    window.DN_GLOBAL_AUDIO = new Audio();
    window.DN_GLOBAL_AUDIO.loop = true;
    window.DN_GLOBAL_AUDIO.preload = "auto";
  }

  const bgMusic = window.DN_GLOBAL_AUDIO;

  const musicToggleBtn = document.getElementById("musicToggleBtn");
  const musicPanel = document.getElementById("musicPanel");
  const trackSelect = document.getElementById("trackSelect");
  const playPauseBtn = document.getElementById("playPauseBtn");
  const stopMusicBtn = document.getElementById("stopMusicBtn");
  const volumeSlider = document.getElementById("volumeSlider");
  const currentTrackLabel = document.getElementById("currentTrackLabel");

  if (
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

  let currentTrackIndex = 0;
  let isPlaying = false;
  let restorePendingTime = null;
  let saveInterval = null;
  let isTryingAutoResume = false;

  function safeSet(key, value) {
    try {
      localStorage.setItem(key, String(value));
    } catch (error) {
      console.log("Music safeSet error:", error);
    }
  }

  function safeGet(key, fallback = "") {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : value;
    } catch (error) {
      console.log("Music safeGet error:", error);
      return fallback;
    }
  }

  function renderTracks() {
    trackSelect.innerHTML = DN_MUSIC_TRACKS.map(
      (track, index) => `<option value="${index}">${track.name}</option>`
    ).join("");
  }

  function getTrack(index) {
    return DN_MUSIC_TRACKS[index] || DN_MUSIC_TRACKS[0];
  }

  function updateUI() {
    const track = getTrack(currentTrackIndex);

    currentTrackLabel.textContent = track ? track.name : "No track selected";
    playPauseBtn.textContent = isPlaying ? "⏸ Pause" : "▶ Play";
    trackSelect.value = String(currentTrackIndex);

    const panelOpen = musicPanel.classList.contains("show");
    musicToggleBtn.setAttribute("title", panelOpen ? "Close player" : "Open player");
    musicPanel.setAttribute("aria-hidden", panelOpen ? "false" : "true");
  }

  function saveState() {
    safeSet(STORAGE_KEYS.TRACK_INDEX, currentTrackIndex);
    safeSet(STORAGE_KEYS.VOLUME, Number.isFinite(bgMusic.volume) ? bgMusic.volume : 0.35);
    safeSet(STORAGE_KEYS.PLAYING, isPlaying);
    safeSet(
      STORAGE_KEYS.CURRENT_TIME,
      Number.isFinite(bgMusic.currentTime) ? bgMusic.currentTime : 0
    );
    safeSet(STORAGE_KEYS.PANEL_OPEN, musicPanel.classList.contains("show"));
  }

  function startStateSaver() {
    if (saveInterval) return;

    saveInterval = setInterval(() => {
      saveState();
    }, 2000);
  }

  function stopStateSaver() {
    if (!saveInterval) return;
    clearInterval(saveInterval);
    saveInterval = null;
  }

  function setTrack(index, preserveTime = false) {
    const safeIndex =
      Number.isInteger(index) && index >= 0 && index < DN_MUSIC_TRACKS.length ? index : 0;

    const previousTime = preserveTime ? bgMusic.currentTime || 0 : 0;
    const track = getTrack(safeIndex);

    currentTrackIndex = safeIndex;

    const currentSrc = bgMusic.src || "";
    const nextSrc = track.file;

    if (!currentSrc || !currentSrc.includes(nextSrc)) {
      bgMusic.src = nextSrc;
      restorePendingTime = previousTime;
    } else if (preserveTime) {
      restorePendingTime = previousTime;
    }

    updateUI();
    saveState();
  }

  async function play() {
    try {
      await bgMusic.play();
      isPlaying = true;
      startStateSaver();
    } catch (error) {
      console.log("Play blocked:", error);
      isPlaying = false;
    }

    updateUI();
    saveState();
  }

  function pause() {
    bgMusic.pause();
    isPlaying = false;
    stopStateSaver();
    updateUI();
    saveState();
  }

  function stop() {
    bgMusic.pause();
    bgMusic.currentTime = 0;
    isPlaying = false;
    restorePendingTime = 0;
    stopStateSaver();
    updateUI();
    saveState();
  }

  function applyPendingRestoreTime() {
    if (restorePendingTime == null) return;

    const durationReady = Number.isFinite(bgMusic.duration) && bgMusic.duration > 0;
    if (!durationReady) return;

    const safeTime = Math.max(0, Math.min(restorePendingTime, bgMusic.duration - 0.25));
    bgMusic.currentTime = safeTime;
    restorePendingTime = null;
    saveState();
  }

  function loadState() {
    let savedTrack = Number(safeGet(STORAGE_KEYS.TRACK_INDEX, "0"));
    let savedVolume = Number(safeGet(STORAGE_KEYS.VOLUME, "0.35"));
    let savedPlaying = safeGet(STORAGE_KEYS.PLAYING, "false") === "true";
    let savedCurrentTime = Number(safeGet(STORAGE_KEYS.CURRENT_TIME, "0"));
    let panelOpen = safeGet(STORAGE_KEYS.PANEL_OPEN, "false") === "true";

    if (!Number.isInteger(savedTrack) || savedTrack < 0 || savedTrack >= DN_MUSIC_TRACKS.length) {
      savedTrack = 0;
    }

    if (!Number.isFinite(savedVolume) || savedVolume < 0 || savedVolume > 1) {
      savedVolume = 0.35;
    }

    if (!Number.isFinite(savedCurrentTime) || savedCurrentTime < 0) {
      savedCurrentTime = 0;
    }

    bgMusic.volume = Number.isFinite(savedVolume) ? savedVolume : 0.35;
    volumeSlider.value = String(savedVolume);

    renderTracks();
    setTrack(savedTrack, false);

    if (savedCurrentTime > 0) {
      restorePendingTime = savedCurrentTime;
    }

    if (panelOpen) {
      musicPanel.classList.add("show");
    } else {
      musicPanel.classList.remove("show");
    }

    isPlaying = savedPlaying;
    updateUI();

    if (savedPlaying) {
      tryAutoResume();
    }
  }

  async function tryAutoResume() {
    if (isTryingAutoResume) return;
    isTryingAutoResume = true;

    try {
      await play();
    } catch (error) {
      console.log("Auto resume failed:", error);
    }

    isTryingAutoResume = false;
  }

  function attemptResumeAfterInteraction() {
    const wantsPlaying = safeGet(STORAGE_KEYS.PLAYING, "false") === "true";

    if (wantsPlaying && bgMusic.paused) {
      play();
    }
  }

  bgMusic.addEventListener("loadedmetadata", applyPendingRestoreTime);
  bgMusic.addEventListener("canplay", applyPendingRestoreTime);

  bgMusic.addEventListener("play", () => {
    isPlaying = true;
    startStateSaver();
    updateUI();
    saveState();
  });

  bgMusic.addEventListener("pause", () => {
    if (bgMusic.ended) return;
    isPlaying = false;
    stopStateSaver();
    updateUI();
    saveState();
  });

  bgMusic.addEventListener("ended", () => {
    isPlaying = false;
    stopStateSaver();
    updateUI();
    saveState();
  });

  bgMusic.addEventListener("timeupdate", () => {
    if (!bgMusic.paused) {
      saveState();
    }
  });

  bgMusic.addEventListener("error", (error) => {
    console.log("Music audio error:", error);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      saveState();
      return;
    }

    const wantsPlaying = safeGet(STORAGE_KEYS.PLAYING, "false") === "true";
    if (wantsPlaying && bgMusic.paused) {
      tryAutoResume();
    }
  });

  window.addEventListener("beforeunload", saveState);
  window.addEventListener("pagehide", saveState);

  document.addEventListener(
    "click",
    () => {
      attemptResumeAfterInteraction();
    },
    { once: true }
  );

  document.addEventListener(
    "touchstart",
    () => {
      attemptResumeAfterInteraction();
    },
    { once: true }
  );

  musicToggleBtn.addEventListener("click", () => {
    musicPanel.classList.toggle("show");
    updateUI();
    saveState();
  });

  trackSelect.addEventListener("change", () => {
    const nextIndex = Number(trackSelect.value);
    const wasPlaying = isPlaying;

    setTrack(nextIndex, false);

    if (wasPlaying) {
      play();
    } else {
      updateUI();
    }
  });

  playPauseBtn.addEventListener("click", () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  });

  stopMusicBtn.addEventListener("click", stop);

  volumeSlider.addEventListener("input", () => {
    const volume = Number(volumeSlider.value);
    bgMusic.volume = Number.isFinite(volume) ? volume : 0.35;
    saveState();
  });

  loadState();
})();
