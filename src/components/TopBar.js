import React from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../theme";
import i18n from "../i18n";

export default function TopBar() {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const language = i18n.language || "cs";

  return (
    <header className="topbar">
      <div className="topbar__left">
        <div className="topbar__brand">{t("appTitle")}</div>
      </div>

      <div className="topbar__right">
        <label className="field">
          <span className="field__label">{t("language")}</span>
          <select
            className="input"
            value={language}
            onChange={(e) => i18n.changeLanguage(e.target.value)}
          >
            <option value="cs">CZ</option>
            <option value="en">EN</option>
            <option value="de">DE</option>
          </select>
        </label>

        <button className="btn" onClick={toggleTheme}>
          {t("theme")}: {theme === "dark" ? t("dark") : t("light")}
        </button>
      </div>
    </header>
  );
}
