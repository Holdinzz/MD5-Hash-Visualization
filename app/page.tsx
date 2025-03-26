"use client";

import md5 from "@/assets/md5";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    final: string;
  }>({ working: { A: "", B: "", C: "", D: "" }, final: "" });
  const [currentStage, setCurrentStage] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newInput = e.target.value;
    setInput(newInput);

    // Clear all states if input is empty
    if (!newInput) {
      setStage1([]);
      setStage2({ round: 0, state: [] });
      setStage3({ working: { A: "", B: "", C: "", D: "" }, final: "" });
      setCurrentStage(0);
      setIsCalculating(false);
      return;
    }

    // Clear previous results
    setStage1([]);
    setStage2({ round: 0, state: [] });
    setStage3({ working: { A: "", B: "", C: "", D: "" }, final: "" });
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
      setStage3: (value) => {
        if (currentStage >= 2) setStage3(value);
      },
    });
  };

  return (
    <div className="flex flex-col items-center justify-items-center min-h-screen p-8 pb-10 gap-15 sm:p-20">
      <div className="*:not-first:mt-2 w-[70%]">
        <div className="flex rounded-md shadow-xs gap-2">
          <Input
            className="flex-1 shadow-none focus-visible:z-10"
            placeholder="Enter text to generate MD5 hash"
            type="text"
            value={input}
            onChange={handleInputChange}
          />
          <div className="flex gap-2">
            <Button
              onClick={handleNextStage}
              disabled={!input || currentStage >= 3}
              className="whitespace-nowrap cursor-pointer"
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
                  setStage3,
                });
              }}
              disabled={!input}
              variant="secondary"
              className="whitespace-nowrap cursor-pointer"
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
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Stage 1 - Padding:</h3>
              <div className="grid grid-cols-4 gap-4">
                {stage1.map((block, blockIndex) => (
                  <div
                    key={blockIndex}
                    className="font-mono text-sm whitespace-pre"
                  >
                    {block.map((word, wordIndex) => (
                      <React.Fragment key={wordIndex}>
                        {wordIndex > 0 && wordIndex % 4 === 0 ? "\n" : ""}
                        <span
                          className={
                            blockIndex === stage1.length - 1 &&
                            wordIndex >= 64 - 8
                              ? "text-green-500"
                              : ""
                          }
                        >
                          {word + " "}
                        </span>
                      </React.Fragment>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
          {currentStage >= 2 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">
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
                          <div key={roundIndex} className="font-mono text-sm">
                            <p className="whitespace-nowrap">A {state.A}</p>
                            <p className="whitespace-nowrap">B {state.B}</p>
                            <p className="whitespace-nowrap">C {state.C}</p>
                            <p className="whitespace-nowrap">D {state.D}</p>
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
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Stage 3 - Final Result:</h3>
              <div className="font-mono text-sm mb-4">
                <p className="font-semibold mb-1">Concatenate variables</p>
                <p>A {stage3.working.A}</p>
                <p>B {stage3.working.B}</p>
                <p>C {stage3.working.C}</p>
                <p>D {stage3.working.D}</p>
              </div>
              <div>
                <p className="font-semibold mb-1">Hash:</p>
                <pre className="text-sm whitespace-pre font-mono leading-relaxed tracking-wide">
                  {stage3.final}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
