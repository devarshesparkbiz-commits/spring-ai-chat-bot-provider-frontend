import React, { useState, useEffect, useRef } from 'react';
import { marked } from 'marked';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import { chatService } from '../services/chatbotService';
import type { ChatMessage, ChatSession } from '../types/chatbot';

// Configure marked: no wrapping <p> for single-line content, safe output
marked.setOptions({ breaks: true });

/** Renders assistant Markdown safely — only used for ASSISTANT role. */
function MarkdownContent({ content }: { content: string }) {
  const html = marked.parse(content) as string;
  return (
    <div
      className="bubble-content markdown-body"
      // marked output is trusted (comes from our own LLM, not user input)
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

const ChatPage: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadSessions = async () => {
    try {
      setLoadingSessions(true);
      const res = await chatService.getSessions(0, 20);
      setSessions(res.data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load sessions');
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const openSession = async (session: ChatSession) => {
    try {
      setLoadingMessages(true);
      setActiveSession(session);
      const full = await chatService.getSession(session.sessionId);
      setMessages(full.messages ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  const startNewSession = () => {
    setActiveSession(null);
    setMessages([]);
    setInput('');
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const userText = input.trim();
    setInput('');
    setSending(true);
    setError('');

    // Optimistically add user message
    const optimisticUser: ChatMessage = {
      messageId: Date.now(),
      role: 'USER',
      content: userText,
    };
    setMessages(prev => [...prev, optimisticUser]);

    try {
      const res = await chatService.sendMessage(
        userText,
        activeSession?.sessionId
      );

      // If this was a new session, update the active session
      if (!activeSession) {
        const newSession: ChatSession = {
          sessionId: res.sessionId,
          sessionTitle: res.sessionTitle,
          active: true,
          chatbotId: 0,
          chatbotName: '',
          userId: 0,
        };
        setActiveSession(newSession);
        await loadSessions();
      }

      const assistantMsg: ChatMessage = {
        messageId: Date.now() + 1,
        role: 'ASSISTANT',
        content: res.reply,
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.messageId !== optimisticUser.messageId));
    } finally {
      setSending(false);
    }
  };

  const closeSession = async (sessionId: number) => {
    if (!confirm('Close this conversation?')) return;
    try {
      await chatService.closeSession(sessionId);
      if (activeSession?.sessionId === sessionId) {
        startNewSession();
      }
      await loadSessions();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to close session');
    }
  };

  return (
    <Layout>
      <div className="chat-layout">
        {/* ── Sidebar: session list ─────────────────────────────────────── */}
        <aside className="chat-sidebar">
          <div className="chat-sidebar-header">
            <h2>Conversations</h2>
            <button className="btn-new-chat" onClick={startNewSession}>
              + New Chat
            </button>
          </div>

          {loadingSessions ? (
            <LoadingSpinner />
          ) : sessions.length === 0 ? (
            <p className="empty-state">No conversations yet.</p>
          ) : (
            <ul className="session-list">
              {sessions.map(s => (
                <li
                  key={s.sessionId}
                  className={`session-item ${activeSession?.sessionId === s.sessionId ? 'active' : ''}`}
                >
                  <button
                    className="session-title"
                    onClick={() => openSession(s)}
                    title={s.sessionTitle}
                  >
                    {s.sessionTitle.length > 40
                      ? s.sessionTitle.slice(0, 40) + '…'
                      : s.sessionTitle}
                  </button>
                  <button
                    className="session-close"
                    onClick={() => closeSession(s.sessionId)}
                    title="Close session"
                    aria-label="Close session"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        {/* ── Main chat area ────────────────────────────────────────────── */}
        <div className="chat-main">
          {error && <ErrorAlert message={error} />}

          <div className="chat-messages" role="log" aria-live="polite">
            {!activeSession && messages.length === 0 && (
              <div className="chat-welcome">
                <h3>Start a new conversation</h3>
                <p>Type a message below to chat with the AI assistant.</p>
              </div>
            )}

            {loadingMessages ? (
              <LoadingSpinner />
            ) : (
              messages.map(msg => (
                <div
                  key={msg.messageId}
                  className={`chat-bubble ${msg.role === 'USER' ? 'bubble-user' : 'bubble-assistant'}`}
                >
                  <span className="bubble-role">
                    {msg.role === 'USER' ? 'You' : activeSession?.chatbotName || 'Assistant'}
                  </span>
                  {msg.role === 'USER' ? (
                    <p className="bubble-content">{msg.content}</p>
                  ) : (
                    <MarkdownContent content={msg.content} />
                  )}
                </div>
              ))
            )}

            {sending && (
              <div className="chat-bubble bubble-assistant bubble-typing">
                <span className="bubble-role">Assistant</span>
                <p className="bubble-content typing-indicator">
                  <span /><span /><span />
                </p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ── Input ──────────────────────────────────────────────────── */}
          <form className="chat-input-form" onSubmit={sendMessage}>
            <textarea
              className="chat-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(e as unknown as React.FormEvent);
                }
              }}
              placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
              rows={2}
              disabled={sending}
              aria-label="Chat message input"
            />
            <button
              type="submit"
              className="chat-send-btn"
              disabled={sending || !input.trim()}
              aria-label="Send message"
            >
              {sending ? '…' : '➤'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default ChatPage;
