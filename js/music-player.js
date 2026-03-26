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
  // ===== GLOBAL AUDIO (IMPORTANT FIX) =====
  if (!window.DN_GLOBAL_AUDIO) {
    window.DN_GLOBAL_AUDIO = new Audio();
    window.DN_GLOBAL_AUDIO.loop = true;
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

  if (!musicToggleBtn) return;

  const STORAGE_KEYS = {
    TRACK_INDEX: "dnMusicTrack",
    VOLUME: "dnMusicVolume",
    PLAYING: "dnMusicPlaying"
  };

  let currentTrackIndex = 0;
  let isPlaying = false;

  function renderTracks() {
    trackSelect.innerHTML = DN_MUSIC_TRACKS.map(
      (t, i) => `<option value="${i}">${t.name}</option>`
    ).join("");
  }

  function updateUI() {
    const track = DN_MUSIC_TRACKS[currentTrackIndex];
    currentTrackLabel.textContent = track
      ? `Current: ${track.name}`
      : "None";

    playPauseBtn.textContent = isPlaying ? "⏸ Pause" : "▶ Play";
  }

  function setTrack(index) {
    currentTrackIndex = index;
    const track = DN_MUSIC_TRACKS[index];

    if (!track) return;

    if (!bgMusic.src.includes(track.file)) {
      bgMusic.src = track.file;
    }

    trackSelect.value = index;
    updateUI();
    saveState();
  }

  async function play() {
    try {
      await bgMusic.play();
      isPlaying = true;
    } catch (e) {
      console.log("Play blocked:", e);
    }
    updateUI();
    saveState();
  }

  function pause() {
    bgMusic.pause();
    isPlaying = false;
    updateUI();
    saveState();
  }

  function stop() {
    bgMusic.pause();
    bgMusic.currentTime = 0;
    isPlaying = false;
    updateUI();
    saveState();
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEYS.TRACK_INDEX, currentTrackIndex);
    localStorage.setItem(STORAGE_KEYS.VOLUME, bgMusic.volume);
    localStorage.setItem(STORAGE_KEYS.PLAYING, isPlaying);
  }

  function loadState() {
    const savedTrack = Number(localStorage.getItem(STORAGE_KEYS.TRACK_INDEX)) || 0;
    const savedVolume = Number(localStorage.getItem(STORAGE_KEYS.VOLUME)) || 0.35;
    const savedPlaying = localStorage.getItem(STORAGE_KEYS.PLAYING) === "true";

    bgMusic.volume = savedVolume;
    volumeSlider.value = savedVolume;

    renderTracks();
    setTrack(savedTrack);

    if (savedPlaying) {
      play();
    }
  }

  // ===== EVENTS =====
  musicToggleBtn.addEventListener("click", () => {
    musicPanel.classList.toggle("show");
  });

  trackSelect.addEventListener("change", () => {
    setTrack(Number(trackSelect.value));
    if (isPlaying) play();
  });

  playPauseBtn.addEventListener("click", () => {
    isPlaying ? pause() : play();
  });

  stopMusicBtn.addEventListener("click", stop);

  volumeSlider.addEventListener("input", () => {
    bgMusic.volume = Number(volumeSlider.value);
    saveState();
  });

  // ===== INIT =====
  loadState();
})();
