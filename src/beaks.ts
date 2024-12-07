import * as vscode from 'vscode';
import cssesc from 'cssesc';
import { HTMLElement, parse } from "node-html-parser";

export async function beaks() {
    try {
        const r = await fetch("https://limelightvision.io/collections/products");
        if (!r.ok) {
            vscode.window.showErrorMessage(`HTTP error -- status: ${r.status}`);
        }
        const rootHtml = parse(await r.text());
        const cards = rootHtml.getElementsByTagName("product-card");
        let llNames: string[] = [];
        let llPrices: string[] = [];

        for (let card of cards) {
            let cardHtml = parse(card.innerHTML);
            let llName = cardHtml.querySelector(cssesc('a[class="product-title h6 "]'))?.innerText;
            let llPrice = cardHtml.querySelector('price-list')?.innerText.replaceAll("Sale price", "");
            if (cardHtml.querySelectorAll("sold-out-badge").length > 0) {
                llPrice += " (Sold Out)";
            }

            llPrice?.trim();
            llNames.push(llName as string);
            llPrices.push(llPrice as string);
        }

        if (llNames.length === 0) {
            vscode.window.showErrorMessage("Unable to find any limelights");
            return;
        }

        let highest: number[] = [0, 0];
        const priceSearch = /\d+\.\d+/;
        for (let i = 0; i < llPrices.length; i++) {
            const res = priceSearch.exec(llPrices[i]);
            if (res === null) {
                vscode.window.showErrorMessage("Error parsing prices");
                return;
            }
            if (Number(res[0]) > highest[0]) {
                highest[0] = Number(res[0]);
                highest[1] = i;
            } else if (Number(res[0]) === highest[0]) {
                highest.push(Number(res[0]));
                highest.push(i);
            }
        }
        const plural: string = highest.length > 2 ? 's' : '';
        vscode.window.showInformationMessage(`Highest price${plural}: ${plural ? highest.filter((_, i) => i % 2 === 1).map(i => llNames[i]).join(' and ') : ''} at $${highest[0]}`);
        let choice = await vscode.window.showInputBox({
            prompt: "Enter Beaks or $USD:",
        });

        if (!choice) {
            vscode.window.showErrorMessage("No input value provided");
            return;
        }

        const advancedSearch = /[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?/;
        const inputValueSearch = advancedSearch.exec(choice);
        if (inputValueSearch === null || inputValueSearch.length === 0) {
            vscode.window.showErrorMessage("Error, input does not contain a number");
            return;
        }

        const realValue = Number(inputValueSearch[0]);

        if (choice.includes("$")) {
            vscode.window.showInformationMessage(`Beaks: ${realValue / highest[0]}`);
        } else {
            vscode.window.showInformationMessage(`USD: $${realValue * highest[0]}`);
        }

        return;
    } catch (e) {
        vscode.window.showErrorMessage(`Error occured: ${e}`);
    }
}