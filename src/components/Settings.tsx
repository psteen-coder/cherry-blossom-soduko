import { THEMES, type ThemeId } from "../sudoku/theme";

type Props = {
  theme: ThemeId;
  onChoose: (id: ThemeId) => void;
  onBack: () => void;
};

export default function Settings({ theme, onChoose, onBack }: Props) {
  return (
    <section className="menu-screen" data-testid="settings-screen">
      <h1>Settings</h1>
      <p className="tagline">Pick a theme. It applies right away.</p>
      <nav className="menu" aria-label="Themes">
        {THEMES.map((item) => (
          <button
            key={item.id}
            type="button"
            data-testid={`theme-${item.id}`}
            className={theme === item.id ? "theme-selected" : ""}
            aria-pressed={theme === item.id}
            onClick={() => onChoose(item.id)}
          >
            {item.name}
          </button>
        ))}
        <button type="button" data-testid="settings-back" onClick={onBack}>
          Back
        </button>
      </nav>
    </section>
  );
}
