// Source: https://github.com/wpilibsuite/vscode-wpilib/blob/main/vscode-wpilib/src/shared/vendorlibrariesbase.ts

import * as path from 'path';
import { deleteFileAsync, existsAsync, mkdirpAsync, readdirAsync, readFileAsync, writeFileAsync } from './utilities.js';
import { IUtilitiesAPI } from 'vscode-wpilibapi';

export interface IJsonDependency {
  name: string;
  version: string;
  uuid: string;
  jsonUrl: string;
  fileName: string;
  conflictsWith: IJsonConflicts[] | undefined;
  requires: IJsonRequires[] | undefined;
}

export interface  IJsonRequires {
  uuid: string;
  errorMessage: string;
  offlineFileName: string;
  onlineUrl: string;
}

export interface IJsonConflicts {
  uuid: string;
  errorMessage: string;
  offlineFileName: string;
}

export function isJsonDependency(arg: unknown): arg is IJsonDependency {
  const jsonDep = arg as IJsonDependency;

  return jsonDep.jsonUrl !== undefined && jsonDep.name !== undefined
         && jsonDep.uuid !== undefined && jsonDep.version !== undefined;
}

export class VendorLibrariesBase {
  private utilities: IUtilitiesAPI;

  public constructor(utilities: IUtilitiesAPI) {
    this.utilities = utilities;
  }

  public async findForUUIDs(uuid: string[]): Promise<IJsonDependency[]> {
    const homeDirDeps = await this.getHomeDirDeps();
    const foundDeps = homeDirDeps.filter((value) => {
      return uuid.indexOf(value.uuid) >= 0;
    });
    return foundDeps;
  }

  public getVendorFolder(root: string): string {
    return path.join(root, 'vendordeps');
  }

  public async installDependency(dep: IJsonDependency, url: string, override: boolean): Promise<boolean> {
    const dirExists = await existsAsync(url);

    if (!dirExists) {
      await mkdirpAsync(url);
      // Directly write file
      await writeFileAsync(path.join(url, dep.fileName), JSON.stringify(dep, null, 4));
      return true;
    }

    const files = await readdirAsync(url);

    for (const file of files) {
      const fullPath = path.join(url, file);
      const result = await this.readFile(fullPath);
      if (result !== undefined) {
        if (result.uuid === dep.uuid) {
          if (override) {
            await deleteFileAsync(fullPath);
            break;
          } else {
            return false;
          }
        }
      }
    }

    await writeFileAsync(path.join(url, dep.fileName), JSON.stringify(dep, null, 4));
    return true;
  }

  public getHomeDirDeps(): Promise<IJsonDependency[]> {
    return this.getDependencies(path.join(this.utilities.getWPILibHomeDir(), 'vendordeps'));
  }

  public async readFile(file: string): Promise<IJsonDependency | undefined> {
    try {
      const jsonContents = await readFileAsync(file, 'utf8');
      const dep = JSON.parse(jsonContents);

      if (isJsonDependency(dep)) {
        return dep;
      }

      return undefined;
    } catch (err) {
      return undefined;
    }
  }

  public async getDependencies(dir: string): Promise<IJsonDependency[]> {
    try {
      const files = await readdirAsync(dir);

      const promises: Promise<IJsonDependency | undefined>[] = [];

      for (const file of files) {
        promises.push(this.readFile(path.join(dir, file)));
      }

      const results = await Promise.all(promises);

      return results.filter((x) => x !== undefined) as IJsonDependency[];
    } catch (err) {
      return [];
    }
  }

  public async loadFileFromUrl(url: string): Promise<IJsonDependency> {
    const response = await fetch(url);
    if (response === undefined) {
      throw new Error('Failed to fetch file');
    }
    if (response.status >= 200 && response.status <= 300) {
      const text = await response.text();
      const json = JSON.parse(text);
      if (isJsonDependency(json)) {
        return json;
      } else {
        throw new Error('Incorrect JSON format');
      }
    } else {
      throw new Error('Bad status ' + response.status);
    }
  }
}