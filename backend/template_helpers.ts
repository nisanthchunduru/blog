import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';
import { format } from 'date-fns';
import { orderBy } from 'lodash';

const templatesRoot = path.join(__dirname, '..', 'templates');
const staticFolder = path.join(__dirname, '..', 'static');
const assetHashes: { [key: string]: string | null } = {};

function computeAssetHash(file: string): string | null {
  if (assetHashes.hasOwnProperty(file)) {
    return assetHashes[file];
  }

  const assetPath = path.join(staticFolder, file);
  
  if (fs.existsSync(assetPath)) {
    const fileBuffer = fs.readFileSync(assetPath);
    const hash = crypto.createHash('md5').update(fileBuffer).digest('hex').substring(0, 10);
    assetHashes[file] = hash;
    return hash;
  } else {
    assetHashes[file] = null;
    return null;
  }
}

function resolvePartialFilePath(filePath: string, root?: string): string {
  let fullPath = filePath;
  if (!path.isAbsolute(filePath) && root) {
    fullPath = path.join(root, filePath);
  }
  
  if (!fullPath.endsWith('.liquid')) {
    fullPath += '.liquid';
  }
  
  if (fs.existsSync(fullPath)) {
    return fullPath;
  }
  
  const dir = path.dirname(fullPath);
  const basename = path.basename(fullPath, '.liquid');
  const underscored = path.join(dir, `_${basename}.liquid`);
  
  if (fs.existsSync(underscored)) {
    return underscored;
  }
  
  const rootUnderscored = path.join(templatesRoot, `_${basename}.liquid`);
  if (fs.existsSync(rootUnderscored)) {
    return rootUnderscored;
  }
  
  return fullPath;
}

export function createCustomFileSystem() {
  const fileSystem = {
    resolve: (root: string, file: string, ext: string): string => {
      return resolvePartialFilePath(file, root);
    },
    readFileSync: (file: string): string => {
      const resolved = resolvePartialFilePath(file, templatesRoot);
      return fs.readFileSync(resolved, 'utf-8');
    },
    existsSync: (file: string): boolean => {
      if (fs.existsSync(file)) {
        return true;
      }
      const dir = path.dirname(file);
      const basename = path.basename(file, '.liquid');
      const underscored = path.join(dir, `_${basename}.liquid`);
      if (fs.existsSync(underscored)) {
        return true;
      }
      const rootUnderscored = path.join(templatesRoot, `_${basename}.liquid`);
      return fs.existsSync(rootUnderscored);
    },
    exists: (file: string): Promise<boolean> => {
      return Promise.resolve(fileSystem.existsSync(file));
    },
    readFile: (file: string): Promise<string> => {
      return Promise.resolve(fileSystem.readFileSync(file));
    }
  };
  return fileSystem;
}

export function createLiquidFilters() {
  return {
    asset_url: (file: string) => {
      const assetHash = computeAssetHash(file) || 'nohash';
      return `/${file}?v=${assetHash}`;
    },
    sort_by: (entities: Record<string, unknown>[], key: string, direction: string = 'desc') => {
      return orderBy(entities, [key], [direction === 'desc' ? 'desc' : 'asc']);
    },
    format_time: (timeString: string | null | undefined, formatString: string = '%b %d, %Y') => {
      if (!timeString) return '';
      const parsedDate = new Date(timeString);
      
      if (isNaN(parsedDate.getTime())) return '';
      
      const formatMap: Record<string, string> = {
        '%b': format(parsedDate, 'MMM'),
        '%d': format(parsedDate, 'dd'),
        '%-d': format(parsedDate, 'd'),
        '%Y': format(parsedDate, 'yyyy'),
        '%y': format(parsedDate, 'yy'),
        '%m': format(parsedDate, 'MM'),
        '%-m': format(parsedDate, 'M'),
        '%B': format(parsedDate, 'MMMM'),
        '%A': format(parsedDate, 'EEEE'),
        '%a': format(parsedDate, 'EEE')
      };
      
      let formattedDateString = formatString;
      Object.entries(formatMap).forEach(([placeholder, formattedValue]) => {
        formattedDateString = formattedDateString.replace(placeholder, formattedValue);
      });
      
      return formattedDateString;
    },
    content_path: (content: { name: string; slug: string }) => {
      if (!content || !content.name || !content.slug) {
        return '';
      }
      if (content.name === content.slug) {
        return `/${content.slug}`;
      }
      return `/${content.name}s/${content.slug}`;
    },
    url_encode: (str: string) => {
      if (!str) return '';
      return encodeURIComponent(str);
    }
  };
}
