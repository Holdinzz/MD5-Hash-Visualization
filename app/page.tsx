"use client";

import md5 from "@/assets/md5";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import React, { useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [stage1, setStage1] = useState<string[][]>([]);
  const [stage2, setStage2] = useState<{
    round: number;
    state: { A: string; B: string; C: string; D: string }[];
  }>({ round: 0, state: [] });
  const [stage3, setStage3] = useState<{
    working: { A: string; B: string; C: string; D: string };
    saved: { AA: string; BB: string; CC: string; DD: string };
    final: string;
  }>({
    working: { A: "", B: "", C: "", D: "" },
    saved: { AA: "", BB: "", CC: "", DD: "" },
    final: "",
  });
  const [currentStage, setCurrentStage] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [hoveredPopover, setHoveredPopover] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newInput = e.target.value;
    setInput(newInput);

    // Clear all states if input is empty
    if (!newInput) {
      setStage1([]);
      setStage2({ round: 0, state: [] });
      setStage3({
        working: { A: "", B: "", C: "", D: "" },
        saved: { AA: "", BB: "", CC: "", DD: "" },
        final: "",
      });
      setCurrentStage(0);
      setIsCalculating(false);
      return;
    }

    // Clear previous results
    setStage1([]);
    setStage2({ round: 0, state: [] });
    setStage3({
      working: { A: "", B: "", C: "", D: "" },
      saved: { AA: "", BB: "", CC: "", DD: "" },
      final: "",
    });
    setCurrentStage(0);
    setIsCalculating(false);
  };

  const handleNextStage = () => {
    if (!input) return;

    setIsCalculating(true);
    setCurrentStage((prev) => prev + 1);

    // Run MD5 with state setters based on current stage
    md5(input, {
      setStage1: (value) => {
        if (currentStage >= 0) setStage1(value);
      },
      setStage2: (value) => {
        if (currentStage >= 1) setStage2(value);
      },
      setStage3: (value: {
        working: { A: string; B: string; C: string; D: string };
        saved: { AA: string; BB: string; CC: string; DD: string };
        final: string;
      }) => {
        if (currentStage >= 2) setStage3(value);
      },
    });
  };

  return (
    <div className="flex flex-col items-center justify-items-center min-h-screen p-8 pb-10 gap-15 sm:p-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-sm">
      <div className="*:not-first:mt-2 w-[70%]">
        <div className="flex rounded-md shadow-sm gap-2 bg-gray-800/80 backdrop-blur-sm p-1 border border-gray-700">
          <Input
            className="flex-1 shadow-none focus-visible:z-10 bg-gray-800 text-white border-gray-700"
            placeholder="Enter text to generate MD5 hash"
            type="text"
            value={input}
            onChange={handleInputChange}
          />
          <div className="flex gap-2">
            <Button
              onClick={handleNextStage}
              disabled={!input || currentStage >= 3}
              className="whitespace-nowrap cursor-pointer bg-blue-500 hover:bg-blue-600 text-white"
            >
              {currentStage === 0
                ? "Start"
                : currentStage === 1
                ? "Next Stage"
                : currentStage === 2
                ? "Final Stage"
                : "Complete"}
            </Button>
            <Button
              onClick={() => {
                setCurrentStage(3);
                md5(input, {
                  setStage1,
                  setStage2,
                  setStage3: (value: {
                    working: { A: string; B: string; C: string; D: string };
                    saved: { AA: string; BB: string; CC: string; DD: string };
                    final: string;
                  }) => {
                    setStage3(value);
                  },
                });
              }}
              disabled={!input}
              variant="secondary"
              className="whitespace-nowrap cursor-pointer bg-purple-500 hover:bg-purple-600 text-white"
            >
              Run All
            </Button>
          </div>
        </div>
      </div>
      {/* Results Display */}
      {(stage1.length > 0 || stage2.state.length > 0 || stage3.final) && (
        <div className="grid grid-rows-[auto_1fr_auto] gap-4 w-full">
          {currentStage >= 1 && (
            <div className="bg-gray-800/80 backdrop-blur-sm p-4 rounded-lg shadow-sm border border-blue-900">
              <h3 className="font-semibold mb-2 text-blue-400">
                Stage 1 - Padding:
              </h3>
              <div className="grid grid-cols-4 gap-4">
                {stage1.map((block, blockIndex) => (
                  <div
                    key={blockIndex}
                    className="font-mono text-xs whitespace-pre bg-gray-900/50 p-3 rounded-md text-gray-200"
                  >
                    {block.map((word, wordIndex) => (
                      <React.Fragment key={wordIndex}>
                        {wordIndex > 0 && wordIndex % 4 === 0 ? "\n" : ""}
                        <Popover
                          open={hoveredPopover === `${blockIndex}-${wordIndex}`}
                        >
                          <PopoverTrigger asChild>
                            <span
                              className={
                                blockIndex === stage1.length - 1 &&
                                wordIndex >= 64 - 8
                                  ? "text-green-400 font-medium"
                                  : ""
                              }
                              onMouseEnter={() =>
                                setHoveredPopover(`${blockIndex}-${wordIndex}`)
                              }
                              onMouseLeave={() => setHoveredPopover(null)}
                            >
                              {word + " "}
                            </span>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-2 text-[10px] duration-500">
                            <div className="font-mono">
                              Hex:{" "}
                              {parseInt(word, 2).toString(16).padStart(8, "0")}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </React.Fragment>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
          {currentStage >= 2 && (
            <div className="bg-gray-800/80 backdrop-blur-sm p-4 rounded-lg shadow-sm border border-purple-900">
              <h3 className="font-semibold mb-2 text-purple-400">
                Stage 2 - Block Processing:
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {Array.from(
                  { length: Math.ceil(stage2.state.length / 4) },
                  (_, blockIndex) => {
                    const rounds = stage2.state.slice(
                      blockIndex * 4,
                      (blockIndex + 1) * 4
                    );
                    return (
                      <div key={blockIndex} className="grid grid-cols-4 gap-4">
                        {rounds.map((state, roundIndex) => (
                          <div
                            key={roundIndex}
                            className="font-mono text-xs bg-gray-900/50 p-3 rounded-md text-gray-200"
                          >
                            <div className="text-xs text-purple-300 mb-2">
                              {roundIndex === 0
                                ? "F(x,y,z) = (x & y) | (~x & z)"
                                : roundIndex === 1
                                ? "G(x,y,z) = (x & z) | (y & ~z)"
                                : roundIndex === 2
                                ? "H(x,y,z) = x ^ y ^ z"
                                : "I(x,y,z) = y ^ (x | ~z)"}
                            </div>
                            <Popover
                              open={
                                hoveredPopover ===
                                `stage2-${blockIndex}-${roundIndex}-A`
                              }
                            >
                              <PopoverTrigger asChild>
                                <p
                                  className="whitespace-nowrap"
                                  onMouseEnter={() =>
                                    setHoveredPopover(
                                      `stage2-${blockIndex}-${roundIndex}-A`
                                    )
                                  }
                                  onMouseLeave={() => setHoveredPopover(null)}
                                >
                                  A {state.A}
                                </p>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-2 text-[10px] duration-500">
                                <div className="font-mono">
                                  Hex:{" "}
                                  {parseInt(state.A, 2)
                                    .toString(16)
                                    .padStart(8, "0")}
                                </div>
                              </PopoverContent>
                            </Popover>
                            <Popover
                              open={
                                hoveredPopover ===
                                `stage2-${blockIndex}-${roundIndex}-B`
                              }
                            >
                              <PopoverTrigger asChild>
                                <p
                                  className="whitespace-nowrap"
                                  onMouseEnter={() =>
                                    setHoveredPopover(
                                      `stage2-${blockIndex}-${roundIndex}-B`
                                    )
                                  }
                                  onMouseLeave={() => setHoveredPopover(null)}
                                >
                                  B {state.B}
                                </p>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-2 text-[10px] duration-500">
                                <div className="font-mono">
                                  Hex:{" "}
                                  {parseInt(state.B, 2)
                                    .toString(16)
                                    .padStart(8, "0")}
                                </div>
                              </PopoverContent>
                            </Popover>
                            <Popover
                              open={
                                hoveredPopover ===
                                `stage2-${blockIndex}-${roundIndex}-C`
                              }
                            >
                              <PopoverTrigger asChild>
                                <p
                                  className="whitespace-nowrap"
                                  onMouseEnter={() =>
                                    setHoveredPopover(
                                      `stage2-${blockIndex}-${roundIndex}-C`
                                    )
                                  }
                                  onMouseLeave={() => setHoveredPopover(null)}
                                >
                                  C {state.C}
                                </p>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-2 text-[10px] duration-500">
                                <div className="font-mono">
                                  Hex:{" "}
                                  {parseInt(state.C, 2)
                                    .toString(16)
                                    .padStart(8, "0")}
                                </div>
                              </PopoverContent>
                            </Popover>
                            <Popover
                              open={
                                hoveredPopover ===
                                `stage2-${blockIndex}-${roundIndex}-D`
                              }
                            >
                              <PopoverTrigger asChild>
                                <p
                                  className="whitespace-nowrap"
                                  onMouseEnter={() =>
                                    setHoveredPopover(
                                      `stage2-${blockIndex}-${roundIndex}-D`
                                    )
                                  }
                                  onMouseLeave={() => setHoveredPopover(null)}
                                >
                                  D {state.D}
                                </p>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-2 text-[10px] duration-500">
                                <div className="font-mono">
                                  Hex:{" "}
                                  {parseInt(state.D, 2)
                                    .toString(16)
                                    .padStart(8, "0")}
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                        ))}
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          )}
          {currentStage >= 3 && (
            <div className="bg-gray-800/80 backdrop-blur-sm p-4 rounded-lg shadow-sm border border-pink-900">
              <h3 className="font-semibold mb-2 text-pink-400">
                Stage 3 - State Update (Initial values += Block result):
              </h3>
              <div className="font-mono text-xs space-y-4">
                <div className="bg-gray-900/50 p-3 rounded-md text-gray-200">
                  <div className="space-y-4">
                    <div>
                      <p className="text-pink-300 mb-2">A += AA:</p>
                      <p>
                        {stage3.working.A} + {stage3.saved.AA} ={" "}
                        {(
                          (parseInt(stage3.working.A, 16) +
                            parseInt(stage3.saved.AA, 16)) >>>
                          0
                        )
                          .toString(16)
                          .padStart(8, "0")
                          .slice(-8)}
                      </p>
                    </div>
                    <div>
                      <p className="text-pink-300 mb-2">B += BB:</p>
                      <p>
                        {stage3.working.B} + {stage3.saved.BB} ={" "}
                        {(
                          (parseInt(stage3.working.B, 16) +
                            parseInt(stage3.saved.BB, 16)) >>>
                          0
                        )
                          .toString(16)
                          .padStart(8, "0")
                          .slice(-8)}
                      </p>
                    </div>
                    <div>
                      <p className="text-pink-300 mb-2">C += CC:</p>
                      <p>
                        {stage3.working.C} + {stage3.saved.CC} ={" "}
                        {(
                          (parseInt(stage3.working.C, 16) +
                            parseInt(stage3.saved.CC, 16)) >>>
                          0
                        )
                          .toString(16)
                          .padStart(8, "0")
                          .slice(-8)}
                      </p>
                    </div>
                    <div>
                      <p className="text-pink-300 mb-2">D += DD:</p>
                      <p>
                        {stage3.working.D} + {stage3.saved.DD} ={" "}
                        {(
                          (parseInt(stage3.working.D, 16) +
                            parseInt(stage3.saved.DD, 16)) >>>
                          0
                        )
                          .toString(16)
                          .padStart(8, "0")
                          .slice(-8)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-900/50 p-3 rounded-md text-gray-200 mt-4">
                  <p className="text-pink-300 mb-2">
                    Final Hash (Little Endian):
                  </p>
                  <p className="text-lg">{stage3.final}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
