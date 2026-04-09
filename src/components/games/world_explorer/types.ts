export type Vec3 = [number, number, number];

export type CountryDetail = {
  label: string;
  value: string;
};

export type Country = {
  id: string;
  name: string;
  flag: string;
  position: Vec3;
  capitalPosition?: Vec3;
  capitalName?: string;
  summary: string;
  famousFor: string;
  imageUrl: string;
  imageCaption: string;
  details: CountryDetail[];
};

export type ExploreFeedback = {
  kind: "new" | "repeat";
  message: string;
};
