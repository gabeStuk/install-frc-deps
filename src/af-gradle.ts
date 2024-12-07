import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export async function afGradle() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
		if (workspaceFolders && workspaceFolders.length > 0) {
			const filename = await vscode.window.showInputBox({
				prompt: "Enter the name of the gradle build file",
				value: "build.gradle",
			});

			if (!filename) {
				vscode.window.showErrorMessage("No filename provided");
				return;
			}

			let possiblities: string[] = [];
			for (let i = 0; i < workspaceFolders.length; i++) {
				const filepath = path.join(workspaceFolders[i].uri.fsPath, filename);
				if (fs.existsSync(filepath)) {
					possiblities.push(filepath);
				}
			}

            const selected = await vscode.window.showQuickPick(possiblities, {
                placeHolder: "Choose files to add to",
                canPickMany: true,
            });

            console.log(selected);
            if (!selected) {
                vscode.window.showErrorMessage("Error: No files selected");
                return;
            } else {
                for (let i = 0; i < selected.length; i++) {
                    console.log(`Applying to file: ${selected[i]}`);
                    fs.readFile(selected[i], 'utf-8', (err, data) => {
                        if (err) {
                            vscode.window.showErrorMessage(`Failed to reaed file: ${selected[i]}`);
                            return;
                        }

                        const pluginToAdd = 'id "com.diffplug.spotless" version "7.0.0.BETA4"';
                        let newContent: string = data;
                        let mkSpotless = true;
                        if (!data.includes(pluginToAdd)) {
                            if (data.includes("plugins {")) {
                                newContent = data.replace('plugins {', `plugins {\n    ${pluginToAdd}`);
                            } else {
                                newContent = `plugins {\n    ${pluginToAdd}\n}\n\n`;
                            }
                        } else {
                            if (data.includes('spotless {')) {
                                if (!data.includes('spotless {\n    java {')) {
                                    newContent = data.replace('spotless {', 'spotless {\n    java {\n        indentWithSpaces()\n        formatAnnotations()\n    }');
                                }

                                mkSpotless = false;
                            }
                        }

                        if (mkSpotless) {
                            newContent += "\nspotless {\n    java {\n        removeUnusedImports()\n        eclipse()\n        indentWithSpaces()\n        formatAnnotations()\n    }\n}";
                        }

                        if (!data.includes("compileJava.dependsOn 'spotlessApply'")) {
                            newContent += "\ncompileJava.dependsOn 'spotlessApply'";
                        }

                        console.log(`Updated file:\n${newContent}\n(write to ${selected[i]})`);

								fs.writeFile(selected[i], newContent, (writeErr) => {
									console.log("writing");
									if (writeErr) {
										vscode.window.showErrorMessage(`Error updating ${selected[i]} Gradle file.`);
									} else {
										vscode.window.showInformationMessage(`Plugin successfully applied changes to ${selected[i]}.`);
									}
								});
                    });
                }
            }
		} else {
            vscode.window.showErrorMessage("Please open a workspace folder first");
            return;
        }
}