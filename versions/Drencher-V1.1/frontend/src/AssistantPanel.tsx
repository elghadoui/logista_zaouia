import { Alert, Badge, Button, Group, Loader, Paper, Stack, Text, Textarea } from '@mantine/core';
import { useEffect, useRef, useState } from 'react';
import type { Context } from './api';
import { api, useApi } from './api';
import { PageHeading, State } from './components';
interface Status {
  configured: boolean;
  message: string;
  maxQuestionCharacters: number;
}
interface Reply {
  available: boolean;
  conversationId?: string;
  text?: string;
  message?: string;
  diagnostic?: string;
  context?: { id: number; station: string; label: string };
}
interface Message {
  role: 'user' | 'assistant';
  text: string;
}
export function AssistantPanel({ context }: { context: Context }) {
  const status = useApi<Status>('/assistant');
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState('');
  const [conversation, setConversation] = useState<string>();
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const controller = useRef<AbortController | null>(null);
  const bottom = useRef<HTMLDivElement>(null);
  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages, generating]);
  async function send() {
    const text = question.trim();
    if (!text || generating || !status.data?.configured) return;
    const request = new AbortController();
    controller.current = request;
    setGenerating(true);
    setError('');
    setQuestion('');
    setMessages((old) => [...old, { role: 'user', text }]);
    try {
      const reply = await api<Reply>(
        `/contexts/${context.id}/assistant/chat`,
        'POST',
        { question: text, conversationId: conversation },
        request.signal,
      );
      if (request.signal.aborted) return;
      if (!reply.available) {
        setError(
          (reply.message ?? 'Assistant IA indisponible') +
            (reply.diagnostic ? ` · Diagnostic administrateur : ${reply.diagnostic}` : ''),
        );
        setQuestion(text);
        return;
      }
      setConversation(reply.conversationId);
      setMessages((old) => [...old, { role: 'assistant', text: reply.text ?? '' }]);
    } catch (e: unknown) {
      if (!request.signal.aborted) {
        setError(e instanceof Error ? e.message : 'Assistant IA indisponible');
        setQuestion(text);
      }
    } finally {
      if (!request.signal.aborted) setGenerating(false);
    }
  }
  async function reset() {
    if (generating) return;
    if (conversation) {
      try {
        await api(`/contexts/${context.id}/assistant/conversations/${conversation}`, 'DELETE');
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Nouvelle conversation indisponible');
        return;
      }
    }
    setConversation(undefined);
    setMessages([]);
    setQuestion('');
    setError('');
  }
  return (
    <>
      <PageHeading
        eyebrow="ASSISTANT"
        title="Assistant IA"
        subtitle={`${context.station} · ${context.label}`}
      />
      <State loading={status.loading} error={status.error} retry={status.refresh}>
        <Stack>
          <Group justify="space-between">
            <Group>
              <Badge color="green">Lecture seule</Badge>
              <Text size="sm">
                Contexte : {context.station} · {context.label}
              </Text>
            </Group>
            <Button variant="light" disabled={generating} onClick={() => void reset()}>
              Nouvelle conversation
            </Button>
          </Group>
          {!status.data?.configured ? (
            <Alert color="orange" title="Assistant IA indisponible">
              Les autres modules restent disponibles. L’administrateur peut vérifier l’activation du
              service.
            </Alert>
          ) : null}
          <Paper withBorder p="lg" aria-label="Conversation">
            <Stack gap="lg" role="log" aria-live="polite" aria-busy={generating}>
              {!messages.length ? (
                <Text c="dimmed">
                  Posez une question sur un adhérent, ses vergers ou parcelles, les réceptions,
                  versements ou écarts d’une période. Indiquez la référence adhérent ou les dates
                  utiles.
                </Text>
              ) : null}
              {messages.map((message, index) => (
                <Paper key={index} p="md" bg={message.role === 'user' ? 'green.0' : 'gray.0'}>
                  <Text fw={650} size="sm" mb="xs">
                    {message.role === 'user' ? 'Vous' : 'Assistant VITASOUSS'}
                  </Text>
                  <Text style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
                    {message.text}
                  </Text>
                </Paper>
              ))}
              {generating ? (
                <Group role="status">
                  <Loader size="sm" />
                  <Text size="sm">
                    Recherche dans le contexte autorisé et génération de la réponse…
                  </Text>
                </Group>
              ) : null}
              <div ref={bottom} />
            </Stack>
          </Paper>
          {error ? (
            <Alert color="red" role="alert">
              {error}
            </Alert>
          ) : null}
          <Paper withBorder p="lg">
            <Stack>
              <Textarea
                label="Votre question"
                placeholder="Combien de vergers possède l’adhérent 65 ?"
                autosize
                minRows={3}
                value={question}
                maxLength={status.data?.maxQuestionCharacters ?? 2000}
                disabled={generating || !status.data?.configured}
                onChange={(event) => setQuestion(event.currentTarget.value)}
              />
              <Group justify="space-between">
                <Text size="xs" c="dimmed">
                  {question.length} / {status.data?.maxQuestionCharacters ?? 2000} caractères ·
                  Aucune modification de données
                </Text>
                <Button
                  onClick={() => void send()}
                  loading={generating}
                  disabled={!question.trim() || !status.data?.configured}
                >
                  Envoyer
                </Button>
              </Group>
            </Stack>
          </Paper>
        </Stack>
      </State>
    </>
  );
}
