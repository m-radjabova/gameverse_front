import { useCallback, useEffect, useRef } from "react";
import applauseSound from "../../../assets/sounds/applause.mp3";
import crackSound from "../../../assets/sounds/crack-egg.m4a";
import fantasyMusic from "../../../assets/sounds/Magical_Fantasy_Extended_Version_of_Magical_Music_by_Dmitriy_S.m4a";
import revealSound from "../../../assets/sounds/magic-reveral.m4a";
import wrongSound from "../../../assets/sounds/wrong.mp3";

type SoundName = "wrong" | "crack" | "reveal" | "applause";

export function useMysteryEggAudio() {
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const soundsRef = useRef<Record<SoundName, HTMLAudioElement> | null>(null);

  useEffect(() => {
    const music = new Audio(fantasyMusic);
    music.loop = true;
    music.volume = .26;
    music.preload = "none";
    musicRef.current = music;

    const sounds = {
      wrong: new Audio(wrongSound),
      crack: new Audio(crackSound),
      reveal: new Audio(revealSound),
      applause: new Audio(applauseSound),
    };
    sounds.wrong.volume = .72;
    sounds.crack.volume = .82;
    sounds.reveal.volume = .88;
    sounds.applause.volume = .82;
    Object.values(sounds).forEach((audio) => { audio.preload = "auto"; });
    soundsRef.current = sounds;

    return () => {
      music.pause();
      Object.values(sounds).forEach((audio) => audio.pause());
      musicRef.current = null;
      soundsRef.current = null;
    };
  }, []);

  const prepare = useCallback(() => {
    const music = musicRef.current;
    if (music && music.preload !== "auto") {
      music.preload = "auto";
      music.load();
    }
    Object.values(soundsRef.current ?? {}).forEach((audio) => {
      if (audio.readyState === HTMLMediaElement.HAVE_NOTHING) audio.load();
    });
  }, []);

  const playMusic = useCallback(() => {
    prepare();
    const music = musicRef.current;
    if (!music || !music.paused) return;
    void music.play().catch(() => undefined);
  }, [prepare]);

  const stopMusic = useCallback(() => {
    const music = musicRef.current;
    if (!music) return;
    music.pause();
    music.currentTime = 0;
  }, []);

  const play = useCallback((name: SoundName) => {
    const audio = soundsRef.current?.[name];
    if (!audio) return;
    audio.currentTime = 0;
    void audio.play().catch(() => undefined);
  }, []);

  return {
    prepare,
    playMusic,
    stopMusic,
    playWrong: useCallback(() => play("wrong"), [play]),
    playCrack: useCallback(() => play("crack"), [play]),
    playReveal: useCallback(() => play("reveal"), [play]),
    playApplause: useCallback(() => play("applause"), [play]),
  };
}
