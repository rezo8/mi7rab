import { useRef } from "react";
import type { Door } from "./doors";
import { SafetySceneMickey } from "./SafetySceneMickey";

export interface SafetySceneProps {
  door: Door;
  onBack: () => void;
}

type SceneComponent = (props: SafetySceneProps) => React.ReactElement;

const SCENES: SceneComponent[] = [
  SafetySceneMickey,
  // add more scenes here
];

export function SafetyScene(props: SafetySceneProps) {
  const Scene = useRef(SCENES[Math.floor(Math.random() * SCENES.length)]!).current;
  return <Scene {...props} />;
}
