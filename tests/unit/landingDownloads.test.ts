import { describe, expect, it } from 'vitest';
import {
  desktopDownloadGroups,
  downloadPageHref,
  releaseBase,
  releaseVersion,
} from '../../packages/web/lib/landing-content';

describe('landing download links', () => {
  it('routes landing download CTAs to the download page', () => {
    expect(downloadPageHref).toBe('/download');
  });

  it('publishes a direct installer link for each desktop platform and architecture', () => {
    const downloadOptions = desktopDownloadGroups.flatMap((group) => group.options);
    const hrefs = downloadOptions.map((option) => option.href);

    expect(downloadOptions).toHaveLength(6);
    expect(new Set(hrefs).size).toBe(hrefs.length);
    expect(hrefs).toEqual([
      `${releaseBase}/Trace-${releaseVersion}-mac-arm64.dmg`,
      `${releaseBase}/Trace-${releaseVersion}-mac-x64.dmg`,
      `${releaseBase}/Trace-${releaseVersion}-win-x64.exe`,
      `${releaseBase}/Trace-${releaseVersion}-win-arm64.exe`,
      `${releaseBase}/Trace-${releaseVersion}-linux-x64.deb`,
      `${releaseBase}/Trace-${releaseVersion}-linux-arm64.deb`,
    ]);
  });
});
