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

export default function Home() {
  const [energy, setEnergy] = useState(50);
  const [mood, setMood] = useState(50);
  const [loneliness, setLoneliness] = useState(50);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  const generatePlaylist = () => {
    // Placeholder logic for generating recommendations
    const mockRecommendations = [
      "Song 1 - Artist A",
      "Song 2 - Artist B",
      "Song 3 - Artist C",
    ];
    setRecommendations(mockRecommendations);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="w-1/3 p-6 min-w-64">
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
              <h4>Mood</h4>
              <Slider value={[mood]} onValueChange={(v) => setMood(v[0])} />
              <p className="text-sm text-gray-500">Value: {mood}</p>
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
      <div className="w-2/3 p-6">
        <h1 className="font-bold text-xl">Recommended Songs</h1>
        {recommendations.length > 0 ? (
          <ul className="space-y-2">
            {recommendations.map((song, index) => (
              <li key={index} className="text-gray-700">
                <Card>{song}</Card>
              </li>
            ))}
          </ul>
        ) : (
          <Card>
            <CardContent>
              <p className="text-gray-500">
                No recommendations yet. Adjust preferences and hit Generate
                Playlist!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
