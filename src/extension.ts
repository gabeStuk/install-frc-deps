import * as vscode from 'vscode';
import { HTMLElement, parse } from 'node-html-parser';
import { VendorLibrariesBase } from './shared/vendorlibrariesbase.js';
import * as wpilibapi from 'vscode-wpilibapi';

export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand('install-frc-deps.install-deps', async () => {
		vscode.window.showInformationMessage("Fetching avaliable deps");
		try {
			const response = await fetch("https://beaksquad.dev/links.html");
			if (!response.ok) {
				vscode.window.showErrorMessage(`HTTP Error -- status: ${response.status}`);
			}

			let links: Record<string, string> = {};
			let titles: string[] = [];
			const root = parse(await response.text());
			
			let a: Array<HTMLElement> = root.getElementsByTagName('a');
			for (var i = 0; i < a.length; i++) {
				if (a[i].attributes["href"].includes("/vendors/")) {
					titles.push(a[i].innerText);
					links[a[i].innerText] = a[i].attributes["href"];
				}
			}
			
			vscode.window.showInformationMessage("Done fetching deps");

			let libManager = new VendorLibrariesBase((await wpilibapi.getWPILibApi())?.getUtilitiesAPI() as wpilibapi.IUtilitiesAPI);
			const existing = await libManager.getDependencies(libManager.getVendorFolder(vscode.workspace.workspaceFolders?.at(0)?.uri.fsPath as string));

			let selectionOptions = titles.map(title => ({
				label: title,
				description: links[title]
			}));

			for (var i = 0; i < selectionOptions.length; i++) {
				const file = await libManager.loadFileFromUrl(selectionOptions[i].description);
				for (const dep of existing) {
					if (dep.uuid === file.uuid) {
						selectionOptions[i].label += " (Installed)";
					}
				}
			}

			let selection = await vscode.window.showQuickPick(selectionOptions, {
				placeHolder: "Choose VendorDeps to import:",
				canPickMany: true,
			});

			if (!selection || selection.length === 0) {
				vscode.window.showErrorMessage("Error: No Selection");
				return;
			}

			vscode.window.showInformationMessage(`Selected: [${selection.map(sel => sel.label).join(', ')}]`);

			let allSucceeded: boolean = true;

			for (var i = 0; i < selection.length; i++) {
				const file = await libManager.loadFileFromUrl(selection[i].description);

				const success = await libManager.installDependency(file, libManager.getVendorFolder(vscode.workspace.workspaceFolders?.at(0)?.uri.fsPath as string), true);
				allSucceeded = allSucceeded && success;
			}
			
			if (allSucceeded) {
				const buildRes = await vscode.window.showInformationMessage(
					'It is recommended to run a "Build" after a vendor update. ' +
					  'Would you like to do this now?', {
						modal: true,
					}, {title: "Yes"}, {title: "No", isCloseAffordace: true});

				if (buildRes?.title === 'Yes') {
					await (await wpilibapi.getWPILibApi())?.getBuildTestAPI()
						.buildCode(vscode.workspace.getWorkspaceFolder(vscode.workspace.workspaceFolders?.at(0)?.uri as vscode.Uri) as vscode.WorkspaceFolder, undefined);
				}
			} else {
				vscode.window.showErrorMessage(`Failed to install ${selection[i].label}`);
			}
		} catch (err) {
			vscode.window.showErrorMessage(`Error occurred: ${err}`);
		}
	});

	
	context.subscriptions.push(disposable);
	
	vscode.window.showInformationMessage("install-frc-deps activated successfully");
}

// This method is called when your extension is deactivated
export function deactivate() { }