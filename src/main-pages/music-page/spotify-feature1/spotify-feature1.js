// -----------updated with playing toggle one------
const dotenv = require('dotenv');/// to access .env file

dotenv.config();

const CLIENT_ID = process.env.SP_CLIENT_ID;
const REDIRECT_URI = process.env.SP_REDIRECT_URI;
const SCOPES = [
    "user-read-playback-state",
    "user-modify-playback-state",
    "streaming",
    "playlist-read-private",
    "playlist-read-collaborative",
    "user-read-currently-playing" // Add necessary scopes
].join(" ");

const loginButton = document.getElementById("login-button");
const fetchPlaylistsButton = document.getElementById("fetch-playlists-button");
const playlistsContainer = document.getElementById("playlists");
const nextSongButton = document.getElementById("next-song-button");
const playPauseButton = document.getElementById("play-pause-button");
const playIcon = document.getElementById("play-icon");
const pauseIcon = document.getElementById("pause-icon");
const progressBar = document.getElementById("progress-bar");
const currentTimeElement = document.getElementById("current-time");
const durationTimeElement = document.getElementById("duration-time");
let accessToken = "";
let deviceId = "";
let player = null;
let isPlaying = false;

// Fetch Access Token from URL
const urlParams = new URLSearchParams(window.location.search);
accessToken = urlParams.get("access_token");

if (accessToken) {
    console.log("Access token retrieved:", accessToken);
    localStorage.setItem("spotifyAccessToken", accessToken);
} else {
    console.error("Access token not found. Please log in again.");
}

// Handle login button click
loginButton.addEventListener("click", () => {
    const authURL = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&scope=${encodeURIComponent(SCOPES)}`;
    window.location.href = authURL; // Redirect to Spotify's login page
});

// Initialize Spotify Web Playback SDK
window.onSpotifyWebPlaybackSDKReady = () => {
    player = new Spotify.Player({
        name: "Spotify Web Player",
        getOAuthToken: (cb) => cb(accessToken),
        volume: 0.5,
    });

    player.addListener("ready", ({ device_id }) => {
        console.log("Ready with Device ID", device_id);
        deviceId = device_id;
    });

    player.addListener("not_ready", ({ device_id }) => {
        console.error("Device ID is offline", device_id);
    });

    player.addListener("player_state_changed", (state) => {
        if (!state) return;
        updateNowPlayingInfo(state);
        isPlaying = !state.paused;
        togglePlayPauseUI(isPlaying);
    });

  //   //-------updated one of above
  //   player.addListener("player_state_changed", (state) => {
  //     if (state) {
  //         isPlaying = !state.paused;
  //         if (isPlaying) {
  //             syncProgressBar();
  //         }
  //     }
  // });


    player.connect().then(success => {
        if (success) {
            console.log('The Web Playback SDK successfully connected to Spotify!');
        }
    });
};

// Update Now Playing Info
function updateNowPlayingInfo(state) {
    const track = state.track_window.current_track;

    if (track) {
        document.getElementById("album-art").src = track.album.images[0].url;
        document.getElementById("song-title").textContent = track.name;
        document.getElementById("artist-name").textContent = track.artists
            .map((artist) => artist.name)
            .join(", ");
        const duration = Math.floor(track.duration_ms / 1000); // Track duration in seconds
        durationTimeElement.textContent = formatTime(duration);
    } else {
        console.error("No track data available.");
    }
}

// Format time in mm:ss
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${minutes}:${secs}`;
}

// Play/Pause toggle UI
function togglePlayPauseUI(isPlaying) {
    playIcon.style.display = isPlaying ? "none" : "inline";
    pauseIcon.style.display = isPlaying ? "inline" : "none";
}

// Play/Pause button event
// playPauseButton.addEventListener("click", () => {
//     if (player) {
//         player.togglePlay().then(() => {
//             console.log(isPlaying ? "Paused playback" : "Resumed playback");
//             isPlaying = !isPlaying;
//             togglePlayPauseUI(isPlaying);
//         }).catch((error) => {
//             console.error("Error toggling play/pause:", error);
//         });
//     }
// });
//--------updated one of above
if (playPauseButton) {
  playPauseButton.addEventListener("click", () => {
      if (player) {
          player.togglePlay()
              .then(() => {
                  console.log(isPlaying ? "Paused playback" : "Resumed playback");
                  isPlaying = !isPlaying;
                  togglePlayPauseUI(isPlaying);
              })
              .catch((error) => console.error("Error toggling play/pause:", error));
      } else {
          console.warn("Player is not initialized.");
      }
  });
}



// Next Song button event
// Next Song button event
document.getElementById("next-song-button").addEventListener("click", async () => {
  if (player) {
      player.nextTrack().then(() => {
          console.log("Skipped to the next song.");
          // Optionally update the Now Playing info
          player.getCurrentState().then((state) => {
              if (state) updateNowPlayingInfo(state);
          });
      }).catch((error) => {
          console.error("Error skipping to the next song:", error);
          alert("Could not skip to the next song. Please try again 🥹");
      });
  } else {
      console.error("Player is not initialized for skipping to the next song.");
  }
});


// Previous Song button event
document.getElementById("previous-button").addEventListener("click", async () => {
    if (player) {
        try {
            await player.previousTrack();
            console.log("Went to the previous song.");
        } catch (error) {
            console.error("Error going to the previous song:", error);
        }
    } else {
        console.error("Player not initialized for previous track.");
    }
});

// // Progress Bar Interaction
// progressBar.addEventListener("input", (e) => {
//     if (player) {
//         const seekPosition = (e.target.value / 100) * player.state.duration;
//         player.seek(seekPosition).then(() => {
//             console.log(`Seeked to position: ${seekPosition}`);
//         }).catch((error) => {
//             console.error("Error seeking:", error);
//         });
//     }
// });
//---------updated one of above-------
progressBar.addEventListener("input", (e) => {
  if (player) {
      player.getCurrentState().then((state) => {
          if (state && state.duration) {
              const seekPosition = (e.target.value / 100) * state.duration;
              player.seek(seekPosition).then(() => {
                  console.log(`Seeked to position: ${seekPosition}`);
              }).catch((error) => console.error("Error seeking:", error));
          } else {
              console.warn("State or duration is undefined.");
          }
      });
  }
});


// Automatically update Now Playing info
function startNowPlayingUpdater() {
    setInterval(() => {
        if (isPlaying) {
            player.getCurrentState().then((state) => {
                if (state) {
                    const currentTime = Math.floor(state.position / 1000);
                    const duration = Math.floor(state.track_window.current_track.duration_ms / 1000);
                    currentTimeElement.textContent = formatTime(currentTime);
                    progressBar.value = (currentTime / duration) * 100;
                }
            }).catch((error) => {
                console.error("Error updating playback progress:", error);
            });
        }
    }, 1000);
}

startNowPlayingUpdater();

// // Fetch user's playlists
// async function fetchPlaylists() {
//     try {
//         const response = await fetch(`http://localhost:8888/playlists?access_token=${accessToken}`);
//         if (!response.ok) throw new Error("Failed to fetch playlists");

//         const data = await response.json();

//         playlistsContainer.innerHTML = ""; // Clear previous content
//         data.items.forEach((playlist) => {
//             const playlistElement = document.createElement("div");
//             playlistElement.innerHTML = `
//                 <h3>${playlist.name}</h3>
//                 <p>Total Tracks: ${playlist.tracks.total}</p>
//                 <a href="${playlist.external_urls.spotify}" target="_blank">Open in Spotify</a>
//                 <button onclick="playPlaylist('${playlist.uri}')">Play Playlist</button>
//             `;
//             playlistsContainer.appendChild(playlistElement);
//         });
//     } catch (error) {
//         console.error("Error fetching playlists:", error);
//     }
// }

//--------------------updated one of above
async function fetchPlaylists() {
  try {
      const response = await fetch(`http://localhost:8888/playlists?access_token=${accessToken}`);
      if (!response.ok) throw new Error("Failed to fetch playlists.");

      const data = await response.json();
      playlistsContainer.innerHTML = ""; // Clear previous playlists
      data.items.forEach((playlist) => {
          const playlistElement = document.createElement("div");
          playlistElement.innerHTML = `
              <h3>${playlist.name}</h3>
              <p>Total Tracks: ${playlist.tracks.total}</p>
              <a href="${playlist.external_urls.spotify}" target="_blank">Open in Spotify</a>
              <button onclick="playPlaylist('${playlist.uri}')">Play Playlist</button>
          `;
          playlistsContainer.appendChild(playlistElement);
      });
  } catch (error) {
      console.error("Error fetching playlists:", error);
      alert("Could not fetch playlists. Please try again later 😭");
  }
}


// Play a playlist
async function playPlaylist(playlistUri) {
    try {
        if (!deviceId) {
            console.error("Device not ready. Please wait for the player to initialize.");
            alert("Player is not ready yet. Please try again 🥹");
            return;
        }

        const response = await fetch(
            `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
            {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ context_uri: playlistUri }),
            }
        );

        if (response.ok) {
            console.log("Playlist playback started.");
        } else {
            const errorData = await response.json();
            console.error("Error starting playback:", errorData);
        }
    } catch (error) {
        console.error("Error playing playlist:", error);
    }
}

async function fetchNowPlaying() {
  try {
      const response = await fetch(`http://localhost:8888/now-playing?access_token=${accessToken}`);
      if (!response.ok) {
          throw new Error("Failed to fetch now-playing data.");
      }

      const data = await response.json();

      if (data && data.item) {
          document.getElementById("album-art").src = data.item.album.images[0].url;
          document.getElementById("song-title").textContent = data.item.name;
          document.getElementById("artist-name").textContent = data.item.artists
              .map((artist) => artist.name)
              .join(", ");
          document.getElementById("now-playing-info").style.display = "block"; // Show the info section
      } else {
          document.getElementById("song-title").textContent = "No song is currently playing";
          document.getElementById("artist-name").textContent = "";
          document.getElementById("album-art").src = ""; // Clear the album art
          document.getElementById("now-playing-info").style.display = "none"; // Hide the info section
      }
  } catch (error) {
      console.error("Error fetching Now Playing data:", error);
      alert("Could not fetch Now Playing data. Please try again 🥹");
  }
}

// Show Now Playing button event listener
const toggleNowPlayingButton = document.getElementById("toggle-now-playing");
toggleNowPlayingButton.addEventListener("click", () => {
    console.log("Show Now Playing button clicked."); // Debugging log
    fetchNowPlaying(); // Call the fetch function
});



// Attach fetchPlaylists to button click
fetchPlaylistsButton.addEventListener("click", fetchPlaylists);

// Generate frequency bars for background animation
const barContainer = document.getElementById("frequency-bars");
const barCount = 50;

for (let i = 0; i < barCount; i++) {
    const bar = document.createElement("div");
    bar.classList.add("bar");
    bar.style.setProperty("--i", i);
    barContainer.appendChild(bar);
}

// Update progress bar dynamically based on playback state
  // Update the progress bar and labels every second
// setInterval(() => {
//   if (player) {
//       player.getCurrentState().then((state) => {
//           if (state) {
//               const currentPosition = state.position / 1000; // Current position in seconds
//               const duration = state.duration / 1000; // Total duration in seconds
//               const progressPercent = (currentPosition / duration) * 100;

//               // Update the progress bar's width
//               const progressBar = document.getElementById("progress-bar");
//               progressBar.style.width = `${progressPercent}%`;

//               // Update time labels
//               document.getElementById("current-time").textContent = formatTime(currentPosition);
//               document.getElementById("duration-time").textContent = formatTime(duration);
//           } else {
//               console.warn("No state returned by Spotify Player");
//           }
//       }).catch((err) => {
//           console.error("Error fetching player state:", err);
//       });
//   } else {
//       console.warn("Player not initialized yet");
//   }
// }, 1000); // Run every second

//---------------updated one------
setInterval(() => {
  if (player) {
      player.getCurrentState()
          .then((state) => {
              if (state) {
                  const currentPosition = state.position / 1000;
                  const duration = state.duration / 1000;
                  const progressPercent = (currentPosition / duration) * 100;

                  progressBar.style.width = `${progressPercent}%`;
                  currentTimeElement.textContent = formatTime(currentPosition);
                  durationTimeElement.textContent = formatTime(duration);
              } else {
                  console.warn("No state returned by Spotify Player. Playback might be paused.");
              }
          })
          .catch((err) => console.error("Error fetching player state:", err));
  }
}, 1000);



// Handle user input on progress bar
progressBar.addEventListener("input", (e) => {
  const seekPosition = (e.target.value / 100) * player.state.duration;
  player.seek(seekPosition).then(() => {
      console.log(`Seeked to position: ${seekPosition}`);
  });
});

// Start syncing the progress bar when playback begins
player.addListener("player_state_changed", (state) => {
  if (state) {
      isPlaying = !state.paused;
      if (isPlaying) {
          syncProgressBar();
      }
  }
});
