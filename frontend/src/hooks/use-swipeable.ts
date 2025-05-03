"use client";

import type React from "react";

import { useState, useRef, useCallback } from "react";

interface SwipeableOptions {
  onSwipedLeft?: () => void;
  onSwipedRight?: () => void;
  onSwipedUp?: () => void;
  onSwipedDown?: () => void;
  swipeThreshold?: number;
}

interface SwipeableHandlers {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
}

export function useSwipeable({
  onSwipedLeft,
  onSwipedRight,
  onSwipedUp,
  onSwipedDown,
  swipeThreshold = 50,
}: SwipeableOptions): SwipeableHandlers {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(
    null,
  );
  const mouseDown = useRef(false);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;

    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);

    if (isHorizontalSwipe) {
      if (distanceX > swipeThreshold) {
        onSwipedLeft?.();
      } else if (distanceX < -swipeThreshold) {
        onSwipedRight?.();
      }
    } else {
      if (distanceY > swipeThreshold) {
        onSwipedUp?.();
      } else if (distanceY < -swipeThreshold) {
        onSwipedDown?.();
      }
    }

    setTouchStart(null);
    setTouchEnd(null);
  }, [
    touchStart,
    touchEnd,
    swipeThreshold,
    onSwipedLeft,
    onSwipedRight,
    onSwipedUp,
    onSwipedDown,
  ]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    mouseDown.current = true;
    setTouchEnd(null);
    setTouchStart({
      x: e.clientX,
      y: e.clientY,
    });
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!mouseDown.current) return;

    setTouchEnd({
      x: e.clientX,
      y: e.clientY,
    });
  }, []);

  const onMouseUp = useCallback(() => {
    if (!mouseDown.current) return;

    mouseDown.current = false;
    onTouchEnd();
  }, [onTouchEnd]);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onMouseDown,
    onMouseMove,
    onMouseUp,
  };
}
