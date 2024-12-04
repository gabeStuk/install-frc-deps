import { defineConfig } from '@vscode/test-cli';

export default defineConfig({
	files: 'out/test/**/*.test.js',
	useInstallation: {
		fromPath: "C:/Users/Public/wpilib/2024/vscode/Code.exe",
	},

	launchArgs: [
		'--wait',
	]
});
