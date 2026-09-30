import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export const copy = (text: string, label = text) =>
  navigator.clipboard.writeText(text).then(
    () => toast.success(`copied ${label}`),
    () => toast.error("couldn't copy, it's " + text),
  );

export function CopyButton({ text, children, ...props }: { text: string } & React.ComponentProps<typeof Button>) {
  return (
    <Button variant="outline" size="sm" onClick={() => copy(text, text.includes('@') ? text : '@' + text)} {...props}>
      {children ?? 'copy'}
    </Button>
  );
}
