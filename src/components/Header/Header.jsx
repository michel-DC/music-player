import { useState } from "react";
import "./Header.css";
import { toast } from "react-toastify";
import { PiMusicNotesBold } from "react-icons/pi";
import ReactPlayer from "react-player";
import Modal from "react-modal";
import { useMutation } from "@apollo/client";
import { ADD_SONG } from "../../utils/mutations";
import { TbInputSearch } from "react-icons/tb";

const DEFAULT_SONG = {
  Duration: 0,
  Title: "",
  Artist: "",
  Thumbnail: "",
};

function Header() {
  Modal.setAppElement(document.getElementById("root"));

  const [modalIsOpen, setIsOpen] = useState(false);
  const [inputModal, setInputModal] = useState(false);
  const [userImage, setUserImage] = useState("");
  const handleImageChange = (e) => {
    const file = e.target.value;
    setUserImage(file);
  };

  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      borderRadius: "24px",
      backgroundColor: "#1b2328",
      height: "auto",
      width: inputModal && "56vw",
    },
    overlay: {
      backgroundColor: "rgba(0,0,0,0.6)",
    },
  };

  function openModal() {
    setIsOpen(!modalIsOpen);
    setInput("");
    setUserImage("");
  }

  //* code for input

  const [input, setInput] = useState("");

  const handleInput = (e) => {
    e.preventDefault();
    const workingURL = ReactPlayer.canPlay(input);
    if (workingURL) {
      setIsOpen(true);
      setInputModal(false);
      // setInput("")
    } else {
      toast.error("URL invalide, saisissez un lien valide.", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    }
  };

  //* song code
  const [song, setSong] = useState({
    Duration: 0,
    Title: "",
    Artist: "",
    Thumbnail: "",
  });

  const [addSong] = useMutation(ADD_SONG);

  const handleSongEdit = async ({ player }) => {
    try {
      let ourPlayer = player.player.player;
      let titleData;
      if (ourPlayer.getVideoData) {
        titleData = getYoutubeInfo(ourPlayer);
        console.log(titleData);
      } else if (ourPlayer.getCurrentSound) {
        titleData = await getSoundCloudInfo(ourPlayer);
      }
      setSong({ ...titleData, input });
    } catch (err) {
      console.log(err);
    }
  };

  const getYoutubeInfo = (player) => {
    const duration = player.getDuration();
    const { author, title, video_id } = player.getVideoData();
    const thumbnail = `http://img.youtube.com/vi/${video_id}/0.jpg`;
    return {
      Duration: duration,
      Title: title,
      Artist: author,
      Thumbnail: thumbnail,
    };
  };

  const getSoundCloudInfo = (player) => {
    return new Promise((resolve) => {
      player.getCurrentSound((songData) => {
        console.log(songData);
        if (songData) {
          resolve({
            Duration: Number(songData.duration / 1000),
            Title: songData.title,
            Artist: songData.user.username,
            Thumbnail: songData.artwork_url.replace("-larger", "-t500x500"),
          });
        }
      });
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSong((prevSong) => ({ ...prevSong, [name]: value }));
  };

  const addSongToDB = async (song) => {
    try {
      const { Artist, Title, Thumbnail, Duration, input } = song;
      await addSong({
        variables: {
          Duration,
          Title: Title.length > 0 ? Title : null,
          Artist: Artist.length > 0 ? Artist : null,
          Thumbnail: userImage
            ? userImage
            : Thumbnail.length > 0
            ? Thumbnail
            : null,
          URL: input.length > 0 ? input : null,
        },
      });
      setSong(DEFAULT_SONG);
      setIsOpen(false);
      setInput("");
      toast.success("Song Added :)", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    } catch (err) {
      console.log(err);
      toast.error("Veuillez fournir les valeurs requises correctement", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    }
  };

  const { Title, Artist, Thumbnail } = song;

  return (
    <>
      <header>
        <PiMusicNotesBold className="music-icon" />
        <form onSubmit={handleInput}>
          <input
            className="input-search"
            onChange={(e) => setInput(e.target.value)}
            value={input}
            placeholder="Ajouter un lien Youtube ou SoundCloud"
            type="text"
          />
        </form>
        <div>
          <TbInputSearch
            className="search-icon"
            onClick={() => setInputModal(true)}
          />
          <Modal
            isOpen={inputModal}
            onRequestClose={() => setInputModal(false)}
            style={customStyles}
            contentLabel="URL pour ajouter une musique"
          >
            <form onSubmit={handleInput} className="mobile-modal">
              <input
                onChange={(e) => setInput(e.target.value)}
                value={input}
                placeholder="Ajouter un lien Youtube ou SoundCloud"
                type="text"
              />
            </form>
          </Modal>
        </div>
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={openModal}
          style={customStyles}
          contentLabel="Ajouter une musique"
        >
          <div className="modal-container">
            <ReactPlayer url={input} hidden onReady={handleSongEdit} />
            <img src={userImage ? userImage : Thumbnail} alt={Artist} />
            <label>*Choisissez une couverture pour votre musique*</label>
            <input
              type="text"
              placeholder="Inserez le lien de l'image"
              onChange={handleImageChange}
            />
            <input
              value={Artist}
              onChange={handleInputChange}
              placeholder="Nom de l'artiste"
              name="Artist"
              label="artist"
              className="custom-input"
              required
            />
            <input
              value={Title}
              onChange={handleInputChange}
              placeholder="Nom de la musique"
              name="Title"
              label="title"
              className="custom-input"
              required
            />
            <button type="submit" onClick={() => addSongToDB(song)}>
              Ajouter
            </button>
          </div>
        </Modal>
      </header>
    </>
  );
}

export default Header;
