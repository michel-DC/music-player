import { gql } from "@apollo/client";

// Récupérer toutes les chansons depuis le serveur
export const GET_ALL_SONGS = gql`
  query GetAllSongs {
    Music(order_by: { CreatedAt: desc }) {
      Artist
      CreatedAt
      Duration
      ID
      Thumbnail
      Title
      URL
    }
  }
`;

// Récupérer la file d'attente côté client
export const GET_QUEUED_SONGS = gql`
  query GetQueuedSongs {
    queue @client {
      Artist
      CreatedAt
      Duration
      ID
      Thumbnail
      Title
      URL
    }
  }
`;
