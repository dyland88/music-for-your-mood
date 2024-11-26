"use client";
import React, { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { generatePlaylist, PlaylistItem } from "./generate-playlist";

export default function Home() {
  const [energy, setEnergy] = useState(50);
  const [happiness, setHappiness] = useState(50);
  const [loneliness, setLoneliness] = useState(50);
  const [recommendations, setRecommendations] = useState<PlaylistItem[]>([]);
  /* eslint-disable */
  const [sortingAlgorithm, setSortingAlgorithm] = React.useState("quick");
  /* eslint-enable */

  async function handleSubmit(): Promise<void> {
    const playlist = await generatePlaylist(energy, happiness, loneliness);
    console.log(playlist);
    setRecommendations(playlist);
  }

  return (
    <div className="min-w-full flex justify-center">
      {/* Left Panel */}
      <div className="w-80 p-6">
        <Card>
          <CardHeader>
            <CardTitle>How Are You Feeling?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4>Energy</h4>
              <Slider value={[energy]} onValueChange={(v) => setEnergy(v[0])} />
              <p className="text-sm text-gray-500">Value: {energy}</p>
            </div>
            <div>
              <h4>Happiness</h4>
              <Slider
                value={[happiness]}
                onValueChange={(v) => setHappiness(v[0])}
              />
              <p className="text-sm text-gray-500">Value: {happiness}</p>
            </div>
            <div>
              <h4>Focused</h4>
              <Slider
                value={[loneliness]}
                onValueChange={(v) => setLoneliness(v[0])}
              />
              <p className="text-sm text-gray-500">Value: {loneliness}</p>
            </div>
            <RadioGroup
              defaultValue="quick"
              onValueChange={(value) => setSortingAlgorithm(value)}
            >
              <p className=" font-bold">Sorting Algorithm</p>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="quick" id="r1" />
                <Label htmlFor="r1">Quick Sort</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="merge" id="r2" />
                <Label htmlFor="r2">Merge Sort</Label>
              </div>
            </RadioGroup>
            <Button onClick={handleSubmit}>Generate Playlist</Button>
          </CardContent>
        </Card>
      </div>

      {/* Right Panel */}
      <div className="flex flex-col p-6 w-3/5 max-w-[800px]">
        <h1 className="font-bold text-xl mb-5">Recommended Songs</h1>
        {recommendations.length > 0 ? (
          <ul className="space-y-2">
            {recommendations.map((song, index) => (
              <li key={index} className="text-gray-700 w-full">
                <Card>
                  <div className="flex flex-row gap-5 p-3 align-middle overflow-hidden">
                    <p className="text-gray-400 flex items-center">
                      {index + 1}
                    </p>
                    <div className="flex flex-col p-0 m-0">
                      <p className="font-bold">{song.title}</p>
                      {song.artists.map((artist, index) => (
                        <p className=" text-gray-400" key={index}>
                          {artist}
                        </p>
                      ))}
                      <iframe
                      src={song.link}
                      width="300"
                      height="80"
                      frameBorder="0"
                      allow="encrypted-media"
                      style={{ border: "none", overflow: "hidden" }}
                      className="mt-2"
                    ></iframe>
                    </div>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        ) : (
          <Card>
            <p className="text-gray-500 p-6">
              No recommendations yet. Adjust preferences and hit Generate
              Playlist!
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
