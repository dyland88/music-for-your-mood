import csvParser from "csv-parser";
import fetch from "node-fetch";
import * as stream from "stream";

interface TrackData {
  id: string;
  name: string;
  artists: string[];
  instrumentalness: number;
  energyL: number;
  valence: number;
}

export interface PlaylistItem {
  title: string;
  artists: string[];
}

interface UserPreferences {
  focused: number;
  energy: number;
  happiness: number;
}

async function loadDataset(): Promise<TrackData[]> {
  const response = await fetch("./dataset.csv");
  const csvData = await response.text();
  const tracks: TrackData[] = [];
  const readable = stream.Readable.from([csvData]);

  return new Promise<TrackData[]>((resolve, reject) => {
    readable
      .pipe(csvParser())
      .on("data", (row) => {
        try {
          const track: TrackData = {
            id: row["id"],
            name: row["name"],
            artists: (0, eval)("(" + row["artists"] + ")"),
            instrumentalness: parseFloat(row["instrumentalness"]),
            energyL: parseFloat(row["energy"]),
            valence: parseFloat(row["valence"]),
          };
          tracks.push(track);
        } catch (e) {
          console.log(e);
        }
      })
      .on("end", () => {
        resolve(tracks);
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

function calculateScore(track: TrackData, preferences: UserPreferences) {
  let score = 0;
  score += Math.abs(1 - track.instrumentalness - preferences.focused / 100.0);
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

// store tracks outside the function to cache it
let tracks: TrackData[] | null = null;

export async function generatePlaylist(
  energy: number,
  happiness: number,
  focused: number
): Promise<PlaylistItem[]> {
  if (!tracks) {
    tracks = await loadDataset();
  }
  const preferences: UserPreferences = {
    energy,
    happiness,
    focused,
  };
  const recommendedTracks = mergeSort(tracks, preferences).slice(0, 20);
  const playlistItems = recommendedTracks.map((track) => ({
    title: track.name,
    artists: track.artists,
  }));

  return playlistItems;
}
