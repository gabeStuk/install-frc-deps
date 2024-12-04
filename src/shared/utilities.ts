// Source: https://github.com/wpilibsuite/vscode-wpilib/blob/main/vscode-wpilib/src/utilities.ts

import * as fs from 'fs';
import * as mkdirp from "mkdirp";
import * as util from 'util';

export const statAsync = util.promisify(fs.stat);

export const readFileAsync = util.promisify(fs.readFile);

export const writeFileAsync = util.promisify(fs.writeFile);

export const copyFileAsync = util.promisify(fs.copyFile);

export const mkdirAsync = util.promisify(fs.mkdir);

export const existsAsync = util.promisify(fs.exists);

export const deleteFileAsync = util.promisify(fs.unlink);

export const mkdirpAsync = mkdirp.mkdirp;

export const readdirAsync = util.promisify(fs.readdir);