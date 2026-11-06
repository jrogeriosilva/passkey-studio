import { openInspector } from '../../../inspection';
import { Button } from './ui/button';

export function DecoderActions({ data }: { data: unknown }) {
  return <Button variant="secondary" onClick={() => openInspector(data)}>Inspect this payload</Button>;
}
