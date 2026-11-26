# Background Music (`public/music/`)

Royalty-free background music bed for Remotion compositions (`<BackgroundMusic />` in `src/lib/audio.tsx`).

## Bundled Track

| File | Source | Duration | Usage |
| --- | --- | --- | --- |
| `bg-ambient.mp3` | Mixkit — *Serene View* (Mixkit Stock Music Free License) | `113.93s` | Subtle looping background music bed under narration (`volume={0.08}` with fade-in/out). |

## Swapping or Disabling Music

- Replace `public/music/bg-ambient.mp3` with your own track, or pass `src="music/your-track.mp3"` to `<BackgroundMusic />` in `src/Video.tsx`.
- Set `musicVolume={0}` in `defaultProps` (in `src/Root.tsx` or Remotion Studio) to mute background music cleanly.
