export function movementKey(key: string, code = "") {
  const physical: Record<string, string> = {
    KeyW: "w",
    KeyA: "a",
    KeyS: "s",
    KeyD: "d",
    KeyE: "e",
    Space: " ",
  };
  return physical[code] ?? key.toLowerCase();
}
export function createInput() {
  const keyboard = new Set<string>();
  const pointers = new Map<number, string>();
  return {
    keyboard,
    pointers,
    clear() {
      keyboard.clear();
      pointers.clear();
    },
    direction() {
      const keys = new Set([...keyboard, ...pointers.values()]);
      return {
        x:
          Number(keys.has("d") || keys.has("arrowright")) -
          Number(keys.has("a") || keys.has("arrowleft")),
        y:
          Number(keys.has("s") || keys.has("arrowdown")) -
          Number(keys.has("w") || keys.has("arrowup")),
      };
    },
  };
}
