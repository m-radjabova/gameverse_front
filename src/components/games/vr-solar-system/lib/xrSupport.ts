export type XRSupportState = {
  checked: boolean;
  isVRSupported: boolean;
  message: string | null;
};

export function getInitialXRSupport(): XRSupportState {
  if (typeof navigator === "undefined" || !("xr" in navigator)) {
    return {
      checked: true,
      isVRSupported: false,
      message: "Qurilmangizda WebXR qo'llab-quvvatlanmaydi. Kompyuter rejimi to'liq ishlaydi.",
    };
  }

  return {
    checked: false,
    isVRSupported: false,
    message: null,
  };
}

export async function detectXRSupport(): Promise<XRSupportState> {
  if (typeof navigator === "undefined" || !("xr" in navigator)) {
    return getInitialXRSupport();
  }

  try {
    const xr = navigator.xr;

    if (!xr) {
      return getInitialXRSupport();
    }

    const isVRSupported = await xr.isSessionSupported("immersive-vr");

    return {
      checked: true,
      isVRSupported,
      message: isVRSupported
        ? null
        : "WebXR topildi, ammo immersive-vr sessiyasi hozircha mavjud emas.",
    };
  } catch {
    return {
      checked: true,
      isVRSupported: false,
      message: "VR holatini tekshirib bo'lmadi. Kompyuter rejimi bilan davom etishingiz mumkin.",
    };
  }
}
