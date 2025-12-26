import { Container } from "../services/ServiceContainer";
import { Input } from "../platform/input";

export async function sendMessageCommand() {
    const message = await Input.showInputBox({
        placeHolder: "Enter message",
        prompt: "Send a message"
    });

    if (!message) {
        return;
    }

    const messageService = Container.get("MessageService");
    messageService.sendMessage({ content: message, attachments: [] });
}
