const MP4box = require("mp4box");

export interface IVideoInfo {
  width?: number;
  height?: number;
  duration?: number;
}
export interface VideoInfo extends IVideoInfo { }

export class VideoInfo {
  static getVideoInfo(bytes: number[]): IVideoInfo {
    const mp4boxfile = MP4box.createFile();
    const arrayBuffer: any = new Uint8Array(bytes).buffer;
    arrayBuffer.fileStart = 0;
    mp4boxfile.appendBuffer(arrayBuffer);
    const info = mp4boxfile.getInfo()?.videoTracks[0];
    return {
      width: info?.track_width,
      height: info?.track_height,
      duration: info?.movie_duration / info?.movie_timescale
    };
  }
}