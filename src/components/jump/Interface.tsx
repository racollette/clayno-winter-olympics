import { useKeyboardControls } from "@react-three/drei";
import useGame from "../../stores/useGame";
import { use, useEffect, useRef, useState } from "react";
import { addEffect } from "@react-three/fiber";
import { api } from "~/utils/api";
import Link from "next/link";
import { OLYMPICS_ENDED } from "~/utils/constants";

export default function Interface() {
  const time = useRef<HTMLDivElement | null>(null);
  // const gatesActivated = useRef();
  const [gatesActivated, setGatesActivated] = useState(0);

  const restart = useGame((state) => state.restart);
  const phase = useGame((state) => state.phase);
  const userId = useGame((state) => state.userId);
  const dino = useGame((state) => state.dino);
  const velocity = useGame((state) => state.velocity);

  const forward = useKeyboardControls((state) => !!state.forward);
  const backward = useKeyboardControls((state) => !!state.backward);
  const leftward = useKeyboardControls((state) => !!state.leftward);
  const rightward = useKeyboardControls((state) => !!state.rightward);
  const jump = useKeyboardControls((state) => !!state.jump);

  const recordResult = api.leaderboard.recordResult.useMutation();

  const [score, setScore] = useState(0);
  const totalGates = 21;

  useEffect(() => {
    const unsubscribeEffect = addEffect(() => {
      const state = useGame.getState();
      let elapsedTime = 0;

      if (state.phase === "playing") {
        elapsedTime = (Date.now() - state.startTime) / 1000;
        setScore(0);
      } else if (state.phase === "ended") {
        setGatesActivated(state.gatesActivated);
        elapsedTime = (state.endTime - state.startTime) / 1000;
        const score = elapsedTime + (totalGates - state.gatesActivated) * 5;
        setScore(score);
      }

      if (time.current) time.current.textContent = elapsedTime.toFixed(2);
    });

    return () => {
      unsubscribeEffect();
    };
  }, []);

  useEffect(() => {
    if (OLYMPICS_ENDED) return;
    if (phase === "ended" && userId && dino?.mint && score) {
      recordResult.mutate({
        eventId: 1,
        userId,
        score: score,
        dinoId: dino?.mint ?? "",
      });
    }
  }, [score]);

  return (
    <div className="pointer-events-none fixed left-0 top-0 h-screen w-screen font-clayno">
      {/* Time */}
      <div className="top-15% absolute left-0 mt-2 flex w-full flex-row justify-center gap-4 bg-black/50 py-2 text-center text-2xl text-white">
        <div>{Math.abs(velocity).toFixed(0)}</div>
      </div>

      {phase === "ended" && (
        <div className="absolute left-0 top-1/4 flex w-full flex-col items-center justify-center gap-2 bg-black/50 py-4 text-4xl text-white">
          <div className="text-xl">
            Missed Gates: {totalGates - gatesActivated}
          </div>
          <div className="text-xl">
            Penalty: {(totalGates - gatesActivated) * 5} seconds
          </div>
          <div className="text-2xl font-extrabold">
            Score: {score.toFixed(4)} seconds
          </div>
        </div>
      )}

      {/* Restart */}
      {phase === "ended" && (
        <div className="absolute left-0 top-1/2 flex w-full items-center justify-center gap-8 bg-black/50 py-4 text-xl font-bold text-white">
          <div
            className="pointer-events-auto cursor-pointer rounded-lg bg-emerald-500 p-2"
            onClick={restart}
          >
            Restart
          </div>
          {/* <div className="pointer-events-auto cursor-pointer rounded-lg bg-sky-500 p-2">
            Next Event
          </div> */}
          <Link
            href={`/events`}
            className="pointer-events-auto cursor-pointer rounded-lg bg-sky-500 p-2"
          >
            Menu
          </Link>
          <Link
            href={`/leaderboard`}
            target="_blank"
            className="pointer-events-auto cursor-pointer rounded-lg bg-purple-500 p-2"
          >
            Leaderboard
          </Link>
        </div>
      )}

      {phase === "playing" && (
        <div className="absolute bottom-5 left-10 flex w-full items-center py-4 text-xl uppercase text-white">
          <div
            className="pointer-events-auto cursor-pointer rounded-lg border-2 border-emerald-500 bg-black/50 p-2"
            onClick={restart}
          >
            Restart
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="controls">
        <div className="raw">
          <div className={`key ${forward ? "active" : ""}`}></div>
        </div>
        <div className="raw">
          <div className={`key ${leftward ? "active" : ""}`}></div>
          <div className={`key ${backward ? "active" : ""}`}></div>
          <div className={`key ${rightward ? "active" : ""}`}></div>
        </div>
        <div className="raw">
          <div className={`key large ${jump ? "active" : ""}`}></div>
        </div>
      </div>
    </div>
  );
}
