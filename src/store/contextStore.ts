let contextId: string | undefined;

export function setContextId(id: string) {
  contextId = id;
}

export function getContextId(): string | undefined {
  return contextId;
}
