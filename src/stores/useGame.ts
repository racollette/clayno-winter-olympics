import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { type Character } from "~/utils/inventory";

type State = {
  blocksCount: number;
  blocksSeed: number;
  startTime: number;
  endTime: number;
  phase: string;
  gatesActivated: number;
  userId: string;
  dino: Character | null;
  velocity: number;
  distanceFromCenter: number;
  start: () => void;
  restart: () => void;
  end: () => void;
  gateActivated: () => void;
  playerInformation: (userId: string, dino: Character | null) => void;
  setSpeed: (velocity: number) => void;
  setDistance: (distanceFromCenter: number) => void;
  reset: () => void;
};

export default create(
  subscribeWithSelector(
    (
      set: (
        partial: Partial<State> | ((state: State) => Partial<State>),
        replace?: boolean
      ) => void
    ) => {
      return {
        blocksCount: 10,
        blocksSeed: 0,

        /**
         * Time
         */
        startTime: 0,
        endTime: 0,

        /**
         * Phases
         */
        phase: "ready",

        /**
         * Actions
         */
        gatesActivated: 0,

        // Results
        distanceFromCenter: 0,

        // Player information
        userId: "",
        dino: {} as Character | null,
        velocity: 0,

        playerInformation: (userId: string, dino: Character | null) => {
          set((state) => ({ ...state, userId, dino }));
        },

        setSpeed: (velocity: number) => {
          set((state) => ({ ...state, velocity }));
        },

        start: () => {
          set((state) => {
            if (state.phase === "ready")
              return { phase: "playing", startTime: Date.now() };

            return {};
          });
        },

        gateActivated: () => {
          set((state) => {
            return { gatesActivated: state.gatesActivated + 1 };
          });
        },

        setDistance: (distanceFromCenter: number) => {
          set((state) => ({ ...state, distanceFromCenter }));
        },

        restart: () => {
          set((state) => {
            if (state.phase === "playing" || state.phase === "ended")
              return {
                phase: "ready",
                blocksSeed: Math.random(),
                gatesActivated: 0,
              };

            return {};
          });
        },

        end: () => {
          set((state) => {
            if (state.phase === "playing")
              return { phase: "ended", endTime: Date.now() };

            return {};
          });
        },

        reset: () => {
          set({
            blocksCount: 10,
            blocksSeed: 0,
            startTime: 0,
            endTime: 0,
            phase: "ready",
            gatesActivated: 0,
            userId: "",
            dino: null,
            velocity: 0,
            distanceFromCenter: 0,
          });
        },
      };
    }
  )
);
