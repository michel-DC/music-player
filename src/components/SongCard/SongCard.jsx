import React, { useContext, useEffect, useState } from "react";
import "./SongCard.css";
import { TbMusicPlus } from "react-icons/tb";
import { AiFillPlayCircle } from "react-icons/ai";
import { useSubscription, useMutation } from "@apollo/client";
import { SongContext } from "../../context/context";
import { GET_SONGS } from "../../utils/subscription";
import { ADD_OR_REMOVE_FROM_QUEUE } from "../../utils/mutations";

export default function SongCard() {
  const { data } = useSubscription(GET_SONGS);

  return (
    <div>
      {data?.Music?.map((song) => (
        <Song song={song} key={song.ID} />
      ))}
    </div>
  );
}

function Song({ song }) {
  if (!song) return null;

  const { Title, Thumbnail, Artist, ID } = song;
  const { state, dispatch } = useContext(SongContext);
  const [currentSongSelected, setCurrentSongSelected] = useState(false);

  useEffect(() => {
    setCurrentSongSelected(state.isPlaying && ID === state.song?.ID);
  }, [state.isPlaying, state.song, ID]);

  function handleTogglePlay() {
    dispatch({ type: "SET_SONG", payload: { song } });
    dispatch({ type: state.isPlaying ? "PAUSE_SONG" : "PLAY_SONG" });
  }

  const [addOrRemoveFromQueue] = useMutation(ADD_OR_REMOVE_FROM_QUEUE, {
    onCompleted: (data) => {
      if (data?.addOrRemoveFromQueue) {
        localStorage.setItem(
          "queue",
          JSON.stringify(data.addOrRemoveFromQueue)
        );
      }
    },
  });

  const handleAddOrRemoveFromQueue = () => {
    addOrRemoveFromQueue({
      variables: {
        input: { ...song, __typename: "Song" },
      },
    });
  };

  return (
    <div
      className={`container-border-box ${
        currentSongSelected ? "selected" : ""
      }`}
    >
      <section className="playlist-row">
        <div className="playlist-container">
          <img src={Thumbnail} alt={`Thumbnail of ${Title}`} />
          <div className="playlist-info">
            <h1>{Title}</h1>
            <h2>{Artist}</h2>
          </div>
        </div>
        <div className="playlist-edit">
          <AiFillPlayCircle
            className="playlist-playbtn"
            onClick={handleTogglePlay}
            style={{ fontSize: "2rem" }}
          />
          <TbMusicPlus
            className="playlist-addbtn"
            onClick={handleAddOrRemoveFromQueue}
            style={{ fontSize: "2rem" }}
          />
        </div>
      </section>
    </div>
  );
}
