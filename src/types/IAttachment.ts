interface BaseAttachment {
    type: string;
}

export interface Snippet extends BaseAttachment {
    type: 'code';
    filePath: string;
    startLine: number;
    endLine: number;
    content: string;
    repoUrl: string;
}

export type Attachment = Snippet;
