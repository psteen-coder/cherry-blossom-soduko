import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { consumeAndroidBack } from "./androidBack";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("Android back", () => {
  it("returns to menu instead of exiting when not on the menu", () => {
    expect(consumeAndroidBack("play")).toBe(true);
    expect(consumeAndroidBack("difficulty")).toBe(true);
    expect(consumeAndroidBack("leaderboard")).toBe(true);
    expect(consumeAndroidBack("settings")).toBe(true);
    expect(consumeAndroidBack("menu")).toBe(false);
  });
});

describe("Android package", () => {
  it("is org.cherryblossomsoduko.game 0.1.0 arm64 portrait", () => {
    const manifest = readFileSync(
      join(repoRoot, "android/app/src/main/AndroidManifest.xml"),
      "utf8",
    );
    expect(manifest).toContain("android.intent.action.MAIN");
    expect(manifest).toContain('android:screenOrientation="portrait"');
    const gradle = readFileSync(
      join(repoRoot, "android/app/build.gradle"),
      "utf8",
    );
    expect(gradle).toContain('applicationId "org.cherryblossomsoduko.game"');
    expect(gradle).toContain('namespace = "org.cherryblossomsoduko.game"');
    expect(gradle).toContain('versionName "0.1.0"');
    expect(gradle).toContain("arm64-v8a");
    const cap = readFileSync(join(repoRoot, "capacitor.config.ts"), "utf8");
    expect(cap).toContain('appId: "org.cherryblossomsoduko.game"');
    expect(cap).toContain('webDir: "dist"');
    const strings = readFileSync(
      join(repoRoot, "android/app/src/main/res/values/strings.xml"),
      "utf8",
    );
    expect(strings).toContain("Cherry Blossom Soduko");
    expect(strings).toContain("org.cherryblossomsoduko.game");
    const workflow = readFileSync(
      join(repoRoot, ".github/workflows/android-apk.yml"),
      "utf8",
    );
    expect(workflow).toContain("workflow_dispatch:");
    expect(workflow).toContain("assembleDebug");
    expect(workflow).toContain("CherryBlossomSoduko.apk");
    const script = readFileSync(
      join(repoRoot, "scripts/build-apk.ps1"),
      "utf8",
    );
    expect(script).toContain("assembleDebug");
    expect(script).toContain("org.cherryblossomsoduko.game");
  });

  it("has no hover-only controls in CSS", () => {
    const css = readFileSync(join(repoRoot, "src/index.css"), "utf8");
    expect(css).not.toMatch(/:hover\s*\{[^}]*display\s*:/);
    expect(css.includes(":hover")).toBe(false);
  });
});
