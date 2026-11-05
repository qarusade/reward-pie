import { useEffect, useId, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import { fileToRewardImage } from '../lib/image';
import { nextColor, PALETTE, presetName, REWARD_PRESETS } from '../palette';
import { useStore } from '../store/store';
import type { Category, RewardKind } from '../types';
import { CloseIcon, PhotoIcon } from './Icon';
import { RewardArt } from './RewardArt';
import { RewardPie } from './RewardPie';

interface Props {
  /** null — создание новой категории. */
  categoryId: string | null;
  onClose(): void;
}

/** Создание и правка категории в модальном <dialog>: название, награда (пресет или своё фото), цвет. */
export function CategorySheet({ categoryId, onClose }: Props) {
  const categories = useStore((s) => s.categories);
  const tasks = useStore((s) => s.tasks);
  const addCategory = useStore((s) => s.addCategory);
  const updateCategory = useStore((s) => s.updateCategory);
  const removeCategory = useStore((s) => s.removeCategory);
  const existing: Category | undefined = categories.find((c) => c.id === categoryId);

  const [name, setName] = useState(existing?.name ?? '');
  const [color, setColor] = useState(existing?.color ?? nextColor(categories));
  const [kind, setKind] = useState<RewardKind>(existing?.reward.kind ?? firstUnusedKind(categories));
  const [rewardName, setRewardName] = useState(existing?.reward.name ?? presetName(kind));
  const [image, setImage] = useState<string | undefined>(existing?.reward.image);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const dialogRef = useRef<HTMLDialogElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const titleId = useId();
  const nameId = useId();
  const rewardNameId = useId();
  const presetsLabelId = useId();
  const colorsLabelId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const close = () => dialogRef.current?.close();

  /** Название награды меняем вслед за пресетом, только если пользователь его не правил. */
  function syncRewardName(next: RewardKind) {
    const untouched = !rewardName.trim() || REWARD_PRESETS.some((p) => p.name === rewardName.trim());
    if (untouched) setRewardName(presetName(next));
  }

  function pick(next: RewardKind) {
    if (next === 'photo' && !image) {
      fileRef.current?.click();
      return;
    }
    setKind(next);
    syncRewardName(next);
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      setImage(await fileToRewardImage(file));
      setKind('photo');
      syncRewardName('photo');
    } catch {
      setError('Не получилось открыть картинку. Попробуй другой файл.');
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  function save(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || busy) return;
    const reward = {
      kind,
      name: rewardName.trim() || presetName(kind),
      image: kind === 'photo' ? image : undefined,
    };
    if (existing) updateCategory(existing.id, { name, color, reward });
    else addCategory({ name, color, reward });
    close();
  }

  function remove() {
    if (!existing) return;
    const hasTasks = tasks.some((t) => t.categoryId === existing.id);
    const msg = hasTasks
      ? `Убрать категорию «${existing.name}»? Её прошлые задачи и награды останутся в истории.`
      : `Удалить категорию «${existing.name}»?`;
    if (!window.confirm(msg)) return;
    removeCategory(existing.id);
    close();
  }

  const previewReward = { kind, name: rewardName, image: kind === 'photo' ? image : undefined };

  return (
    <dialog ref={dialogRef} className="sheet" aria-labelledby={titleId} onClose={onClose}>
      <form className="sheet__body" onSubmit={save} style={{ '--cat': color } as CSSProperties}>
        <div className="sheet__head">
          <RewardPie reward={previewReward} done={1} total={1} size={64} />
          <h2 id={titleId} className="sheet__title">
            {existing ? 'Категория' : 'Новая категория'}
          </h2>
          <button type="button" className="icon-btn" aria-label="Закрыть" onClick={close}>
            <CloseIcon />
          </button>
        </div>

        <div className="field">
          <label className="field__label" htmlFor={nameId}>
            Название
          </label>
          <input
            id={nameId}
            className="input"
            type="text"
            placeholder="Например: Английский"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            autoComplete="off"
            required
          />
        </div>

        <div className="field">
          <span id={presetsLabelId} className="field__label">
            Награда за категорию
          </span>
          <div className="presets" role="group" aria-labelledby={presetsLabelId}>
            {REWARD_PRESETS.map((p) => (
              <button
                key={p.kind}
                type="button"
                className="preset"
                aria-pressed={kind === p.kind}
                onClick={() => pick(p.kind)}
              >
                <span className="preset__art">
                  <RewardArt reward={{ kind: p.kind, name: p.name, image: p.kind === 'photo' ? image : undefined }} />
                </span>
                <span className="preset__name">{p.short}</span>
              </button>
            ))}
          </div>
          <input
            ref={fileRef}
            className="sr-only"
            type="file"
            accept="image/*"
            tabIndex={-1}
            aria-hidden="true"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
          {kind === 'photo' && image && (
            <button type="button" className="link-btn" onClick={() => fileRef.current?.click()}>
              <PhotoIcon /> Заменить фото
            </button>
          )}
          {busy && <p className="hint">Обрабатываю картинку…</p>}
          {error && (
            <p className="hint hint--error" role="alert">
              {error}
            </p>
          )}
        </div>

        <div className="field">
          <label className="field__label" htmlFor={rewardNameId}>
            Как называется награда
          </label>
          <input
            id={rewardNameId}
            className="input"
            type="text"
            placeholder={presetName(kind)}
            value={rewardName}
            onChange={(e) => setRewardName(e.target.value)}
            maxLength={40}
            autoComplete="off"
          />
        </div>

        <div className="field">
          <span id={colorsLabelId} className="field__label">
            Цвет
          </span>
          <div className="swatches" role="group" aria-labelledby={colorsLabelId}>
            {PALETTE.map((c, i) => (
              <button
                key={c}
                type="button"
                className="swatch"
                aria-pressed={color === c}
                aria-label={`Цвет ${i + 1}`}
                onClick={() => setColor(c)}
                style={{ '--c': c } as CSSProperties}
              >
                <span />
              </button>
            ))}
          </div>
        </div>

        <div className="sheet__actions">
          <button type="submit" className="btn btn--primary" disabled={!name.trim() || busy}>
            {existing ? 'Сохранить' : 'Создать категорию'}
          </button>
          {existing && (
            <button type="button" className="btn btn--danger" onClick={remove}>
              Удалить категорию
            </button>
          )}
        </div>
      </form>
    </dialog>
  );
}

function firstUnusedKind(categories: Category[]): RewardKind {
  const used = new Set(categories.filter((c) => !c.archived).map((c) => c.reward.kind));
  return REWARD_PRESETS.find((p) => p.kind !== 'photo' && !used.has(p.kind))?.kind ?? 'pizza';
}
