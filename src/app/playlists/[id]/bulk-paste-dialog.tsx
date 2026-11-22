"use client";

import { startTransition, useActionState, useEffect, useId, useRef, useState } from "react";
import { ListPlus } from "lucide-react";
import type { TrackFormState } from "@/app/playlists/actions";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatTrackCount } from "@/lib/track-count";
import { BULK_PASTE_LINES_MAX, TRACK_TITLE_MAX } from "@/playlists/limits";
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
  return (
    <Modal
      title="Масова вставка"
      className="max-w-xl"
      trigger={(open) => (
        <IconButton label="Вставити списком" size="icon" onClick={open}>
          <ListPlus />
        </IconButton>
      )}
    >
      {(close) => <BulkPasteSteps action={action} onDone={close} />}
    </Modal>
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
          Один трек на рядок у форматі «Виконавець - Назва», до {BULK_PASTE_LINES_MAX} рядків. Розділювач —
          дефіс, коротке або довге тире з пробілами.
        </p>
      </div>
      <div className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="outline" onClick={onDone}>
          Скасувати
        </Button>
        <Button type="button" disabled={text.trim() === ""} onClick={() => setStep("preview")}>
          Переглянути
        </Button>
      </div>
    </>
  ) : (
    <>
      <section className="flex flex-col gap-2">
        <h3 className="font-semibold">Розпізнано · {formatTrackCount(tracks.length)}</h3>
        {tracks.length > 0 && (
          <ol aria-label="Розпізнані треки" className="flex flex-col divide-y rounded-lg border bg-background/60 text-sm">
            {tracks.map((track, index) => (
              <li key={index} className="flex gap-3 px-3 py-2">
                <span className="w-6 shrink-0 text-right font-mono text-xs leading-5 tabular-nums text-muted-foreground">{index + 1}</span>
                <span className="min-w-0 break-words">
                  <span className="text-muted-foreground">{track.artist} —</span> <span className="font-medium">{track.title}</span>
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>
      {errors.length > 0 && (
        <section aria-label="Нерозпізнані рядки" className="flex flex-col gap-3">
          <h3 className="font-semibold text-destructive">Не вдалося розпізнати · {errors.length}</h3>
          <p className="text-sm text-muted-foreground">
            Виправте рядки у форматі «Виконавець - Назва» (виконавець і назва — до {TRACK_TITLE_MAX} символів) або
            залиште порожніми, щоб пропустити.
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
      <div className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="outline" disabled={pending} onClick={() => setStep("text")}>
          Назад до тексту
        </Button>
        <Button type="button" disabled={pending || errors.length > 0 || tracks.length === 0} onClick={save}>
          Зберегти
        </Button>
      </div>
    </>
  );
}
