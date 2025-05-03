"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface JournalEntry {
  id: number;
  title: string;
  date: string;
  content: string;
}

interface JournalCardsProps {
  entries: JournalEntry[];
}

export default function JournalCards({ entries }: JournalCardsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);
  const [exitComplete, setExitComplete] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);

  const handlePrevious = () => {
    if (currentIndex > 0 && exitComplete) {
      setDirection("right");
      setExitComplete(false);
      setTimeout(() => {
        setCurrentIndex(currentIndex - 1);
        setExitComplete(true);
      }, 300);
    }
  };

  const handleNext = () => {
    if (currentIndex < entries.length - 1 && exitComplete) {
      setDirection("left");
      setExitComplete(false);
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
        setExitComplete(true);
      }, 300);
    }
  };

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (!exitComplete) return;
    setIsSwiping(true);
    if ("touches" in e) {
      setStartX(e.touches[0].clientX);
    } else {
      setStartX(e.clientX);
    }
    setCurrentX(0);
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isSwiping) return;
    if ("touches" in e) {
      setCurrentX(e.touches[0].clientX - startX);
    } else {
      setCurrentX(e.clientX - startX);
    }
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);
    if (currentX > 100 && currentIndex > 0 && exitComplete) {
      handlePrevious();
    } else if (
      currentX < -100 &&
      currentIndex < entries.length - 1 &&
      exitComplete
    ) {
      handleNext();
    }
    setCurrentX(0);
  };

  useEffect(() => {
    const handleMouseUp = () => {
      if (isSwiping) {
        handleTouchEnd();
      }
    };
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isSwiping]);

  const currentEntry = entries[currentIndex];

  const getAnimationClass = () => {
    if (isSwiping) return "transition-transform duration-300 ease-out";
    if (direction === "left")
      return exitComplete ? "animate-slide-in-right" : "animate-slide-out-left";
    if (direction === "right")
      return exitComplete ? "animate-slide-in-left" : "animate-slide-out-right";
    return "";
  };

  return (
    <div className="relative flex flex-col items-center">
      <div
        ref={cardRef}
        className={`${getAnimationClass()} will-change-transform`}
        style={{
          transform: isSwiping ? `translateX(${currentX}px)` : "translateX(0)",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseMove={handleTouchMove}
      >
        <Card className="w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-6 shadow-md transition-shadow duration-300 hover:shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              {currentEntry.title}
            </CardTitle>
            <CardDescription className="text-gray-500">
              {currentEntry.date}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="line-clamp-3 text-gray-700">{currentEntry.content}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 flex w-full max-w-xs items-center justify-between">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevious}
          disabled={currentIndex === 0 || !exitComplete}
          className="transition-all duration-200 hover:scale-110"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="text-sm text-gray-500">
          {currentIndex + 1} of {entries.length}
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleNext}
          disabled={currentIndex === entries.length - 1 || !exitComplete}
          className="transition-all duration-200 hover:scale-110"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
