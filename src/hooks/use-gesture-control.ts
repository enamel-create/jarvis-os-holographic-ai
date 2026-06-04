import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";

export interface GestureControlState {
  stream: MediaStream | null;
  ready: boolean;
  error: string | null;
  handCount: number;
  gestureLabel: string;
  distanceLabel: string;
  targetPosition: [number, number, number];
  targetQuaternion: [number, number, number, number];
  scale: number;
  spreadMultiplier: number;
  turbulenceBoost: number;
}

const DEFAULT_STATE: GestureControlState = {
  stream: null,
  ready: false,
  error: null,
  handCount: 0,
  gestureLabel: "SYSTEM STANDBY",
  distanceLabel: "Waiting for hands",
  targetPosition: [0, 0, 0],
  targetQuaternion: [0, 0, 0, 1],
  scale: 1,
  spreadMultiplier: 1,
  turbulenceBoost: 0,
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

function distance(a: { x: number; y: number; z?: number }, b: { x: number; y: number; z?: number }) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = (a.z ?? 0) - (b.z ?? 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function palmWidth(hand: Array<{ x: number; y: number; z?: number }>) {
  return distance(hand[5], hand[17]);
}

function openness(hand: Array<{ x: number; y: number; z?: number }>) {
  const wrist = hand[0];
  const avgTipDistance = [8, 12, 16, 20].reduce((sum, idx) => sum + distance(hand[idx], wrist), 0) / 4;
  const normalized = avgTipDistance / Math.max(palmWidth(hand), 0.001);
  return clamp((normalized - 1.85) / 1.35, 0, 1);
}

function toScenePoint(point: { x: number; y: number; z?: number }) {
  return new THREE.Vector3((0.5 - point.x) * 2, (0.5 - point.y) * 2, -(point.z ?? 0) * 6);
}

function computeGestureState(hands: Array<Array<{ x: number; y: number; z?: number }>>) {
  if (!hands.length) {
    return DEFAULT_STATE;
  }

  const openRatio = hands.reduce((sum, hand) => sum + openness(hand), 0) / hands.length;

  if (hands.length === 1) {
    const hand = hands[0];
    const wrist = hand[0];
    const sceneX = -(wrist.x - 0.5) * 18;
    const sceneY = -(wrist.y - 0.5) * 12;
    const width = palmWidth(hand);
    const zFactor = clamp((width - 0.055) / 0.14, 0, 1);
    const sceneZ = -7 + zFactor * 14;

    const pos0 = toScenePoint(hand[0]);
    const pos5 = toScenePoint(hand[5]);
    const pos9 = toScenePoint(hand[9]);
    const pos17 = toScenePoint(hand[17]);

    const vUp = new THREE.Vector3().subVectors(pos9, pos0).normalize();
    const vTemp = new THREE.Vector3().subVectors(pos5, pos17).normalize();
    const vNormal = new THREE.Vector3().crossVectors(vTemp, vUp).normalize();
    const vRight = new THREE.Vector3().crossVectors(vUp, vNormal).normalize();
    const matrix = new THREE.Matrix4().makeBasis(vRight, vUp, vNormal);
    const quaternion = new THREE.Quaternion().setFromRotationMatrix(matrix);

    return {
      stream: null,
      ready: true,
      error: null,
      handCount: 1,
      gestureLabel:
        openRatio > 0.72
          ? "TARGET: ACTIVE (OPEN)"
          : openRatio < 0.32
            ? "TARGET: CHARGING (CLOSED)"
            : "TARGET: TRACKED (RELAXED)",
      distanceLabel: `1-TGT DEPTH: ${Math.round(sceneZ)}`,
      targetPosition: [sceneX, sceneY, sceneZ] as [number, number, number],
      targetQuaternion: [quaternion.x, quaternion.y, quaternion.z, quaternion.w] as [number, number, number, number],
      scale: 0.82 + openRatio * 0.72,
      spreadMultiplier: 0.78 + openRatio * 1.05,
      turbulenceBoost: 0.04 + (1 - openRatio) * 0.18,
    } satisfies GestureControlState;
  }

  const handA = hands[0];
  const handB = hands[1];
  const wristA = handA[0];
  const wristB = handB[0];
  const avgX = (wristA.x + wristB.x) / 2;
  const avgY = (wristA.y + wristB.y) / 2;
  const sceneX = -(avgX - 0.5) * 24;
  const sceneY = -(avgY - 0.5) * 14;
  const wristDistance = distance(wristA, wristB);
  const normalizedDistance = clamp((wristDistance - 0.08) / 0.35, 0, 1);
  const avgPalmWidth = (palmWidth(handA) + palmWidth(handB)) / 2;
  const depthFactor = clamp((avgPalmWidth - 0.055) / 0.125, 0, 1);
  const sceneZ = -10 + depthFactor * 18;
  const handsAngle = Math.atan2(wristB.y - wristA.y, wristB.x - wristA.x);
  const quaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -handsAngle);

  return {
    stream: null,
    ready: true,
    error: null,
    handCount: 2,
    gestureLabel:
      openRatio > 0.72
        ? "TARGET: ACTIVE (OPEN)"
        : openRatio < 0.32
          ? "TARGET: CHARGING (CLOSED)"
          : "TARGET: TRACKED (RELAXED)",
    distanceLabel: `2-TGT SPAN: ${(wristDistance * 100).toFixed(0)}%`,
    targetPosition: [sceneX, sceneY, sceneZ],
    targetQuaternion: [quaternion.x, quaternion.y, quaternion.z, quaternion.w],
    scale: 0.9 + normalizedDistance * 0.95,
    spreadMultiplier: 0.85 + normalizedDistance * 1.25,
    turbulenceBoost: 0.06 + (1 - openRatio) * 0.18,
  } satisfies GestureControlState;
}

export function useGestureControl(enabled: boolean) {
  const [state, setState] = useState<GestureControlState>(DEFAULT_STATE);

  const resetState = useMemo(
    () => () => setState((current) => ({ ...DEFAULT_STATE, stream: current.stream })),
    [],
  );

  useEffect(() => {
    if (!enabled || typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setState(DEFAULT_STATE);
      return;
    }

    let cancelled = false;
    let stream: MediaStream | null = null;
    let processing = true;
    let handsInstance: { send: (input: { image: HTMLVideoElement }) => Promise<void>; close?: () => void } | null = null;
    const video = document.createElement("video");
    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;

    const run = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: "user" },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        video.srcObject = stream;
        await video.play().catch(() => undefined);

        const { Hands } = await import("@mediapipe/hands");
        const hands = new Hands({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
        });
        handsInstance = hands;
        hands.setOptions({
          maxNumHands: 2,
          modelComplexity: 1,
          minDetectionConfidence: 0.75,
          minTrackingConfidence: 0.6,
        });

        hands.onResults((results: { multiHandLandmarks?: Array<Array<{ x: number; y: number; z?: number }>> }) => {
          if (cancelled) return;
          const next = computeGestureState(results.multiHandLandmarks ?? []);
          setState({ ...next, stream, ready: true, error: null });
        });

        setState((current) => ({ ...current, stream, ready: true, error: null }));

        while (!cancelled && processing) {
          if (video.readyState >= 2) {
            await hands.send({ image: video });
          }
          await new Promise((resolve) => window.setTimeout(resolve, 45));
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            ...DEFAULT_STATE,
            stream,
            error: error instanceof Error ? error.message : "Camera unavailable",
          });
        }
      }
    };

    run();

    return () => {
      cancelled = true;
      processing = false;
      handsInstance?.close?.();
      stream?.getTracks().forEach((track) => track.stop());
      video.srcObject = null;
      resetState();
    };
  }, [enabled, resetState]);

  return state;
}