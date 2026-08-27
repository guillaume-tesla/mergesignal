import Link from 'next/link';

export function Brand({ app = false }: { app?: boolean }) {
  return (
    <Link className={app ? 'app-wordmark' : 'wordmark'} href="/" aria-label="MergeSignal home">
      <span className="brand-mark" aria-hidden="true">
        <span />
        <span />
      </span>
      <span>MergeSignal</span>
    </Link>
  );
}
