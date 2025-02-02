import { createContext } from "react";

export const SongContext = createContext({
  song: {
    ID: "unknow",
    Title: "Rapture",
    Artist: "Tom Walker",
    Thumbnail: "src/assets/norway-sky.jpg",
    URL: "https://www.youtube.com/watch?v=vXIRFVnApZM",
    Duration: 309,
  },
});
