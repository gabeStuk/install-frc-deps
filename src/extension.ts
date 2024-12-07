import * as vscode from 'vscode';
import { installDeps } from './install-deps';
import { beaks } from './beaks';
import { afGradle } from './af-gradle';

export function activate(context: vscode.ExtensionContext) {

	const disposables: vscode.Disposable[] = [];

	disposables.push(vscode.commands.registerCommand('install-frc-deps.install-deps', installDeps));

	disposables.push(vscode.commands.registerCommand("install-frc-deps.af-gradle", afGradle));

	disposables.push(vscode.commands.registerCommand("install-frc-deps.beaks", beaks));
	
	disposables.forEach(disp => context.subscriptions.push(disp));
	
	vscode.window.showInformationMessage("install-frc-deps activated successfully");
}

// This method is called when your extension is deactivated
export function deactivate() { }