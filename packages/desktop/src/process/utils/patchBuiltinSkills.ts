/**
 * @license
 * Copyright 2026 Trace (trace.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs/promises';
import path from 'path';

type PatchLogger = Pick<Console, 'error' | 'info' | 'warn'>;

export type PatchBuiltinSkillsOptions = {
  backendPort?: number;
  fetchImpl?: typeof fetch;
  logger?: PatchLogger;
  sqliteDriverFactory?: SqliteDriverFactory;
};

type SkillRename = {
  from: string;
  to: string;
};

type SqliteRunResult = {
  changes: number;
};

type SqliteStatement = {
  run: (...args: unknown[]) => SqliteRunResult;
};

type SqliteDriver = {
  prepare: (sql: string) => SqliteStatement;
  pragma: (sql: string) => unknown;
  close: () => void;
};

type SqliteDriverFactory = (dbPath: string) => Promise<SqliteDriver> | SqliteDriver;

const SKILL_RENAMES: SkillRename[] = [];

const X_RECRUITER_DESCRIPTION =
  'Publish recruiting posts on X (x.com). Includes copywriting rules, image generation prompts, and an automated posting script. Prefer this skill when publishing AI, design, or technical roles.';

const X_RECRUITER_SKILL_MD = `---
name: x-recruiter
description: ${X_RECRUITER_DESCRIPTION}
---

> **Platform note - read before running any command.** The command examples here are written for **macOS / Linux**. On **Windows**: run \`python\` (or \`py\`) instead of \`python3\`, use \`$env:USERPROFILE\\...\` and backslashes instead of \`~/...\`, and translate shell pipes/redirects (\`|\`, \`>\`, \`&&\`) to their PowerShell equivalents before running. The scripts themselves are cross-platform; only the way you invoke them differs.

# X Recruiter

Use this skill to prepare and publish recruiting posts on X. It covers concise job-post copy, image generation, and browser-assisted publishing.

## Workflow

### 1. Collect The Required Details

Confirm these details with the user:

- **Role title**
- **Core responsibilities and requirements**
- **Application email or link**

### 2. Generate Visual Assets

Use \`scripts/generate_images.js\` to generate images.

\`\`\`bash
node scripts/generate_images.js
\`\`\`

Expected outputs:

- \`cover.png\`
- \`jd_details.png\`

### 3. Write The Post Copy

Write copy that fits X's tone and stays within 280 characters.

Rules:

- Follow \`assets/rules.md\`.
- Keep it concise and specific.
- Include the role, key requirements, and application method.

### 4. Publish To X

Use \`scripts/publish_x.py\` to open a browser and prepare the post.

Prerequisites:

- Install Playwright: \`pip install playwright\`
- Install the browser driver: \`playwright install chromium\`

Run:

\`\`\`bash
python3 scripts/publish_x.py "post_content.txt" "cover.png" "jd_details.png"
\`\`\`

Interaction flow:

1. Watch the browser window. The script opens X.
2. If a login page appears, complete login manually.
3. After login, the script fills the post copy and attaches images.
4. Review the content in the browser, then click **Post** when it is correct.

## Resources

- \`assets/rules.md\`: post copy rules and limits.
- \`assets/design_philosophy.md\`: visual style guide.
- \`scripts/generate_images.js\`: image generation script.
- \`scripts/publish_x.py\`: publishing automation script.
`;

const XIAOHONGSHU_RECRUITER_DESCRIPTION =
  'Publish high-quality AI recruiting posts on Xiaohongshu. Includes automated geek-style cover and job-detail image generation plus a semi-automated publishing script. Use this skill when posting recruiting content or hiring Agent designers and other AI talent.';

const XIAOHONGSHU_RECRUITER_SKILL_MD = `---
name: xiaohongshu-recruiter
description: ${XIAOHONGSHU_RECRUITER_DESCRIPTION}
---

> **Platform note - read before running any command.** The command examples here are written for **macOS / Linux**. On **Windows**: run \`python\` (or \`py\`) instead of \`python3\`, use \`$env:USERPROFILE\\...\` and backslashes instead of \`~/...\`, and translate shell pipes/redirects (\`|\`, \`>\`, \`&&\`) to their PowerShell equivalents before running. The scripts themselves are cross-platform; only the way you invoke them differs.

# Xiaohongshu Recruiter

Use this skill to prepare and publish recruiting posts on Xiaohongshu. It covers job-post copy, geek-style visuals based on the "Systemic Flux" design direction, and semi-automated browser publishing with Playwright.

## Workflow

### Simplified Mode

When the user gives only a short instruction, such as "publish a frontend engineer recruiting post on Xiaohongshu":

1. Fill in reasonable recruiting details and copy without asking follow-up questions.
2. Do not require an email address or application link; default to direct messages or comments.
3. Generate the cover and job-detail images.
4. Open the browser, wait for the user to log in, fill the post, and publish.

### 1. Collect Details

Ask the user only when they explicitly request it or when key details conflict:

- **Role title** (for example, Agent Designer)
- **Core responsibilities and requirements**
- **Application email or link**

### 2. Generate Visual Assets

Use \`scripts/generate_images.js\` to generate images. The model-based image flow is intentionally hidden/disabled for now.

\`\`\`bash
node scripts/generate_images.js
\`\`\`

Expected outputs:

- \`cover.png\`
- \`jd_details.png\`

Adjust the script text configuration when needed.

### 3. Write The Post Copy

Write Xiaohongshu-style copy and save it as \`post_content.txt\`.

Rules:

- Follow \`assets/rules.md\`.
- Keep the title under 20 Chinese characters or similarly concise in English.
- Include relevant hashtags in the body.

### 4. Publish To Xiaohongshu

Use \`scripts/publish_xiaohongshu.py\` to open a browser and publish.

Prerequisites:

- Install Playwright: \`pip install playwright\`
- Install the browser driver: \`playwright install chromium\`

Run:

\`\`\`bash
python3 scripts/publish_xiaohongshu.py "post title" "post_content.txt" "cover.png" "jd_details.png"
\`\`\`

Interaction flow:

1. Watch the browser window. The script opens Xiaohongshu Creator Center.
2. If a login page appears, scan the QR code or complete login manually.
3. After login, the script uploads images and fills the title and body.
4. The script clicks publish automatically and leaves the browser open for confirmation.

## Resources

- \`assets/design_philosophy.md\`: visual style guide.
- \`assets/rules.md\`: platform rules and content constraints.
- \`scripts/generate_images.js\`: image generation script.
- \`scripts/publish_xiaohongshu.py\`: publishing automation script.
`;

type RecruiterSkillPatch = {
  content: string;
  description: string;
};

const RECRUITER_SKILL_CONTENT = new Map<string, RecruiterSkillPatch>([
  ['x-recruiter', { content: X_RECRUITER_SKILL_MD, description: X_RECRUITER_DESCRIPTION }],
  [
    'xiaohongshu-recruiter',
    { content: XIAOHONGSHU_RECRUITER_SKILL_MD, description: XIAOHONGSHU_RECRUITER_DESCRIPTION },
  ],
]);

function replaceVisibleTraceBranding(content: string): string {
  let next = content;
  for (const rename of SKILL_RENAMES) {
    next = next.replaceAll(rename.from, rename.to);
  }
  return next.replaceAll('an Trace', 'a Trace');
}

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

type RenameResult = {
  path: string;
  renamed: boolean;
} | null;

async function renameSkillDirectory(root: string, rename: SkillRename): Promise<RenameResult> {
  const fromPath = path.join(root, rename.from);
  const toPath = path.join(root, rename.to);
  const fromExists = await pathExists(fromPath);
  const toExists = await pathExists(toPath);

  if (fromExists && !toExists) {
    await fs.rename(fromPath, toPath);
    return { path: toPath, renamed: true };
  }

  if (fromExists && toExists) {
    await fs.rm(fromPath, { recursive: true, force: true });
    return { path: toPath, renamed: true };
  }

  return toExists ? { path: toPath, renamed: false } : null;
}

function isTextContent(content: string): boolean {
  return !content.includes('\u0000');
}

async function readTextFile(filePath: string): Promise<string | null> {
  const content = await fs.readFile(filePath, 'utf8');
  return isTextContent(content) ? content : null;
}

async function updateTextFiles(dirPath: string): Promise<void> {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        await updateTextFiles(entryPath);
        return;
      }
      if (!entry.isFile()) return;
      const content = await readTextFile(entryPath);
      if (content === null) return;
      const next = replaceVisibleTraceBranding(content);
      if (next !== content) {
        await fs.writeFile(entryPath, next);
      }
    })
  );
}

async function patchTraceSkillNames(builtinSkillsDir: string): Promise<boolean> {
  const renameResults = await Promise.all(
    SKILL_RENAMES.map(async (rename) => {
      const renamed = await renameSkillDirectory(builtinSkillsDir, rename);
      return Boolean(renamed?.renamed);
    })
  );
  const before = await snapshotTextContent(builtinSkillsDir);
  await updateTextFiles(builtinSkillsDir);
  const fileRenameChanged = await renameBrandedEntries(builtinSkillsDir);
  const after = await snapshotTextContent(builtinSkillsDir);

  return renameResults.some(Boolean) || before !== after || fileRenameChanged;
}

async function snapshotTextContent(dirPath: string): Promise<string> {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const parts = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        return snapshotTextContent(entryPath);
      }
      if (entry.isFile()) {
        return (await readTextFile(entryPath)) ?? '';
      }
      return '';
    })
  );
  return parts.join('\n');
}

async function renameBrandedEntries(dirPath: string): Promise<boolean> {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const results = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(dirPath, entry.name);
      let changed = false;

      if (entry.isDirectory()) {
        changed = await renameBrandedEntries(entryPath);
      }

      const nextName = replaceVisibleTraceBranding(entry.name);
      if (nextName === entry.name) return changed;

      const nextPath = path.join(dirPath, nextName);
      if (await pathExists(nextPath)) {
        await fs.rm(entryPath, { recursive: entry.isDirectory(), force: true });
      } else {
        await fs.rename(entryPath, nextPath);
      }
      return true;
    })
  );

  return results.some(Boolean);
}

async function patchRecruiterSkill(
  builtinSkillsDir: string,
  skillName: string,
  expectedContent: string
): Promise<boolean> {
  const skillPath = path.join(builtinSkillsDir, skillName, 'SKILL.md');
  if (!(await pathExists(skillPath))) return false;

  const current = await fs.readFile(skillPath, 'utf8');
  if (current === expectedContent) return false;

  await fs.writeFile(skillPath, expectedContent);
  return true;
}

async function patchRecruiterSkills(builtinSkillsDir: string): Promise<boolean> {
  const results = await Promise.all(
    Array.from(RECRUITER_SKILL_CONTENT, ([skillName, patch]) =>
      patchRecruiterSkill(builtinSkillsDir, skillName, patch.content)
    )
  );
  return results.some(Boolean);
}

async function createDefaultSqliteDriver(dbPath: string): Promise<SqliteDriver> {
  const { BetterSqlite3Driver } = await import('@process/services/database/drivers/BetterSqlite3Driver');
  return new BetterSqlite3Driver(dbPath);
}

async function patchRecruiterCatalogDescriptions(
  dataDir: string,
  logger: PatchLogger,
  sqliteDriverFactory: SqliteDriverFactory = createDefaultSqliteDriver
): Promise<boolean> {
  const dbPath = path.join(dataDir, 'trace-backend.db');
  if (!(await pathExists(dbPath))) return false;

  let db: SqliteDriver | null = null;
  try {
    db = await sqliteDriverFactory(dbPath);
    db.pragma('busy_timeout = 5000');

    const update = db.prepare(`
      UPDATE skills
      SET description = ?, updated_at = ?
      WHERE name = ?
        AND source = 'builtin'
        AND (description IS NULL OR description <> ?)
    `);
    const now = Date.now();
    let changed = false;

    for (const [skillName, patch] of RECRUITER_SKILL_CONTENT) {
      const result = update.run(patch.description, now, skillName, patch.description);
      changed = changed || result.changes > 0;
    }

    return changed;
  } catch (error) {
    logger.warn('[Trace] Built-in recruiter skill files patched, but catalog update failed:', error);
    return false;
  } finally {
    db?.close();
  }
}

async function patchTraceSkillCatalog(
  dataDir: string,
  logger: PatchLogger,
  sqliteDriverFactory: SqliteDriverFactory = createDefaultSqliteDriver
): Promise<boolean> {
  if (SKILL_RENAMES.length === 0) return false;

  const dbPath = path.join(dataDir, 'trace-backend.db');
  if (!(await pathExists(dbPath))) return false;

  let db: SqliteDriver | null = null;
  try {
    db = await sqliteDriverFactory(dbPath);
    db.pragma('busy_timeout = 5000');

    const now = Date.now();
    let changed = false;
    const renameSkill = db.prepare(`
      UPDATE skills
      SET name = ?, path = ?, updated_at = ?
      WHERE name = ?
        AND source = 'builtin'
    `);

    for (const rename of SKILL_RENAMES) {
      const result = renameSkill.run(rename.to, path.join(dataDir, 'builtin-skills', rename.to), now, rename.from);
      changed = changed || result.changes > 0;
    }
    return changed;
  } catch (error) {
    logger.warn('[Trace] Built-in skill files patched, but Trace catalog rebrand failed:', error);
    return false;
  } finally {
    db?.close();
  }
}

async function requestSkillScan(backendPort: number, fetchImpl: typeof fetch, builtinSkillsDir: string): Promise<void> {
  const response = await fetchImpl(`http://127.0.0.1:${backendPort}/api/skills/scan`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ folder_path: builtinSkillsDir }),
  });
  if (!response.ok) {
    throw new Error(`skill scan failed with status ${response.status}`);
  }
}

export async function patchBuiltinSkills(dataDir: string, options: PatchBuiltinSkillsOptions = {}): Promise<boolean> {
  const logger = options.logger ?? console;
  const builtinSkillsDir = path.join(dataDir, 'builtin-skills');
  if (!(await pathExists(builtinSkillsDir))) {
    return false;
  }

  const traceChanged = await patchTraceSkillNames(builtinSkillsDir);
  const recruiterChanged = await patchRecruiterSkills(builtinSkillsDir);
  const catalogChanged = await patchRecruiterCatalogDescriptions(dataDir, logger, options.sqliteDriverFactory);
  const traceCatalogChanged = await patchTraceSkillCatalog(dataDir, logger, options.sqliteDriverFactory);
  const changed = traceChanged || recruiterChanged || catalogChanged || traceCatalogChanged;
  if (!changed) return false;

  if (options.backendPort) {
    try {
      await requestSkillScan(options.backendPort, options.fetchImpl ?? fetch, builtinSkillsDir);
    } catch (error) {
      logger.warn('[Trace] Built-in skill patch applied, but skill scan failed:', error);
    }
  }

  logger.info('[Trace] Built-in skill names/content patched');
  return true;
}
