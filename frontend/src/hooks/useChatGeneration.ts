import { useEffect, useRef, type Dispatch, type SetStateAction } from "react";
import type { ChatType } from "../types/Chat";
import { fetchAssistantResponse, fetchChatTitle, stopAssistantResponse } from "../api/chatApi";
import { ApiError } from "../types/Api";
import { createMessage } from "../utils/conversation";

type UseChatGenerationProps = {
    setChats: Dispatch<SetStateAction<ChatType[]>>;
};

const TYPING_TICK_MS = 20;
const TYPING_TARGET_MS = 1500; // long replies finish in about this time
const MIN_CHARS_PER_TICK = 2;

type TypingAnimation = {
    interval: ReturnType<typeof setInterval>;
    messageId: string;
    fullText: string;
};

type ActiveRequest = {
    requestId: string;
    controller: AbortController;
};

export function useChatGeneration({ setChats }: UseChatGenerationProps) {
    const requestsRef = useRef(new Map<string, ActiveRequest>());
    const typingRef = useRef(new Map<string, TypingAnimation>());

    function updateChat(chatId: string, update: (chat: ChatType) => ChatType) {
        setChats((prev) => prev.map((chat) => (chat.id === chatId ? update(chat) : chat)));
    }

    function clearTyping(chatId: string) {
        const typing = typingRef.current.get(chatId);
        if (typing) clearInterval(typing.interval);
        typingRef.current.delete(chatId);
    }

    function abortRequest(chatId: string) {
        requestsRef.current.get(chatId)?.controller.abort();
        requestsRef.current.delete(chatId);
    }

    useEffect(() => {
        const requests = requestsRef.current;
        const typingAnimations = typingRef.current;

        return () => {
            requests.forEach((request) => request.controller.abort());
            typingAnimations.forEach((typing) => clearInterval(typing.interval));
            requests.clear();
            typingAnimations.clear();
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

        typingRef.current.set(chatId, { interval, messageId, fullText });
    }

    async function generateAssistantResponse(chatId: string, userText: string) {
        abortRequest(chatId);
        clearTyping(chatId);

        const request: ActiveRequest = { requestId: crypto.randomUUID(), controller: new AbortController() };
        requestsRef.current.set(chatId, request);

        try {
            const aiResponse = await fetchAssistantResponse(chatId, userText, request.requestId, request.controller);

            if (aiResponse === null) return;

            if (requestsRef.current.get(chatId) !== request) {
                // Stop arrived after the reply was saved, so show it to match what a reload would show
                updateChat(chatId, (chat) => ({
                    ...chat,
                    messages: [...chat.messages, createMessage(aiResponse, "assistant")],
                }));
                return;
            }

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
            // Stopped or replaced while waiting, so this result no longer matters
            if (requestsRef.current.get(chatId) !== request) return;

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
            if (requestsRef.current.get(chatId) === request) {
                requestsRef.current.delete(chatId);
            }
        }
    }

    function stopTyping(chatId: string) {
        const typing = typingRef.current.get(chatId);
        const request = requestsRef.current.get(chatId);

        // The message request stays open so it always reaches the server, which needs it to save the user's message
        requestsRef.current.delete(chatId);
        clearTyping(chatId);

        if (request) {
            stopAssistantResponse(chatId, request.requestId).catch((error) => {
                console.error("Error stopping response:", error);
            });
        }

        updateChat(chatId, (chat) => ({
            ...chat,
            isTyping: false,
            isResponseLoading: false,
            // A reply being typed out is already saved, so show all of it to match what a reload would show
            messages: typing
                ? chat.messages.map((m) => (m.id === typing.messageId ? { ...m, text: typing.fullText } : m))
                : chat.messages,
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
