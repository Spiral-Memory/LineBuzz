interface BaseAttachment {
    type: string;
}

export interface Snippet extends BaseAttachment {
    type: 'code';
    file_path: string;
    start_line: number;
    end_line: number;
    content: string;
    commit_sha: string;
    ref: string;
    remote_url: string;
}

export type Attachment = Snippet;
