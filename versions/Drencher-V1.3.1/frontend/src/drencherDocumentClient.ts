export async function fetchDrencherPdf(path: string, signal: AbortSignal) {
  const response = await fetch('/api' + path, {
    credentials: 'same-origin',
    signal,
    cache: 'no-store',
  });
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(
      data?.title ??
        data?.error ??
        data?.message ??
        'Document indisponible. Vérifiez vos droits et le contexte.',
    );
  }
  if (!response.headers.get('content-type')?.includes('application/pdf')) {
    throw new Error('Réponse PDF attendue. Rechargez votre session.');
  }
  const blob = await response.blob();
  return { blob, name: `Drencher-${response.headers.get('X-Document-Id') ?? 'document'}.pdf` };
}
