import React from "react";
import { Composition } from "remotion";
import { MainVideo, MainVideoProps } from "./Composition";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition<MainVideoProps>
      id="MainVideo"
      component={MainVideo}
      durationInFrames={1800}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{
        scenes: [],
        audioBase64: "",
      }}
    />
  );
};