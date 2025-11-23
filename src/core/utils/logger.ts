import * as vscode from 'vscode';

export const logger = {
    info: (context: string, message: string, ...args: any[]): void => {
        log('INFO', context, message, args);
    },

    warn: (context: string, message: string, ...args: any[]): void => {
        log('WARN', context, message, args);
    },

    error: (context: string, message: string, ...args: any[]): void => {
        log('ERROR', context, message, args);
    }
};

function log(level: string, context: string, message: string, args: any[]): void {
    const formattedMessage = `[LineBuzz] [${context}] ${message}`;

    if (args.length > 0) {
        console.log(formattedMessage, ...args);
    } else {
        console.log(formattedMessage);
    }
}
