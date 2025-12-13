export const getColorName = (colorInput: string): string => {
  if (!colorInput) return "Unknown";

  const color = colorInput.trim().toLowerCase();

  const colorNames: Record<string, string> = {
    "#ff0000": "Red",
    "#00ff00": "Green",
    "#0000ff": "Blue",
    "#ffff00": "Yellow",
    "#ffa500": "Orange",
    "#800080": "Purple",
    "#000000": "Black",
    "#ffffff": "White",
    "#808080": "Gray",
    "#a52a2a": "Brown",
    "#ff4500": "Orange Red",
    "#008000": "Green",
    "#000080": "Navy Blue",
    "#ff69b4": "Hot Pink",
    "#008080": "Teal",
    "#ffd700": "Gold",
    "#c0c0c0": "Silver",

    red: "Red",
    green: "Green",
    blue: "Blue",
    yellow: "Yellow",
    orange: "Orange",
    purple: "Purple",
    black: "Black",
    white: "White",
    gray: "Gray",
    grey: "Gray",
    brown: "Brown",
    pink: "Pink",
    cyan: "Cyan",
    magenta: "Magenta",
    teal: "Teal",
    navy: "Navy Blue",
    maroon: "Maroon",
    olive: "Olive",
    lime: "Lime",
    aqua: "Aqua",
    silver: "Silver",
    gold: "Gold",
  };

  if (color.startsWith("#")) {
    return colorNames[color] || colorInput;
  }

  if (/^[0-9a-f]{3}$|^[0-9a-f]{6}$/i.test(color)) {
    const hexColor = `#${color}`;
    return colorNames[hexColor] || hexColor;
  }

  return colorNames[color] || colorInput;
};

export const formatColorHex = (colorInput: string): string => {
  if (!colorInput) return "#000000";

  const color = colorInput.trim().toLowerCase();

  if (color.startsWith("#")) {
    return color;
  }

  // Agar hex raqam bo'lsa (faqat raqamlar va harflar)
  if (/^[0-9a-f]{3}$|^[0-9a-f]{6}$/i.test(color)) {
    return `#${color}`;
  }
  const cssToHex: Record<string, string> = {
    red: "#FF0000",
    green: "#00FF00",
    blue: "#0000FF",
    yellow: "#FFFF00",
    orange: "#FFA500",
    purple: "#800080",
    black: "#000000",
    white: "#FFFFFF",
    gray: "#808080",
    grey: "#808080",
    brown: "#A52A2A",
    pink: "#FFC0CB",
    cyan: "#00FFFF",
    magenta: "#FF00FF",
    teal: "#008080",
    navy: "#000080",
    maroon: "#800000",
    olive: "#808000",
    lime: "#00FF00",
    aqua: "#00FFFF",
    silver: "#C0C0C0",
    gold: "#FFD700",
  };

  return cssToHex[color] || "#000000";
};
