import { mkdtemp, readFile, rm, writeFile, mkdir } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { patchBuiltinSkills } from '@/process/utils/patchBuiltinSkills';

const tempDirs: string[] = [];

async function createTempDataDir(): Promise<string> {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'trace-builtin-skills-test-'));
  tempDirs.push(dir);
  await mkdir(path.join(dir, 'builtin-skills'), { recursive: true });
  return dir;
}

async function writeSkill(dataDir: string, skillName: string, content: string): Promise<void> {
  const skillDir = path.join(dataDir, 'builtin-skills', skillName);
  await mkdir(skillDir, { recursive: true });
  await writeFile(path.join(skillDir, 'SKILL.md'), content);
}

async function writeSkillFile(
  dataDir: string,
  skillName: string,
  relativePath: string,
  content: string
): Promise<void> {
  const filePath = path.join(dataDir, 'builtin-skills', skillName, relativePath);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, content);
}

describe('patchBuiltinSkills', () => {
  afterEach(async () => {
    await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
  });

  it('patches recruiter skills and refreshes the skill scan', async () => {
    const dataDir = await createTempDataDir();
    await writeSkill(
      dataDir,
      'trace-config',
      [
        '---',
        'name: trace-config',
        'description: Configure Trace itself.',
        '---',
        '',
        '# Trace Config',
        '',
        'Use the trace-config skill with TRACE markers and ~/.trace paths.',
      ].join('\n')
    );
    await writeSkillFile(
      dataDir,
      'trace-config',
      'scripts/trace_api.py',
      '"""Trace helper."""\nprint("trace-config TRACE")\n'
    );
    await writeSkill(
      dataDir,
      'x-recruiter',
      [
        '---',
        'name: x-recruiter',
        'description: 用于在 X 发布招聘帖子。',
        '---',
        '',
        '# X Recruiter (X 招聘助手)',
      ].join('\n')
    );
    await writeSkill(
      dataDir,
      'xiaohongshu-recruiter',
      [
        '---',
        'name: xiaohongshu-recruiter',
        'description: 用于在小红书上发布高质量的 AI 相关岗位招聘帖子。',
        '---',
        '',
        '# Xiaohongshu Recruiter (小红书招聘助手)',
      ].join('\n')
    );
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true });

    await expect(patchBuiltinSkills(dataDir, { backendPort: 25808, fetchImpl })).resolves.toBe(true);

    const traceSkill = await readFile(path.join(dataDir, 'builtin-skills', 'trace-config', 'SKILL.md'), 'utf8');
    expect(traceSkill).toContain('name: trace-config');
    expect(traceSkill).toContain('Configure Trace itself.');
    expect(traceSkill).toContain('# Trace Config');
    expect(traceSkill).toContain('trace-config skill');
    expect(traceSkill).toContain('TRACE markers and ~/.trace paths');
    const traceScript = await readFile(
      path.join(dataDir, 'builtin-skills', 'trace-config', 'scripts', 'trace_api.py'),
      'utf8'
    );
    expect(traceScript).toContain('Trace helper');
    expect(traceScript).toContain('trace-config TRACE');

    const recruiterSkill = await readFile(path.join(dataDir, 'builtin-skills', 'x-recruiter', 'SKILL.md'), 'utf8');
    expect(recruiterSkill).toContain('description: Publish recruiting posts on X');
    expect(recruiterSkill).toContain('# X Recruiter');
    expect(recruiterSkill).not.toContain('招聘助手');

    const xiaohongshuRecruiterSkill = await readFile(
      path.join(dataDir, 'builtin-skills', 'xiaohongshu-recruiter', 'SKILL.md'),
      'utf8'
    );
    expect(xiaohongshuRecruiterSkill).toContain('description: Publish high-quality AI recruiting posts on Xiaohongshu');
    expect(xiaohongshuRecruiterSkill).toContain('# Xiaohongshu Recruiter');
    expect(xiaohongshuRecruiterSkill).not.toContain('小红书招聘助手');

    expect(fetchImpl).toHaveBeenCalledWith('http://127.0.0.1:25808/api/skills/scan', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ folder_path: path.join(dataDir, 'builtin-skills') }),
    });
  });

  it('updates stale built-in recruiter descriptions in the backend catalog', async () => {
    const dataDir = await createTempDataDir();
    await writeSkill(
      dataDir,
      'x-recruiter',
      [
        '---',
        'name: x-recruiter',
        'description: Publish recruiting posts on X (x.com). Includes copywriting rules, image generation prompts, and an automated posting script. Prefer this skill when publishing AI, design, or technical roles.',
        '---',
        '',
        '# X Recruiter',
      ].join('\n')
    );
    await writeSkill(
      dataDir,
      'xiaohongshu-recruiter',
      [
        '---',
        'name: xiaohongshu-recruiter',
        'description: Publish high-quality AI recruiting posts on Xiaohongshu. Includes automated geek-style cover and job-detail image generation plus a semi-automated publishing script. Use this skill when posting recruiting content or hiring Agent designers and other AI talent.',
        '---',
        '',
        '# Xiaohongshu Recruiter',
      ].join('\n')
    );

    await writeFile(path.join(dataDir, 'trace-backend.db'), '');
    const descriptions = new Map([
      ['x-recruiter', '用于在 X 发布招聘帖子。'],
      ['xiaohongshu-recruiter', '用于在小红书上发布高质量的 AI 相关岗位招聘帖子。'],
    ]);
    const close = vi.fn();
    const prepare = vi.fn((sql: string) => ({
      run: (...args: unknown[]) => {
        if (sql.includes('WHERE name = ?') && sql.includes('description <> ?')) {
          const [description, _updatedAt, name] = args as [string, number, string, string];
          const changed = descriptions.get(name) !== description;
          descriptions.set(name, description);
          return { changes: changed ? 1 : 0 };
        }
        return { changes: 0 };
      },
    }));
    const sqliteDriverFactory = vi.fn(() => ({
      close,
      pragma: vi.fn(),
      prepare,
    }));

    await expect(patchBuiltinSkills(dataDir, { sqliteDriverFactory })).resolves.toBe(true);

    expect(sqliteDriverFactory).toHaveBeenCalledWith(path.join(dataDir, 'trace-backend.db'));
    expect(close).toHaveBeenCalled();
    expect(descriptions.get('x-recruiter')).toBe(
      'Publish recruiting posts on X (x.com). Includes copywriting rules, image generation prompts, and an automated posting script. Prefer this skill when publishing AI, design, or technical roles.'
    );
    expect(descriptions.get('xiaohongshu-recruiter')).toBe(
      'Publish high-quality AI recruiting posts on Xiaohongshu. Includes automated geek-style cover and job-detail image generation plus a semi-automated publishing script. Use this skill when posting recruiting content or hiring Agent designers and other AI talent.'
    );
  });

  it('does nothing when built-in skills are already patched', async () => {
    const dataDir = await createTempDataDir();
    await writeSkill(
      dataDir,
      'trace-config',
      ['---', 'name: trace-config', 'description: Configure Trace itself.', '---', '', '# Trace Config'].join('\n')
    );
    const fetchImpl = vi.fn();

    await expect(patchBuiltinSkills(dataDir, { backendPort: 25808, fetchImpl })).resolves.toBe(false);
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
