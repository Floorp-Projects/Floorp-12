import * as fs from "node:fs/promises";
import * as pathe from "pathe";
import { injectManifest } from "./scripts/inject/manifest";
import { injectXHTML, injectXHTMLDev } from "./scripts/inject/xhtml";
import { applyMixin } from "./scripts/inject/mixin-loader";
import { build as buildVite } from "vite";
import AdmZip from "adm-zip";
import { execa, ExecaError, type ResultPromise } from "execa";
import { savePrefsForProfile } from "./scripts/launchDev/savePrefs";

import { applyPatches } from "./scripts/git-patches/git-patches-manager";
import { initializeBinGit } from "./scripts/git-patches/git-patches-manager";
import { genVersion } from "./scripts/launchDev/writeVersion";
import { writeBuildid2 } from "./scripts/update/buildid2";
import { $, type ProcessPromise } from "zx";
import { usePwsh } from "zx";

switch (process.platform) {
  case "win32":
    usePwsh();
}

//? branding
const brandingBaseName = "floorp";
const brandingName = "Floorp";

//? when the linux binary has published, I'll sync linux bin version
const VERSION = process.platform === "win32" ? "001" : "000";
const binExtractDir = "_dist/bin";
const binDir =
  process.platform !== "darwin"
    ? `_dist/bin/${brandingBaseName}`
    : `_dist/bin/${brandingBaseName}/${brandingName}.app/Contents/Resources`;

const r = (dir: string) => {
  return pathe.resolve(import.meta.dirname, dir);
};

const isExists = async (path: string) => {
  return await fs
    .access(path)
    .then(() => true)
    .catch(() => false);
};

const getBinArchive = async () => {
  const arch = process.arch;
  if (process.platform === "win32") {
    return `${brandingBaseName}-win-amd64-moz-artifact.zip`;
  } else if (process.platform === "linux") {
    if (arch === "x64") {
      return `${brandingBaseName}-linux-amd64-moz-artifact-dev.zip`;
    } else if (arch === "arm64") {
      return `${brandingBaseName}-linux-arm64-moz-artifact-dev.zip`;
    }
  } else if (process.platform === "darwin") {
    return `${brandingBaseName}-mac-universal-moz-artifact-dev.zip`;
  }
  throw new Error("Unsupported platform/architecture");
};

const binArchive = await getBinArchive();

try {
  await fs.access("dist");
  await fs.rename("dist", "_dist");
} catch {}

const binPath = pathe.join(binDir, brandingBaseName);
const binPathExe =
  process.platform !== "darwin"
    ? binPath + (process.platform === "win32" ? ".exe" : "")
    : `./_dist/bin/${brandingBaseName}/${brandingName}.app/Contents/MacOS/${brandingBaseName}`;

const binVersion = pathe.join(binDir, "nora.version.txt");

async function decompressBin() {
  try {
    console.log(`decompressing ${binArchive}`);
    if (!(await isExists(binArchive))) {
      console.error(`${binArchive} not found`);
      process.exit(1);
    }

    if (process.platform !== "darwin") {
      new AdmZip(binArchive).extractAllTo(binExtractDir);
      console.log("decompress complete!");
      await fs.writeFile(binVersion, VERSION);
    } else {
      //? macOS
      // extract zip to get .dmg
      const tempDir = "_dist/dmgTemp";
      await fs.mkdir(tempDir, { recursive: true });
      new AdmZip(binArchive).extractAllTo(tempDir);

      const mountDir = "_dist/mount";
      await fs.mkdir(mountDir, { recursive: true });
      await execa("hdiutil", [
        "attach",
        "-mountpoint",
        mountDir,
        `_dist/dmgTemp/${brandingBaseName}-macOS-universal-moz-artifact-dev.dmg`,
      ]);
      await fs.mkdir(binDir, { recursive: true });
      await execa("cp", [
        "-R",
        pathe.join(mountDir, `${brandingName}.app`),
        pathe.join(`./_dist/bin/${brandingBaseName}`, ""),
      ]);
      await fs.writeFile(binVersion, VERSION);
      await execa("hdiutil", ["detach", mountDir]);
      await fs.rm(mountDir, { recursive: true });
      await execa("chmod", [
        "-R",
        "777",
        `./_dist/bin/${brandingBaseName}/${brandingName}.app`,
      ]);
      await execa("xattr", [
        "-rc",
        `./_dist/bin/${brandingBaseName}/${brandingName}.app`,
      ]);
    }

    if (process.platform === "linux") {
      try {
        await execa("chmod", ["-R", "755", `./${binDir}`]);
        await execa("chmod", ["755", binPathExe]);
      } catch (chmodError) {
        process.exit(1);
      }
    }
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

async function initBin() {
  const hasVersion = await isExists(binVersion);
  const hasBin = await isExists(binPathExe);

  if (hasVersion) {
    const version = (await fs.readFile(binVersion)).toString();
    const mismatch = VERSION !== version;
    if (mismatch) {
      console.log(`version mismatch ${version} !== ${VERSION}`);
      await fs.rm(binDir, { recursive: true });
      await fs.mkdir(binDir, { recursive: true });
      await decompressBin();
      return;
    }
  } else {
    if (hasBin) {
      console.log(`bin exists, but version file not found, writing ${VERSION}`);
      await fs.mkdir(binDir, { recursive: true });
      await fs.writeFile(binVersion, VERSION);
    }
  }
  console.log("initBin");
  if (!hasBin) {
    console.log("There seems no bin. decompressing.");
    await fs.mkdir(binDir, { recursive: true });
    await decompressBin();
  }
}

async function runWithInitBinGit() {
  if (await isExists(binDir)) {
    await fs.rm(binDir, { recursive: true, force: true });
  }

  await initBin();
  await initializeBinGit();
  await run();
}

let devViteProcess: ProcessPromise | null = null;
let browserProcess: ProcessPromise | null = null;
const devExecaProcesses: ResultPromise[] = [];
let devInit = false;

async function run(mode: "dev" | "test" | "release" = "dev") {
  await initBin();
  await applyPatches();

  //create version for dev
  await genVersion();
  let buildid2: string | null = null;
  try {
    await fs.access("_dist/buildid2");
    buildid2 = await fs.readFile("_dist/buildid2", { encoding: "utf-8" });
  } catch {}
  console.log(`[dev] buildid2: ${buildid2}`);
  if (mode !== "release") {
    if (!devInit) {
      console.log("run dev servers");
      devViteProcess =
        $`node --import @swc-node/register/esm-register ./scripts/launchDev/child-dev.ts ${mode} ${buildid2 ?? ""}`
          .stdio("pipe")
          .nothrow();

      (async () => {
        for await (const temp of devViteProcess.stdout) {
          process.stdout.write(temp);
        }
      })();
      (async () => {
        for await (const temp of devViteProcess.stderr) {
          process.stdout.write(temp);
        }
      })();
      await execa({
        stdout: "inherit",
        preferLocal: true,
        stderr: "inherit",
      })`node --import @swc-node/register/esm-register ./scripts/launchDev/child-build.ts ${mode} ${buildid2 ?? ""}`;

      if (mode === "test") {
        devExecaProcesses.push(
          execa({
            preferLocal: true,
            cwd: r("./src/apps/test"),
          })`node --import @swc-node/register/esm-register server.ts`,
        );
      }
      // env
      if (process.platform === "darwin") {
        process.env.MOZ_DISABLE_CONTENT_SANDBOX = "1";
      }
      devInit = true;
    }
    await Promise.all([
      injectManifest(binDir, true, "noraneko-dev"),
      injectXHTMLDev(binDir),
    ]);
  } else {
    await release("before");
    try {
      await fs.access(`_dist/bin/${brandingBaseName}/noraneko-dev`);
      await fs.rm(`_dist/bin/${brandingBaseName}/noraneko-dev`, {
        recursive: true,
      });
    } catch {}
    await fs.symlink(
      `../../${brandingBaseName}`,
      `./_dist/bin/${brandingBaseName}/noraneko-dev`,
      process.platform === "win32" ? "junction" : undefined,
    );
  }

  await Promise.all([
    buildVite({
      mode,
      root: r("./src/apps/startup"),
      configFile: r("./src/apps/startup/vite.config.ts"),
    }),

    (async () => {
      await injectXHTML(binDir);
    })(),
    applyMixin(binDir),
    (async () => {
      try {
        await fs.access("_dist/profile");
        await fs.rm("_dist/profile", { recursive: true });
      } catch {}
    })(),
  ]);

  //https://github.com/puppeteer/puppeteer/blob/c229fc8f9750a4c87d0ed3c7b541c31c8da5eaab/packages/puppeteer-core/src/node/FirefoxLauncher.ts#L123
  await fs.mkdir("./_dist/profile/test", { recursive: true });
  await savePrefsForProfile("./_dist/profile/test");

  browserProcess =
    $`node --import @swc-node/register/esm-register ./scripts/launchDev/child-browser.ts`
      .stdio("pipe")
      .nothrow();

  (async () => {
    for await (const temp of browserProcess.stdout) {
      process.stdout.write(temp);
    }
  })();
  (async () => {
    for await (const temp of browserProcess.stderr) {
      process.stdout.write(temp);
    }
  })();
}

let runningExit = false;
async function exit() {
  if (runningExit) return;
  runningExit = true;
  if (browserProcess) {
    console.log("[build] Shutdown browserProcess");
    browserProcess.stdin.write("s");
    try {
      await browserProcess;
    } catch (e) {
      console.error(e);
    }
  }
  devExecaProcesses.forEach((v) => {
    v.kill(new Error("Kill by exit()"));
  });
  if (devViteProcess) {
    console.log("[build] Shutdown devViteProcess");
    devViteProcess.stdin.write("s");
    try {
      await devViteProcess;
    } catch (e) {
      console.error(e);
    }
  }
  process.exit(0);
}

process.on("SIGINT", async () => {
  await exit();
});

/**
 * * Please run with NODE_ENV='production'
 * @param mode
 */
async function release(mode: "before" | "after") {
  let buildid2: string | null = null;
  try {
    await fs.access("_dist/buildid2");
    buildid2 = await fs.readFile("_dist/buildid2", { encoding: "utf-8" });
  } catch {}
  console.log(`[build] buildid2: ${buildid2}`);
  if (mode === "before") {
    await execa({
      stdout: "inherit",
      preferLocal: true,
    })`node --import @swc-node/register/esm-register ./scripts/launchDev/child-build.ts production ${buildid2 ?? ""}`;
    await injectManifest("./_dist", false);
  } else if (mode === "after") {
    const binPath = "../obj-artifact-build-output/dist/bin";
    injectXHTML(binPath);
    let buildid2: string | null = null;
    try {
      await fs.access("_dist/buildid2");
      buildid2 = await fs.readFile("_dist/buildid2", { encoding: "utf-8" });
    } catch {}
    await writeBuildid2(`${binPath}/browser`, buildid2 ?? "");
  }
}

if (process.argv[2]) {
  switch (process.argv[2]) {
    case "--run":
      run();
      break;
    case "--run-with-init-bin-git":
      runWithInitBinGit();
      break;
    case "--test":
      run("test");
      break;
    case "--run-prod":
      run("release");
      break;
    case "--release-build-before":
      release("before");
      break;
    case "--release-build-after":
      release("after");
      break;
    case "--write-version":
      await genVersion();
      break;
  }
}
