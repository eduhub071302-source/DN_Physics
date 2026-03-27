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
  // ===== GLOBAL AUDIO (PERSIST ACROSS PAGES) =====
  if (!window.DN_GLOBAL_AUDIO) {
    window.DN_GLOBAL_AUDIO = new Audio();
    window.DN_GLOBAL_AUDIO.loop = true;
    window.DN_GLOBAL_AUDIO.preload = "auto";
  }

  const bgMusic = window.DN_GLOBAL_AUDIO;

  // ===== UI ELEMENTS =====
  const musicToggleBtn = document.getElementById("musicToggleBtn");
  const musicPanel = document.getElementById("musicPanel");
  const trackSelect = document.getElementById("trackSelect");
  const playPauseBtn = document.getElementById("playPauseBtn");
  const stopMusicBtn = document.getElementById("stopMusicBtn");
  const volumeSlider = document.getElementById("volumeSlider");
  const currentTrackLabel = document.getElementById("currentTrackLabel");

  if (!musicToggleBtn || !musicPanel || !trackSelect || !playPauseBtn || !stopMusicBtn || !volumeSlider || !currentTrackLabel) {
    return;
  }

  const STORAGE_KEYS = {
    TRACK_INDEX: "dnMusicTrack",
    VOLUME: "dnMusicVolume",
    PLAYING: "dnMusicPlaying",
    CURRENT_TIME: "dnMusicCurrentTime"
  };

  let currentTrackIndex = 0;
  let isPlaying = false;
  let restorePendingTime = null;
  let saveInterval = null;

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
    currentTrackLabel.textContent = track ? `Current: ${track.name}` : "Current: None";
    playPauseBtn.textContent = isPlaying ? "⏸ Pause" : "▶ Play";
    trackSelect.value = String(currentTrackIndex);
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEYS.TRACK_INDEX, String(currentTrackIndex));
      localStorage.setItem(STORAGE_KEYS.VOLUME, String(bgMusic.volume));
      localStorage.setItem(STORAGE_KEYS.PLAYING, String(isPlaying));
      localStorage.setItem(
        STORAGE_KEYS.CURRENT_TIME,
        String(Number.isFinite(bgMusic.currentTime) ? bgMusic.currentTime : 0)
      );
    } catch (error) {
      console.log("Music saveState error:", error);
    }
  }

  function startStateSaver() {
    if (saveInterval) return;
    saveInterval = setInterval(() => {
      saveState();
    }, 3000);
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

    if (!bgMusic.src || !bgMusic.src.includes(track.file)) {
      bgMusic.src = track.file;
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
    let savedTrack = 0;
    let savedVolume = 0.35;
    let savedPlaying = false;
    let savedCurrentTime = 0;

    try {
      savedTrack = Number(localStorage.getItem(STORAGE_KEYS.TRACK_INDEX));
      savedVolume = Number(localStorage.getItem(STORAGE_KEYS.VOLUME));
      savedPlaying = localStorage.getItem(STORAGE_KEYS.PLAYING) === "true";
      savedCurrentTime = Number(localStorage.getItem(STORAGE_KEYS.CURRENT_TIME));
    } catch (error) {
      console.log("Music loadState error:", error);
    }

    if (!Number.isInteger(savedTrack) || savedTrack < 0 || savedTrack >= DN_MUSIC_TRACKS.length) {
      savedTrack = 0;
    }

    if (!Number.isFinite(savedVolume) || savedVolume < 0 || savedVolume > 1) {
      savedVolume = 0.35;
    }

    if (!Number.isFinite(savedCurrentTime) || savedCurrentTime < 0) {
      savedCurrentTime = 0;
    }

    bgMusic.volume = savedVolume;
    volumeSlider.value = String(savedVolume);

    renderTracks();
    setTrack(savedTrack, false);

    if (savedCurrentTime > 0) {
      restorePendingTime = savedCurrentTime;
    }

    isPlaying = savedPlaying;
    updateUI();

    if (savedPlaying) {
      play();
    }
  }

  function attemptResumeAfterInteraction() {
    const wantsPlaying = localStorage.getItem(STORAGE_KEYS.PLAYING) === "true";

    if (wantsPlaying && bgMusic.paused) {
      play();
    }
  }

  // ===== AUDIO EVENTS =====
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

    const wantsPlaying = localStorage.getItem(STORAGE_KEYS.PLAYING) === "true";
    if (wantsPlaying && bgMusic.paused) {
      play();
    }
  });

  window.addEventListener("beforeunload", saveState);

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

  // ===== UI EVENTS =====
  musicToggleBtn.addEventListener("click", () => {
    musicPanel.classList.toggle("show");
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

  // ===== INIT =====
  loadState();
})();
