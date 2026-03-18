export type QuestionType = "bolalar_iq";
export type Difficulty = "easy" | "medium" | "hard";

export type DatasetOption = {
  id: string;
  image: string;
};

export type IQQuestion = {
  id: number;
  type: QuestionType;
  question: string;
  image: string;
  options: DatasetOption[];
  correctAnswer: string;
  difficulty: Difficulty;
  timeLimit: number;
};

type ShapeKind = "circle" | "square" | "triangle" | "diamond" | "star" | "hex";
type FillKind = "solid" | "outline" | "striped" | "dotted";
type PositionKind = "center" | "top" | "right" | "bottom" | "left" | "tl" | "tr" | "bl" | "br";

type GlyphSpec = {
  shape: ShapeKind;
  fill: FillKind;
  rotation: number;
  position: PositionKind;
  scale: number;
  accent: number;
  mirrorX?: boolean;
  mirrorY?: boolean;
};

type CellSpec = {
  glyphs: GlyphSpec[];
};

const svgToDataUri = (svg: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

const palette = {
  paper: "#fbfcfe",
  panel: "#eef3f8",
  line: "#c8d2df",
  ink: "#0f172a",
  soft: "#64748b",
  accents: ["#0f172a", "#334155", "#2563eb", "#0f766e", "#b45309", "#7c3aed"],
};

const SHAPES: ShapeKind[] = ["circle", "square", "triangle", "diamond", "star", "hex"];
const FILLS: FillKind[] = ["solid", "outline", "striped", "dotted"];
const POSITIONS: PositionKind[] = ["center", "top", "right", "bottom", "left", "tl", "tr", "bl", "br"];
const ROTATIONS = [0, 45, 90, 135];
const SCALES = [0.72, 0.84, 0.96, 1.1];
const QUESTION_TEXTS = [
  "Bo'sh katakka mos shaklni toping.",
  "Matritsadagi mantiqni topib, to'g'ri javobni tanlang.",
  "Qator va ustun qoidasiga mos javobni toping.",
  "Vizual mantiqni davom ettiradigan variantni tanlang.",
];

const positionOffset: Record<PositionKind, [number, number]> = {
  center: [0, 0],
  top: [0, -22],
  right: [22, 0],
  bottom: [0, 22],
  left: [-22, 0],
  tl: [-18, -18],
  tr: [18, -18],
  bl: [-18, 18],
  br: [18, 18],
};

const mod = (value: number, size: number) => ((value % size) + size) % size;
const pick = <T,>(list: T[], index: number) => list[mod(index, list.length)];
const clampRotation = (value: number) => mod(value, 360);

const seededShuffle = <T,>(items: T[], seed: number) => {
  let value = seed + 1;
  const next = () => {
    value |= 0;
    value = (value + 0x6d2b79f5) | 0;
    let t = Math.imul(value ^ (value >>> 15), 1 | value);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(next() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
};

const cloneCell = (cell: CellSpec): CellSpec => ({
  glyphs: cell.glyphs.map((glyph) => ({ ...glyph })),
});

const cellKey = (cell: CellSpec) =>
  JSON.stringify(
    cell.glyphs.map((glyph) => ({
      shape: glyph.shape,
      fill: glyph.fill,
      rotation: clampRotation(glyph.rotation),
      position: glyph.position,
      scale: Number(glyph.scale.toFixed(3)),
      accent: glyph.accent,
      mirrorX: Boolean(glyph.mirrorX),
      mirrorY: Boolean(glyph.mirrorY),
    })),
  );

const glyphPath = (shape: ShapeKind, size: number) => {
  const r = size / 2;
  if (shape === "circle") return `<circle cx="0" cy="0" r="${r}" />`;
  if (shape === "square") return `<rect x="${-r}" y="${-r}" width="${size}" height="${size}" rx="${size * 0.16}" />`;
  if (shape === "triangle") return `<polygon points="0,${-r} ${r},${r} ${-r},${r}" />`;
  if (shape === "diamond") return `<polygon points="0,${-r} ${r},0 0,${r} ${-r},0" />`;
  if (shape === "hex") {
    const p = [
      [0, -r],
      [r * 0.87, -r * 0.5],
      [r * 0.87, r * 0.5],
      [0, r],
      [-r * 0.87, r * 0.5],
      [-r * 0.87, -r * 0.5],
    ]
      .map(([x, y]) => `${x},${y}`)
      .join(" ");
    return `<polygon points="${p}" />`;
  }
  const star = [
    [0, -r],
    [r * 0.28, -r * 0.28],
    [r, -r * 0.2],
    [r * 0.44, r * 0.16],
    [r * 0.6, r],
    [0, r * 0.5],
    [-r * 0.6, r],
    [-r * 0.44, r * 0.16],
    [-r, -r * 0.2],
    [-r * 0.28, -r * 0.28],
  ]
    .map(([x, y]) => `${x},${y}`)
    .join(" ");
  return `<polygon points="${star}" />`;
};

const renderGlyph = (glyph: GlyphSpec, cx: number, cy: number, size: number, key: string) => {
  const accent = palette.accents[mod(glyph.accent, palette.accents.length)];
  const softAccent = `${accent}22`;
  const [dx, dy] = positionOffset[glyph.position];
  const scaleX = glyph.mirrorX ? -glyph.scale : glyph.scale;
  const scaleY = glyph.mirrorY ? -glyph.scale : glyph.scale;
  const transform = `translate(${cx + dx} ${cy + dy}) rotate(${clampRotation(glyph.rotation)}) scale(${scaleX} ${scaleY})`;
  const shape = glyphPath(glyph.shape, size);
  const clipId = `clip-${key}`;
  const stripeLines = Array.from({ length: 8 }, (_, index) => {
    const x = -size + index * (size / 3);
    return `<line x1="${x}" y1="${-size}" x2="${x + size * 1.5}" y2="${size}" stroke="${accent}" stroke-width="4" stroke-linecap="round" />`;
  }).join("");
  const dotPattern = Array.from({ length: 9 }, (_, index) => {
    const row = Math.floor(index / 3);
    const col = index % 3;
    return `<circle cx="${-size * 0.35 + col * size * 0.35}" cy="${-size * 0.35 + row * size * 0.35}" r="${size * 0.07}" fill="${accent}" />`;
  }).join("");
  const stroke = `<g transform="${transform}" fill="none" stroke="${accent}" stroke-width="${Math.max(3, size * 0.08)}">${shape}</g>`;
  const base =
    glyph.fill === "outline"
      ? stroke
      : `<g transform="${transform}" fill="${glyph.fill === "solid" ? accent : softAccent}" stroke="${accent}" stroke-width="${Math.max(2.2, size * 0.06)}">${shape}</g>`;

  const patternOverlay =
    glyph.fill === "striped"
      ? `<clipPath id="${clipId}"><g transform="${transform}">${shape}</g></clipPath><g clip-path="url(#${clipId})" transform="translate(${cx + dx} ${cy + dy})">${stripeLines}</g>`
      : glyph.fill === "dotted"
      ? `<clipPath id="${clipId}"><g transform="${transform}">${shape}</g></clipPath><g clip-path="url(#${clipId})" transform="translate(${cx + dx} ${cy + dy})">${dotPattern}</g>`
      : "";

  return `${base}${patternOverlay}`;
};

const renderCell = (cell: CellSpec | null, x: number, y: number, w: number, h: number, key: string) => {
  const outer = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="#ffffff" stroke="${palette.line}" stroke-width="2"/>`;
  if (!cell) {
    return `${outer}<text x="${x + w / 2}" y="${y + h / 2 + 16}" text-anchor="middle" font-family="Arial, sans-serif" font-size="56" font-weight="700" fill="${palette.ink}">?</text>`;
  }
  const glyphs = cell.glyphs
    .map((glyph, index) => renderGlyph(glyph, x + w / 2, y + h / 2, 44 - index * 8, `${key}-${index}`))
    .join("");
  return `${outer}${glyphs}`;
};

const matrixImage = (rows: Array<Array<CellSpec | null>>) =>
  svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 620 360">
    <rect width="620" height="360" rx="28" fill="${palette.paper}"/>
    <rect x="24" y="24" width="572" height="312" rx="24" fill="${palette.panel}" />
    ${rows
      .flatMap((row, rowIndex) =>
        row.map((cell, colIndex) => renderCell(cell, 56 + colIndex * 172, 42 + rowIndex * 96, 148, 76, `m-${rowIndex}-${colIndex}`)),
      )
      .join("")}
  </svg>`);

const optionImage = (label: string, cell: CellSpec) =>
  ({
    id: label,
    image: svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 120">
      <rect width="220" height="120" rx="22" fill="${palette.paper}"/>
      <rect x="16" y="16" width="188" height="88" rx="18" fill="#ffffff" stroke="${palette.line}" stroke-width="2"/>
      ${cell.glyphs.map((glyph, index) => renderGlyph(glyph, 110, 60, 42 - index * 7, `o-${label}-${index}`)).join("")}
    </svg>`),
  }) satisfies DatasetOption;

const nextFill = (fill: FillKind, step = 1) => pick(FILLS, FILLS.indexOf(fill) + step);
const nextPosition = (position: PositionKind, step = 1) => pick(POSITIONS, POSITIONS.indexOf(position) + step);
const nextShape = (shape: ShapeKind, step = 1) => pick(SHAPES, SHAPES.indexOf(shape) + step);

const tweakCell = (cell: CellSpec, mode: "rotation" | "fill" | "position" | "shape" | "mirror"): CellSpec => {
  const next = cloneCell(cell);
  const target = next.glyphs[0];
  if (!target) return next;
  if (mode === "rotation") target.rotation = clampRotation(target.rotation + 45);
  if (mode === "fill") target.fill = nextFill(target.fill);
  if (mode === "position") target.position = nextPosition(target.position);
  if (mode === "shape") target.shape = nextShape(target.shape);
  if (mode === "mirror") target.mirrorX = !target.mirrorX;
  return next;
};

const makeQuestion = (
  id: number,
  difficulty: Difficulty,
  timeLimit: number,
  rows: CellSpec[][],
  answer: CellSpec,
  distractors: CellSpec[],
  text: string,
): IQQuestion => {
  const seen = new Set<string>([cellKey(answer)]);
  const uniqueDistractors: CellSpec[] = [];
  for (const candidate of distractors) {
    const key = cellKey(candidate);
    if (!seen.has(key)) {
      uniqueDistractors.push(candidate);
      seen.add(key);
    }
    if (uniqueDistractors.length === 3) break;
  }
  const fallbackModes: Array<"rotation" | "fill" | "position" | "shape" | "mirror"> = ["rotation", "fill", "position", "shape", "mirror"];
  let fallbackIndex = 0;
  while (uniqueDistractors.length < 3) {
    const candidate = tweakCell(answer, fallbackModes[fallbackIndex % fallbackModes.length]);
    fallbackIndex += 1;
    const key = cellKey(candidate);
    if (!seen.has(key)) {
      uniqueDistractors.push(candidate);
      seen.add(key);
    }
  }

  const optionSpecs = seededShuffle(
    [
      { label: "A", cell: answer, correct: true },
      { label: "B", cell: uniqueDistractors[0], correct: false },
      { label: "C", cell: uniqueDistractors[1], correct: false },
      { label: "D", cell: uniqueDistractors[2], correct: false },
    ],
    id * 97,
  ).map((item, index) => ({
    id: String.fromCharCode(65 + index),
    cell: item.cell,
    correct: item.correct,
  }));

  return {
    id,
    type: "bolalar_iq",
    difficulty,
    question: text,
    image: matrixImage([
      [rows[0][0], rows[0][1], rows[0][2]],
      [rows[1][0], rows[1][1], rows[1][2]],
      [rows[2][0], rows[2][1], null],
    ]),
    correctAnswer: optionSpecs.find((item) => item.correct)?.id ?? "A",
    timeLimit,
    options: optionSpecs.map((item) => optionImage(item.id, item.cell)),
  };
};

const simpleCell = (glyph: GlyphSpec): CellSpec => ({ glyphs: [glyph] });
const overlayCell = (first: GlyphSpec, second: GlyphSpec): CellSpec => ({ glyphs: [first, second] });
const tripleCell = (a: GlyphSpec, b: GlyphSpec, c: GlyphSpec): CellSpec => ({ glyphs: [a, b, c] });

const easyRule = (family: number, seed: number, row: number, col: number): CellSpec => {
  if (family === 0) {
    return simpleCell({
      shape: pick(SHAPES, seed + row),
      fill: pick(FILLS, seed + col),
      rotation: 0,
      position: "center",
      scale: 0.92,
      accent: (seed + row + col) % 3,
    });
  }
  if (family === 1) {
    return simpleCell({
      shape: pick(SHAPES, seed + row),
      fill: "outline",
      rotation: pick(ROTATIONS, seed + col),
      position: "center",
      scale: 0.94,
      accent: (seed + row) % 4,
    });
  }
  if (family === 2) {
    return simpleCell({
      shape: pick(SHAPES, seed),
      fill: pick(FILLS, seed + row),
      rotation: 0,
      position: pick(["left", "center", "right"], col),
      scale: 0.9,
      accent: (seed + row + 1) % 5,
    });
  }
  if (family === 3) {
    return simpleCell({
      shape: pick(SHAPES, seed + col),
      fill: "solid",
      rotation: 0,
      position: "center",
      scale: pick(SCALES, seed + row),
      accent: (seed + col + 2) % 5,
    });
  }
  return simpleCell({
    shape: pick(SHAPES, seed + row),
    fill: pick(["outline", "striped", "solid"], col),
    rotation: pick([0, 90, 180], col),
    position: "center",
    scale: 0.9,
    accent: (seed + row + col) % 6,
    mirrorX: row === 1,
  });
};

const mediumRule = (family: number, seed: number, row: number, col: number): CellSpec => {
  if (family === 0) {
    return simpleCell({
      shape: pick(SHAPES, seed + row),
      fill: pick(FILLS, seed + row + col),
      rotation: pick(ROTATIONS, seed + col),
      position: "center",
      scale: 0.9,
      accent: (seed + row + col) % 6,
    });
  }
  if (family === 1) {
    return simpleCell({
      shape: pick(SHAPES, seed + col),
      fill: pick(["outline", "solid", "striped"], row),
      rotation: pick([0, 45, 90], row + col),
      position: pick(["top", "center", "bottom"], row + col),
      scale: 0.9,
      accent: (seed + row + 2 * col) % 6,
    });
  }
  if (family === 2) {
    return overlayCell(
      {
        shape: pick(SHAPES, seed + row),
        fill: row === col ? "outline" : "solid",
        rotation: pick([0, 90, 180], col),
        position: "center",
        scale: 0.96,
        accent: (seed + row) % 6,
      },
      {
        shape: pick(SHAPES, seed + col + 2),
        fill: "outline",
        rotation: pick([0, 45, 90], row),
        position: pick(["tl", "top", "tr"], col),
        scale: 0.48,
        accent: (seed + col + 3) % 6,
      },
    );
  }
  if (family === 3) {
    return simpleCell({
      shape: pick(SHAPES, seed + row + col),
      fill: row === 1 ? "striped" : "outline",
      rotation: pick(ROTATIONS, row + col),
      position: pick(["left", "center", "right"], col),
      scale: pick([0.8, 0.92, 1.06], row),
      accent: (seed + row + col + 1) % 6,
      mirrorY: col === 2,
    });
  }
  return overlayCell(
    {
      shape: pick(SHAPES, seed + row),
      fill: pick(["solid", "outline", "dotted"], col),
      rotation: pick([0, 45, 90], row),
      position: pick(["left", "center", "right"], col),
      scale: 0.84,
      accent: (seed + row + col) % 6,
      mirrorX: row === 2,
    },
    {
      shape: pick(["diamond", "triangle", "circle"], row + col),
      fill: "outline",
      rotation: pick([0, 90, 180], col + row),
      position: pick(["top", "center", "bottom"], row),
      scale: 0.42,
      accent: (seed + row + col + 2) % 6,
    },
  );
};

const hardRule = (family: number, seed: number, row: number, col: number): CellSpec => {
  if (family === 0) {
    return overlayCell(
      {
        shape: pick(SHAPES, seed + row),
        fill: pick(FILLS, seed + ((row + col) % 4)),
        rotation: pick(ROTATIONS, seed + col),
        position: pick(["left", "center", "right"], col),
        scale: pick([0.76, 0.9, 1.04], row),
        accent: (seed + row) % 6,
      },
      {
        shape: pick(SHAPES, seed + col + 2),
        fill: row === col ? "solid" : "outline",
        rotation: pick([0, 45, 90, 135], row + col),
        position: pick(["top", "center", "bottom"], row),
        scale: 0.42,
        accent: (seed + col + 2) % 6,
        mirrorX: row === 1,
      },
    );
  }
  if (family === 1) {
    return tripleCell(
      {
        shape: pick(SHAPES, seed + row),
        fill: pick(["outline", "striped", "solid"], col),
        rotation: pick([0, 90, 180], row + col),
        position: "center",
        scale: pick([0.78, 0.92, 1.05], row),
        accent: (seed + row + col) % 6,
      },
      {
        shape: pick(["circle", "diamond", "hex"], seed + col),
        fill: "outline",
        rotation: pick([0, 45, 90], col),
        position: pick(["tl", "top", "tr"], col),
        scale: 0.32,
        accent: (seed + row + 3) % 6,
      },
      {
        shape: pick(["square", "triangle", "star"], seed + row),
        fill: "solid",
        rotation: pick([0, 90, 180], row),
        position: pick(["bl", "bottom", "br"], row),
        scale: 0.26,
        accent: (seed + col + 1) % 6,
      },
    );
  }
  if (family === 2) {
    return overlayCell(
      {
        shape: pick(SHAPES, seed + row + col),
        fill: pick(FILLS, seed + row),
        rotation: pick(ROTATIONS, row + col),
        position: pick(["center", "left", "right"], col + row),
        scale: 0.9,
        accent: (seed + row + col + 2) % 6,
        mirrorX: row === 2,
        mirrorY: col === 1,
      },
      {
        shape: pick(["circle", "triangle", "diamond", "hex"], seed + col),
        fill: "outline",
        rotation: pick([0, 45, 90, 135], seed + row),
        position: pick(["top", "right", "bottom", "left"], row + col),
        scale: 0.34,
        accent: (seed + row + 4) % 6,
      },
    );
  }
  if (family === 3) {
    return tripleCell(
      {
        shape: pick(SHAPES, seed + row),
        fill: row === col ? "striped" : pick(["outline", "solid", "dotted"], col),
        rotation: pick(ROTATIONS, col),
        position: "center",
        scale: 0.9,
        accent: (seed + row) % 6,
      },
      {
        shape: pick(["diamond", "triangle", "square"], row + col),
        fill: "outline",
        rotation: pick([0, 90, 180], row + seed),
        position: pick(["tl", "tr", "br", "bl"], row + col),
        scale: 0.28,
        accent: (seed + col + 2) % 6,
      },
      {
        shape: "circle",
        fill: "solid",
        rotation: 0,
        position: pick(["top", "right", "bottom"], col),
        scale: 0.18,
        accent: (seed + row + col + 3) % 6,
      },
    );
  }
  return overlayCell(
    {
      shape: pick(SHAPES, seed + row),
      fill: pick(FILLS, seed + col),
      rotation: pick(ROTATIONS, row + col),
      position: pick(["left", "center", "right"], col),
      scale: pick([0.76, 0.9, 1.06], row),
      accent: (seed + row + 1) % 6,
      mirrorX: row === 1,
      mirrorY: col === 2,
    },
    {
      shape: pick(["star", "hex", "diamond"], seed + row + col),
      fill: row === 0 ? "solid" : "outline",
      rotation: pick([0, 45, 90], row + col),
      position: pick(["top", "center", "bottom"], row),
      scale: 0.36,
      accent: (seed + col + 4) % 6,
    },
  );
};

const fallbackDistractors = (rule: (row: number, col: number) => CellSpec, answer: CellSpec) => {
  const picks = [rule(1, 2), rule(2, 1), rule(1, 1), rule(0, 2), rule(2, 0), tweakCell(answer, "rotation"), tweakCell(answer, "fill")];
  return picks;
};

const buildFamilyQuestion = (
  id: number,
  difficulty: Difficulty,
  family: number,
  seed: number,
  timeLimit: number,
  ruleFactory: (family: number, seed: number, row: number, col: number) => CellSpec,
): IQQuestion => {
  const text = pick(QUESTION_TEXTS, id + seed);
  const rule = (row: number, col: number) => ruleFactory(family, seed, row, col);
  const rows: CellSpec[][] = [
    [rule(0, 0), rule(0, 1), rule(0, 2)],
    [rule(1, 0), rule(1, 1), rule(1, 2)],
    [rule(2, 0), rule(2, 1), rule(2, 2)],
  ];
  const answer = rows[2][2];
  const distractors = fallbackDistractors(rule, answer);
  return makeQuestion(id, difficulty, timeLimit, rows, answer, distractors, text);
};

const easyQuestions: IQQuestion[] = Array.from({ length: 35 }, (_, index) =>
  buildFamilyQuestion(index + 1, "easy", Math.floor(index / 7), index + 2, 18 + (index % 4), easyRule),
);

const mediumQuestions: IQQuestion[] = Array.from({ length: 35 }, (_, index) =>
  buildFamilyQuestion(36 + index, "medium", Math.floor(index / 7), index + 11, 22 + (index % 4), mediumRule),
);

const hardQuestions: IQQuestion[] = Array.from({ length: 30 }, (_, index) =>
  buildFamilyQuestion(71 + index, "hard", Math.floor(index / 6), index + 23, 25 + (index % 5), hardRule),
);

export const IQ_QUESTIONS: IQQuestion[] = [...easyQuestions, ...mediumQuestions, ...hardQuestions];
