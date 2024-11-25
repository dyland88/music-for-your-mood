"use client";
import React, { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { generatePlaylist } from "./generate-playlist";

export default function Home() {
  const [energy, setEnergy] = useState(50);
  const [happiness, setHappiness] = useState(50);
  const [loneliness, setLoneliness] = useState(50);
  const [recommendations, setRecommendations] = useState<
    { title: string; artist: string }[]
  >([]);

  const generatePlaylist = () => {
    setRecommendations([
      {
        title: "Not Like us",
        artist: "KSI",
      },
      { title: "Thick of it", artist: "KSI" },
      { title: "Thick of it", artist: "KSI" },
    ]);
  };

  return (
    <div className=" min-w-full flex justify-center">
      {/* Left Panel */}
      <div className="  w-80 p-6 ">
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
              <h4>Loneliness</h4>
              <Slider
                value={[loneliness]}
                onValueChange={(v) => setLoneliness(v[0])}
              />
              <p className="text-sm text-gray-500">Value: {loneliness}</p>
            </div>
            <Button onClick={generatePlaylist}>Generate Playlist</Button>
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
                    <p className="text-gray-400 flex items-center">{index}</p>
                    <div className="flex flex-col">
                      <p className="font-bold">{song.title}</p>
                      <p className=" text-gray-400">{song.artist}</p>
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
