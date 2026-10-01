/** True if Android back was consumed (stay in the app). False → exit. */
export function consumeAndroidBack(screen: string): boolean {
  return screen !== "menu";
}

export async function listenAndroidBack(
  getScreen: () => string,
  goMenu: () => void,
): Promise<() => void> {
  try {
    const { Capacitor } = await import("@capacitor/core");
    if (!Capacitor.isNativePlatform()) return () => {};
    const { App } = await import("@capacitor/app");
    const handle = await App.addListener("backButton", () => {
      if (consumeAndroidBack(getScreen())) {
        goMenu();
        return;
      }
      void App.exitApp();
    });
    return () => {
      void handle.remove();
    };
  } catch {
    return () => {};
  }
}
