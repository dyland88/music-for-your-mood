"use client";
import React, { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { generatePlaylist, PlaylistItem } from "./generate-playlist";
import { motion } from "motion/react";

export default function Home() {
  const [energy, setEnergy] = useState(50);
  const [happiness, setHappiness] = useState(50);
  const [focused, setFocused] = useState(50);
  const [recommendations, setRecommendations] = useState<PlaylistItem[]>([]);
  /* eslint-disable */
  const [sortingAlgorithm, setSortingAlgorithm] = useState("quick");
  /* eslint-enable */
  const [loading, setLoading] = useState(false);
  const [loadedPlayers, setLoadedPlayers] = useState(
    Array(recommendations.length).fill(false)
  );
  const [timeElapsed, setTimeElapsed] = useState(-1);

  async function handleSubmit(): Promise<void> {
    setLoading(true);
    const { playlistItems: playlist, timeElapsed: sortTime } =
      await generatePlaylist(energy, happiness, focused, sortingAlgorithm);
    console.log(playlist);
    setRecommendations(playlist);
    setLoadedPlayers(Array(recommendations.length).fill(false));
    setLoading(false);
    setTimeElapsed(sortTime);
  }

  return (
    <div className="flex flex-col">
      <div className="min-w-full h-[3.5rem] bg-card flex justify-center font-bold text-xl items-center border-border border-b-[1px]">
        <h1>Music for Your Mood</h1>
      </div>
      <main className="min-w-full flex justify-center">
        {/* Left Panel */}
        <div className="w-80 p-6">
          <Card>
            <CardHeader>
              <CardTitle>How Are You Feeling?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4>Energy</h4>
                <Slider
                  value={[energy]}
                  onValueChange={(v) => setEnergy(v[0])}
                />
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
                  value={[focused]}
                  onValueChange={(v) => setFocused(v[0])}
                />
                <p className="text-sm text-gray-500">Value: {focused}</p>
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
              <motion.div
                whileHover={{
                  scale: 1.03,
                }}
                whileTap={{ scale: 0.95 }}
                className="w-[9rem]"
              >
                <Button onClick={handleSubmit}>
                  {loading ? "Loading..." : "Generate Playlist"}
                </Button>
              </motion.div>
              {timeElapsed != -1 ? (
                <p className=" font-medium">
                  {"Sort Time: " + Math.round(timeElapsed) + " ms"}
                </p>
              ) : null}
            </CardContent>
          </Card>
        </div>

        {/* Right Panel */}
        <div className="flex flex-col p-6 w-3/5 max-w-[800px] max-h-[calc(100vh-3.5rem)] overflow-y-auto">
          <h1 className="font-bold text-xl mb-5">Recommended Songs</h1>
          {recommendations.length > 0 ? (
            <div>
              <ul className="space-y-2">
                {recommendations.map((song, index) => (
                  <li key={index} className="text-gray-700 w-full">
                    <Card>
                      <div className="flex flex-row gap-5 p-3 align-middle overflow-hidden">
                        <p className="text-gray-400 flex items-center">
                          {index + 1}
                        </p>
                        <div className="flex flex-col p-0 m-0 gap-1">
                          <p className="font-bold">{song.title}</p>
                          <div className="gap-0 flex flex-col">
                            {song.artists.map((artist, index) => (
                              <p className=" text-gray-400" key={index}>
                                {artist}
                              </p>
                            ))}
                          </div>
                          {loadedPlayers[index] ? (
                            <iframe
                              src={song.link}
                              width="300"
                              height="80"
                              allow="encrypted-media"
                              style={{ border: "none", overflow: "hidden" }}
                              className="rounded-xl"
                            />
                          ) : (
                            <motion.div
                              whileHover={{
                                scale: 1.03,
                              }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                setLoadedPlayers((prev) => {
                                  const newState = [...prev];
                                  newState[index] = true;
                                  return newState;
                                });
                              }}
                              className="w-[300px] h-[80px] rounded-xl bg-accent flex items-center justify-center"
                            >
                              Play With Spotify
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </li>
                ))}
              </ul>
              <p className=" text-center mt-3 px-5">
                Made with 🍵 by Dylan Coben, Chris Oeltjen, and Austin VanLoon
              </p>
            </div>
          ) : (
            <Card>
              <p className="text-gray-500 p-6">
                No recommendations yet. Adjust preferences and hit Generate
                Playlist!
              </p>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
