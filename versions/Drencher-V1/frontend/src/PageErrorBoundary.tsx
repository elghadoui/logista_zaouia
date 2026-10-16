import { Component } from 'react';
import type { ReactNode } from 'react';
import { Alert, Button, Stack } from '@mantine/core';

/** Keep the header and navigation usable when a page fails to render. */
export class PageErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <Stack>
          <Alert color="red" title="Cette page ne peut pas être affichée">
            Sélectionnez une autre page dans le menu ou réessayez. Si le problème persiste,
            contactez votre administrateur.
          </Alert>
          <Button variant="light" onClick={() => this.setState({ failed: false })}>
            Réessayer cette page
          </Button>
        </Stack>
      );
    return this.props.children;
  }
}
