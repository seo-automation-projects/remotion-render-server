import React from "react";
import { AbsoluteFill, Audio, Sequence, Video } from "remotion";

export interface Scene {
  videoUrl: string;
  hookText: string;
  durationInFrames: number;
}

export interface MainVideoProps {
  scenes: Scene[];
  audioBase64: string;
}

export const MainVideo: React.FC<MainVideoProps> = ({ scenes = [], audioBase64 }) => {
  let accumulatedFrames = 0;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      {/* Voiceover Track */}
      {audioBase64 && <Audio src={audioBase64} />}

      {/* Sequential Scenes */}
      {scenes.map((scene, index) => {
        const startFrame = accumulatedFrames;
        accumulatedFrames += scene.durationInFrames;

        return (
          <Sequence key={index} from={startFrame} durationInFrames={scene.durationInFrames}>
            {/* Background Video */}
            {scene.videoUrl && (
              <Video
                src={scene.videoUrl}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            )}

            {/* Dark Vignette Overlay for Contrast */}
            <AbsoluteFill style={{ backgroundColor: "rgba(0,0,0,0.35)" }} />

            {/* Subtitle / Hook Overlay */}
            <AbsoluteFill
              style={{
                justifyContent: "center",
                alignItems: "center",
                padding: "0 60px",
              }}
            >
              <h1
                style={{
                  fontFamily: "Arial, sans-serif",
                  fontSize: 70,
                  fontWeight: 900,
                  color: "#FFE500",
                  textAlign: "center",
                  textTransform: "uppercase",
                  textShadow: "0 8px 24px rgba(0,0,0,0.9), 0 2px 4px rgba(0,0,0,1)",
                }}
              >
                {scene.hookText}
              </h1>
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};