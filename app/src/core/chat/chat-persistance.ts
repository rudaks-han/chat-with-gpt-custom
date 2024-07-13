import * as idb from '../utils/idb';
import {MessageTree} from './message-tree';
import {YChatDoc} from './y-chat';

export async function loadFromPreviousVersion(doc: YChatDoc) {
    const serialized = await idb.get('chats');
    if (serialized) {
        for (const chat of serialized) {
            try {
                if (chat.deleted) {
                    continue;
                }
                if (doc.has(chat.id)) {
                    continue;
                }
                const messages = new MessageTree();
                for (const m of chat.messages) {
                    messages.addMessage(m);
                }
                chat.messages = messages;
            } catch (e) {
                console.error(e);
            }
        }
    }
}
