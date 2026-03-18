import { useEffect, useRef } from "react";

import bodyMaskSrc from "./mask.png";
import downMaskSrc from "./down_mask.png";
import eyeSrc from "./eye_1.png";

type Props = {
  src: string;
  alt?: string;
  size?: number;
  paused?: boolean;
  isCorrect?: boolean;
};

type Assets = {
  flag: HTMLImageElement | null;
  bodyMask: HTMLImageElement | null;
  downMask: HTMLImageElement | null;
  eye: HTMLImageElement | null;
};

const TAU = Math.PI * 2;

function loadImage(src: string, crossOrigin = false) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    if (crossOrigin) {
      img.crossOrigin = "anonymous";
    }
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function drawImageCover(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  zoom = 1,
) {
  const targetWidth = width * zoom;
  const targetHeight = height * zoom;
  const offsetX = (targetWidth - width) / 2;
  const offsetY = (targetHeight - height) / 2;
  const imageRatio = image.width / image.height;
  const frameRatio = targetWidth / targetHeight;

  let drawWidth = targetWidth;
  let drawHeight = targetHeight;
  let drawX = x - offsetX;
  let drawY = y - offsetY;

  if (imageRatio > frameRatio) {
    drawWidth = targetHeight * imageRatio;
    drawX = x - offsetX - (drawWidth - targetWidth) / 2;
  } else {
    drawHeight = targetWidth / imageRatio;
    drawY = y - offsetY - (drawHeight - targetHeight) / 2;
  }

  ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
}

export default function CountryBallCanvas({
  src,
  alt = "Country ball",
  size = 280,
  paused = false,
  isCorrect = false,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const jumpUntilRef = useRef<number>(0);
  const prevCorrectRef = useRef<boolean>(false);

  const assetsRef = useRef<Assets>({
    flag: null,
    bodyMask: null,
    downMask: null,
    eye: null,
  });

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      loadImage(src, true),
      loadImage(bodyMaskSrc),
      loadImage(downMaskSrc),
      loadImage(eyeSrc),
    ])
      .then(([flag, bodyMask, downMask, eye]) => {
        if (cancelled) return;
        assetsRef.current = { flag, bodyMask, downMask, eye };
      })
      .catch(() => {
        if (cancelled) return;
        assetsRef.current = {
          flag: null,
          bodyMask: null,
          downMask: null,
          eye: null,
        };
      });

    return () => {
      cancelled = true;
      assetsRef.current = {
        flag: null,
        bodyMask: null,
        downMask: null,
        eye: null,
      };
    };
  }, [src]);

  useEffect(() => {
    if (isCorrect && !prevCorrectRef.current) {
      jumpUntilRef.current = performance.now() + 650;
    }
    prevCorrectRef.current = isCorrect;
  }, [isCorrect]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cssWidth = size;
    const cssHeight = Math.round(size * 0.9);

    const render = (time: number) => {
      if (startTimeRef.current === 0) {
        startTimeRef.current = time;
      }

      const elapsed = (time - startTimeRef.current) / 1000;
      const dpr = window.devicePixelRatio || 1;

      if (
        canvas.width !== Math.round(cssWidth * dpr) ||
        canvas.height !== Math.round(cssHeight * dpr)
      ) {
        canvas.width = Math.round(cssWidth * dpr);
        canvas.height = Math.round(cssHeight * dpr);
        canvas.style.width = `${cssWidth}px`;
        canvas.style.height = `${cssHeight}px`;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssWidth, cssHeight);

      const { flag, bodyMask, downMask, eye } = assetsRef.current;

      const idleFloat = paused ? 0 : Math.sin(elapsed * 2) * size * 0.014;
      const idleSway = paused ? 0 : Math.sin(elapsed * 1.25) * 0.03;

      let jumpOffset = 0;
      if (time < jumpUntilRef.current) {
        const t = 1 - (jumpUntilRef.current - time) / 650;
        jumpOffset = Math.sin(Math.min(t, 1) * Math.PI) * size * 0.13;
      }

            const blinkWave = paused ? -1 : (Math.sin(elapsed * 3.2) + 1) / 2;
const eyeScaleY = 0.12 + (1 - Math.pow(blinkWave, 14)) * 0.88;

      const ballSize = size * 0.61;
      const ballX = (cssWidth - ballSize) / 2;
      const ballY = cssHeight * 0.04 + idleFloat - jumpOffset;
      const centerX = ballX + ballSize / 2;
      const centerY = ballY + ballSize / 2;
      const bodyMaskScale = 1.81;
      const bodyMaskSize = ballSize * bodyMaskScale;
      const bodyMaskX = centerX - bodyMaskSize / 2;
      const bodyMaskY = centerY - bodyMaskSize / 2 - ballSize * 0.36;

      const downMaskWidth = ballSize * 0.64;
      const downMaskHeight = ballSize * 0.26;
      const downMaskX = centerX - downMaskWidth / 2;
      const downMaskY = ballY + ballSize * 0.75;

      ctx.save();
      ctx.fillStyle = "rgba(0,0,0,0.16)";
      ctx.filter = `blur(${Math.max(8, size * 0.025)}px)`;
      ctx.beginPath();
      ctx.ellipse(
        centerX,
        ballY + ballSize + size * 0.04,
        ballSize * 0.28,
        ballSize * 0.07,
        0,
        0,
        TAU,
      );
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(idleSway);
      ctx.translate(-centerX, -centerY);

      if (downMask) {
        ctx.save();
        ctx.globalAlpha = 0.88;
        ctx.drawImage(
          downMask,
          downMaskX,
          downMaskY,
          downMaskWidth,
          downMaskHeight,
        );
        ctx.restore();
      }

      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, ballSize / 2, 0, TAU);
      ctx.clip();

      if (flag) {
        drawImageCover(ctx, flag, ballX, ballY, ballSize, ballSize, 1.04);
      } else {
        ctx.fillStyle = "#334155";
        ctx.fillRect(ballX, ballY, ballSize, ballSize);
      }

      const highlight = ctx.createRadialGradient(
        ballX + ballSize * 0.28,
        ballY + ballSize * 0.22,
        ballSize * 0.04,
        ballX + ballSize * 0.28,
        ballY + ballSize * 0.22,
        ballSize * 0.48,
      );
      highlight.addColorStop(0, "rgba(255,255,255,0.4)");
      highlight.addColorStop(0.45, "rgba(255,255,255,0.12)");
      highlight.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = highlight;
      ctx.fillRect(ballX, ballY, ballSize, ballSize);

      const shade = ctx.createRadialGradient(
        ballX + ballSize * 0.7,
        ballY + ballSize * 0.76,
        ballSize * 0.04,
        ballX + ballSize * 0.7,
        ballY + ballSize * 0.76,
        ballSize * 0.62,
      );
      shade.addColorStop(0, "rgba(0,0,0,0.16)");
      shade.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = shade;
      ctx.fillRect(ballX, ballY, ballSize, ballSize);

      const bottomShade = ctx.createLinearGradient(
        0,
        ballY + ballSize * 0.62,
        0,
        ballY + ballSize,
      );
      bottomShade.addColorStop(0, "rgba(0,0,0,0)");
      bottomShade.addColorStop(1, "rgba(0,0,0,0.22)");
      ctx.fillStyle = bottomShade;
      ctx.fillRect(ballX, ballY, ballSize, ballSize);

      ctx.restore();

      if (bodyMask) {
        ctx.drawImage(
          bodyMask,
          bodyMaskX,
          bodyMaskY,
          bodyMaskSize,
          bodyMaskSize,
        );
      }

            if (eye) {
        const leftEyeWidth = ballSize * 0.19;
        const leftEyeHeight = ballSize * 0.13 * eyeScaleY;
        const rightEyeWidth = ballSize * 0.16;
        const rightEyeHeight = ballSize * 0.11 * eyeScaleY;
        const eyeLift = ballSize * 0.04;
        const eyeSpacing = ballSize * 0.12;

        const leftEyeXBase = centerX - eyeSpacing - leftEyeWidth / 2;
        const rightEyeXBase = centerX + eyeSpacing - rightEyeWidth / 2;

        const leftEyeYBase =
          ballY +
          ballSize * 0.455 -
          eyeLift +
          (ballSize * 0.13 - leftEyeHeight) / 2;

        const rightEyeYBase =
          ballY +
          ballSize * 0.465 -
          eyeLift +
          (ballSize * 0.11 - rightEyeHeight) / 2;

        // Realistik eye movement:
        // mayin micro movement + sekinroq qarash harakati
        const microX = paused ? 0 : Math.sin(elapsed * 2.7) * ballSize * 0.006;
        const microY = paused ? 0 : Math.cos(elapsed * 3.4) * ballSize * 0.004;

        const glanceX = paused ? 0 : Math.sin(elapsed * 0.9) * ballSize * 0.01;
        const glanceY = paused ? 0 : Math.cos(elapsed * 1.15) * ballSize * 0.006;

        const eyeMoveX = microX + glanceX;
        const eyeMoveY = microY + glanceY;

        const leftEyeX = leftEyeXBase + eyeMoveX;
        const rightEyeX = rightEyeXBase + eyeMoveX;

        const leftEyeY = leftEyeYBase + eyeMoveY;
        const rightEyeY = rightEyeYBase + eyeMoveY;

        ctx.drawImage(eye, leftEyeX, leftEyeY, leftEyeWidth, leftEyeHeight);
        ctx.drawImage(eye, rightEyeX, rightEyeY, rightEyeWidth, rightEyeHeight);
      }
      ctx.restore();

      rafRef.current = window.requestAnimationFrame(render);
    };

    rafRef.current = window.requestAnimationFrame(render);

    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = null;
      startTimeRef.current = 0;
    };
  }, [size, paused, isCorrect]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={alt}
      className="mx-auto block"
    />
  );
}