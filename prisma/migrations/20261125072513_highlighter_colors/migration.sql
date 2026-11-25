-- Move students from the old saturated palette to the highlighter palette.
UPDATE "Student" SET "color" = CASE "color"
  WHEN '#f472b6' THEN '#ff9cc8'
  WHEN '#38bdf8' THEN '#8dcfff'
  WHEN '#fbbf24' THEN '#ffe04d'
  WHEN '#34d399' THEN '#86e3a0'
  WHEN '#a78bfa' THEN '#c9aeff'
  WHEN '#fb923c' THEN '#ffb36b'
  WHEN '#a3e635' THEN '#c4ee62'
  WHEN '#f87171' THEN '#ff9f8e'
  WHEN '#22d3ee' THEN '#74e0d6'
  WHEN '#818cf8' THEN '#aebbff'
  ELSE "color"
END;
