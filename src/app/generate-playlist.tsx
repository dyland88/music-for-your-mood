import SpotifyWebApi from "spotify-web-api-node";

const spotifyApi = new SpotifyWebApi({
  clientId: 'your_client_id',
  clientSecret: 'your_client_secret',
});

async function authenticate() {
  const data = await spotifyApi.clientCredentialsGrant();
  spotifyApi.setAccessToken(data.body['access_token']);
}

async function fetchTracks(): Promise<string[]> {
  let trackIds: string[] = [];
  let offset = 0;
  const limit = 50; // Max limit per request

  while (trackIds.length < 100000) {
    const data = await spotifyApi.searchTracks('a', {
      limit,
      offset,
      market: 'US',
    });

    const tracks = data.body.tracks?.items || [];
    trackIds.push(...tracks.map((track) => track.id));

    if (tracks.length < limit) {
      break; // No more tracks to fetch
    }

    offset += limit;
  }

  return trackIds.slice(0, 100000); // Ensure we have exactly 100,000 tracks
}

async function fetchTrackFeatures(trackIds: string[]): Promise<any[]> {
  const features: any[] = [];
  const batchSize = 100;

  for (let i = 0; i < trackIds.length; i += batchSize) {
    const batchIds = trackIds.slice(i, i + batchSize);
    const data = await spotifyApi.getAudioFeaturesForTracks(batchIds);
    features.push(...(data.body.audio_features || []));
  }

  return features;
}

export interface PlaylistItem {
  title: string;
  artists: string[];
  imageURL: string;
}

function mergeSort(
  array: TrackFeature[],
  preferences: UserPreferences
): TrackFeature[] {
  if (array.length <= 1) {
    return array;
  }

  const middle = Math.floor(array.length / 2);
  const left = mergeSort(array.slice(0, middle), preferences);
  const right = mergeSort(array.slice(middle), preferences);

  return merge(left, right, preferences);
}

function merge(
  left: TrackFeature[],
  right: TrackFeature[],
  preferences: UserPreferences
): TrackFeature[] {
  const result: TrackFeature[] = [];
  let indexLeft = 0;
  let indexRight = 0;

  while (indexLeft < left.length && indexRight < right.length) {
    const scoreLeft = calculateScore(left[indexLeft], preferences);
    const scoreRight = calculateScore(right[indexRight], preferences);

    if (scoreLeft <= scoreRight) {
      result.push(left[indexLeft]);
      indexLeft++;
    } else {
      result.push(right[indexRight]);
      indexRight++;
    }
  }

  return result
    .concat(left.slice(indexLeft))
    .concat(right.slice(indexRight));
}

interface TrackFeature {
  id: string;
  liveness: number;
  energy: number;
  valence: number;
  // Include other features as needed
}

interface UserPreferences {
  loneliness: number;
  energy: number;
  happiness: number;
}

function calculateScore(track: TrackFeature, preferences: UserPreferences)
{
  let score = 0;
  score += Math.abs(track.liveness - preferences.loneliness);
  score += Math.abs(track.energy - preferences.energy);
  score += Math.abs(track.valence - preferences.happiness);

  return score;
}

async function convertToPlaylistItems(tracks: TrackFeature[]): Promise<PlaylistItem[]> {
  const trackIds = tracks.map((track) => track.id);
  const batchSize = 50; // Spotify API allows up to 50 tracks per request
  const playlistItems: PlaylistItem[] = [];

  for (let i = 0; i < trackIds.length; i += batchSize) {
    const batchIds = trackIds.slice(i, i + batchSize);
    const data = await spotifyApi.getTracks(batchIds);

    data.body.tracks.forEach((track) => {
      playlistItems.push({
        title: track.name,
        artists: track.artists.map((artist) => artist.name),
        imageURL: track.album.images[0]?.url || '',
      });
    });
  }

  return playlistItems;
}

export async function generatePlaylist(
  energy: number,
  happiness: number,
  loneliness: number
): Promise<PlaylistItem[]> {
  await authenticate();
  const trackIds = await fetchTracks();
  const trackFeatures = await fetchTrackFeatures(trackIds);
  const sortedTracks = mergeSort(trackFeatures, {energy, happiness, loneliness})
  const recommendedTracks = sortedTracks.slice(0, 15);
  return convertToPlaylistItems(recommendedTracks);
}