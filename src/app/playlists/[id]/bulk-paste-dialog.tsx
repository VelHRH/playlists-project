"use client";

import { startTransition, useActionState, useEffect, useId, useRef, useState } from "react";
import type { TrackFormState } from "@/app/playlists/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatTrackCount } from "@/lib/track-count";
import { parseTrackList } from "@/playlists/track-list";

type BulkPasteDialogProps = {
  action: (previous: TrackFormState, form: FormData) => Promise<TrackFormState>;
};

function applyFixes(text: string, fixes: Record<number, string>) {
  const lines = text.split(/\r?\n/);
  for (const [line, fixed] of Object.entries(fixes)) lines[Number(line) - 1] = fixed;
  return lines.join("\n");
}

export function BulkPasteDialog({ action }: BulkPasteDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headingId = useId();
  const [session, setSession] = useState(0);
  const close = () => dialogRef.current?.close();

  return (
    <>
      <Button type="button" variant="outline" onClick={() => dialogRef.current?.showModal()}>
        Вставити списком
      </Button>
      <dialog
        ref={dialogRef}
        aria-labelledby={headingId}
        onClose={() => setSession(session + 1)}
        className="m-auto w-[calc(100%-2rem)] max-w-xl rounded-xl border bg-background p-0 text-foreground backdrop:bg-black/50"
      >
        <div className="flex max-h-[85dvh] flex-col gap-4 overflow-y-auto p-4">
          <h2 id={headingId} className="text-lg font-medium">
            Масова вставка
          </h2>
          <BulkPasteSteps key={session} action={action} onDone={close} />
        </div>
      </dialog>
    </>
  );
}

function BulkPasteSteps({ action, onDone }: BulkPasteDialogProps & { onDone: () => void }) {
  const [state, formAction, pending] = useActionState(action, { error: null, saved: 0 });
  const textId = useId();
  const fixId = useId();
  const [text, setText] = useState("");
  const [step, setStep] = useState<"text" | "preview">("text");
  const [fixes, setFixes] = useState<Record<number, string>>({});
  const onDoneRef = useRef(onDone);

  const { tracks, errors } = parseTrackList(text);

  useEffect(() => {
    onDoneRef.current = onDone;
  });

  useEffect(() => {
    if (state.saved === 0) return;
    onDoneRef.current();
  }, [state.saved]);

  function recheck() {
    setText(applyFixes(text, fixes));
    setFixes({});
  }

  function save() {
    const form = new FormData();
    form.set("text", text);
    startTransition(() => formAction(form));
  }

  return step === "text" ? (
    <>
      <div className="flex flex-col gap-2">
        <Label htmlFor={textId}>Текст</Label>
        <Textarea
          id={textId}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={"Океан Ельзи - Обійми\nДахаБраха - Vesna"}
          rows={8}
          className="max-h-[50dvh] min-h-40"
        />
        <p className="text-sm text-muted-foreground">
          Один трек на рядок у форматі «Виконавець - Назва». Розділювач — дефіс, коротке або довге тире з
          пробілами.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" disabled={text.trim() === ""} onClick={() => setStep("preview")}>
          Переглянути
        </Button>
        <Button type="button" variant="outline" onClick={onDone}>
          Скасувати
        </Button>
      </div>
    </>
  ) : (
    <>
      <section className="flex flex-col gap-2">
        <h3 className="font-medium">Розпізнано · {formatTrackCount(tracks.length)}</h3>
        {tracks.length > 0 && (
          <ol aria-label="Розпізнані треки" className="flex flex-col divide-y rounded-lg border text-sm">
            {tracks.map((track, index) => (
              <li key={index} className="flex gap-3 px-3 py-2">
                <span className="w-6 shrink-0 text-right tabular-nums text-muted-foreground">{index + 1}</span>
                <span className="min-w-0 break-words">
                  {track.artist} — <span className="font-medium">{track.title}</span>
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>
      {errors.length > 0 && (
        <section aria-label="Нерозпізнані рядки" className="flex flex-col gap-3">
          <h3 className="font-medium text-destructive">Не вдалося розпізнати · {errors.length}</h3>
          <p className="text-sm text-muted-foreground">
            Виправте рядки у форматі «Виконавець - Назва» або залиште порожніми, щоб пропустити.
          </p>
          {errors.map((error) => (
            <div key={error.line} className="flex flex-col gap-2">
              <Label htmlFor={`${fixId}-${error.line}`}>Рядок {error.line}</Label>
              <Input
                id={`${fixId}-${error.line}`}
                value={fixes[error.line] ?? error.text}
                aria-invalid
                onChange={(event) => setFixes({ ...fixes, [error.line]: event.target.value })}
              />
            </div>
          ))}
          <Button type="button" variant="outline" className="self-start" onClick={recheck}>
            Перевірити ще раз
          </Button>
        </section>
      )}
      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button type="button" disabled={pending || errors.length > 0 || tracks.length === 0} onClick={save}>
          Зберегти
        </Button>
        <Button type="button" variant="outline" disabled={pending} onClick={() => setStep("text")}>
          Назад до тексту
        </Button>
      </div>
    </>
  );
}
