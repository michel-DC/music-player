import { useContext, useRef, useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { GET_QUEUED_SONGS } from "../../utils/queries";
import { SongContext } from "../../context/Context";
import "./PlayingNext.css";
import { BsFillPlayFill } from "react-icons/bs";
import { HiPause } from "react-icons/hi2";
import { TbChevronsLeft, TbChevronsRight } from "react-icons/tb";
import ReactPlayer from "react-player";

function PlayingNext() {
  const { state, dispatch } = useContext(SongContext);
  const [sliderValue, setSliderValue] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [currentSongIndex, setCurrentSongIndex] = useState(-1);
  const reactPlayerRef = useRef();
  const { data, loading, error } = useQuery(GET_QUEUED_SONGS);

  // Handle play/pause toggle
  function handleTogglePlay() {
    dispatch(state.isPlaying ? { type: "PAUSE_SONG" } : { type: "PLAY_SONG" });
  }

  // Handle slider changes
  function handleProgressChange(event) {
    const value = parseFloat(event.target.value);
    setSliderValue(value);
  }

  function handleMouseDown() {
    setIsSliding(true);
  }

  function handleMouseUp() {
    setIsSliding(false);
    reactPlayerRef.current.seekTo(sliderValue);
  }

  // Format duration into HH:MM:SS
  function formatDuration(seconds) {
    return new Date(seconds * 1000).toISOString().substring(11, 19);
  }

  // Navigate to the next song
  function handleNextSong() {
    if (currentSongIndex >= 0 && currentSongIndex < data?.queue.length - 1) {
      const nextSong = data.queue[currentSongIndex + 1];
      dispatch({ type: "SET_SONG", payload: { song: nextSong } });
    }
  }

  // Navigate to the previous song
  function handlePrevSong() {
    if (currentSongIndex > 0) {
      const prevSong = data.queue[currentSongIndex - 1];
      dispatch({ type: "SET_SONG", payload: { song: prevSong } });
    }
  }

  // Update the current song index whenever the queue or current song changes
  useEffect(() => {
    if (data?.queue && state.song) {
      const songIndex = data.queue.findIndex(
        (song) => song.ID === state.song.ID
      );
      setCurrentSongIndex(songIndex);
    }
  }, [data?.queue, state.song]);

  // Auto-play the next song when the current song ends
  useEffect(() => {
    if (sliderValue >= 1) {
      handleNextSong();
    }
  }, [sliderValue, handleNextSong]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!state.song) return <p>No song is currently playing.</p>;

  return (
    <div className="playing-container">
      <img
        src={state.song.Thumbnail}
        alt="Current song"
        className={state.isPlaying ? "rotating-disc" : ""}
      />
      <section className="playing-song-info">
        <h4>{state.song.Title}</h4>
        <p>{state.song.Artist}</p>
      </section>
      <section className="controls">
        <TbChevronsLeft className="playing-btns" onClick={handlePrevSong} />
        {state.isPlaying ? (
          <HiPause onClick={handleTogglePlay} className="playing-btns" />
        ) : (
          <BsFillPlayFill onClick={handleTogglePlay} className="playing-btns" />
        )}
        <TbChevronsRight className="playing-btns" onClick={handleNextSong} />
      </section>
      <input
        value={sliderValue}
        type="range"
        min={0}
        max={1}
        step={0.01}
        onChange={handleProgressChange}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        className="music-slider"
      />
      <p className="seconds-bar">{formatDuration(playedSeconds)}</p>
      <ReactPlayer
        url={state.song.URL}
        playing={state.isPlaying}
        ref={reactPlayerRef}
        onProgress={({ played, playedSeconds }) => {
          if (!isSliding) {
            setSliderValue(played);
            setPlayedSeconds(playedSeconds);
          }
        }}
        onEnded={handleNextSong}
        hidden
      />
    </div>
  );
}

export default PlayingNext;
