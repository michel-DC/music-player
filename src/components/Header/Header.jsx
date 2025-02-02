import { useState } from "react";
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
    setUserImage(e.target.value);
  };

  function openModal() {
    setIsOpen(!modalIsOpen);
    setInput("");
    setUserImage("");
  }

  const [input, setInput] = useState("");

  const handleInput = (e) => {
    e.preventDefault();
    const workingURL = ReactPlayer.canPlay(input);
    if (workingURL) {
      setIsOpen(true);
      setInputModal(false);
    } else {
      toast.error("URL invalide, saisissez un lien valide.");
    }
  };

  const [song, setSong] = useState(DEFAULT_SONG);

  const [addSong] = useMutation(ADD_SONG);

  const handleSongEdit = async ({ player }) => {
    try {
      let ourPlayer = player.player.player;
      let titleData;
      if (ourPlayer.getVideoData) {
        titleData = getYoutubeInfo(ourPlayer);
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
          Title: Title || null,
          Artist: Artist || null,
          Thumbnail: userImage || Thumbnail || null,
          URL: input || null,
        },
      });
      setSong(DEFAULT_SONG);
      setIsOpen(false);
      setInput("");
      toast.success("Chanson ajoutée !");
    } catch (err) {
      console.log(err);
      toast.error("Veuillez remplir correctement les champs.");
    }
  };

  const { Title, Artist, Thumbnail } = song;

  return (
    <>
      <header className="flex items-center justify-between h-16 bg-gray-900 px-5 shadow-md border-b border-gray-800">
        <PiMusicNotesBold className="text-white text-2xl cursor-pointer" />
        <form onSubmit={handleInput} className="hidden md:flex">
          <input
            className="bg-gray-800 text-white px-4 py-2 rounded-full w-72 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setInput(e.target.value)}
            value={input}
            placeholder="Ajouter un lien Youtube ou SoundCloud"
            type="text"
          />
        </form>
        <div>
          <TbInputSearch
            className="text-white text-2xl cursor-pointer md:hidden"
            onClick={() => setInputModal(true)}
          />
          <Modal
            isOpen={inputModal}
            onRequestClose={() => setInputModal(false)}
            contentLabel="Ajouter un lien"
          >
            <form onSubmit={handleInput} className="flex flex-col p-5">
              <input
                onChange={(e) => setInput(e.target.value)}
                value={input}
                placeholder="Ajouter un lien"
                type="text"
                className="bg-gray-700 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </form>
          </Modal>
        </div>
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={openModal}
          contentLabel="Ajouter une musique"
        >
          <div className="bg-gray-800 p-6 rounded-lg flex flex-col items-center space-y-4 w-80 md:w-[60vw]">
            <ReactPlayer url={input} hidden onReady={handleSongEdit} />
            <img
              src={userImage || Thumbnail}
              alt={Artist}
              className="w-full rounded-lg"
            />
            <label className="text-white text-lg">
              *Choisissez une couverture*
            </label>
            <input
              type="text"
              placeholder="Insérez le lien de l'image"
              onChange={handleImageChange}
              className="bg-gray-700 text-white px-4 py-2 rounded-md w-full focus:outline-none"
            />
            <input
              value={Artist}
              onChange={handleInputChange}
              placeholder="Nom de l'artiste"
              name="Artist"
              className="bg-gray-700 text-white px-4 py-2 rounded-md w-full focus:outline-none"
              required
            />
            <input
              value={Title}
              onChange={handleInputChange}
              placeholder="Nom de la musique"
              name="Title"
              className="bg-gray-700 text-white px-4 py-2 rounded-md w-full focus:outline-none"
              required
            />
            <button
              type="submit"
              onClick={() => addSongToDB(song)}
              className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition-all"
            >
              Ajouter
            </button>
          </div>
        </Modal>
      </header>
    </>
  );
}

export default Header;
