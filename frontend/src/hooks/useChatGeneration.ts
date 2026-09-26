import { useEffect, useRef, type Dispatch, type SetStateAction } from "react";
import type { ChatType, MessageType } from "../types/Chat";
import { fetchAssistantResponse, fetchChatTitle } from "../api/chatApi";
import type { ConversationType } from "../types/Api";
import { createMessage } from "../utils/conversation";

type UseChatGenerationProps = {
    activeChatId: string;
    setChats: Dispatch<SetStateAction<ChatType[]>>;
};

export function useChatGeneration({ activeChatId, setChats }: UseChatGenerationProps) {
    const abortControllerRef = useRef<AbortController | null>(null);
    const typingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        return () => {
            if (typingIntervalRef.current) {
                clearInterval(typingIntervalRef.current);
                typingIntervalRef.current = null;
            }

            abortControllerRef.current?.abort();
        };
    }, []);

    async function generateAssistantResponse(conversation: ConversationType[]) {
        const currentChatId = activeChatId;

        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
            const aiResponse = await fetchAssistantResponse(conversation, controller);

            const assistantMessage = createMessage("", "assistant");

            setChats((prevChats) =>
                prevChats.map((chat) => {
                    if (chat.id !== currentChatId) return chat;

                    return {
                        ...chat,
                        isTyping: true,
                        isResponseLoading: false,
                        messages: [...chat.messages, assistantMessage],
                    };
                })
            );

            startTypingAnimation(assistantMessage, aiResponse, currentChatId);
        } catch (error) {
            if (error instanceof DOMException && error.name === "AbortError") return;

            console.error("Error generating assistant message:", error);

            setChats((prevChats) =>
                prevChats.map((chat) => {
                    if (chat.id !== currentChatId) return chat;

                    return {
                        ...chat,
                        isTyping: false,
                        isResponseLoading: false,
                        error: "Sorry, something went wrong. Please try again.",
                    };
                })
            );
        } finally {
            if (abortControllerRef.current === controller) abortControllerRef.current = null;
        }
    }

    function startTypingAnimation(assistantMessage: MessageType, aiResponse: string, currentChatId: string) {
        let index = 0;

        typingIntervalRef.current = setInterval(() => {
            if (index >= aiResponse.length) {
                if (typingIntervalRef.current) {
                    clearInterval(typingIntervalRef.current);
                    typingIntervalRef.current = null;
                }

                setChats((prevChats) =>
                    prevChats.map((chat) => {
                        if (chat.id !== currentChatId) return chat;

                        return {
                            ...chat,
                            isTyping: false,
                        };
                    })
                );

                return;
            }

            const currentChar = aiResponse[index];

            setChats((prevChats) =>
                prevChats.map((chat) => {
                    if (chat.id !== currentChatId) return chat;

                    return {
                        ...chat,
                        messages: chat.messages.map((message) => {
                            if (message.id !== assistantMessage.id) return message;

                            return {
                                ...message,
                                text: message.text + currentChar,
                            };
                        }),
                    };
                })
            );

            index++;
        }, 30);
    }

    function stopTyping() {
        abortControllerRef.current?.abort();

        if (typingIntervalRef.current) {
            clearInterval(typingIntervalRef.current);
            typingIntervalRef.current = null;
        }

        setChats((prevChats) =>
            prevChats.map((chat) => {
                if (chat.id !== activeChatId) return chat;
                return {
                    ...chat,
                    isTyping: false,
                    isResponseLoading: false,
                };
            })
        );
    }

    async function generateTitle(message: string) {
        const currentChatId = activeChatId;

        try {
            const newTitle = await fetchChatTitle(message);

            setChats((prev) => prev.map((chat) => (chat.id === currentChatId ? { ...chat, title: newTitle } : chat)));
        } catch (error) {
            console.error("Error generating title:", error);
        }
    }

    return {
        generateAssistantResponse,
        generateTitle,
        stopTyping,
    };
}
