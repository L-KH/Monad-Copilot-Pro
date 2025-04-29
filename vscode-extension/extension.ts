import * as vscode from 'vscode';
import { exec } from 'child_process';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    console.log('Monad Copilot Pro extension is now active');

    // Register the command to run Monad Copilot
    let disposable = vscode.commands.registerCommand('monad-copilot.run', async () => {
        const prompt = await vscode.window.showInputBox({ 
            prompt: "What Monad action do you want?",
            placeHolder: "e.g., Create an NFT contract named MyArt and mint 5 to address 0x123"
        });
        
        if (!prompt) return; // User cancelled

        // Show progress notification
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Monad Copilot Pro",
            cancellable: true
        }, async (progress, token) => {
            progress.report({ message: "Processing your request..." });
            
            // Execute the CLI command
            return new Promise<void>((resolve) => {
                exec(`python "${path.join(vscode.workspace.rootPath || '', 'copilot.py')}" "${prompt}"`, (err, stdout, stderr) => {
                    if (err) {
                        vscode.window.showErrorMessage(`Error: ${err.message}`);
                        console.error(stderr);
                    } else {
                        // Show output in a new editor
                        const outputPanel = vscode.window.createOutputChannel("Monad Copilot");
                        outputPanel.clear();
                        outputPanel.appendLine(stdout);
                        outputPanel.show();
                        
                        vscode.window.showInformationMessage("Monad operation completed successfully!");
                    }
                    resolve();
                });
            });
        });
    });

    // Register the command to view workflow templates
    let viewTemplatesDisposable = vscode.commands.registerCommand('monad-copilot.viewTemplates', async () => {
        const workflowsPath = path.join(vscode.workspace.rootPath || '', 'workflows');
        
        // List available templates
        exec(`dir /b "${workflowsPath}"`, (err, stdout, stderr) => {
            if (err) {
                vscode.window.showErrorMessage(`Error listing templates: ${err.message}`);
                return;
            }
            
            const templates = stdout.split('\n')
                .filter(line => line.trim().endsWith('.json'))
                .map(line => line.replace('.json', ''));
            
            if (templates.length === 0) {
                vscode.window.showInformationMessage("No workflow templates found");
                return;
            }
            
            // Show quick pick to select a template
            vscode.window.showQuickPick(templates, {
                placeHolder: 'Select a workflow template'
            }).then(selected => {
                if (!selected) return;
                
                // Open the selected template file
                const templatePath = path.join(workflowsPath, `${selected}.json`);
                vscode.workspace.openTextDocument(templatePath).then(doc => {
                    vscode.window.showTextDocument(doc);
                });
            });
        });
    });

    context.subscriptions.push(disposable, viewTemplatesDisposable);
}

export function deactivate() {}