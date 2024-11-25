import * as fs from "fs";
import * as path from "path";
import csvParser from "csv-parser";

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
    // Path to the dataset file
    const datasetPath = path.join(__dirname, "spotify_tracks_dataset.csv");
    const tracks: TrackData[] = [];

    // Create a read stream for the CSV file
    fs.createReadStream(datasetPath)
      // Pipe the read stream into the CSV parser
      .pipe(csvParser())
      // On each data event, process a row
      .on("data", (row) => {
        // Parse the CSV row into a TrackData object
        const track: TrackData = {
          id: row["id"],
          name: row["name"],
          artists: row["artists"].split(";"),
          album: row["album"],
          liveness: parseFloat(row["liveness"]),
          energyL: parseFloat(row["energy"]),
          valence: parseFloat(row["valence"]),
        };

        tracks.push(track);
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
