# install-frc-deps
`install-frc-deps` is an extension created to automate the instillation of vendor dependencies to WPILib vscode, removing the need to find the link each time, and also comes with some other utils.
## Commands
### Install Dependencies (`install-frc-deps.install-deps`)
This is the main command of the extension, which pulls the dependencies listed on [Beaksquad.dev](https://beaksquad.dev/links.html) and uses the [WPILib vscode extension API](https://github.com/wpilibsuite/vscode-wpilib/) to install the deps without any need to search for links.
### Add autoformatting to build.gradle (`install-frc-deps.af-gradle`)
This command is a merge of another previously made extension that uses [Spotless](https://github.com/diffplug/spotless/) to apply the Java autoformatter to every java file when the code compiles.
### Beak Converter (`install-frc-deps.beaks`)
This command, based on a season running joke, converts between the fictitious currency "Beaks" (1 Beak = Price of a [Limelight](https://limelightvision.io/collections/products)) and $USD.
## How do I install?
Builds of this extension can be accessed from [Actions](https://github.com/gabeStuk/install-frc-deps/actions), where the latest passing build should be working:
[![Build Extension](https://github.com/gabeStuk/install-frc-deps/actions/workflows/extensionBuild.yml/badge.svg)](https://github.com/gabeStuk/install-frc-deps/actions/workflows/extensionBuild.yml)
After downloading and unzipping the file, you can use the three dots at the top of the "extensions" tab and then click "Install from VSIX" and then select the file to install the extension.
[This](https://code.visualstudio.com/docs/editor/extension-marketplace#_install-from-a-vsix) official page has additional details
![image](https://github.com/user-attachments/assets/1e717a05-85b0-4fc9-8b9f-9d81d09b3a2c)
