import { useEffect, useRef, type Dispatch, type SetStateAction } from "react";
import type { ChatType } from "../types/Chat";
import { fetchAssistantResponse, fetchChatTitle } from "../api/chatApi";
import { ApiError } from "../types/Api";
import { createMessage } from "../utils/conversation";

type UseChatGenerationProps = {
    setChats: Dispatch<SetStateAction<ChatType[]>>;
};

const TYPING_TICK_MS = 20;
const TYPING_TARGET_MS = 1500; // long replies finish in about this time
const MIN_CHARS_PER_TICK = 2;

export function useChatGeneration({ setChats }: UseChatGenerationProps) {
    const controllersRef = useRef(new Map<string, AbortController>());
    const intervalsRef = useRef(new Map<string, ReturnType<typeof setInterval>>());

    function updateChat(chatId: string, update: (chat: ChatType) => ChatType) {
        setChats((prev) => prev.map((chat) => (chat.id === chatId ? update(chat) : chat)));
    }

    function clearTyping(chatId: string) {
        const interval = intervalsRef.current.get(chatId);
        if (interval) clearInterval(interval);
        intervalsRef.current.delete(chatId);
    }

    function abortRequest(chatId: string) {
        controllersRef.current.get(chatId)?.abort();
        controllersRef.current.delete(chatId);
    }

    useEffect(() => {
        const controllers = controllersRef.current;
        const intervals = intervalsRef.current;

        return () => {
            controllers.forEach((controller) => controller.abort());
            intervals.forEach((interval) => clearInterval(interval));
            controllers.clear();
            intervals.clear();
        };
    }, []);

    function setChatError(chatId: string, error: string) {
        updateChat(chatId, (chat) => ({
            ...chat,
            isTyping: false,
            isResponseLoading: false,
            error,
        }));
    }

    function startTypingAnimation(chatId: string, messageId: string, fullText: string) {
        const step = Math.max(MIN_CHARS_PER_TICK, Math.ceil(fullText.length / (TYPING_TARGET_MS / TYPING_TICK_MS)));
        let index = 0;

        const interval = setInterval(() => {
            index = Math.min(index + step, fullText.length);

            const visibleText = fullText.slice(0, index);
            const done = index >= fullText.length;

            updateChat(chatId, (chat) => ({
                ...chat,
                isTyping: !done,
                messages: chat.messages.map((m) => (m.id === messageId ? { ...m, text: visibleText } : m)),
            }));

            if (done) clearTyping(chatId);
        }, TYPING_TICK_MS);

        intervalsRef.current.set(chatId, interval);
    }

    async function generateAssistantResponse(chatId: string, userText: string) {
        abortRequest(chatId);
        clearTyping(chatId);

        const controller = new AbortController();
        controllersRef.current.set(chatId, controller);

        try {
            const aiResponse = await fetchAssistantResponse(chatId, userText, controller);
            const assistantMessage = createMessage("", "assistant");

            updateChat(chatId, (chat) => ({
                ...chat,
                isTyping: true,
                isResponseLoading: false,
                lastMessageAt: new Date().toISOString(),
                messages: [...chat.messages, assistantMessage],
            }));

            startTypingAnimation(chatId, assistantMessage.id, aiResponse);
        } catch (error) {
            if (error instanceof DOMException && error.name === "AbortError") return;

            if (error instanceof ApiError) {
                console.error("API error:", error.message);

                setChatError(
                    chatId,
                    error.statusCode === 429 && error.retryAfter
                        ? `You can send another message in ${error.retryAfter} seconds.`
                        : "Sorry, something went wrong.",
                );
                return;
            }

            console.error("Unexpected error:", error);
            setChatError(chatId, "Sorry, something went wrong.");
        } finally {
            if (controllersRef.current.get(chatId) === controller) {
                controllersRef.current.delete(chatId);
            }
        }
    }

    function stopTyping(chatId: string) {
        abortRequest(chatId);
        clearTyping(chatId);

        updateChat(chatId, (chat) => ({
            ...chat,
            isTyping: false,
            isResponseLoading: false,
        }));
    }

    async function generateTitle(chatId: string, message: string) {
        try {
            const newTitle = await fetchChatTitle(chatId, message);

            updateChat(chatId, (chat) => (chat.title === "New Chat" ? { ...chat, title: newTitle } : chat));
        } catch (error) {
            console.error("Error generating title:", error);
        }
    }

    return { generateAssistantResponse, generateTitle, stopTyping };
}
