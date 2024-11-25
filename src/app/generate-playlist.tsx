import csvParser from "csv-parser";
import fetch from 'node-fetch'
import * as stream from 'stream'

interface TrackData {
  id: string;
  name: string;
  artists: string[];
  album: string;
  liveness: number;
  energyL: number;
  valence: number;
}

export interface PlaylistItem {
  title: string;
  artists: string[];
}

interface UserPreferences {
  loneliness: number;
  energy: number;
  happiness: number;
}

function loadDataset(): Promise<TrackData[]> {
  return new Promise((resolve, reject) => {
    fetch('./spotify_tracks_dataset.csv')
      .then((response) => response.text())
      .then((csvData) => {
        const tracks: TrackData[] = [];
        const readable = stream.Readable.from([csvData]);

        readable
          .pipe(csvParser())
          .on('data', (row) => {
            const track: TrackData = {
              id: row['id'],
              name: row['name'],
              artists: row['artists'].split(';'),
              album: row['album'],
              liveness: parseFloat(row['liveness']),
              energyL: parseFloat(row['energy']),
              valence: parseFloat(row['valence']),
            };

            tracks.push(track);
          })
      });
  });
}

function calculateScore(track: TrackData, preferences: UserPreferences) {
  let score = 0;
  score += Math.abs(track.liveness - preferences.loneliness / 100.0);
  score += Math.abs(track.energyL - preferences.energy / 100.0);
  score += Math.abs(track.valence - preferences.happiness / 100.0);

  return score;
}

function merge(
  left: TrackData[],
  right: TrackData[],
  preferences: UserPreferences
): TrackData[] {
  const result: TrackData[] = [];
  let indexLeft = 0;
  let indexRight = 0;

  // Compare elements from left and right arrays and merge them in sorted order
  while (indexLeft < left.length && indexRight < right.length) {
    const leftScore = calculateScore(left[indexLeft], preferences);
    const rightScore = calculateScore(right[indexRight], preferences);

    if (leftScore <= rightScore) {
      result.push(left[indexLeft]);
      indexLeft++;
    } else {
      result.push(right[indexRight]);
      indexRight++;
    }
  }

  // Concatenate any remaining elements
  return result.concat(left.slice(indexLeft)).concat(right.slice(indexRight));
}

function mergeSort(
  array: TrackData[],
  preferences: UserPreferences
): TrackData[] {
  if (array.length <= 1) {
    return array;
  }

  // Divide the array into two halves
  const middle = Math.floor(array.length / 2);
  const left = array.slice(0, middle);
  const right = array.slice(middle);

  // Recursively sort the left and right halves and merge them
  return merge(
    mergeSort(left, preferences),
    mergeSort(right, preferences),
    preferences
  );
}

export async function generatePlaylist(
  energy: number,
  happiness: number,
  loneliness: number
): Promise<PlaylistItem[]> {
  const tracks = await loadDataset();
  const preferences: UserPreferences = {
    energy,
    happiness,
    loneliness,
  };
  const recommendedTracks = mergeSort(tracks, preferences).slice(0, 20);

  const playlistItems = recommendedTracks.map((track) => ({
    title: track.name,
    artists: track.artists,
  }));

  return playlistItems;
}
