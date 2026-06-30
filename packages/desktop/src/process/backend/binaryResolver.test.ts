import { execSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resolveBinaryPath } from './binaryResolver';

vi.mock('node:child_process', () => ({
  execSync: vi.fn(),
}));

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  readdirSync: vi.fn(),
}));

const originalResourcesPath = (process as NodeJS.Process & { resourcesPath?: string }).resourcesPath;
const originalBackendBin = process.env.TRACE_BACKEND_BIN;

function setResourcesPath(resourcesPath: string | undefined): void {
  Object.defineProperty(process, 'resourcesPath', {
    configurable: true,
    value: resourcesPath,
  });
}

function dirEntry(name: string, isDirectory = false): ReturnType<typeof readdirSync>[number] {
  return {
    name,
    isDirectory: () => isDirectory,
  } as unknown as ReturnType<typeof readdirSync>[number];
}

describe('resolveBinaryPath', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    setResourcesPath(originalResourcesPath);
    if (originalBackendBin === undefined) {
      delete process.env.TRACE_BACKEND_BIN;
    } else {
      process.env.TRACE_BACKEND_BIN = originalBackendBin;
    }
  });

  it('prefers explicit backend binary override', () => {
    process.env.TRACE_BACKEND_BIN = '/custom/aioncore';
    vi.mocked(existsSync).mockImplementation((path) => path === '/custom/aioncore');

    expect(resolveBinaryPath()).toBe('/custom/aioncore');
    expect(execSync).not.toHaveBeenCalled();
  });

  it('uses repo-local bundled binary in development', () => {
    const runtimeKey = `${process.platform}-${process.arch}`;
    const binaryName = process.platform === 'win32' ? 'aioncore.exe' : 'aioncore';
    const checkedDevBundledPath = join(process.cwd(), 'resources', 'bundled-aioncore', runtimeKey, binaryName);

    setResourcesPath('/electron/resources');
    vi.mocked(existsSync).mockImplementation((path) => path === checkedDevBundledPath);

    expect(resolveBinaryPath()).toBe(checkedDevBundledPath);
    expect(execSync).not.toHaveBeenCalled();
  });

  it('attaches bundled path diagnostics when aioncore cannot be resolved', () => {
    const resourcesPath = '/app/resources';
    const runtimeKey = `${process.platform}-${process.arch}`;
    const binaryName = process.platform === 'win32' ? 'aioncore.exe' : 'aioncore';
    const bundledDir = join(resourcesPath, 'bundled-aioncore');
    const runtimeDir = join(bundledDir, runtimeKey);
    const checkedBundledPath = join(runtimeDir, binaryName);
    const checkedDevBundledPath = join(process.cwd(), 'resources', 'bundled-aioncore', runtimeKey, binaryName);

    setResourcesPath(resourcesPath);
    vi.mocked(existsSync).mockReturnValue(false);
    vi.mocked(readdirSync).mockImplementation((path) => {
      if (path === resourcesPath) return [dirEntry('bundled-aioncore', true)];
      if (path === runtimeDir) return [dirEntry('manifest.json')];
      return [] as ReturnType<typeof readdirSync>;
    });
    vi.mocked(execSync).mockImplementation(() => {
      throw new Error('not found on PATH');
    });

    expect(() => resolveBinaryPath()).toThrow('Cannot find "aioncore" binary');

    try {
      resolveBinaryPath();
    } catch (error) {
      expect(error).toMatchObject({
        name: 'BackendBinaryResolveError',
        diagnostics: expect.objectContaining({
          resourcesPath,
          runtimeKey,
          binaryName,
          checkedBundledPath,
          checkedDevBundledPath,
          bundledDirExists: false,
          runtimeDirExists: false,
          devBundledDirExists: false,
          devRuntimeDirExists: false,
          resourcesDirEntries: ['bundled-aioncore/'],
          runtimeDirEntries: ['manifest.json'],
          pathLookupCommand: process.platform === 'win32' ? 'where aioncore' : 'which aioncore',
          pathLookupError: expect.stringContaining('not found on PATH'),
        }),
      });
    }
  });
});
