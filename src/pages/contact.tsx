import { Mail } from 'lucide-react';
import { DISCORDS, EMAIL, GITHUB, TELEGRAM } from '@/config';
import { useNowPlaying } from '@/context/now-playing';
import { Eyebrow, PageHeader, Reveal } from '@/components/site/section';
import { ClockCompare } from '@/components/site/clock-compare';
import { DiscordCard } from '@/components/site/discord-card';
import { CopyButton } from '@/components/site/copy-button';
import { Icon } from '@/components/site/icon';
import { Spot } from '@/components/site/spot';
import { Button } from '@/components/ui/button';

export function Contact() {
  const { presences } = useNowPlaying();
  return (
    <>
      <PageHeader n="06" eyebrow="contact" title="contact">
        <b className="font-medium text-foreground">commissions are free rn</b>. dm me on discord, i answer there the fastest.
      </PageHeader>

      <Reveal><ClockCompare /></Reveal>

      <Eyebrow>discord</Eyebrow>
      <div className="grid items-start gap-3 md:grid-cols-2">
        {DISCORDS.map((d, i) => <Reveal key={d.id} delay={i * 0.08}><DiscordCard presence={presences[i]} handle={d.handle} /></Reveal>)}
      </div>

      <Eyebrow>elsewhere</Eyebrow>
      <div className="grid gap-3 sm:grid-cols-2">
        <Spot className="flex items-center gap-4 p-4 sm:col-span-2">
          <Mail className="size-5 text-muted-foreground" />
          <span className="min-w-0 flex-1"><b className="block truncate font-medium">{EMAIL}</b><span className="font-mono text-xs text-muted-foreground">email</span></span>
          <CopyButton text={EMAIL} />
          <Button size="sm" asChild><a href={`mailto:${EMAIL}`}>send</a></Button>
        </Spot>
        <Spot className="flex items-center gap-4 p-4">
          <Icon name="telegram" className="size-5 text-muted-foreground" />
          <span className="flex-1"><b className="block font-medium">@{TELEGRAM}</b><span className="font-mono text-xs text-muted-foreground">telegram</span></span>
          <CopyButton text={TELEGRAM} />
          <Button size="sm" asChild><a href={`https://t.me/${TELEGRAM}`} target="_blank" rel="noopener noreferrer">open</a></Button>
        </Spot>
        <Spot className="flex items-center gap-4 p-4">
          <Icon name="github" className="size-5 text-muted-foreground" />
          <span className="flex-1"><b className="block font-medium">@{GITHUB}</b><span className="font-mono text-xs text-muted-foreground">github</span></span>
          <Button size="sm" asChild><a href={`https://github.com/${GITHUB}`} target="_blank" rel="noopener noreferrer">open</a></Button>
        </Spot>
      </div>
    </>
  );
}
